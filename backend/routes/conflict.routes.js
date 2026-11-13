import express from 'express';
import prisma from '../config/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { detectConflicts } from '../services/conflictService.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET /api/conflicts - Detect scheduling conflicts in real time
router.get('/', authenticate, async (req, res, next) => {
  try {
    const [shifts, employees, leaves, templates] = await Promise.all([
      prisma.assignedShift.findMany({
        where: { organizationId: req.user.organizationId },
      }),
      prisma.employee.findMany({
        where: { organizationId: req.user.organizationId },
        include: { availability: true },
      }),
      prisma.leaveRequest.findMany({
        where: { organizationId: req.user.organizationId, status: 'Approved' },
      }),
      prisma.shiftTemplate.findMany({
        where: { organizationId: req.user.organizationId },
      }),
    ]);

    const result = detectConflicts({ shifts, employees, leaves, templates });

    res.json({
      success: true,
      hasConflicts: result.hasConflicts,
      totalConflicts: result.totalConflicts,
      conflicts: result.conflicts,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/conflicts/resolve - Resolve conflict by modifying real database records
router.post('/resolve', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const { conflictId, type, shiftId, employeeId } = req.body;

    let actionTaken = 'Resolved';

    // 1. If OVERLAP: remove one of the conflicting shifts
    if (type === 'OVERLAP' && shiftId) {
      await prisma.assignedShift.delete({ where: { id: shiftId } });
      actionTaken = `Removed duplicate overlapping shift #${shiftId}`;
    }
    // 2. If OVERTIME: reduce hours or trim excess shifts
    else if (type === 'OVERTIME' && employeeId) {
      const latestShift = await prisma.assignedShift.findFirst({
        where: { employeeId, organizationId: req.user.organizationId },
        orderBy: { createdAt: 'desc' },
      });
      if (latestShift) {
        await prisma.assignedShift.delete({ where: { id: latestShift.id } });
        actionTaken = `Trimmed overtime shift on ${latestShift.day} for employee`;
      }
    }
    // 3. If AVAILABILITY: release the shift
    else if (type === 'AVAILABILITY' && shiftId) {
      await prisma.assignedShift.delete({ where: { id: shiftId } });
      actionTaken = `Released shift on unavailable rest day #${shiftId}`;
    }
    // 4. Default: release conflicting shift
    else if (shiftId) {
      await prisma.assignedShift.delete({ where: { id: shiftId } });
      actionTaken = `Released shift #${shiftId}`;
    }

    await logAudit({
      userId: req.user.id,
      action: 'RESOLVE_CONFLICT',
      entityType: 'CONFLICT',
      entityId: conflictId,
      details: { conflictId, type, actionTaken },
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: actionTaken,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

