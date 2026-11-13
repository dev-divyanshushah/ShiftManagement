import express from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

const swapSchema = z.object({
  requesterShiftId: z.string().min(1),
  requesterDay: z.string().min(3),
  requesterTiming: z.string().min(3),
  targetId: z.string().min(1), // Target employee id or employeeId
  targetShiftId: z.string().optional().nullable(),
  targetDay: z.string().min(3),
  targetTiming: z.string().min(3),
  reason: z.string().optional(),
});

// GET /api/swaps
router.get('/', authenticate, async (req, res, next) => {
  try {
    const isManager = req.user.role === 'MANAGER';
    const where = {
      organizationId: req.user.organizationId,
      ...(!isManager && {
        OR: [
          { requesterId: req.user.dbEmployeeId || req.user.employeeId },
          { requester: { employeeId: req.user.employeeId } },
          { targetId: req.user.dbEmployeeId || req.user.employeeId },
          { target: { employeeId: req.user.employeeId } },
        ],
      }),
    };

    const swaps = await prisma.shiftSwapRequest.findMany({
      where,
      include: {
        requester: { select: { id: true, employeeId: true, name: true } },
        target: { select: { id: true, employeeId: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = swaps.map(s => ({
      id: s.id,
      requesterId: s.requester.employeeId,
      requesterName: s.requester.name,
      requesterShiftId: s.requesterShiftId,
      requesterDay: s.requesterDay,
      requesterTiming: s.requesterTiming,
      targetId: s.target.employeeId,
      targetName: s.target.name,
      targetShiftId: s.targetShiftId,
      targetDay: s.targetDay,
      targetTiming: s.targetTiming,
      reason: s.reason,
      status: s.status,
      submittedAt: s.submittedAt,
    }));

    res.json({ success: true, swaps: formatted });
  } catch (err) {
    next(err);
  }
});

// POST /api/swaps - Submit swap request
router.post('/', authenticate, validateBody(swapSchema), async (req, res, next) => {
  try {
    const data = req.body;

    // Resolve requester DB id
    let reqEmp = await prisma.employee.findFirst({
      where: {
        OR: [{ id: req.user.dbEmployeeId }, { employeeId: req.user.employeeId }, { email: req.user.email }],
        organizationId: req.user.organizationId,
      },
    });

    // Resolve target DB id
    let tgtEmp = await prisma.employee.findFirst({
      where: {
        OR: [{ id: data.targetId }, { employeeId: data.targetId }],
        organizationId: req.user.organizationId,
      },
    });

    if (!reqEmp || !tgtEmp) {
      return res.status(404).json({ success: false, error: 'Could not resolve participating employees.' });
    }

    const swap = await prisma.shiftSwapRequest.create({
      data: {
        requesterId: reqEmp.id,
        requesterShiftId: data.requesterShiftId,
        requesterDay: data.requesterDay,
        requesterTiming: data.requesterTiming,
        targetId: tgtEmp.id,
        targetShiftId: data.targetShiftId || null,
        targetDay: data.targetDay,
        targetTiming: data.targetTiming,
        reason: data.reason || 'Personal schedule adjustment',
        status: 'Pending',
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        organizationId: req.user.organizationId,
      },
      include: { requester: true, target: true },
    });

    // Notify Managers
    await prisma.notification.create({
      data: {
        title: 'New Shift Swap Requested',
        message: `${reqEmp.name} proposed a shift trade with ${tgtEmp.name} for ${data.requesterDay}.`,
        type: 'info',
        organizationId: req.user.organizationId,
      },
    });

    res.status(201).json({ success: true, swap });
  } catch (err) {
    next(err);
  }
});

// PUT /api/swaps/:id/status - Approve or reject swap (Manager only)
// CRITICAL: Atomically updates both employee schedules when approved!
router.put('/:id/status', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Approved or Rejected.' });
    }

    const swap = await prisma.shiftSwapRequest.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
      include: { requester: true, target: true },
    });

    if (!swap) {
      return res.status(404).json({ success: false, error: 'Swap request not found.' });
    }

    // ATOMIC TRANSACTION: If approved, swap the assignments in the database!
    await prisma.$transaction(async (tx) => {
      // 1. Update swap request status
      await tx.shiftSwapRequest.update({
        where: { id: swap.id },
        data: {
          status,
          reviewedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          reviewedById: req.user.id,
        },
      });

      // 2. If approved, swap shifts atomically
      if (status === 'Approved') {
        const reqShift = await tx.assignedShift.findUnique({ where: { id: swap.requesterShiftId } });
        
        if (reqShift) {
          // Reassign requester's shift to target employee
          await tx.assignedShift.update({
            where: { id: reqShift.id },
            data: { employeeId: swap.targetId },
          });
        }

        if (swap.targetShiftId) {
          const tgtShift = await tx.assignedShift.findUnique({ where: { id: swap.targetShiftId } });
          if (tgtShift) {
            // Reassign target's shift to requester
            await tx.assignedShift.update({
              where: { id: tgtShift.id },
              data: { employeeId: swap.requesterId },
            });
          }
        }
      }
    });

    // Notify both employees
    await prisma.notification.createMany({
      data: [
        {
          targetEmployeeId: swap.requester.employeeId,
          title: `Shift Trade ${status}`,
          message: `Your shift trade with ${swap.target.name} for ${swap.requesterDay} has been ${status.toLowerCase()}.`,
          type: status === 'Approved' ? 'success' : 'warning',
          organizationId: req.user.organizationId,
        },
        {
          targetEmployeeId: swap.target.employeeId,
          title: `Shift Trade ${status}`,
          message: `The shift trade with ${swap.requester.name} has been ${status.toLowerCase()} by management.`,
          type: status === 'Approved' ? 'success' : 'warning',
          organizationId: req.user.organizationId,
        },
      ],
    });

    await logAudit({
      userId: req.user.id,
      action: `SWAP_${status.toUpperCase()}`,
      entityType: 'SWAP',
      entityId: swap.id,
      details: { requester: swap.requester.name, target: swap.target.name, status },
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `Shift swap ${status.toLowerCase()} successfully.` });
  } catch (err) {
    next(err);
  }
});

export default router;

