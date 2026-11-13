import express from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authenticate, requireRole, requireSelfOrManager } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

const employeeSchema = z.object({
  employeeId: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string().min(2),
  department: z.string().min(2),
  seniority: z.enum(['Lead', 'Senior', 'Mid', 'Junior']).default('Mid'),
  maxHoursPerWeek: z.number().min(10).max(60).default(40),
  hourlyRate: z.number().min(0).default(25),
  status: z.enum(['Full-Time', 'Part-Time', 'Contractor']).default('Full-Time'),
  skills: z.array(z.string()).default([]),
  availability: z.array(z.string()).default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
});

// GET /api/employees - List employees
router.get('/', authenticate, async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { organizationId: req.user.organizationId },
      include: {
        department: true,
        skills: { include: { skill: true } },
        availability: true,
      },
      orderBy: { employeeId: 'asc' },
    });

    const formatted = employees.map(e => ({
      id: e.id,
      employeeId: e.employeeId,
      name: e.name,
      email: e.email,
      role: e.role,
      department: e.department.name,
      seniority: e.seniority,
      maxHoursPerWeek: e.maxHoursPerWeek,
      hourlyRate: e.hourlyRate,
      status: e.status,
      avatar: e.avatar,
      skills: e.skills.map(s => s.skill.name),
      availability: e.availability.map(a => a.dayOfWeek),
    }));

    res.json({ success: true, employees: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [{ id: req.params.id }, { employeeId: req.params.id }],
        organizationId: req.user.organizationId,
      },
      include: {
        department: true,
        skills: { include: { skill: true } },
        availability: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    res.json({
      success: true,
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department.name,
        seniority: employee.seniority,
        maxHoursPerWeek: employee.maxHoursPerWeek,
        hourlyRate: employee.hourlyRate,
        status: employee.status,
        avatar: employee.avatar,
        skills: employee.skills.map(s => s.skill.name),
        availability: employee.availability.map(a => a.dayOfWeek),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/employees - Create employee (Manager only)
router.post('/', authenticate, requireRole('MANAGER'), validateBody(employeeSchema), async (req, res, next) => {
  try {
    const data = req.body;

    // Check duplicate employeeId or email
    const duplicate = await prisma.employee.findFirst({
      where: {
        OR: [{ employeeId: data.employeeId }, { email: data.email }],
      },
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: 'An employee with this Employee ID or Email already exists.',
      });
    }

    // Find or create department
    let dept = await prisma.department.findFirst({
      where: {
        name: data.department,
        organizationId: req.user.organizationId,
      },
    });
    if (!dept) {
      const code = data.department.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'DEPT';
      dept = await prisma.department.create({
        data: {
          name: data.department,
          code: `${code}-${Date.now().toString().slice(-3)}`,
          organizationId: req.user.organizationId,
        },
      });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        role: data.role,
        seniority: data.seniority,
        maxHoursPerWeek: data.maxHoursPerWeek,
        hourlyRate: data.hourlyRate,
        status: data.status,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=4F46E5&color=fff`,
        departmentId: dept.id,
        organizationId: req.user.organizationId,
      },
    });

    // Add availability days
    if (data.availability && data.availability.length > 0) {
      await prisma.employeeAvailability.createMany({
        data: data.availability.map(day => ({
          employeeId: employee.id,
          dayOfWeek: day,
          isAvailable: true,
          preferredShiftTypes: 'General Shift,Morning Shift',
          status: 'Approved',
        })),
      });
    }

    await logAudit({
      userId: req.user.id,
      action: 'CREATE_EMPLOYEE',
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      details: { name: employee.name, employeeId: employee.employeeId },
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, employee });
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id - Update employee (Manager only)
router.put('/:id', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const data = req.body;
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [{ id: req.params.id }, { employeeId: req.params.id }],
        organizationId: req.user.organizationId,
      },
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role }),
        ...(data.seniority && { seniority: data.seniority }),
        ...(data.maxHoursPerWeek !== undefined && { maxHoursPerWeek: data.maxHoursPerWeek }),
        ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
        ...(data.status && { status: data.status }),
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'UPDATE_EMPLOYEE',
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      details: data,
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.json({ success: true, employee: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/employees/:id - Delete employee (Manager only)
router.delete('/:id', authenticate, requireRole('MANAGER'), async (req, res, next) => {
  try {
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [{ id: req.params.id }, { employeeId: req.params.id }],
        organizationId: req.user.organizationId,
      },
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    await prisma.employee.delete({
      where: { id: employee.id },
    });

    await logAudit({
      userId: req.user.id,
      action: 'DELETE_EMPLOYEE',
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      details: { name: employee.name, employeeId: employee.employeeId },
      organizationId: req.user.organizationId,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Employee deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;

