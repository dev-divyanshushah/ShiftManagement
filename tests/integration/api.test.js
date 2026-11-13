import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../backend/app.js';

describe('Workforce Management Core API Integration Tests', () => {
  let managerToken = '';
  let employeeToken = '';

  beforeAll(async () => {
    // Login manager
    const mgrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@shiftflow.com', password: 'Manager@123' });
    managerToken = mgrRes.body.token;

    // Login employee
    const empRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'employee@shiftflow.com', password: 'Employee@123' });
    employeeToken = empRes.body.token;
  });

  it('GET /api/health returns 200 OK and database connected status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBe('connected');
  });

  it('GET /api/employees returns list of seeded employees', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.employees)).toBe(true);
    expect(res.body.employees.length).toBeGreaterThan(0);
  });

  it('POST /api/employees allows manager to create a new team member', async () => {
    const empId = `EMP-${Date.now().toString().slice(-4)}`;
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        employeeId: empId,
        name: 'Jordan Rivera',
        email: `jordan.${Date.now()}@shiftflow.com`,
        role: 'Support Specialist',
        department: 'Customer Support',
        seniority: 'Mid',
        maxHoursPerWeek: 40,
        hourlyRate: 26.0,
        status: 'Full-Time',
        skills: ['Omnichannel Zendesk'],
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.employee.employeeId).toBe(empId);
  });

  it('FORBIDS employee from creating an employee record (RBAC)', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        employeeId: 'EMP-HACK',
        name: 'Hacker',
        email: 'hack@shiftflow.com',
        role: 'Support Specialist',
        department: 'Customer Support',
      });

    expect(res.status).toBe(403);
  });

  it('manages full leave request workflow: submit -> review -> approve', async () => {
    // 1. Employee submits leave
    const leaveRes = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'Paid Time Off (PTO)',
        startDate: '2026-12-01',
        endDate: '2026-12-02',
        totalDays: 2,
        reason: 'Holiday vacation',
      });

    expect(leaveRes.status).toBe(201);
    const leaveId = leaveRes.body.leave.id;

    // 2. Manager approves leave
    const approveRes = await request(app)
      .put(`/api/leaves/${leaveId}/status`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'Approved', managerComment: 'Approved by supervisor' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.leave.status).toBe('Approved');
  });

  it('runs the scheduling optimizer engine transactionally via POST /api/shifts/generate', async () => {
    const res = await request(app)
      .post('/api/shifts/generate')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        respectAvailability: true,
        respectHourLimits: true,
        balanceFairness: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result.metrics.totalShifts).toBeGreaterThan(0);
  });

  it('runs conflict detection service via GET /api/conflicts', async () => {
    const res = await request(app)
      .get('/api/conflicts')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.conflicts)).toBe(true);
  });
});

