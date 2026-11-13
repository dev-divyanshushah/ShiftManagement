import { describe, it, expect } from 'vitest';
import { optimizeBreaksForShifts } from '../../backend/services/breakAllocationService.js';

describe('Break Allocation Service', () => {
  const mockShifts = [
    { id: 's1', employeeId: 'e1', startTime: '09:00', endTime: '17:00', durationHours: 8, role: 'Support' },
    { id: 's2', employeeId: 'e2', startTime: '09:00', endTime: '17:00', durationHours: 8, role: 'Support' },
    { id: 's3', employeeId: 'e3', startTime: '09:00', endTime: '17:00', durationHours: 8, role: 'Support' },
    { id: 's4', employeeId: 'e4', startTime: '09:00', endTime: '17:00', durationHours: 8, role: 'Support' },
  ];

  it('allocates breaks within shift duration boundaries', () => {
    const result = optimizeBreaksForShifts({ shifts: mockShifts });

    expect(result.success).toBe(true);
    expect(result.totalBreaksAllocated).toBe(4);

    result.breaks.forEach(b => {
      const [startH] = b.breakStart.split(':').map(Number);
      // Breaks should be allocated during working hours (after 09:00 and before 17:00)
      expect(startH).toBeGreaterThanOrEqual(9);
      expect(startH).toBeLessThan(17);
      expect(b.durationMinutes).toBe(45);
    });
  });

  it('staggers breaks so that employees do not all take breaks at the exact same minute', () => {
    const result = optimizeBreaksForShifts({ shifts: mockShifts });

    const startTimes = result.breaks.map(b => b.breakStart);
    const uniqueTimes = new Set(startTimes);

    // Should have staggered start times
    expect(uniqueTimes.size).toBeGreaterThan(1);
  });
});

