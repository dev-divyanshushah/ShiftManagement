import express from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';
import { solveSchedule } from '../services/schedulingEngine.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

const shiftSchema = z.object({
  employeeId: z.string().min(1),
  templateId: z.string().optional().nullable(),
  day: z.string().min(3),
  date: z.string().default('2026-11-09'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationHours: z.number().min(0.5).max(24).default(8),
  role: z.string().default('Support Specialist'),
  department: z.string().default('Customer Support'),
  status: z.enum(['Draft', 'Published', 'Completed']).default('Published'),
});

// GET /api/shifts - List shifts
router.get('/', authenticate, async (req, res, next) => {
  try {
    const isManager = req.user.role === 'MANAGER';
    
    const shifts = await prisma.assignedShift.findMany({
      where: {
        organizationId: req.user.organizationId,
        // Employees only see published shifts unless viewing their own
        ...(!isManager && {
          OR: [
            { status: 'Published' },
            { employeeId: req.user.dbEmployeeId || req.user.employeeId },
          ],
        }),
      },
      include: {
        employee: {
          select: { id: true, employeeId: true, name: true, role: true, department: true, avatar: true },
        },
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = shifts.map(s => ({
      id: s.id,
      employeeId: s.employee.employeeId, // Use public employeeId for consistency
      dbEmployeeId: s.employeeId,
      employeeName: s.employee.name,
      templateId: s.templateId,
      templateName: s.template?.name,
      day: s.day,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      durationHours: s.durationHours,
      role: s.role,
      department: s.department,
      status: s.status,
    }));

    res.json({ success: true, shifts: formatted });
  } catch (err) {
    next(err);
  }
});

// POST /api/shifts - Create single shift (Manager only)
router.post('/', authenticate, requireRole('MANAGER'), validateBody(shiftSchema), async (req, res, next) => {
  try {
    const data = req.body;

    // Lookup employee by id or employeeId
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [{ id: data.employeeId }, { employeeId: data.employeeId }],
        organizationId: req.user.organizationId,
      },
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Target employee not found.' });
    }

    const shift = await prisma.assignedShift.create({
      data: {
        employeeId: employee.id,
        templateId: data.templateId || null,
        day: data.day,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        durationHours: data.durationHours,
        role: data.role || employee.role,
        department: data.department || employee.department?.name || 'Customer Support',
        status: data.status || 'Published',
        organizationId: req.user.organizationId,
      },
      include: { employee: true },
    });

    // Create default break for shift
    const [h, m] = shift.startTime.split(':').map(Number);
    const breakStartH = Math.floor(h + shift.durationHours / 2);
    const breakStart = `${String(breakStartH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const breakEnd = `${String(breakStartH).padStart(2, '0')}:${String(m + 45).padStart(2, '0')}`;

    await prisma.breakSchedule.create({
      data: {
        shiftId: shift.id,
        employeeId: employee.id,
        breakStart,
        breakEnd,
        durationMinutes: 45,
        shiftName: shift.role,
        status: 'Scheduled',
        organizationId: req.user.organizationId,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'CREATE_SHIFT',
      entityType: 'SHIFT',
      entityId: shift.id,
      details: { day: shift.day, employee: employee.name },
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      shift: {
        ...shift,
        employeeId: employee.employeeId,
        dbEmployeeId: employee.id,
        employeeName: employee.name,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/shifts/:id - Update shift (Manager only)
router.put('/:id', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const data = req.body;
    const existing = await prisma.assignedShift.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Shift not found.' });
    }

    const updated = await prisma.assignedShift.update({
      where: { id: req.params.id },
      data: {
        ...(data.day && { day: data.day }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.durationHours && { durationHours: data.durationHours }),
        ...(data.role && { role: data.role }),
        ...(data.status && { status: data.status }),
      },
      include: { employee: true },
    });

    res.json({ success: true, shift: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/shifts/:id - Delete shift (Manager only)
router.delete('/:id', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const existing = await prisma.assignedShift.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Shift not found.' });
    }

    await prisma.assignedShift.delete({ where: { id: req.params.id } });

    await logAudit({
      userId: req.user.id,
      action: 'DELETE_SHIFT',
      entityType: 'SHIFT',
      entityId: req.params.id,
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Shift deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/shifts/generate - Run Scheduling Engine (Manager only)
router.post('/generate', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const { targetDepartment, respectAvailability, respectHourLimits, balanceFairness } = req.body;

    const [employees, templates, approvedLeaves] = await Promise.all([
      prisma.employee.findMany({
        where: { organizationId: req.user.organizationId },
        include: { availability: true, department: true },
      }),
      prisma.shiftTemplate.findMany({
        where: { organizationId: req.user.organizationId },
      }),
      prisma.leaveRequest.findMany({
        where: { organizationId: req.user.organizationId, status: 'Approved' },
      }),
    ]);

    const result = solveSchedule({
      employees,
      templates,
      approvedLeaves,
      targetDepartment: targetDepartment || 'All',
      respectAvailability: respectAvailability !== false,
      respectHourLimits: respectHourLimits !== false,
      balanceFairness: balanceFairness !== false,
    });

    // Save generated shifts transactionally
    await prisma.$transaction(async (tx) => {
      // Clear existing draft shifts
      await tx.assignedShift.deleteMany({
        where: { organizationId: req.user.organizationId },
      });

      // Insert candidate shifts
      for (const s of result.generatedShifts) {
        const createdShift = await tx.assignedShift.create({
          data: {
            employeeId: s.employeeId,
            templateId: s.templateId,
            day: s.day,
            date: '2026-11-09',
            startTime: s.startTime,
            endTime: s.endTime,
            durationHours: s.durationHours,
            role: s.role,
            department: s.department,
            status: 'Published',
            organizationId: req.user.organizationId,
          },
        });

        // Insert matched break
        const matchedBreak = result.generatedBreaks.find(b => b.shiftId === s.id);
        if (matchedBreak) {
          await tx.breakSchedule.create({
            data: {
              shiftId: createdShift.id,
              employeeId: s.employeeId,
              breakStart: matchedBreak.breakStart,
              breakEnd: matchedBreak.breakEnd,
              durationMinutes: matchedBreak.durationMinutes,
              shiftName: matchedBreak.shiftName,
              status: 'Scheduled',
              organizationId: req.user.organizationId,
            },
          });
        }
      }
    });

    await logAudit({
      userId: req.user.id,
      action: 'OPTIMIZE_SCHEDULE',
      entityType: 'SCHEDULE',
      details: result.metrics,
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/shifts/publish - Publish schedule & notify staff (Manager only)
router.post('/publish', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    await prisma.assignedShift.updateMany({
      where: { organizationId: req.user.organizationId },
      data: { status: 'Published' },
    });

    // Create broadcast notification
    await prisma.notification.create({
      data: {
        title: 'Weekly Schedule Published',
        message: 'The official weekly roster has been finalized and published by workforce management.',
        type: 'success',
        organizationId: req.user.organizationId,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'PUBLISH_SCHEDULE',
      entityType: 'SCHEDULE',
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Schedule published and floor broadcast sent.' });
  } catch (err) {
    next(err);
  }
});

export default router;

