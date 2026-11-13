// CSV Export Utilities for ShiftFlow WFM

export const exportScheduleToCSV = (shifts, employees, templates, weekLabel = 'Current_Week') => {
  const empMap = new Map(employees.map(e => [e.id, e]));
  const tmplMap = new Map(templates.map(t => [t.id, t]));

  const headers = [
    'Shift ID',
    'Day',
    'Employee ID',
    'Employee Name',
    'Department',
    'Role',
    'Shift Name',
    'Start Time',
    'End Time',
    'Duration (Hours)',
  ];

  const rows = shifts.map(shift => {
    const emp = empMap.get(shift.employeeId) || { name: 'Unknown', department: shift.department, role: shift.role };
    const tmpl = tmplMap.get(shift.templateId);
    const tmplName = tmpl ? tmpl.name : 'Custom Shift';

    const [sh, sm] = (shift.startTime || '09:00').split(':').map(Number);
    const [eh, em] = (shift.endTime || '17:00').split(':').map(Number);
    let duration = (eh * 60 + em - (sh * 60 + sm)) / 60;
    if (duration < 0) duration += 24;

    return [
      `"${shift.id}"`,
      `"${shift.day}"`,
      `"${shift.employeeId}"`,
      `"${emp.name.replace(/"/g, '""')}"`,
      `"${shift.department || emp.department}"`,
      `"${shift.role || emp.role}"`,
      `"${tmplName}"`,
      `"${shift.startTime}"`,
      `"${shift.endTime}"`,
      duration.toFixed(1),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadBlob(csvContent, `shiftflow_schedule_${weekLabel}.csv`, 'text/csv;charset=utf-8;');
};

export const exportPayrollSummaryToCSV = (employees, shifts, weekLabel = 'Current_Week') => {
  // Calculate assigned hours per employee
  const hoursMap = {};
  shifts.forEach(shift => {
    const [sh, sm] = (shift.startTime || '09:00').split(':').map(Number);
    const [eh, em] = (shift.endTime || '17:00').split(':').map(Number);
    let dur = (eh * 60 + em - (sh * 60 + sm)) / 60;
    if (dur < 0) dur += 24;
    hoursMap[shift.employeeId] = (hoursMap[shift.employeeId] || 0) + dur;
  });

  const headers = [
    'Employee ID',
    'Full Name',
    'Department',
    'Job Role',
    'Seniority',
    'Status',
    'Hourly Rate ($)',
    'Max Weekly Limit (h)',
    'Scheduled Hours (h)',
    'Overtime Hours (h)',
    'Estimated Gross Pay ($)',
  ];

  const rows = employees.map(emp => {
    const scheduled = hoursMap[emp.id] || 0;
    const maxH = emp.maxHoursPerWeek || 40;
    const regular = Math.min(scheduled, maxH);
    const overtime = Math.max(0, scheduled - maxH);
    const rate = emp.hourlyRate || 25;
    const grossPay = (regular * rate) + (overtime * rate * 1.5);

    return [
      `"${emp.id}"`,
      `"${emp.name.replace(/"/g, '""')}"`,
      `"${emp.department}"`,
      `"${emp.role}"`,
      `"${emp.seniority}"`,
      `"${emp.status}"`,
      rate.toFixed(2),
      maxH,
      scheduled.toFixed(1),
      overtime.toFixed(1),
      grossPay.toFixed(2),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadBlob(csvContent, `shiftflow_payroll_summary_${weekLabel}.csv`, 'text/csv;charset=utf-8;');
};

const downloadBlob = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', filename);
  pom.click();
  URL.revokeObjectURL(url);
};

