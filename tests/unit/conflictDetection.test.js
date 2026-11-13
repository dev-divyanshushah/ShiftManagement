import { describe, it, expect } from 'vitest';
import { detectConflicts } from '../../backend/services/conflictService.js';

describe('Conflict Detection Service', () => {
  const employees = [
    {
      id: 'emp-101',
      name: 'John Doe',
      maxHoursPerWeek: 40,
      availability: ['Monday', 'Tuesday', 'Wednesday'],
    },
  ];

  it('detects OVERTIME violation when total hours exceed maxHoursPerWeek', () => {
    const shifts = [
      { id: 's1', employeeId: 'emp-101', day: 'Monday', startTime: '09:00', endTime: '17:00', durationHours: 12 },
      { id: 's2', employeeId: 'emp-101', day: 'Tuesday', startTime: '09:00', endTime: '17:00', durationHours: 12 },
      { id: 's3', employeeId: 'emp-101', day: 'Wednesday', startTime: '09:00', endTime: '17:00', durationHours: 12 },
      { id: 's4', employeeId: 'emp-101', day: 'Thursday', startTime: '09:00', endTime: '17:00', durationHours: 12 }, // Total 48 > 40
    ];

    const result = detectConflicts({ shifts, employees, leaves: [] });

    expect(result.hasConflicts).toBe(true);
    const overtimeConflict = result.conflicts.find(c => c.type === 'OVERTIME');
    expect(overtimeConflict).toBeDefined();
    expect(overtimeConflict.severity).toBe('critical');
  });

  it('detects AVAILABILITY conflict when scheduled on an unavailable rest day', () => {
    const shifts = [
      { id: 's1', employeeId: 'emp-101', day: 'Friday', startTime: '09:00', endTime: '17:00', durationHours: 8 }, // Friday not in avail
    ];

    const result = detectConflicts({ shifts, employees, leaves: [] });

    expect(result.hasConflicts).toBe(true);
    const availConflict = result.conflicts.find(c => c.type === 'AVAILABILITY');
    expect(availConflict).toBeDefined();
    expect(availConflict.day).toBe('Friday');
  });

  it('detects OVERLAP conflict when employee has concurrent shifts on the same day', () => {
    const shifts = [
      { id: 's1', employeeId: 'emp-101', day: 'Monday', startTime: '09:00', endTime: '17:00', durationHours: 8 },
      { id: 's2', employeeId: 'emp-101', day: 'Monday', startTime: '13:00', endTime: '21:00', durationHours: 8 }, // Overlaps 13:00-17:00!
    ];

    const result = detectConflicts({ shifts, employees, leaves: [] });

    expect(result.hasConflicts).toBe(true);
    const overlapConflict = result.conflicts.find(c => c.type === 'OVERLAP');
    expect(overlapConflict).toBeDefined();
    expect(overlapConflict.severity).toBe('critical');
  });

  it('detects APPROVED_LEAVE_OVERLAP when shift is assigned during approved absence', () => {
    const shifts = [
      { id: 's1', employeeId: 'emp-101', day: 'Monday', startTime: '09:00', endTime: '17:00', durationHours: 8 },
    ];
    const leaves = [
      { id: 'l1', employeeId: 'emp-101', leaveType: 'Sick Leave', status: 'Approved', startDate: '2026-11-09', endDate: '2026-11-10' },
    ];

    const result = detectConflicts({ shifts, employees, leaves });

    expect(result.hasConflicts).toBe(true);
    const leaveConflict = result.conflicts.find(c => c.type === 'APPROVED_LEAVE_OVERLAP');
    expect(leaveConflict).toBeDefined();
  });
});

