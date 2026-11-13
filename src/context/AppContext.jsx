import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_EMPLOYEES,
  INITIAL_SHIFTS,
  INITIAL_TEMPLATES,
  INITIAL_BREAKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_SWAP_REQUESTS,
  INITIAL_AVAILABILITY_REQUESTS,
  DAYS_OF_WEEK,
  HOURLY_CALL_CURVE,
  WEEKLY_DEMAND_FORECAST,
} from '../data/mockData';
import { calculateShiftDurationHours, checkTimesOverlap, isHourInShift, getMonday, addDays } from '../utils/dateUtils';
import { runScheduleOptimizer } from '../utils/schedulerOptimizer';
import { api } from '../utils/api';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  EMPLOYEES: 'shiftflow_employees_v3',
  SHIFTS: 'shiftflow_shifts_v3',
  TEMPLATES: 'shiftflow_templates_v3',
  BREAKS: 'shiftflow_breaks_v3',
  NOTIFICATIONS: 'shiftflow_notifications_v3',
  SETTINGS: 'shiftflow_settings_v3',
  STATUS: 'shiftflow_schedule_status_v3',
  LEAVE_REQUESTS: 'shiftflow_leave_requests_v3',
  SWAP_REQUESTS: 'shiftflow_swap_requests_v3',
  AVAILABILITY_REQUESTS: 'shiftflow_availability_requests_v3',
};

export const AppProvider = ({ children }) => {
  // --- Persistent States ---
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [shifts, setShifts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
    } catch {
      return INITIAL_SHIFTS;
    }
  });

  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
    } catch {
      return INITIAL_TEMPLATES;
    }
  });

  const [breaks, setBreaks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BREAKS);
      return saved ? JSON.parse(saved) : INITIAL_BREAKS;
    } catch {
      return INITIAL_BREAKS;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [scheduleStatus, setScheduleStatus] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATUS);
      return saved ? JSON.parse(saved) : 'Draft';
    } catch {
      return 'Draft';
    }
  });

  // --- Requests Persistence ---
  const [leaveRequests, setLeaveRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
    } catch {
      return INITIAL_LEAVE_REQUESTS;
    }
  });

  const [swapRequests, setSwapRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SWAP_REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_SWAP_REQUESTS;
    } catch {
      return INITIAL_SWAP_REQUESTS;
    }
  });

  const [availabilityRequests, setAvailabilityRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AVAILABILITY_REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_AVAILABILITY_REQUESTS;
    } catch {
      return INITIAL_AVAILABILITY_REQUESTS;
    }
  });

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));

  // Active filters and global search
  const [globalSearch, setGlobalSearch] = useState('');
  const [dismissedConflictIds, setDismissedConflictIds] = useState(new Set());

  // --- LocalStorage Synchronization ---
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees)); } catch (e) {}
  }, [employees]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts)); } catch (e) {}
  }, [shifts]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates)); } catch (e) {}
  }, [templates]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.BREAKS, JSON.stringify(breaks)); } catch (e) {}
  }, [breaks]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(scheduleStatus)); } catch (e) {}
  }, [scheduleStatus]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaveRequests)); } catch (e) {}
  }, [leaveRequests]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SWAP_REQUESTS, JSON.stringify(swapRequests)); } catch (e) {}
  }, [swapRequests]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.AVAILABILITY_REQUESTS, JSON.stringify(availabilityRequests)); } catch (e) {}
  }, [availabilityRequests]);

  // --- Backend API Initial Sync ---
  const refreshFromBackend = useCallback(async () => {
    try {
      const [empRes, shiftRes, tmplRes, breakRes, leaveRes, swapRes, notifRes] = await Promise.allSettled([
        api.getEmployees(),
        api.getShifts(),
        api.getTemplates(),
        api.getBreaks(),
        api.getLeaves(),
        api.getSwaps(),
        api.getNotifications(),
      ]);

      if (empRes.status === 'fulfilled' && empRes.value.success && empRes.value.employees?.length > 0) {
        setEmployees(empRes.value.employees);
      }
      if (shiftRes.status === 'fulfilled' && shiftRes.value.success && shiftRes.value.shifts?.length > 0) {
        setShifts(shiftRes.value.shifts);
      }
      if (tmplRes.status === 'fulfilled' && tmplRes.value.success && tmplRes.value.templates?.length > 0) {
        setTemplates(tmplRes.value.templates);
      }
      if (breakRes.status === 'fulfilled' && breakRes.value.success && breakRes.value.breaks?.length > 0) {
        setBreaks(breakRes.value.breaks);
      }
      if (leaveRes.status === 'fulfilled' && leaveRes.value.success) {
        setLeaveRequests(leaveRes.value.leaves);
      }
      if (swapRes.status === 'fulfilled' && swapRes.value.success) {
        setSwapRequests(swapRes.value.swaps);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.success) {
        setNotifications(notifRes.value.notifications);
      }
    } catch (err) {
      console.warn('Backend sync deferred; running in client cache mode:', err.message);
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  // Notifications Helper
  const addNotification = useCallback((notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      read: false,
      ...notif,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // --- Dynamic Live Scheduled Staff Calculation ---
  const getLiveScheduledStaffForHour = useCallback((dayName, hourNum) => {
    const dayShifts = shifts.filter(s => s.day === dayName);
    let count = 0;
    dayShifts.forEach(shift => {
      if (isHourInShift(hourNum, shift.startTime, shift.endTime)) {
        count++;
      }
    });
    return count;
  }, [shifts]);

  const getHourlyDemandForDay = useCallback((dayName, surgeModifier = 0) => {
    const baseDayForecast = WEEKLY_DEMAND_FORECAST[dayName] || HOURLY_CALL_CURVE;
    const factor = 1 + (surgeModifier / 100);

    return baseDayForecast.map(item => {
      const hourNum = parseInt(item.hour.split(':')[0], 10);
      const liveScheduled = getLiveScheduledStaffForHour(dayName, hourNum);
      const adjustedCalls = Math.round(item.callVolume * factor);
      const adjustedRequired = Math.max(2, Math.round(item.requiredStaff * factor));
      const deficit = adjustedRequired - liveScheduled;

      return {
        ...item,
        callVolume: adjustedCalls,
        requiredStaff: adjustedRequired,
        scheduledStaff: liveScheduled,
        deficit: deficit > 0 ? deficit : 0,
        isShortage: deficit > 0,
      };
    });
  }, [getLiveScheduledStaffForHour]);

  // --- Real-time Conflict Engine ---
  const conflicts = useMemo(() => {
    const list = [];
    const empMap = new Map(employees.map(e => [e.id, e]));

    const empDayShifts = {};
    const empTotalHours = {};

    shifts.forEach(shift => {
      const dur = calculateShiftDurationHours(shift.startTime, shift.endTime);
      empTotalHours[shift.employeeId] = (empTotalHours[shift.employeeId] || 0) + dur;

      const key = `${shift.employeeId}_${shift.day}`;
      if (!empDayShifts[key]) empDayShifts[key] = [];
      empDayShifts[key].push(shift);
    });

    // Check 1: Overlaps
    Object.entries(empDayShifts).forEach(([key, dayShifts]) => {
      if (dayShifts.length > 1) {
        for (let i = 0; i < dayShifts.length; i++) {
          for (let j = i + 1; j < dayShifts.length; j++) {
            const s1 = dayShifts[i];
            const s2 = dayShifts[j];
            if (checkTimesOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
              const emp = empMap.get(s1.employeeId);
              list.push({
                id: `conflict-overlap-${s1.id}-${s2.id}`,
                type: 'overlap',
                severity: 'critical',
                employeeId: s1.employeeId,
                employeeName: emp ? emp.name : 'Unknown Agent',
                department: s1.department || (emp && emp.department),
                day: s1.day,
                time: `${s1.startTime}-${s1.endTime} overlaps with ${s2.startTime}-${s2.endTime}`,
                title: 'Overlapping Shift Collision',
                description: `${emp ? emp.name : 'Employee'} is double-booked on ${s1.day} with overlapping hours.`,
                suggestedResolution: 'Eliminate overlapping shift from roster to ensure single seat occupancy.',
                shiftIds: [s1.id, s2.id],
                autoResolvable: true,
              });
            }
          }
        }
      }
    });

    // Check 2: Weekly Overtime Limits
    employees.forEach(emp => {
      const scheduled = empTotalHours[emp.id] || 0;
      const maxLimit = emp.maxHoursPerWeek || 40;
      if (scheduled > maxLimit) {
        const empShifts = shifts.filter(s => s.employeeId === emp.id);
        list.push({
          id: `conflict-overtime-${emp.id}`,
          type: 'overtime',
          severity: 'warning',
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          day: 'Weekly Total',
          time: `${scheduled}h scheduled / ${maxLimit}h limit`,
          title: 'Maximum Weekly Hours Exceeded',
          description: `${emp.name} is scheduled for ${scheduled}h, exceeding policy cap of ${maxLimit}h by ${(scheduled - maxLimit).toFixed(1)}h.`,
          suggestedResolution: 'Reassign excess shift to an under-utilized peer to prevent overtime billing.',
          shiftIds: empShifts.map(s => s.id),
          autoResolvable: true,
        });
      }
    });

    // Check 3: Availability Violations
    shifts.forEach(shift => {
      const emp = empMap.get(shift.employeeId);
      if (emp && emp.availability && emp.availability.length > 0) {
        if (!emp.availability.includes(shift.day)) {
          list.push({
            id: `conflict-avail-${shift.id}`,
            type: 'availability',
            severity: 'warning',
            employeeId: emp.id,
            employeeName: emp.name,
            department: emp.department,
            day: shift.day,
            time: `${shift.startTime} - ${shift.endTime}`,
            title: 'Unavailability Constraint Violation',
            description: `${emp.name} is scheduled on ${shift.day}, but is unavailable per their schedule profile.`,
            suggestedResolution: 'Reassign shift to an available team member in the same department.',
            shiftIds: [shift.id],
            autoResolvable: true,
          });
        }
      }
    });

    // Check 4: Understaffed Shift Slots
    DAYS_OF_WEEK.forEach(day => {
      const dayShifts = shifts.filter(s => s.day === day);
      templates.forEach(tmpl => {
        const matchingShifts = dayShifts.filter(s => s.templateId === tmpl.id);
        const minRequired = ['Saturday', 'Sunday'].includes(day) ? Math.max(2, Math.round(tmpl.minStaffing * 0.4)) : (tmpl.minStaffing || 6);
        if (matchingShifts.length < minRequired) {
          list.push({
            id: `conflict-understaff-${tmpl.id}-${day}`,
            type: 'understaffed',
            severity: 'critical',
            department: 'All Departments',
            day,
            time: `${tmpl.startTime} - ${tmpl.endTime}`,
            title: `Understaffed: ${tmpl.name}`,
            description: `Only ${matchingShifts.length} agents scheduled for ${tmpl.name} on ${day} (Required: ${minRequired}).`,
            suggestedResolution: 'Assign an available under-capacity agent to this slot.',
            templateId: tmpl.id,
            dayName: day,
            shiftIds: [],
            autoResolvable: true,
          });
        }
      });
    });

    return list.filter(c => !dismissedConflictIds.has(c.id));
  }, [employees, shifts, templates, dismissedConflictIds]);

  const dismissConflict = useCallback((id) => {
    setDismissedConflictIds(prev => new Set(prev).add(id));
  }, []);

  // Conflict Resolver
  const resolveConflict = useCallback((conflict) => {
    if (conflict.type === 'overlap' && conflict.shiftIds && conflict.shiftIds.length > 1) {
      const shiftToRemove = conflict.shiftIds[1];
      setShifts(prev => prev.filter(s => s.id !== shiftToRemove));
      setBreaks(prev => prev.filter(b => b.shiftId !== shiftToRemove));
      dismissConflict(conflict.id);
      addNotification({
        title: 'Overlapping Shift Removed',
        message: `Removed duplicate shift on ${conflict.day} for ${conflict.employeeName}. Schedule is now valid.`,
        type: 'success',
      });
    } else if (conflict.type === 'overtime') {
      const emp = employees.find(e => e.id === conflict.employeeId);
      const empShifts = shifts.filter(s => s.employeeId === conflict.employeeId);
      if (empShifts.length > 0) {
        const excessShift = empShifts[empShifts.length - 1];
        
        const candidate = employees.find(e => {
          if (e.id === emp.id) return false;
          if (e.department !== emp.department) return false;
          const currentHours = shifts
            .filter(s => s.employeeId === e.id)
            .reduce((sum, s) => sum + calculateShiftDurationHours(s.startTime, s.endTime), 0);
          const maxHours = e.maxHoursPerWeek || 40;
          const alreadyWorkingThatDay = shifts.some(s => s.employeeId === e.id && s.day === excessShift.day);
          const isAvail = e.availability?.includes(excessShift.day);
          return currentHours + 8 <= maxHours && !alreadyWorkingThatDay && isAvail;
        });

        if (candidate) {
          setShifts(prev => prev.map(s => s.id === excessShift.id ? { ...s, employeeId: candidate.id, role: candidate.role } : s));
          setBreaks(prev => prev.map(b => b.shiftId === excessShift.id ? { ...b, employeeId: candidate.id, employeeName: candidate.name, role: candidate.role } : b));
          dismissConflict(conflict.id);
          addNotification({
            title: 'Overtime Resolved: Shift Reassigned',
            message: `Reassigned ${excessShift.day} shift from ${emp.name} to ${candidate.name} (${candidate.department}). Overtime cap restored.`,
            type: 'success',
          });
        } else {
          setShifts(prev => prev.filter(s => s.id !== excessShift.id));
          setBreaks(prev => prev.filter(b => b.shiftId !== excessShift.id));
          dismissConflict(conflict.id);
          addNotification({
            title: 'Overtime Shift Removed',
            message: `Removed excess shift for ${emp.name} to stay within ${emp.maxHoursPerWeek}h weekly limit.`,
            type: 'success',
          });
        }
      }
    } else if (conflict.type === 'availability') {
      const shiftId = conflict.shiftIds[0];
      const shiftToMove = shifts.find(s => s.id === shiftId);
      if (shiftToMove) {
        const candidate = employees.find(e => {
          if (e.id === shiftToMove.employeeId) return false;
          if (e.department !== shiftToMove.department) return false;
          const isAvail = e.availability?.includes(shiftToMove.day);
          const alreadyWorking = shifts.some(s => s.employeeId === e.id && s.day === shiftToMove.day);
          const currentHours = shifts
            .filter(s => s.employeeId === e.id)
            .reduce((sum, s) => sum + calculateShiftDurationHours(s.startTime, s.endTime), 0);
          return isAvail && !alreadyWorking && currentHours + 8 <= (e.maxHoursPerWeek || 40);
        });

        if (candidate) {
          setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, employeeId: candidate.id, role: candidate.role } : s));
          setBreaks(prev => prev.map(b => b.shiftId === shiftId ? { ...b, employeeId: candidate.id, employeeName: candidate.name } : b));
          dismissConflict(conflict.id);
          addNotification({
            title: 'Shift Swapped for Availability',
            message: `Shift on ${shiftToMove.day} reassigned from ${conflict.employeeName} to ${candidate.name}.`,
            type: 'success',
          });
        } else {
          setShifts(prev => prev.filter(s => s.id !== shiftId));
          setBreaks(prev => prev.filter(b => b.shiftId !== shiftId));
          dismissConflict(conflict.id);
          addNotification({
            title: 'Shift Cancelled',
            message: `Removed shift on ${shiftToMove.day} for ${conflict.employeeName} due to confirmed unavailability.`,
            type: 'info',
          });
        }
      }
    } else if (conflict.type === 'understaffed') {
      const tmpl = templates.find(t => t.id === conflict.templateId);
      const day = conflict.dayName;
      if (tmpl && day) {
        const candidate = employees.find(e => {
          const isAvail = e.availability?.includes(day);
          const alreadyWorking = shifts.some(s => s.employeeId === e.id && s.day === day);
          const currentHours = shifts
            .filter(s => s.employeeId === e.id)
            .reduce((sum, s) => sum + calculateShiftDurationHours(s.startTime, s.endTime), 0);
          const roleMatch = !tmpl.requiredRoles || tmpl.requiredRoles.includes(e.role) || e.department === 'Customer Support';
          return isAvail && !alreadyWorking && currentHours + 8 <= (e.maxHoursPerWeek || 40) && roleMatch;
        });

        if (candidate) {
          const newShiftId = `s-${Date.now()}`;
          const newShift = {
            id: newShiftId,
            employeeId: candidate.id,
            day,
            templateId: tmpl.id,
            startTime: tmpl.startTime,
            endTime: tmpl.endTime,
            role: candidate.role,
            department: candidate.department,
          };
          setShifts(prev => [...prev, newShift]);
          dismissConflict(conflict.id);
          addNotification({
            title: 'Staffing Shortage Filled',
            message: `Assigned ${candidate.name} to ${tmpl.name} on ${day}. Staffing deficit resolved.`,
            type: 'success',
          });
        }
      }
    } else {
      dismissConflict(conflict.id);
    }
  }, [employees, shifts, templates, dismissConflict, addNotification]);

  // Move shift (Drag & drop)
  const moveShift = useCallback((shiftId, targetEmployeeId, targetDay) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return false;

    const targetEmp = employees.find(e => e.id === targetEmployeeId);
    if (!targetEmp) return false;

    const existingShiftOnDay = shifts.find(s => s.employeeId === targetEmployeeId && s.day === targetDay && s.id !== shiftId);
    if (existingShiftOnDay) {
      addNotification({
        title: 'Cannot Move Shift: Overlap Conflict',
        message: `${targetEmp.name} is already working on ${targetDay} (${existingShiftOnDay.startTime} - ${existingShiftOnDay.endTime}).`,
        type: 'critical',
      });
      return false;
    }

    if (targetEmp.availability && !targetEmp.availability.includes(targetDay)) {
      addNotification({
        title: 'Availability Warning',
        message: `${targetEmp.name} has noted they are unavailable on ${targetDay}. Shift moved with policy warning flag.`,
        type: 'warning',
      });
    }

    setShifts(prev => prev.map(s => s.id === shiftId ? {
      ...s,
      employeeId: targetEmployeeId,
      day: targetDay,
      department: targetEmp.department,
      role: targetEmp.role,
    } : s));

    setBreaks(prev => prev.map(b => b.shiftId === shiftId ? {
      ...b,
      employeeId: targetEmployeeId,
      employeeName: targetEmp.name,
      role: targetEmp.role,
    } : b));

    addNotification({
      title: 'Shift Rescheduled',
      message: `Shift moved to ${targetEmp.name} for ${targetDay}.`,
      type: 'success',
    });

    return true;
  }, [shifts, employees, addNotification]);

  // --- CRUD for Employees ---
  const addEmployee = useCallback((newEmp) => {
    const id = `EMP-${1000 + employees.length + 1}`;
    const emp = {
      id,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + employees.length}?w=150&auto=format&fit=crop&q=80`,
      status: 'Full-Time',
      maxHoursPerWeek: 40,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      skills: ['Customer Support', 'Omnichannel Queue'],
      seniority: 'Mid',
      hourlyRate: 25.0,
      hireDate: new Date().toISOString().split('T')[0],
      ...newEmp,
    };
    setEmployees(prev => [emp, ...prev]);
    addNotification({
      title: 'Employee Onboarded',
      message: `${emp.name} added to ${emp.department} as ${emp.role}.`,
      type: 'success',
    });
    return emp;
  }, [employees.length, addNotification]);

  const updateEmployee = useCallback((id, updatedFields) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
    addNotification({
      title: 'Employee Profile Updated',
      message: `Employee details updated successfully.`,
      type: 'info',
    });
  }, [addNotification]);

  const deleteEmployee = useCallback((id) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    setShifts(prev => prev.filter(s => s.employeeId !== id));
    setBreaks(prev => prev.filter(b => b.employeeId !== id));
    addNotification({
      title: 'Employee Removed',
      message: `${emp ? emp.name : id} and their assigned shifts were removed.`,
      type: 'warning',
    });
  }, [employees, addNotification]);

  // --- CRUD for Shifts ---
  const addShift = useCallback(async (newShift) => {
    const emp = employees.find(e => e.id === newShift.employeeId || e.employeeId === newShift.employeeId);
    const tmpl = templates.find(t => t.id === newShift.templateId);
    const id = `s-${Date.now()}`;
    const shift = {
      id,
      startTime: tmpl ? tmpl.startTime : (newShift.startTime || '09:00'),
      endTime: tmpl ? tmpl.endTime : (newShift.endTime || '17:00'),
      role: emp ? emp.role : 'Support Specialist',
      department: emp ? emp.department : 'Customer Support',
      templateId: tmpl ? tmpl.id : 'tmpl-2',
      ...newShift,
    };

    setShifts(prev => [...prev, shift]);
    
    // Auto-create break entry
    const [sh] = shift.startTime.split(':').map(Number);
    const breakHour = (sh + 4) % 24;
    setBreaks(prev => [
      ...prev,
      {
        id: `brk-${id}`,
        shiftId: id,
        employeeId: shift.employeeId,
        employeeName: emp ? emp.name : 'Agent',
        shiftName: `${tmpl ? tmpl.name : 'Shift'} (${shift.startTime} - ${shift.endTime})`,
        breakStart: `${String(breakHour).padStart(2, '0')}:15`,
        durationMinutes: tmpl ? tmpl.breakDurationMinutes : 45,
        status: 'Scheduled',
        role: shift.role,
      }
    ]);

    addNotification({
      title: 'Shift Scheduled',
      message: `Shift assigned to ${emp ? emp.name : 'Employee'} for ${shift.day}.`,
      type: 'success',
      targetEmployeeId: shift.employeeId,
    });

    try {
      await api.createShift({
        employeeId: emp?.employeeId || shift.employeeId,
        templateId: shift.templateId,
        day: shift.day,
        startTime: shift.startTime,
        endTime: shift.endTime,
        durationHours: 8,
        role: shift.role,
        department: shift.department,
      });
    } catch (e) {
      console.warn('Backend shift create deferred:', e.message);
    }

    return shift;
  }, [employees, templates, addNotification]);

  const updateShift = useCallback(async (id, updatedFields) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
    addNotification({
      title: 'Shift Updated',
      message: `Shift timing or assignment modified.`,
      type: 'info',
    });
    try {
      await api.updateShift(id, updatedFields);
    } catch (e) {}
  }, [addNotification]);

  const deleteShift = useCallback(async (id) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    setBreaks(prev => prev.filter(b => b.shiftId !== id));
    addNotification({
      title: 'Shift Cancelled',
      message: `Shift assignment deleted from roster.`,
      type: 'info',
    });
    try {
      await api.deleteShift(id);
    } catch (e) {}
  }, [addNotification]);

  // --- CRUD for Shift Templates ---
  const addTemplate = useCallback((newTmpl) => {
    const id = `tmpl-${Date.now()}`;
    const tmpl = {
      id,
      color: '#4F46E5',
      minStaffing: 8,
      durationHours: 8,
      breakDurationMinutes: 45,
      ...newTmpl,
    };
    setTemplates(prev => [...prev, tmpl]);
    addNotification({
      title: 'Template Created',
      message: `New shift template "${tmpl.name}" is now available.`,
      type: 'success',
    });
  }, [addNotification]);

  const updateTemplate = useCallback((id, updatedFields) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
    addNotification({
      title: 'Template Updated',
      message: `Shift template modified successfully.`,
      type: 'info',
    });
  }, [addNotification]);

  const deleteTemplate = useCallback((id) => {
    const tmpl = templates.find(t => t.id === id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    addNotification({
      title: 'Template Deleted',
      message: `Template "${tmpl ? tmpl.name : id}" was removed.`,
      type: 'warning',
    });
  }, [templates, addNotification]);

  // --- Break Status updates ---
  const updateBreakStatus = useCallback((breakId, status) => {
    setBreaks(prev => prev.map(b => b.id === breakId ? { ...b, status } : b));
  }, []);

  const autoAllocateBreaks = useCallback(() => {
    const empMap = new Map(employees.map(e => [e.id, e]));
    const tmplMap = new Map(templates.map(t => [t.id, t]));

    const newBreaks = shifts.map((shift, idx) => {
      const emp = empMap.get(shift.employeeId);
      const tmpl = tmplMap.get(shift.templateId);
      const [startH] = (shift.startTime || '09:00').split(':').map(Number);
      
      const minuteOffsets = [0, 15, 30, 45];
      const offsetMin = minuteOffsets[idx % 4];
      let breakH = (startH + 4) % 24;

      if (breakH === 11 && offsetMin > 15) breakH = 10;
      if (breakH === 12 && offsetMin < 30) breakH = 13;

      const timeStr = `${String(breakH).padStart(2, '0')}:${String(offsetMin).padStart(2, '0')}`;

      return {
        id: `brk-opt-${shift.id}`,
        shiftId: shift.id,
        employeeId: shift.employeeId,
        employeeName: emp ? emp.name : 'Team Agent',
        shiftName: `${tmpl ? tmpl.name : 'Shift'} (${shift.startTime} - ${shift.endTime})`,
        breakStart: timeStr,
        durationMinutes: tmpl ? tmpl.breakDurationMinutes : 45,
        status: idx % 3 === 0 ? 'Completed' : (idx % 3 === 1 ? 'Scheduled' : 'In Progress'),
        role: shift.role || (emp && emp.role),
      };
    });

    setBreaks(newBreaks);
    addNotification({
      title: 'Intelligent Breaks Allocated',
      message: `Staggered ${newBreaks.length} employee break intervals outside peak queue volume hours.`,
      type: 'success',
    });
  }, [employees, templates, shifts, addNotification]);

  // --- Automated Schedule Optimizer ---
  const optimizeRoster = useCallback(async (options = {}) => {
    try {
      const res = await api.generateShifts(options);
      if (res.success && res.result) {
        if (res.result.generatedShifts?.length > 0) {
          setShifts(res.result.generatedShifts);
        }
        if (res.result.generatedBreaks?.length > 0) {
          setBreaks(res.result.generatedBreaks);
        }
        setScheduleStatus('Published');
        addNotification({
          title: 'Automated Schedule Generated',
          message: `Generated ${res.result.metrics.totalShifts} shifts using constraint engine.`,
          type: 'success',
        });
        return res.result;
      }
    } catch (e) {
      console.warn('Backend solver fallback to local solver:', e.message);
    }

    const result = runScheduleOptimizer({
      employees,
      templates,
      currentShifts: shifts,
      ...options,
    });

    setShifts(result.shifts);
    setBreaks(result.breaks);
    setScheduleStatus('Draft');
    addNotification({
      title: 'Automated Schedule Generated',
      message: `Generated ${result.metrics.shiftsCreated} optimized shifts. Workforce coverage boosted to ${result.metrics.coveragePercentage}%.`,
      type: 'success',
    });

    return result;
  }, [employees, templates, shifts, addNotification]);

  const publishSchedule = useCallback(async () => {
    setScheduleStatus('Published');
    addNotification({
      title: 'Weekly Schedule Published',
      message: 'Weekly schedule is now live. Shift notifications dispatched to all team members.',
      type: 'success',
    });
    try {
      await api.publishShifts();
    } catch (e) {}
  }, [addNotification]);

  // --- LEAVE MANAGEMENT WORKFLOW ---
  const submitLeaveRequest = useCallback(async (leaveData) => {
    const emp = employees.find(e => e.id === leaveData.employeeId || e.employeeId === leaveData.employeeId);
    const id = `leave-${Date.now()}`;
    const newLeave = {
      id,
      employeeId: leaveData.employeeId,
      employeeName: emp ? emp.name : leaveData.employeeName,
      department: emp ? emp.department : 'Customer Support',
      role: emp ? emp.role : 'Support Specialist',
      type: leaveData.type || 'Paid Time Off (PTO)',
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      daysCount: leaveData.daysCount || 1,
      reason: leaveData.reason,
      status: 'Pending',
      submittedAt: 'Just now',
      reviewedBy: null,
    };

    setLeaveRequests(prev => [newLeave, ...prev]);

    addNotification({
      title: 'New Leave Request Received',
      message: `${newLeave.employeeName} submitted a ${newLeave.type} request (${newLeave.startDate} to ${newLeave.endDate}).`,
      type: 'info',
    });

    try {
      await api.submitLeave({
        leaveType: newLeave.type,
        startDate: newLeave.startDate || '2026-11-16',
        endDate: newLeave.endDate || '2026-11-17',
        totalDays: Number(newLeave.daysCount) || 1,
        reason: newLeave.reason || 'Personal time off',
      });
    } catch (e) {}

    return newLeave;
  }, [employees, addNotification]);

  const approveLeaveRequest = useCallback(async (leaveId, reviewerName = 'Operations Director') => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === leaveId) {
        return {
          ...req,
          status: 'Approved',
          reviewedBy: reviewerName,
          reviewedAt: 'Just now',
        };
      }
      return req;
    }));

    const targetLeave = leaveRequests.find(l => l.id === leaveId);
    if (targetLeave) {
      addNotification({
        title: 'Leave Request Approved',
        message: `Your leave request for ${targetLeave.startDate} was approved by ${reviewerName}.`,
        type: 'success',
        targetEmployeeId: targetLeave.employeeId,
      });
    }

    try {
      await api.updateLeaveStatus(leaveId, 'Approved', 'Approved by Operations');
    } catch (e) {}
  }, [leaveRequests, addNotification]);

  const rejectLeaveRequest = useCallback(async (leaveId, reviewerName = 'Operations Director', reason = 'Operational staffing constraint') => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === leaveId) {
        return {
          ...req,
          status: 'Rejected',
          reviewedBy: reviewerName,
          reviewedAt: 'Just now',
          rejectionReason: reason,
        };
      }
      return req;
    }));

    const targetLeave = leaveRequests.find(l => l.id === leaveId);
    if (targetLeave) {
      addNotification({
        title: 'Leave Request Declined',
        message: `Your leave request for ${targetLeave.startDate} could not be approved due to staffing requirements.`,
        type: 'warning',
        targetEmployeeId: targetLeave.employeeId,
      });
    }

    try {
      await api.updateLeaveStatus(leaveId, 'Rejected', reason);
    } catch (e) {}
  }, [leaveRequests, addNotification]);

  // --- SHIFT SWAP WORKFLOW ---
  const submitSwapRequest = useCallback(async (swapData) => {
    const id = `swap-${Date.now()}`;
    const newSwap = {
      id,
      status: 'Pending',
      submittedAt: 'Just now',
      ...swapData,
    };

    setSwapRequests(prev => [newSwap, ...prev]);

    addNotification({
      title: 'Shift Swap Request Submitted',
      message: `${newSwap.requesterName} requested a shift exchange with ${newSwap.targetName}.`,
      type: 'info',
    });

    try {
      await api.submitSwap({
        requesterShiftId: newSwap.requesterShiftId,
        requesterDay: newSwap.requesterDay,
        requesterTiming: newSwap.requesterTiming,
        targetId: newSwap.targetId,
        targetShiftId: newSwap.targetShiftId,
        targetDay: newSwap.targetDay,
        targetTiming: newSwap.targetTiming,
        reason: newSwap.reason,
      });
    } catch (e) {}

    return newSwap;
  }, [addNotification]);

  const approveSwapRequest = useCallback(async (swapId) => {
    const targetSwap = swapRequests.find(s => s.id === swapId);
    if (!targetSwap) return;

    // Perform actual shift swap in `shifts`!
    if (targetSwap.requesterShiftId && targetSwap.targetShiftId) {
      setShifts(prev => prev.map(shift => {
        if (shift.id === targetSwap.requesterShiftId) {
          return { ...shift, employeeId: targetSwap.targetId };
        }
        if (shift.id === targetSwap.targetShiftId) {
          return { ...shift, employeeId: targetSwap.requesterId };
        }
        return shift;
      }));

      // Also swap corresponding breaks
      setBreaks(prev => prev.map(brk => {
        if (brk.shiftId === targetSwap.requesterShiftId) {
          return { ...brk, employeeId: targetSwap.targetId, employeeName: targetSwap.targetName };
        }
        if (brk.shiftId === targetSwap.targetShiftId) {
          return { ...brk, employeeId: targetSwap.requesterId, employeeName: targetSwap.requesterName };
        }
        return brk;
      }));
    }

    setSwapRequests(prev => prev.map(req => req.id === swapId ? { ...req, status: 'Approved' } : req));

    addNotification({
      title: 'Shift Swap Approved & Applied',
      message: `Shift trade between ${targetSwap.requesterName} and ${targetSwap.targetName} has been approved and applied to the roster.`,
      type: 'success',
      targetEmployeeId: targetSwap.requesterId,
    });

    try {
      await api.updateSwapStatus(swapId, 'Approved');
      const refreshed = await api.getShifts();
      if (refreshed.success && refreshed.shifts?.length > 0) {
        setShifts(refreshed.shifts);
      }
    } catch (e) {}
  }, [swapRequests, addNotification]);

  const rejectSwapRequest = useCallback(async (swapId) => {
    const targetSwap = swapRequests.find(s => s.id === swapId);
    setSwapRequests(prev => prev.map(req => req.id === swapId ? { ...req, status: 'Rejected' } : req));

    if (targetSwap) {
      addNotification({
        title: 'Shift Swap Declined',
        message: `Shift exchange request was declined by manager.`,
        type: 'warning',
        targetEmployeeId: targetSwap.requesterId,
      });
    }

    try {
      await api.updateSwapStatus(swapId, 'Rejected');
    } catch (e) {}
  }, [swapRequests, addNotification]);

  // --- AVAILABILITY REQUEST WORKFLOW ---
  const submitAvailabilityRequest = useCallback((availData) => {
    const id = `avail-${Date.now()}`;
    const newReq = {
      id,
      status: 'Pending',
      submittedAt: 'Just now',
      ...availData,
    };

    setAvailabilityRequests(prev => [newReq, ...prev]);

    addNotification({
      title: 'Availability Preference Submitted',
      message: `${newReq.employeeName} submitted updated weekly availability preferences.`,
      type: 'info',
    });

    return newReq;
  }, [addNotification]);

  const approveAvailabilityRequest = useCallback((reqId) => {
    const target = availabilityRequests.find(a => a.id === reqId);
    if (!target) return;

    // Actually update employee availability in state!
    setEmployees(prev => prev.map(emp => {
      if (emp.id === target.employeeId && target.requestedAvailability) {
        return { ...emp, availability: target.requestedAvailability };
      }
      return emp;
    }));

    setAvailabilityRequests(prev => prev.map(a => a.id === reqId ? { ...a, status: 'Approved' } : a));

    addNotification({
      title: 'Availability Approved',
      message: `Your availability preferences have been approved and updated in the system.`,
      type: 'success',
      targetEmployeeId: target.employeeId,
    });
  }, [availabilityRequests, addNotification]);

  const rejectAvailabilityRequest = useCallback((reqId) => {
    const target = availabilityRequests.find(a => a.id === reqId);
    setAvailabilityRequests(prev => prev.map(a => a.id === reqId ? { ...a, status: 'Rejected' } : a));

    if (target) {
      addNotification({
        title: 'Availability Request Declined',
        message: `Your requested availability changes could not be approved.`,
        type: 'warning',
        targetEmployeeId: target.employeeId,
      });
    }
  }, [availabilityRequests, addNotification]);

  const resetToDemoData = useCallback(() => {
    setEmployees(INITIAL_EMPLOYEES);
    setShifts(INITIAL_SHIFTS);
    setTemplates(INITIAL_TEMPLATES);
    setBreaks(INITIAL_BREAKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(INITIAL_SETTINGS);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setSwapRequests(INITIAL_SWAP_REQUESTS);
    setAvailabilityRequests(INITIAL_AVAILABILITY_REQUESTS);
    setScheduleStatus('Draft');
    setDismissedConflictIds(new Set());
    localStorage.clear();
    addNotification({
      title: 'Demo Data Restored',
      message: 'ShiftFlow platform restored to initial benchmark dataset.',
      type: 'info',
    });
  }, [addNotification]);

  const goToNextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7));
  const goToPrevWeek = () => setCurrentWeekStart(prev => addDays(prev, -7));
  const goToCurrentWeek = () => setCurrentWeekStart(getMonday(new Date()));

  const value = {
    employees,
    shifts,
    templates,
    breaks,
    conflicts,
    notifications,
    settings,
    scheduleStatus,
    currentWeekStart,
    leaveRequests,
    swapRequests,
    availabilityRequests,
    globalSearch,
    setGlobalSearch,
    setSettings,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    getLiveScheduledStaffForHour,
    getHourlyDemandForDay,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addShift,
    updateShift,
    deleteShift,
    moveShift,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    updateBreakStatus,
    autoAllocateBreaks,
    optimizeRoster,
    publishSchedule,
    resetToDemoData,
    dismissConflict,
    resolveConflict,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
    submitLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    submitSwapRequest,
    approveSwapRequest,
    rejectSwapRequest,
    submitAvailabilityRequest,
    approveAvailabilityRequest,
    rejectAvailabilityRequest,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
