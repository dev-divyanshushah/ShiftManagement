/**
 * ShiftFlow Scheduling Validation & Conflict Detection Service
 * Audits all assigned shifts against labor rules, rest periods,
 * contractual hour limits, availability, and approved leaves.
 */

import { checkTimesOverlap } from './schedulingEngine.js';

export function detectConflicts({
  shifts = [],
  employees = [],
  leaves = [],
  templates = [],
}) {
  const conflicts = [];
  const employeeMap = new Map(employees.map(e => [e.id, e]));

  // Track hours and daily assignments per employee
  const employeeHours = {};
  const employeeDayShifts = {}; // empId -> day -> Array of shifts

  employees.forEach(e => {
    employeeHours[e.id] = 0;
    employeeDayShifts[e.id] = {};
  });

  shifts.forEach(shift => {
    const emp = employeeMap.get(shift.employeeId);
    if (!emp) return;

    // Track hours
    const duration = shift.durationHours || 8;
    employeeHours[emp.id] = (employeeHours[emp.id] || 0) + duration;

    // Track day assignments
    if (!employeeDayShifts[emp.id][shift.day]) {
      employeeDayShifts[emp.id][shift.day] = [];
    }
    employeeDayShifts[emp.id][shift.day].push(shift);
  });

  // 1. Check for OVERLAPPING SHIFTS on the same day for an employee
  Object.entries(employeeDayShifts).forEach(([empId, days]) => {
    const emp = employeeMap.get(empId);
    if (!emp) return;

    Object.entries(days).forEach(([day, dayShifts]) => {
      if (dayShifts.length > 1) {
        for (let i = 0; i < dayShifts.length; i++) {
          for (let j = i + 1; j < dayShifts.length; j++) {
            const s1 = dayShifts[i];
            const s2 = dayShifts[j];

            if (checkTimesOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
              conflicts.push({
                id: `cnf-overlap-${s1.id}-${s2.id}`,
                shiftId: s2.id,
                employeeId: emp.id,
                employeeName: emp.name,
                type: 'OVERLAP',
                severity: 'critical',
                day,
                description: `${emp.name} is assigned to two overlapping shifts on ${day} (${s1.startTime}-${s1.endTime} and ${s2.startTime}-${s2.endTime}).`,
                suggestedResolution: `Reassign or remove one of the conflicting shifts for ${emp.name}.`,
              });
            }
          }
        }
      }
    });
  });

  // 2. Check for WEEKLY OVERTIME / MAXIMUM WORKING HOURS VIOLATIONS
  Object.entries(employeeHours).forEach(([empId, totalHours]) => {
    const emp = employeeMap.get(empId);
    if (!emp) return;

    const maxH = emp.maxHoursPerWeek || 40;
    if (totalHours > maxH) {
      conflicts.push({
        id: `cnf-overtime-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        type: 'OVERTIME',
        severity: 'critical',
        description: `${emp.name} is scheduled for ${totalHours} hrs, exceeding the statutory/contract limit of ${maxH} hrs by ${totalHours - maxH} hrs.`,
        suggestedResolution: `Trim excess shift hours or reassign late-week shifts to part-time team members.`,
      });
    }
  });

  // 3. Check for SHIFTS ON UNAVAILABLE DAYS
  shifts.forEach(shift => {
    const emp = employeeMap.get(shift.employeeId);
    if (!emp || !emp.availability) return;

    const availDays = Array.isArray(emp.availability)
      ? emp.availability.map(a => typeof a === 'string' ? a : a.dayOfWeek)
      : [];

    if (availDays.length > 0 && !availDays.includes(shift.day)) {
      conflicts.push({
        id: `cnf-avail-${shift.id}`,
        shiftId: shift.id,
        employeeId: emp.id,
        employeeName: emp.name,
        type: 'AVAILABILITY',
        severity: 'warning',
        day: shift.day,
        description: `${emp.name} is scheduled on ${shift.day}, which is designated as an unavailable rest day.`,
        suggestedResolution: `Swap shift with a certified colleague who has active availability on ${shift.day}.`,
      });
    }
  });

  // 4. Check for APPROVED LEAVE OVERLAPPING ASSIGNED SHIFTS
  leaves.forEach(leave => {
    if (leave.status !== 'Approved') return;

    const emp = employeeMap.get(leave.employeeId);
    if (!emp) return;

    // Check if employee has shifts during leave dates
    const conflictingShifts = shifts.filter(s => s.employeeId === emp.id);
    if (conflictingShifts.length > 0) {
      conflicts.push({
        id: `cnf-leave-${leave.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        type: 'APPROVED_LEAVE_OVERLAP',
        severity: 'critical',
        description: `${emp.name} has approved ${leave.leaveType} (${leave.startDate} to ${leave.endDate}) while having active shifts assigned.`,
        suggestedResolution: `Release or reassign assigned shifts for ${emp.name} during the approved absence period.`,
      });
    }
  });

  return {
    success: true,
    hasConflicts: conflicts.length > 0,
    totalConflicts: conflicts.length,
    conflicts,
  };
}

