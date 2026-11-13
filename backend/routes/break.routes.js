import express from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { optimizeBreaksForShifts } from '../services/breakAllocationService.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET /api/breaks
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

    const breaks = await prisma.breakSchedule.findMany({
      where,
      include: {
        employee: { select: { id: true, employeeId: true, name: true } },
      },
      orderBy: { breakStart: 'asc' },
    });

    const formatted = breaks.map(b => ({
      id: b.id,
      shiftId: b.shiftId,
      employeeId: b.employee.employeeId,
      dbEmployeeId: b.employeeId,
      employeeName: b.employee.name,
      breakStart: b.breakStart,
      breakEnd: b.breakEnd,
      durationMinutes: b.durationMinutes,
      shiftName: b.shiftName,
      status: b.status,
    }));

    res.json({ success: true, breaks: formatted });
  } catch (err) {
    next(err);
  }
});

// PUT /api/breaks/:id/status - Update break status (Start/End Break)
router.put('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Scheduled', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid break status.' });
    }

    const breakItem = await prisma.breakSchedule.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
      include: { employee: true },
    });

    if (!breakItem) {
      return res.status(404).json({ success: false, error: 'Break record not found.' });
    }

    // RBAC: Employee can only update their own breaks
    if (req.user.role !== 'MANAGER') {
      const isOwner = breakItem.employee.employeeId === req.user.employeeId || breakItem.employeeId === req.user.dbEmployeeId;
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Cannot modify another employee break status.' });
      }
    }

    const updated = await prisma.breakSchedule.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ success: true, break: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/breaks/optimize - Auto-allocate breaks against demand (Manager only)
router.post('/optimize', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const shifts = await prisma.assignedShift.findMany({
      where: { organizationId: req.user.organizationId },
      include: { employee: true },
    });

    const optimization = optimizeBreaksForShifts({ shifts });

    // Update breaks in DB
    await prisma.$transaction(async (tx) => {
      await tx.breakSchedule.deleteMany({
        where: { organizationId: req.user.organizationId },
      });

      for (const b of optimization.breaks) {
        await tx.breakSchedule.create({
          data: {
            shiftId: b.shiftId,
            employeeId: b.employeeId,
            breakStart: b.breakStart,
            breakEnd: b.breakEnd,
            durationMinutes: b.durationMinutes,
            shiftName: b.shiftName,
            status: 'Scheduled',
            organizationId: req.user.organizationId,
          },
        });
      }
    });

    await logAudit({
      userId: req.user.id,
      action: 'OPTIMIZE_BREAKS',
      entityType: 'BREAK',
      details: { totalBreaks: optimization.totalBreaksAllocated },
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.json({ success: true, optimization });
  } catch (err) {
    next(err);
  }
});

export default router;

