// Date and time utility functions for ShiftFlow WFM

export const getMonday = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDateRange = (startDate) => {
  const end = addDays(startDate, 6);
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
};

export const getDaysOfWeekWithDates = (weekStart = getMonday()) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map((dayName, idx) => {
    const d = addDays(weekStart, idx);
    return {
      dayName,
      date: d,
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayNumber: d.getDate(),
      isToday: isSameDay(d, new Date()),
    };
  });
};

export const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Calculate shift duration in hours, taking care of overnight shifts (e.g., 22:00 to 06:00)
export const calculateShiftDurationHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 8;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  let startMinutes = startH * 60 + (startM || 0);
  let endMinutes = endH * 60 + (endM || 0);

  if (endMinutes < startMinutes) {
    // Crosses midnight
    endMinutes += 24 * 60;
  }

  const diffHours = (endMinutes - startMinutes) / 60;
  return Math.round(diffHours * 10) / 10;
};

// Check if a specific hour (0-23) falls within a shift
export const isHourInShift = (hourNumber, startTime, endTime) => {
  if (!startTime || !endTime) return false;
  const [sh] = startTime.split(':').map(Number);
  const [eh] = endTime.split(':').map(Number);

  if (sh <= eh) {
    // Normal day shift (e.g., 09:00 to 17:00)
    return hourNumber >= sh && hourNumber < eh;
  } else {
    // Overnight shift (e.g., 22:00 to 06:00)
    return hourNumber >= sh || hourNumber < eh;
  }
};

// Check if two time intervals overlap (same day)
export const checkTimesOverlap = (start1, end1, start2, end2) => {
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  let s1 = toMin(start1);
  let e1 = toMin(end1);
  let s2 = toMin(start2);
  let e2 = toMin(end2);

  if (e1 <= s1) e1 += 24 * 60;
  if (e2 <= s2) e2 += 24 * 60;

  return Math.max(s1, s2) < Math.min(e1, e2);
};
