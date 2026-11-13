import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Coffee,
  CalendarDays,
  ArrowRightLeft,
  Sliders,
  CheckCircle2,
  ChevronRight,
  User,
  ShieldCheck,
  Sparkles,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { calculateShiftDurationHours, getDaysOfWeekWithDates } from '../../utils/dateUtils';

export const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { shifts, templates, breaks, leaveRequests, swapRequests, notifications, currentWeekStart } = useApp();

  const myId = currentUser?.employeeId || 'EMP-1001';
  const employeeName = currentUser?.name || 'Sarah Jenkins';

  // My shifts for the week
  const myShifts = useMemo(() => {
    return shifts.filter((s) => s.employeeId === myId || s.dbEmployeeId === currentUser?.dbEmployeeId);
  }, [shifts, myId, currentUser]);

  // Total weekly scheduled hours
  const myTotalHours = useMemo(() => {
    return myShifts.reduce((sum, s) => sum + calculateShiftDurationHours(s.startTime, s.endTime), 0);
  }, [myShifts]);

  // Today's shift (Monday benchmark for contact center operations)
  const todayName = 'Monday';
  const todayShift = useMemo(() => {
    return myShifts.find((s) => s.day === todayName);
  }, [myShifts, todayName]);

  const todayTmpl = useMemo(() => {
    if (!todayShift) return null;
    return templates.find((t) => t.id === todayShift.templateId);
  }, [todayShift, templates]);

  // Next break today
  const myTodayBreak = useMemo(() => {
    return breaks.find((b) => b.employeeId === myId);
  }, [breaks, myId]);

  // Pending requests count
  const myPendingLeaves = useMemo(() => {
    return leaveRequests.filter((l) => (l.employeeId === myId || l.employeeId === currentUser?.dbEmployeeId) && l.status === 'Pending').length;
  }, [leaveRequests, myId, currentUser]);

  const myPendingSwaps = useMemo(() => {
    return swapRequests.filter((s) => (s.requesterId === myId || s.requesterId === currentUser?.dbEmployeeId) && s.status === 'Pending').length;
  }, [swapRequests, myId, currentUser]);

  // Recent notifications for this employee
  const recentNotifications = useMemo(() => {
    return notifications
      .filter((n) => !n.targetEmployeeId || n.targetEmployeeId === myId)
      .slice(0, 4);
  }, [notifications, myId]);

  const weekDays = useMemo(() => getDaysOfWeekWithDates(currentWeekStart), [currentWeekStart]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Personalized Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-semibold">
              Agent Self-Service Workspace
            </span>
            <span className="text-[10px] font-mono text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2 py-0.5 rounded-full font-semibold">
              Roster Synced
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
            Welcome back, {employeeName}
          </h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Here's your real-time schedule, allocated break windows, and leave updates for this week.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigate('/employee/leave')}
            className="px-3.5 py-2 bg-white hover:bg-[#F4F8F8] text-[#111827] font-medium text-xs rounded-xl border border-[#E5ECEE] shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#57945A]" />
            <span>Request Leave</span>
          </button>
          <button
            onClick={() => navigate('/employee/swaps')}
            className="px-3.5 py-2 bg-[#57945A] hover:bg-[#497F4C] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Shift Swap</span>
          </button>
        </div>
      </div>

      {/* 2. Compact & Sophisticated KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Today's Shift */}
        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs hover:border-[#57945A]/40 transition-colors">
          <span className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider block font-mono">
            Today's Shift
          </span>
          <p className="text-xl font-bold text-[#111827] tracking-tight mt-1">
            {todayShift ? `${todayShift.startTime} – ${todayShift.endTime}` : 'Scheduled Off'}
          </p>
          <span className="text-[11px] text-[#57945A] font-semibold block mt-0.5 truncate">
            {todayTmpl ? todayTmpl.name : (todayShift ? 'General Shift' : 'Rest Day')}
          </span>
        </div>

        {/* Next Break */}
        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs hover:border-amber-500/40 transition-colors">
          <span className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider block font-mono">
            Next Staggered Break
          </span>
          <p className="text-xl font-bold text-amber-600 tracking-tight mt-1">
            {myTodayBreak ? myTodayBreak.breakStart : '12:30'}
          </p>
          <span className="text-[11px] text-[#5A7184] block mt-0.5 font-mono">
            {myTodayBreak ? `${myTodayBreak.durationMinutes} mins meal slot` : '45 mins allocated'}
          </span>
        </div>

        {/* Weekly Hours */}
        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs hover:border-[#087F8C]/40 transition-colors">
          <span className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider block font-mono">
            Weekly Hours
          </span>
          <p className="text-xl font-bold text-[#087F8C] tracking-tight mt-1">
            {myTotalHours}h
          </p>
          <span className="text-[11px] text-[#5A7184] font-medium block mt-0.5">
            {myShifts.length} shifts scheduled
          </span>
        </div>

        {/* Pending Requests */}
        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs hover:border-[#D06EBF]/40 transition-colors">
          <span className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider block font-mono">
            Pending Requests
          </span>
          <p className="text-xl font-bold text-[#111827] tracking-tight mt-1">
            {myPendingLeaves + myPendingSwaps}
          </p>
          <span className="text-[11px] text-[#5A7184] block mt-0.5 font-mono">
            {myPendingLeaves} leave • {myPendingSwaps} swap
          </span>
        </div>
      </div>

      {/* 3. Today's Assignment Section */}
      <div className="bg-white rounded-xl border border-[#E5ECEE] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5ECEE]">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111827]">Today's Shift Assignment</h2>
            <p className="text-[11px] text-[#5A7184] mt-0.5">Queue parameters and break dispatch for {todayName}</p>
          </div>
          <span className={`px-2.5 py-0.5 text-xs font-mono font-semibold rounded ${
            todayShift
              ? 'bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20'
              : 'bg-[#F4F8F8] text-[#8A9BA8] border border-[#E5ECEE]'
          }`}>
            {todayShift ? '● Active Floor Roster' : '○ Scheduled Off'}
          </span>
        </div>

        {todayShift ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE]">
              <span className="text-[10px] uppercase font-bold text-[#8A9BA8] tracking-wider font-mono block">Shift Window</span>
              <p className="text-base font-bold text-[#111827] mt-1 font-mono">{todayShift.startTime} – {todayShift.endTime}</p>
              <span className="text-[11px] text-[#087F8C] font-semibold mt-0.5 block">{todayShift.durationHours || 8} hrs scheduled</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE]">
              <span className="text-[10px] uppercase font-bold text-[#8A9BA8] tracking-wider font-mono block">Queue Role</span>
              <p className="text-base font-bold text-[#111827] mt-1 truncate">{todayShift.role || currentUser?.title || 'Specialist'}</p>
              <span className="text-[11px] text-[#57945A] font-semibold mt-0.5 block">Omnichannel Certified</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE]">
              <span className="text-[10px] uppercase font-bold text-[#8A9BA8] tracking-wider font-mono block">Department</span>
              <p className="text-base font-bold text-[#111827] mt-1 truncate">{currentUser?.department || todayShift.department || 'Customer Support'}</p>
              <span className="text-[11px] text-[#5A7184] mt-0.5 block">Apex Contact Solutions</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider font-mono block">Allocated Break</span>
              <p className="text-base font-bold text-amber-900 mt-1 font-mono">
                {myTodayBreak ? `${myTodayBreak.breakStart} (${myTodayBreak.durationMinutes}m)` : '12:30 (45m)'}
              </p>
              <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">Staggered Meal Window</span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#5A7184]">
            <Coffee className="w-8 h-8 mx-auto mb-2 text-[#8A9BA8]" />
            <p className="font-semibold text-[#111827]">No shift scheduled for today</p>
            <p className="text-[11px] text-[#5A7184] mt-0.5">Enjoy your rest day. Your upcoming roster for this week is detailed below.</p>
          </div>
        )}
      </div>

      {/* 4. Upcoming Weekly Schedule */}
      <div className="bg-white rounded-xl border border-[#E5ECEE] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5ECEE] mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111827]">Upcoming Weekly Schedule</h2>
            <p className="text-[11px] text-[#5A7184] mt-0.5">Seven-day shift roster from Monday to Sunday</p>
          </div>
          <button
            onClick={() => navigate('/employee/schedule')}
            className="text-xs font-semibold text-[#087F8C] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Full Schedule View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weekDays.map(({ dayName, dateFormatted, isToday }) => {
            const shift = myShifts.find((s) => s.day === dayName);
            const tmpl = shift ? templates.find((t) => t.id === shift.templateId) : null;

            return (
              <div
                key={dayName}
                className={`p-3.5 rounded-xl border text-center transition-all flex flex-col justify-between ${
                  isToday
                    ? 'border-[#087F8C] bg-[#EBF6F7]/50 shadow-xs'
                    : shift
                    ? 'border-[#E5ECEE] bg-[#F4F8F8] hover:border-[#087F8C]/40'
                    : 'border-[#E5ECEE]/70 bg-white opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-[#8A9BA8]">
                      {dayName.slice(0, 3)}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-bold text-[#087F8C] uppercase tracking-wide">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#111827] block mt-0.5 text-left font-mono">{dateFormatted}</span>
                </div>

                <div className="my-3 py-2 border-y border-[#E5ECEE]">
                  {shift ? (
                    <div>
                      <span className="text-xs font-bold text-[#111827] block font-mono">
                        {shift.startTime} – {shift.endTime}
                      </span>
                      <span className="text-[11px] text-[#087F8C] font-semibold block truncate mt-0.5">
                        {tmpl?.name || 'Assigned Shift'}
                      </span>
                    </div>
                  ) : (
                    <div className="py-1">
                      <span className="text-xs font-medium text-[#8A9BA8] block font-mono">Off</span>
                      <span className="text-[10px] text-[#8A9BA8] block mt-0.5">Rest Day</span>
                    </div>
                  )}
                </div>

                <div>
                  {shift ? (
                    <span className="w-full inline-block text-[10px] font-mono font-medium py-0.5 rounded bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20">
                      Scheduled (8h)
                    </span>
                  ) : (
                    <span className="w-full inline-block text-[10px] font-mono font-medium py-0.5 rounded bg-[#F4F8F8] text-[#8A9BA8]">
                      Off Duty
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Bottom Row: Recent Updates & Compact Self-Service Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Notifications & Updates (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E5ECEE] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5ECEE]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111827]">Recent Updates &amp; Notices</h2>
              <p className="text-[11px] text-[#5A7184] mt-0.5">Operational broadcasts and approval statuses</p>
            </div>
            <button
              onClick={() => navigate('/employee/notifications')}
              className="text-xs font-semibold text-[#087F8C] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-[#E5ECEE] text-xs">
            {recentNotifications.length === 0 ? (
              <p className="py-6 text-center text-[#8A9BA8]">No recent announcements or notifications.</p>
            ) : (
              recentNotifications.map((notif) => (
                <div key={notif.id} className="py-3 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#57945A] mt-1.5 shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#111827] truncate">{notif.title}</p>
                      <span className="text-[10px] text-[#8A9BA8] shrink-0 ml-2 font-mono">{notif.time || 'Recent'}</span>
                    </div>
                    <p className="text-[11px] text-[#5A7184] mt-0.5 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Self-Service Actions (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5ECEE] p-5 shadow-xs space-y-3">
          <div className="pb-3 border-b border-[#E5ECEE]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111827]">Quick Self-Service</h2>
            <p className="text-[11px] text-[#5A7184] mt-0.5">Frequently used shift and leave actions</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => navigate('/employee/leave')}
              className="p-3.5 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE] hover:border-[#57945A]/50 hover:bg-[#EDF6EE]/40 transition-all text-left cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-[#57945A] mb-2" />
              <span className="font-semibold text-[#111827] block text-xs">Request Leave</span>
              <span className="text-[10px] text-[#5A7184] block mt-0.5">Submit PTO or Sick</span>
            </button>

            <button
              onClick={() => navigate('/employee/swaps')}
              className="p-3.5 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE] hover:border-[#57945A]/50 hover:bg-[#EDF6EE]/40 transition-all text-left cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-[#57945A] mb-2" />
              <span className="font-semibold text-[#111827] block text-xs">Shift Swap</span>
              <span className="text-[10px] text-[#5A7184] block mt-0.5">Trade with peer</span>
            </button>

            <button
              onClick={() => navigate('/employee/availability')}
              className="p-3.5 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE] hover:border-[#087F8C]/50 hover:bg-[#EBF6F7]/40 transition-all text-left cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#087F8C] mb-2" />
              <span className="font-semibold text-[#111827] block text-xs">Availability</span>
              <span className="text-[10px] text-[#5A7184] block mt-0.5">Set working days</span>
            </button>

            <button
              onClick={() => navigate('/employee/schedule')}
              className="p-3.5 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE] hover:border-[#087F8C]/50 hover:bg-[#EBF6F7]/40 transition-all text-left cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#111827] mb-2" />
              <span className="font-semibold text-[#111827] block text-xs">My Schedule</span>
              <span className="text-[10px] text-[#5A7184] block mt-0.5">Full calendar view</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
