import express from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

const templateSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationHours: z.number().min(1).max(24).default(8),
  breakDurationMinutes: z.number().min(15).max(120).default(45),
  minStaffing: z.number().min(1).default(6),
  color: z.string().default('#4F46E5'),
  description: z.string().optional(),
  requiredRoles: z.union([z.string(), z.array(z.string())]).default([]),
});

// GET /api/templates
router.get('/', authenticate, async (req, res, next) => {
  try {
    const templates = await prisma.shiftTemplate.findMany({
      where: { organizationId: req.user.organizationId },
      include: { _count: { select: { assignedShifts: true } } },
      orderBy: { startTime: 'asc' },
    });

    const formatted = templates.map(t => ({
      id: t.id,
      name: t.name,
      code: t.code,
      startTime: t.startTime,
      endTime: t.endTime,
      durationHours: t.durationHours,
      breakDurationMinutes: t.breakDurationMinutes,
      minStaffing: t.minStaffing,
      color: t.color,
      description: t.description,
      requiredRoles: t.requiredRoles ? t.requiredRoles.split(',').map(r => r.trim()) : [],
      usageCount: t._count.assignedShifts,
    }));

    res.json({ success: true, templates: formatted });
  } catch (err) {
    next(err);
  }
});

// POST /api/templates (Manager only)
router.post('/', authenticate, requireRole('MANAGER'), validateBody(templateSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const rolesStr = Array.isArray(data.requiredRoles) ? data.requiredRoles.join(',') : data.requiredRoles;

    const tmpl = await prisma.shiftTemplate.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        startTime: data.startTime,
        endTime: data.endTime,
        durationHours: data.durationHours,
        breakDurationMinutes: data.breakDurationMinutes,
        minStaffing: data.minStaffing,
        color: data.color,
        description: data.description,
        requiredRoles: rolesStr,
        organizationId: req.user.organizationId,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'CREATE_TEMPLATE',
      entityType: 'TEMPLATE',
      entityId: tmpl.id,
      details: { name: tmpl.name, code: tmpl.code },
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, template: tmpl });
  } catch (err) {
    next(err);
  }
});

// PUT /api/templates/:id (Manager only)
router.put('/:id', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const data = req.body;
    const existing = await prisma.shiftTemplate.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Shift template not found.' });
    }

    const rolesStr = Array.isArray(data.requiredRoles) ? data.requiredRoles.join(',') : data.requiredRoles;

    const updated = await prisma.shiftTemplate.update({
      where: { id: req.params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.durationHours && { durationHours: data.durationHours }),
        ...(data.breakDurationMinutes && { breakDurationMinutes: data.breakDurationMinutes }),
        ...(data.minStaffing && { minStaffing: data.minStaffing }),
        ...(data.color && { color: data.color }),
        ...(data.description !== undefined && { description: data.description }),
        ...(rolesStr !== undefined && { requiredRoles: rolesStr }),
      },
    });

    res.json({ success: true, template: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/templates/:id (Manager only)
router.delete('/:id', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const existing = await prisma.shiftTemplate.findFirst({
      where: { id: req.params.id, organizationId: req.user.organizationId },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Shift template not found.' });
    }

    await prisma.shiftTemplate.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Shift template deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;

