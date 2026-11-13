/**
 * ShiftFlow Intelligent Workforce Scheduling Engine
 * Multi-Pass Heuristic Constraint Satisfaction Solver
 * 
 * Separates Hard Constraints (must NEVER be violated)
 * from Soft Preferences (optimized via scoring heuristics).
 */

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const SENIORITY_WEIGHTS = {
  Lead: 4,
  Senior: 3,
  Mid: 2,
  Junior: 1,
};

/**
 * Calculates overlap between two time intervals [startA, endA] and [startB, endB]
 * Supports crossing midnight (e.g. 22:00 - 06:00).
 */
export function checkTimesOverlap(startA, endA, startB, endB) {
  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  let aStart = toMinutes(startA);
  let aEnd = toMinutes(endA);
  let bStart = toMinutes(startB);
  let bEnd = toMinutes(endB);

  // If crossing midnight
  if (aEnd <= aStart) aEnd += 24 * 60;
  if (bEnd <= bStart) bEnd += 24 * 60;

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

/**
 * Run the core constraint-based scheduling solver.
 * 
 * @param {Object} params
 * @param {Array} params.employees - Available employee records
 * @param {Array} params.templates - Active shift templates with requirements
 * @param {Array} params.existingShifts - Shifts already committed/locked
 * @param {Array} params.approvedLeaves - Approved leave records
 * @param {String} params.targetDepartment - Optional department filter ('All' or dept name)
 * @param {Boolean} params.respectAvailability - Strict availability enforcement
 * @param {Boolean} params.respectHourLimits - Strict weekly hour cap enforcement
 * @param {Boolean} params.balanceFairness - Soft preference for equitable distribution
 * @returns {Object} Solved schedule with candidate shifts, coverage stats, and conflict diagnostics
 */
export function solveSchedule({
  employees = [],
  templates = [],
  existingShifts = [],
  approvedLeaves = [],
  targetDepartment = 'All',
  respectAvailability = true,
  respectHourLimits = true,
  balanceFairness = true,
}) {
  // 1. Filter eligible pool based on department
  let candidatePool = [...employees];
  if (targetDepartment && targetDepartment !== 'All') {
    candidatePool = candidatePool.filter(e => e.department === targetDepartment || e.department?.name === targetDepartment);
  }

  // 2. Tracking structures for Hard Constraints
  const employeeHours = {};
  const employeeDaysWorked = {};
  const employeeAssignedDays = {}; // empId -> Set of days
  const employeeShifts = {};       // empId -> Array of shift objects

  candidatePool.forEach(e => {
    employeeHours[e.id] = 0;
    employeeDaysWorked[e.id] = 0;
    employeeAssignedDays[e.id] = new Set();
    employeeShifts[e.id] = [];
  });

  // Account for locked / existing shifts
  existingShifts.forEach(s => {
    if (employeeHours[s.employeeId] !== undefined) {
      employeeHours[s.employeeId] += s.durationHours || 8;
      employeeDaysWorked[s.employeeId] += 1;
      employeeAssignedDays[s.employeeId].add(s.day);
      employeeShifts[s.employeeId].push(s);
    }
  });

  const generatedShifts = [];
  const generatedBreaks = [];
  const unmetDemands = [];
  let hardConflictsPrevented = 0;
  let softPreferencesApplied = 0;

  // Active templates fallback
  const activeTemplates = templates.length > 0 ? templates : [
    { id: 'tmpl-1', name: 'Morning Shift', code: 'MORNING', startTime: '06:00', endTime: '14:00', durationHours: 8, minStaffing: 8, breakDurationMinutes: 45, requiredRoles: 'Support Specialist,Billing Analyst,Sales Representative' },
    { id: 'tmpl-2', name: 'General Shift', code: 'GENERAL', startTime: '09:00', endTime: '17:00', durationHours: 8, minStaffing: 14, breakDurationMinutes: 60, requiredRoles: 'Support Specialist,Senior Support Specialist,Technical Lead,Billing Analyst,QA Auditor' },
    { id: 'tmpl-3', name: 'Evening Shift', code: 'EVENING', startTime: '14:00', endTime: '22:00', durationHours: 8, minStaffing: 10, breakDurationMinutes: 45, requiredRoles: 'Support Specialist,Escalations Engineer,Retention Specialist' },
    { id: 'tmpl-4', name: 'Night Shift', code: 'NIGHT', startTime: '22:00', endTime: '06:00', durationHours: 8, minStaffing: 4, breakDurationMinutes: 60, requiredRoles: 'Support Specialist,Escalations Engineer,Technical Lead' },
    { id: 'tmpl-5', name: 'Peak Support Shift', code: 'PEAK', startTime: '11:00', endTime: '19:00', durationHours: 8, minStaffing: 6, breakDurationMinutes: 45, requiredRoles: 'Support Specialist,Sales Representative,Billing Analyst' },
  ];

  // 3. Iterate through each day of the scheduling horizon
  DAYS_OF_WEEK.forEach(day => {
    const isWeekend = day === 'Saturday' || day === 'Sunday';

    activeTemplates.forEach(tmpl => {
      // Base requirement scaled down on weekends
      const baseTarget = tmpl.minStaffing || 6;
      const targetHeadcount = isWeekend ? Math.max(2, Math.round(baseTarget * 0.4)) : baseTarget;

      let slotsFilled = 0;

      // Filter candidates using HARD CONSTRAINTS
      const eligible = candidatePool.filter(emp => {
        // HARD CONSTRAINT 1: No double assignment on same day (Overlap constraint)
        if (employeeAssignedDays[emp.id].has(day)) {
          return false;
        }

        // HARD CONSTRAINT 2: Approved Leave overlap
        const hasApprovedLeave = approvedLeaves.some(l => {
          return (l.employeeId === emp.id || l.employeeId === emp.employeeId) &&
            l.status === 'Approved';
        });
        if (hasApprovedLeave) {
          hardConflictsPrevented++;
          return false;
        }

        // HARD CONSTRAINT 3: Employee contractual Availability
        if (respectAvailability && emp.availability) {
          const availDays = Array.isArray(emp.availability)
            ? emp.availability.map(a => typeof a === 'string' ? a : a.dayOfWeek)
            : [];
          if (availDays.length > 0 && !availDays.includes(day)) {
            hardConflictsPrevented++;
            return false;
          }
        }

        // HARD CONSTRAINT 4: Maximum Weekly Working Hours
        const currentH = employeeHours[emp.id] || 0;
        const maxH = emp.maxHoursPerWeek || 40;
        const shiftDuration = tmpl.durationHours || 8;
        if (respectHourLimits && currentH + shiftDuration > maxH) {
          hardConflictsPrevented++;
          return false;
        }

        // HARD CONSTRAINT 5: Skill & Role compatibility
        const requiredRolesList = typeof tmpl.requiredRoles === 'string'
          ? tmpl.requiredRoles.split(',').map(r => r.trim())
          : (Array.isArray(tmpl.requiredRoles) ? tmpl.requiredRoles : []);

        if (requiredRolesList.length > 0) {
          const roleMatches = requiredRolesList.includes(emp.role);
          if (!roleMatches) {
            return false;
          }
        }

        return true;
      });

      // SOFT PREFERENCES OPTIMIZATION (Fairness, Seniority, Hour balancing)
      eligible.sort((a, b) => {
        // Preference 1: Prioritize employees with fewer hours scheduled (fairness)
        const hoursA = employeeHours[a.id] || 0;
        const hoursB = employeeHours[b.id] || 0;
        if (hoursA !== hoursB) {
          return hoursA - hoursB;
        }

        // Preference 2: Higher seniority gets priority for preferred shifts
        const weightA = SENIORITY_WEIGHTS[a.seniority] || 1;
        const weightB = SENIORITY_WEIGHTS[b.seniority] || 1;
        if (weightA !== weightB) {
          return weightB - weightA;
        }

        // Preference 3: Fewer days worked
        return (employeeDaysWorked[a.id] || 0) - (employeeDaysWorked[b.id] || 0);
      });

      // Assign shifts up to target headcount
      for (let i = 0; i < eligible.length && slotsFilled < targetHeadcount; i++) {
        const assignedEmp = eligible[i];
        const duration = tmpl.durationHours || 8;

        const shiftId = `shift-${day.toLowerCase()}-${assignedEmp.id}-${Date.now()}-${i}`;
        const newShift = {
          id: shiftId,
          employeeId: assignedEmp.id,
          employeeName: assignedEmp.name,
          templateId: tmpl.id,
          day,
          startTime: tmpl.startTime,
          endTime: tmpl.endTime,
          durationHours: duration,
          role: assignedEmp.role,
          department: assignedEmp.department?.name || assignedEmp.department || 'Customer Support',
          status: 'Published',
        };

        generatedShifts.push(newShift);
        employeeHours[assignedEmp.id] += duration;
        employeeDaysWorked[assignedEmp.id] += 1;
        employeeAssignedDays[assignedEmp.id].add(day);
        employeeShifts[assignedEmp.id].push(newShift);
        slotsFilled++;
        softPreferencesApplied++;

        // Staggered Break Allocation during Shift
        const [startHour, startMin] = tmpl.startTime.split(':').map(Number);
        // Place break at mid-shift
        const breakStartHour = Math.floor(startHour + duration / 2);
        const breakStart = `${String(breakStartHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
        const breakMinutes = tmpl.breakDurationMinutes || 45;
        const endTotalMin = breakStartHour * 60 + startMin + breakMinutes;
        const breakEnd = `${String(Math.floor(endTotalMin / 60)).padStart(2, '0')}:${String(endTotalMin % 60).padStart(2, '0')}`;

        generatedBreaks.push({
          id: `brk-${shiftId}`,
          shiftId,
          employeeId: assignedEmp.id,
          breakStart,
          breakEnd,
          durationMinutes: breakMinutes,
          shiftName: tmpl.name,
          status: 'Scheduled',
        });
      }

      // Check if demand was satisfied
      if (slotsFilled < targetHeadcount) {
        unmetDemands.push({
          day,
          templateName: tmpl.name,
          required: targetHeadcount,
          assigned: slotsFilled,
          shortfall: targetHeadcount - slotsFilled,
          reason: 'Insufficient eligible staff satisfying availability, working-hour limits, and role certification constraints.',
        });
      }
    });
  });

  // Calculate overall metrics
  const totalHoursScheduled = Object.values(employeeHours).reduce((acc, h) => acc + h, 0);
  const totalEmployeesAssigned = Object.keys(employeeHours).filter(id => employeeHours[id] > 0).length;
  const isFullySatisfied = unmetDemands.length === 0;

  return {
    success: true,
    isFullySatisfied,
    generatedShifts,
    generatedBreaks,
    metrics: {
      totalShifts: generatedShifts.length,
      totalBreaks: generatedBreaks.length,
      totalHoursScheduled,
      totalEmployeesAssigned,
      hardConflictsPrevented,
      softPreferencesApplied,
      unmetRequirementsCount: unmetDemands.length,
    },
    unmetDemands,
    employeeHourDistribution: employeeHours,
  };
}

