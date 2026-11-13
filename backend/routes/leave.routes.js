import express from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

const leaveSchema = z.object({
  leaveType: z.string().min(2),
  startDate: z.string().min(8),
  endDate: z.string().min(8),
  totalDays: z.number().min(1).default(1),
  reason: z.string().min(2),
});

// GET /api/leaves
router.get('/', authenticate, async (req, res, next) => {
  try {
    const isManager = req.user.role === 'MANAGER';
    const where = {
      organizationId: req.user.organizationId,
      ...(!isManager && {
        OR: [
          { employeeId: req.user.dbEmployeeId || req.user.employeeId },
          { employee: { employeeId: req.user.employeeId } },
        ],
      }),
    };

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: { select: { id: true, employeeId: true, name: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = leaves.map(l => ({
      id: l.id,
      employeeId: l.employee.employeeId,
      employeeName: l.employee.name,
      leaveType: l.leaveType,
      startDate: l.startDate,
      endDate: l.endDate,
      totalDays: l.totalDays,
      reason: l.reason,
      status: l.status,
      submittedAt: l.submittedAt,
      reviewedAt: l.reviewedAt,
      managerComment: l.managerComment,
    }));

    res.json({ success: true, leaves: formatted });
  } catch (err) {
    next(err);
  }
});

// POST /api/leaves - Submit leave request
router.post('/', authenticate, validateBody(leaveSchema), async (req, res, next) => {
  try {
    const data = req.body;

    let targetEmpId = req.user.dbEmployeeId;
    if (!targetEmpId) {
      const emp = await prisma.employee.findFirst({
        where: {
          OR: [{ employeeId: req.user.employeeId }, { email: req.user.email }],
          organizationId: req.user.organizationId,
        },
      });
      targetEmpId = emp?.id;
    }

    if (!targetEmpId) {
      return res.status(400).json({ success: false, error: 'Employee profile not associated with this account.' });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: targetEmpId,
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays: data.totalDays,
        reason: data.reason,
        status: 'Pending',
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        organizationId: req.user.organizationId,
      },
      include: { employee: true },
    });

    // Notify Managers
    await prisma.notification.create({
      data: {
        title: 'New Leave Request Submitted',
        message: `${leave.employee.name} submitted a request for ${leave.leaveType} (${leave.totalDays} day(s)).`,
        type: 'info',
        organizationId: req.user.organizationId,
      },
    });

    res.status(201).json({ success: true, leave });
  } catch (err) {
    next(err);
  }
});

// PUT /api/leaves/:id/status - Approve or reject leave (Manager only)
router.put('/:id/status', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const { status, managerComment } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Approved or Rejected.' });
    }

    const existing = await prisma.leaveRequest.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
      include: { employee: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Leave request not found.' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: {
        status,
        managerComment: managerComment || null,
        reviewedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        reviewedById: req.user.id,
      },
    });

    // Notify the employee directly
    await prisma.notification.create({
      data: {
        targetEmployeeId: existing.employee.employeeId,
        title: `Leave Request ${status}`,
        message: `Your request for ${existing.leaveType} has been ${status.toLowerCase()} by management.`,
        type: status === 'Approved' ? 'success' : 'warning',
        organizationId: req.user.organizationId,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: `LEAVE_${status.toUpperCase()}`,
      entityType: 'LEAVE',
      entityId: existing.id,
      details: { status, employee: existing.employee.name },
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.json({ success: true, leave: updated });
  } catch (err) {
    next(err);
  }
});

export default router;

