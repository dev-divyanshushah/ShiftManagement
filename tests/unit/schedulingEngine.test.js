import { describe, it, expect } from 'vitest';
import { solveSchedule, checkTimesOverlap } from '../../backend/services/schedulingEngine.js';

describe('Scheduling Engine - Constraint Validation', () => {
  const mockEmployees = [
    {
      id: 'emp-1',
      employeeId: 'EMP-1',
      name: 'Alice Support',
      role: 'Support Specialist',
      seniority: 'Senior',
      maxHoursPerWeek: 40,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    {
      id: 'emp-2',
      employeeId: 'EMP-2',
      name: 'Bob PartTime',
      role: 'Support Specialist',
      seniority: 'Mid',
      maxHoursPerWeek: 16, // only 2 shifts max!
      availability: ['Monday', 'Tuesday'],
    },
    {
      id: 'emp-3',
      employeeId: 'EMP-3',
      name: 'Charlie Escalation',
      role: 'Escalations Engineer',
      seniority: 'Lead',
      maxHoursPerWeek: 40,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  ];

  const mockTemplates = [
    {
      id: 'tmpl-general',
      name: 'General Shift',
      code: 'GENERAL',
      startTime: '09:00',
      endTime: '17:00',
      durationHours: 8,
      minStaffing: 1,
      breakDurationMinutes: 60,
      requiredRoles: 'Support Specialist',
    },
  ];

  it('correctly calculates time interval overlaps', () => {
    // Standard overlap
    expect(checkTimesOverlap('09:00', '17:00', '14:00', '22:00')).toBe(true);
    // Non-overlapping sequential
    expect(checkTimesOverlap('06:00', '14:00', '14:00', '22:00')).toBe(false);
    // Disjoint
    expect(checkTimesOverlap('06:00', '10:00', '15:00', '20:00')).toBe(false);
  });

  it('enforces HARD CONSTRAINT: Never exceeds maxHoursPerWeek', () => {
    const result = solveSchedule({
      employees: mockEmployees,
      templates: mockTemplates,
      respectHourLimits: true,
    });

    expect(result.success).toBe(true);

    // Bob only has 16 hrs max. Must NOT have more than 16 hours assigned.
    const bobHours = result.employeeHourDistribution['emp-2'] || 0;
    expect(bobHours).toBeLessThanOrEqual(16);
  });

  it('enforces HARD CONSTRAINT: Never assigns on unavailable days', () => {
    const result = solveSchedule({
      employees: mockEmployees,
      templates: mockTemplates,
      respectAvailability: true,
    });

    expect(result.success).toBe(true);

    // Alice is unavailable on Saturday & Sunday
    const aliceShifts = result.generatedShifts.filter(s => s.employeeId === 'emp-1');
    const aliceDays = aliceShifts.map(s => s.day);

    expect(aliceDays.includes('Saturday')).toBe(false);
    expect(aliceDays.includes('Sunday')).toBe(false);
  });

  it('enforces HARD CONSTRAINT: Role / Skill matching', () => {
    const result = solveSchedule({
      employees: mockEmployees,
      templates: mockTemplates, // Requires 'Support Specialist'
    });

    expect(result.success).toBe(true);

    // Charlie is 'Escalations Engineer', not 'Support Specialist'
    const charlieShifts = result.generatedShifts.filter(s => s.employeeId === 'emp-3');
    expect(charlieShifts.length).toBe(0);
  });

  it('enforces HARD CONSTRAINT: Respects approved leaves', () => {
    const approvedLeaves = [
      { employeeId: 'emp-1', status: 'Approved', startDate: '2026-11-09', endDate: '2026-11-15' },
    ];

    const result = solveSchedule({
      employees: mockEmployees,
      templates: mockTemplates,
      approvedLeaves,
    });

    expect(result.success).toBe(true);

    // Alice has approved leave, should NOT be scheduled
    const aliceShifts = result.generatedShifts.filter(s => s.employeeId === 'emp-1');
    expect(aliceShifts.length).toBe(0);
  });

  it('correctly tracks and flags unmet staffing demands when capacity is insufficient', () => {
    const highDemandTemplate = [
      {
        id: 'tmpl-high',
        name: 'High Demand Shift',
        code: 'HIGH',
        startTime: '09:00',
        endTime: '17:00',
        durationHours: 8,
        minStaffing: 10, // requires 10 people, but only 2 support specialists exist!
        breakDurationMinutes: 60,
        requiredRoles: 'Support Specialist',
      },
    ];

    const result = solveSchedule({
      employees: mockEmployees,
      templates: highDemandTemplate,
    });

    expect(result.isFullySatisfied).toBe(false);
    expect(result.unmetDemands.length).toBeGreaterThan(0);
    expect(result.unmetDemands[0].shortfall).toBeGreaterThan(0);
  });
});

