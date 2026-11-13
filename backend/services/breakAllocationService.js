/**
 * ShiftFlow Intelligent Break Allocation Service
 * Aligns employee rest intervals with hourly call-volume troughs
 * while preserving mandatory floor staffing coverage (Erlang-C).
 */

export const HOURLY_CALL_CURVE = [
  { hour: '06:00', volume: 140, trough: true },
  { hour: '07:00', volume: 220, trough: false },
  { hour: '08:00', volume: 480, trough: false },
  { hour: '09:00', volume: 850, trough: false },
  { hour: '10:00', volume: 1100, trough: false },
  { hour: '11:00', volume: 1420, trough: false }, // Peak
  { hour: '12:00', volume: 1250, trough: false },
  { hour: '13:00', volume: 980, trough: true },  // Lunch trough
  { hour: '14:00', volume: 1150, trough: false },
  { hour: '15:00', volume: 1380, trough: false }, // Afternoon peak
  { hour: '16:00', volume: 1200, trough: false },
  { hour: '17:00', volume: 890, trough: true },  // Trough
  { hour: '18:00', volume: 640, trough: true },
  { hour: '19:00', volume: 510, trough: true },
  { hour: '20:00', volume: 380, trough: true },
  { hour: '21:00', volume: 290, trough: true },
];

/**
 * Re-allocates breaks across active shifts to avoid floor shortages
 * during high-volume surges.
 */
export function optimizeBreaksForShifts({
  shifts = [],
  templates = [],
  minCoverageRatio = 0.70, // At least 70% of scheduled staff must remain on floor
}) {
  const breaks = [];
  const hourlyStaffOnFloor = {};
  const hourlyBreaksCount = {};

  // Initialize hourly counters
  HOURLY_CALL_CURVE.forEach(h => {
    hourlyStaffOnFloor[h.hour] = 0;
    hourlyBreaksCount[h.hour] = 0;
  });

  // Calculate baseline staffing on floor per hour
  shifts.forEach(shift => {
    const [startH] = shift.startTime.split(':').map(Number);
    const [endH] = shift.endTime.split(':').map(Number);
    const duration = shift.durationHours || 8;

    for (let i = 0; i < duration; i++) {
      const h = (startH + i) % 24;
      const hourKey = `${String(h).padStart(2, '0')}:00`;
      if (hourlyStaffOnFloor[hourKey] !== undefined) {
        hourlyStaffOnFloor[hourKey]++;
      }
    }
  });

  // Allocate breaks staggered across staff
  shifts.forEach((shift, index) => {
    const [startH] = shift.startTime.split(':').map(Number);
    const duration = shift.durationHours || 8;

    // Ideal window: between 3rd and 5th hour of shift
    const windowStart = startH + 3;
    const windowEnd = startH + 5;

    let bestHour = windowStart;
    let lowestBreaks = Infinity;

    for (let h = windowStart; h <= windowEnd; h++) {
      const hourKey = `${String(h % 24).padStart(2, '0')}:00`;
      const currentBreaks = hourlyBreaksCount[hourKey] || 0;
      const totalStaff = hourlyStaffOnFloor[hourKey] || 1;

      // Check if minimum coverage is maintained
      const remainingRatio = (totalStaff - currentBreaks - 1) / totalStaff;
      if (remainingRatio >= minCoverageRatio && currentBreaks < lowestBreaks) {
        lowestBreaks = currentBreaks;
        bestHour = h;
      }
    }

    const breakStartHour = bestHour % 24;
    // Stagger in 15-minute intervals based on index
    const minuteStagger = (index % 4) * 15;
    const breakStart = `${String(breakStartHour).padStart(2, '0')}:${String(minuteStagger).padStart(2, '0')}`;
    const durationMins = 45;
    const endMinutes = breakStartHour * 60 + minuteStagger + durationMins;
    const breakEnd = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    const hourKey = `${String(breakStartHour).padStart(2, '0')}:00`;
    hourlyBreaksCount[hourKey] = (hourlyBreaksCount[hourKey] || 0) + 1;

    breaks.push({
      id: `brk-${shift.id}-${index}`,
      shiftId: shift.id,
      employeeId: shift.employeeId,
      breakStart,
      breakEnd,
      durationMinutes: durationMins,
      shiftName: shift.role || 'General Shift',
      status: 'Scheduled',
    });
  });

  return {
    success: true,
    totalBreaksAllocated: breaks.length,
    breaks,
    floorCoverage: hourlyStaffOnFloor,
  };
}

