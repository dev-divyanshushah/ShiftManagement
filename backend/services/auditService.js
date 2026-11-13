import prisma from '../config/prisma.js';

export async function logAudit({
  userId = null,
  action,
  entityType,
  entityId = null,
  details = null,
  ipAddress = null,
  organizationId,
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
        organizationId,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

