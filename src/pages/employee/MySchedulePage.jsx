import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatDateRange, getDaysOfWeekWithDates, calculateShiftDurationHours } from '../../utils/dateUtils';

export const MySchedulePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { shifts, templates, currentWeekStart, goToNextWeek, goToPrevWeek } = useApp();

  const myId = currentUser?.employeeId || 'EMP-1001';

  // Filter only my shifts
  const myShifts = useMemo(() => {
    return shifts.filter(s => s.employeeId === myId || s.dbEmployeeId === currentUser?.dbEmployeeId);
  }, [shifts, myId, currentUser]);

  const totalHours = useMemo(() => {
    return myShifts.reduce((sum, s) => sum + calculateShiftDurationHours(s.startTime, s.endTime), 0);
  }, [myShifts]);

  const weekDays = useMemo(() => getDaysOfWeekWithDates(currentWeekStart), [currentWeekStart]);

  const getTemplateStyle = (templateId) => {
    const tmpl = templates.find(t => t.id === templateId);
    if (!tmpl) return { bg: 'bg-[#EBF6F7] border-[#087F8C]/20 text-[#087F8C]', badge: 'bg-[#087F8C]', name: 'Shift' };
    if (tmpl.code === 'MORNING') return { bg: 'bg-[#EDF6EE] border-[#57945A]/20 text-[#57945A]', badge: 'bg-[#57945A]', name: tmpl.name };
    if (tmpl.code === 'GENERAL') return { bg: 'bg-[#EBF6F7] border-[#087F8C]/20 text-[#087F8C]', badge: 'bg-[#087F8C]', name: tmpl.name };
    if (tmpl.code === 'EVENING') return { bg: 'bg-amber-50 border-amber-200 text-amber-800', badge: 'bg-amber-500', name: tmpl.name };
    if (tmpl.code === 'NIGHT') return { bg: 'bg-purple-50 border-purple-200 text-purple-800', badge: 'bg-purple-500', name: tmpl.name };
    return { bg: 'bg-[#EBF6F7] border-[#087F8C]/20 text-[#087F8C]', badge: 'bg-[#087F8C]', name: tmpl.name };
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-mono font-semibold">
              Agent Roster
            </span>
            <span className="text-[11px] text-[#5A7184] font-mono">
              {myShifts.length} shifts ({totalHours}h committed)
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">My Weekly Schedule</h1>
          <p className="text-xs text-[#5A7184]">Review your shift windows, meal intervals, and rest days for this operational week.</p>
        </div>

        {/* Date Navigator & Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white border border-[#E5ECEE] p-0.5 rounded-xl text-xs shadow-xs">
            <button
              onClick={goToPrevWeek}
              className="p-1.5 hover:bg-[#F4F8F8] rounded-lg text-[#5A7184] hover:text-[#111827] transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-[#111827] px-2.5 font-mono text-xs">{formatDateRange(currentWeekStart)}</span>
            <button
              onClick={goToNextWeek}
              className="p-1.5 hover:bg-[#F4F8F8] rounded-lg text-[#5A7184] hover:text-[#111827] transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => navigate('/employee/swaps')}
            className="px-3.5 py-2 bg-[#57945A] hover:bg-[#497F4C] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Shift Swap</span>
          </button>
        </div>
      </div>

      {/* 7-Day Day-by-Day Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDays.map(({ dayName, dateFormatted, isToday }) => {
          const shift = myShifts.find(s => s.day === dayName);
          const style = shift ? getTemplateStyle(shift.templateId) : null;
          const tmpl = shift ? templates.find(t => t.id === shift.templateId) : null;

          return (
            <div
              key={dayName}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all min-h-[220px] ${
                isToday
                  ? 'border-[#087F8C] bg-[#EBF6F7]/30 shadow-xs'
                  : shift
                  ? 'border-[#E5ECEE] bg-white hover:border-[#087F8C]/40 shadow-xs'
                  : 'border-[#E5ECEE]/70 bg-[#F4F8F8]/50 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E5ECEE]">
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${
                    isToday ? 'text-[#087F8C]' : 'text-[#8A9BA8]'
                  }`}>
                    {dayName.slice(0, 3)}
                  </span>
                  <span className={`text-xs font-semibold font-mono ${
                    isToday ? 'text-[#087F8C] bg-[#EBF6F7] px-1.5 py-0.5 rounded font-bold' : 'text-[#5A7184]'
                  }`}>
                    {dateFormatted}
                  </span>
                </div>

                <div className="mt-3">
                  {shift ? (
                    <div className="space-y-2">
                      <div className={`p-2.5 rounded-xl border text-xs ${style.bg}`}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs truncate">{style.name}</span>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${style.badge}`}></span>
                        </div>
                        <p className="font-mono font-bold text-xs mt-1 text-[#111827]">
                          {shift.startTime} – {shift.endTime}
                        </p>
                        <span className="text-[10px] text-[#5A7184] block truncate mt-1">
                          {shift.role || 'Specialist'}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE] text-[10px] text-[#5A7184] flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Coffee className="w-3 h-3 text-amber-500" />
                          <span>Meal:</span>
                        </span>
                        <span className="font-semibold text-[#111827] font-mono">{tmpl?.breakDurationMinutes || 45}m window</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-[#8A9BA8]">
                      <Coffee className="w-5 h-5 mx-auto mb-1 text-[#8A9BA8]" />
                      <p className="text-xs font-semibold text-[#5A7184]">Scheduled Off</p>
                      <span className="text-[10px] text-[#8A9BA8]">Rest Day</span>
                    </div>
                  )}
                </div>
              </div>

              {shift && (
                <div className="pt-2.5 border-t border-[#E5ECEE] mt-3">
                  <button
                    onClick={() => navigate('/employee/swaps')}
                    className="w-full py-1.5 text-[11px] font-semibold text-[#087F8C] hover:text-[#066B76] bg-[#F4F8F8] hover:bg-[#EBF6F7] border border-[#E5ECEE] hover:border-[#087F8C]/40 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-[#087F8C]" />
                    <span>Swap Shift</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
