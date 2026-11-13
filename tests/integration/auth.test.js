import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../backend/app.js';

describe('Authentication & RBAC Integration Tests', () => {
  it('rejects login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@shiftflow.com',
        password: 'WrongPassword!999',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('authenticates seed manager with valid credentials and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@shiftflow.com',
        password: 'Manager@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('MANAGER');
  });

  it('authenticates seed employee and enforces EMPLOYEE role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'employee@shiftflow.com',
        password: 'Employee@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('EMPLOYEE');
    expect(res.body.user.employeeId).toBe('EMP-1001');
  });

  it('rejects manager registration with an unauthorized invite code', async () => {
    const res = await request(app)
      .post('/api/auth/register-manager')
      .send({
        fullName: 'Intruder Manager',
        workEmail: 'intruder@shiftflow.com',
        password: 'SecurePassword123!',
        organizationName: 'Apex Contact Solutions',
        inviteCode: 'INVALID-CODE-XXX',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('allows manager registration with an authorized invitation code', async () => {
    const uniqueEmail = `newmgr_${Date.now()}@shiftflow.com`;
    const res = await request(app)
      .post('/api/auth/register-manager')
      .send({
        fullName: 'New Department Head',
        workEmail: uniqueEmail,
        password: 'SecurePassword123!',
        organizationName: 'Apex Contact Solutions',
        inviteCode: 'MGR-APEX-2026',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('MANAGER');
  });

  it('protects /api/auth/me against unauthenticated access', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

