import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.shiftflow_token) {
      // Check HTTP-only cookie
      token = req.cookies.shiftflow_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Look up user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        employee: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or has been revoked.',
      });
    }

    // Attach verified user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role, // Always server-validated role: "MANAGER" or "EMPLOYEE"
      name: user.name,
      employeeId: user.employee?.employeeId || user.employeeId || null,
      dbEmployeeId: user.employee?.id || null,
      organizationId: user.organizationId,
      avatar: user.avatar,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware
 * Ensures the authenticated user possesses one of the allowed roles.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const normalizedRole = req.user.role.toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!normalizedAllowed.includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden. Requires ${allowedRoles.join(' or ')} privilege.`,
      });
    }

    next();
  };
}

/**
 * Ensures an employee can only read/write their own records,
 * while managers have full organization-wide visibility.
 */
export function requireSelfOrManager(getEmpIdFromReq) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    if (req.user.role.toUpperCase() === 'MANAGER') {
      return next();
    }

    const requestedEmpId = typeof getEmpIdFromReq === 'function'
      ? getEmpIdFromReq(req)
      : req.params.employeeId || req.query.employeeId || req.body.employeeId;

    if (!requestedEmpId) {
      return res.status(400).json({ success: false, error: 'Missing employee identification.' });
    }

    const isMatch =
      requestedEmpId === req.user.employeeId ||
      requestedEmpId === req.user.dbEmployeeId;

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permission to access another employee records.',
      });
    }

    next();
  };
}

