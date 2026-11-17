import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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

// Set to track used SSO nonces for one-time replay prevention
const usedSsoNonces = new Set();

// POST /api/auth/sso-exchange
router.post('/sso-exchange', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'SSO launch token is required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        error: 'SSO launch token is invalid or has expired. Please launch again from Insigrow.'
      });
    }

    if (decoded.type !== 'INSIGROW_SSO_LAUNCH') {
      return res.status(401).json({ success: false, error: 'Invalid launch token type.' });
    }

    // Nonce replay check
    if (decoded.nonce) {
      if (usedSsoNonces.has(decoded.nonce)) {
        return res.status(401).json({
          success: false,
          error: 'This launch token has already been used. Please launch again from Insigrow.'
        });
      }
      usedSsoNonces.add(decoded.nonce);
      setTimeout(() => usedSsoNonces.delete(decoded.nonce), 120000);
    }

    const cleanEmail = (decoded.email || '').trim().toLowerCase();
    const fullName = (decoded.name || 'Insigrow User').trim();
    const role = (decoded.role || 'MANAGER').toUpperCase() === 'EMPLOYEE' ? 'EMPLOYEE' : 'MANAGER';
    const orgName = (decoded.organizationName || 'Apex Contact Solutions').trim();

    // 1. Locate primary organization or create if none exists
    let org = await prisma.organization.findFirst({
      where: { name: orgName }
    });
    if (!org) {
      org = await prisma.organization.findFirst();
    }
    if (!org) {
      org = await prisma.organization.create({
        data: { name: orgName, code: 'APEX-CORP' }
      });
    }

    // 2. Locate or create User
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { organization: true, employee: true }
    });

    let employee = null;

    if (!user) {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

      if (role === 'EMPLOYEE') {
        let dept = await prisma.department.findFirst({ where: { organizationId: org.id } });
        if (!dept) {
          dept = await prisma.department.create({
            data: { name: 'Customer Support', code: 'CS', organizationId: org.id }
          });
        }

        const empCount = await prisma.employee.count({ where: { organizationId: org.id } });
        employee = await prisma.employee.create({
          data: {
            employeeId: `EMP-${1000 + empCount + 1}`,
            name: fullName,
            email: cleanEmail,
            role: 'Support Specialist',
            seniority: 'Mid',
            maxHoursPerWeek: 40,
            hourlyRate: 25,
            status: 'Full-Time',
            departmentId: dept.id,
            organizationId: org.id,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=087F8C&color=fff`
          }
        });
      }

      user = await prisma.user.create({
        data: {
          name: fullName,
          email: cleanEmail,
          passwordHash,
          role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=087F8C&color=fff`,
          organizationId: org.id,
          employeeId: employee ? employee.id : null
        },
        include: { organization: true, employee: true }
      });
    } else {
      if (role === 'EMPLOYEE' && !user.employeeId) {
        let dept = await prisma.department.findFirst({ where: { organizationId: org.id } });
        const empCount = await prisma.employee.count({ where: { organizationId: org.id } });
        employee = await prisma.employee.create({
          data: {
            employeeId: `EMP-${1000 + empCount + 1}`,
            name: fullName,
            email: cleanEmail,
            role: 'Support Specialist',
            seniority: 'Mid',
            maxHoursPerWeek: 40,
            hourlyRate: 25,
            status: 'Full-Time',
            departmentId: dept ? dept.id : 'default',
            organizationId: org.id,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=087F8C&color=fff`
          }
        });
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role, employeeId: employee.id },
          include: { organization: true, employee: true }
        });
      } else if (user.role !== role) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role },
          include: { organization: true, employee: true }
        });
      }
    }

    // Generate authenticated ShiftPlanner JWT Token
    const sessionToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        dbEmployeeId: user.employee?.id || user.employeeId || null
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    // Set secure HTTP-only cookie
    res.cookie('shiftflow_token', sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logAudit({
      userId: user.id,
      action: 'SSO_INSIGROW_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      organizationId: org.id,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        employeeId: user.employee?.employeeId || null,
        dbEmployeeId: user.employee?.id || null,
        organization: org.name,
        department: user.employee?.department?.name || 'Operations',
        title: user.employee?.role || (user.role === 'MANAGER' ? 'Director of Operations' : 'Specialist')
      },
      targetRoute: decoded.targetRoute || (role === 'EMPLOYEE' ? '/employee/dashboard' : '/overview')
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

