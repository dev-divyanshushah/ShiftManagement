import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { env, managerInviteCodes, employeeInviteCodes } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

const registerManagerSchema = z.object({
  fullName: z.string().min(2),
  workEmail: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2),
  inviteCode: z.string().min(3),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

const registerEmployeeSchema = z.object({
  fullName: z.string().min(2),
  corporateEmail: z.string().email(),
  password: z.string().min(8),
  employeeId: z.string().min(3),
  inviteCode: z.string().min(3),
  department: z.string().optional(),
  role: z.string().optional(),
});

// POST /api/auth/login
router.post('/login', authLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        organization: true,
        employee: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      env.JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : env.JWT_EXPIRES_IN }
    );

    // Set secure HTTP-only cookie
    res.cookie('shiftflow_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
    });

    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      organizationId: user.organizationId,
      ipAddress: req.ip,
    });

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      employeeId: user.employee?.employeeId || user.employeeId || null,
      dbEmployeeId: user.employee?.id || null,
      organization: user.organization.name,
      department: user.employee?.role || 'Workforce Operations',
    };

    res.json({
      success: true,
      token,
      user: sanitizedUser,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register-manager
router.post('/register-manager', authLimiter, validateBody(registerManagerSchema), async (req, res, next) => {
  try {
    const { fullName, workEmail, password, organizationName, inviteCode, jobTitle } = req.body;
    const cleanEmail = workEmail.trim().toLowerCase();

    // Verify authorized invitation code
    if (!managerInviteCodes.includes(inviteCode.trim())) {
      return res.status(403).json({
        success: false,
        error: 'Invalid manager authorization code. Please request an invite code from your organization administrator.',
      });
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    // Find or create organization
    let org = await prisma.organization.findFirst({
      where: { name: organizationName.trim() },
    });
    if (!org) {
      const code = organizationName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      org = await prisma.organization.create({
        data: {
          name: organizationName.trim(),
          code: `${code}-${Date.now().toString().slice(-4)}`,
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        role: 'MANAGER',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4F46E5&color=fff`,
        organizationId: org.id,
      },
      include: {
        organization: true,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.cookie('shiftflow_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAudit({
      userId: user.id,
      action: 'REGISTER_MANAGER',
      entityType: 'USER',
      entityId: user.id,
      organizationId: org.id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        organization: org.name,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register-employee
router.post('/register-employee', authLimiter, validateBody(registerEmployeeSchema), async (req, res, next) => {
  try {
    const { fullName, corporateEmail, password, employeeId, inviteCode, department, role } = req.body;
    const cleanEmail = corporateEmail.trim().toLowerCase();

    // Verify authorized invitation code
    if (!employeeInviteCodes.includes(inviteCode.trim())) {
      return res.status(403).json({
        success: false,
        error: 'Invalid employee authorization code. Please contact your shift supervisor.',
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    // Default to first org or create default
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Apex Contact Solutions', code: 'APEX-CORP' },
      });
    }

    // Find or create employee record
    let emp = await prisma.employee.findUnique({ where: { employeeId } });
    if (!emp) {
      let dept = await prisma.department.findFirst({ where: { organizationId: org.id } });
      if (!dept) {
        dept = await prisma.department.create({
          data: { name: department || 'Customer Support', code: 'CS', organizationId: org.id },
        });
      }

      emp = await prisma.employee.create({
        data: {
          employeeId,
          name: fullName.trim(),
          email: cleanEmail,
          role: role || 'Support Specialist',
          departmentId: dept.id,
          organizationId: org.id,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284C7&color=fff`,
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        role: 'EMPLOYEE',
        employeeId: emp.id,
        avatar: emp.avatar,
        organizationId: org.id,
      },
      include: {
        organization: true,
        employee: true,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.cookie('shiftflow_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAudit({
      userId: user.id,
      action: 'REGISTER_EMPLOYEE',
      entityType: 'USER',
      entityId: user.id,
      organizationId: org.id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        employeeId: emp.employeeId,
        dbEmployeeId: emp.id,
        organization: org.name,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organization: true,
        employee: {
          include: {
            department: true,
            skills: { include: { skill: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        employeeId: user.employee?.employeeId || null,
        dbEmployeeId: user.employee?.id || null,
        organization: user.organization.name,
        department: user.employee?.department?.name || 'Operations',
        title: user.employee?.role || (user.role === 'MANAGER' ? 'Director of Operations' : 'Specialist'),
        skills: user.employee?.skills?.map(s => s.skill.name) || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  res.clearCookie('shiftflow_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;

