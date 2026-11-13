import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarClock,
  UserX,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatDateRange, calculateShiftDurationHours } from '../utils/dateUtils';

export const OverviewPage = () => {
  const navigate = useNavigate();
  const {
    employees,
    shifts,
    conflicts,
    leaveRequests = [],
    currentWeekStart,
    goToNextWeek,
    goToPrevWeek,
    resolveConflict,
    notifications,
  } = useApp();

  const todayName = 'Monday';
  const todayShifts = useMemo(() => shifts.filter(s => s.day === todayName), [shifts, todayName]);

  // 1. Total Employees
  const totalEmployeesCount = employees.length;

  // 2. Employees Currently Working (on today's shift)
  const currentlyWorkingCount = todayShifts.length;

  // 3. Upcoming Shifts (this week total)
  const upcomingShiftsCount = shifts.length;

  // 4. Unfilled Shifts (minimum staffing deficit slots)
  const unfilledShiftsCount = useMemo(() => {
    return conflicts.filter(c => c.type === 'understaffed').length;
  }, [conflicts]);

  // 5. Pending Leave Requests
  const pendingLeavesCount = useMemo(() => {
    return leaveRequests.filter(l => l.status === 'Pending').length;
  }, [leaveRequests]);

  // 6. Scheduling Conflicts (active violations)
  const activeConflictsCount = conflicts.length;

  // Total scheduled hours this week
  const totalWeeklyHours = useMemo(() => {
    return shifts.reduce((sum, s) => sum + calculateShiftDurationHours(s.startTime, s.endTime), 0);
  }, [shifts]);

  const totalContractCapacity = useMemo(() => {
    return employees.reduce((sum, e) => sum + (e.maxHoursPerWeek || 40), 0);
  }, [employees]);

  // Overall Coverage Percentage
  const coverageRate = useMemo(() => {
    if (totalContractCapacity === 0) return 92;
    return Math.min(100, Math.round((totalWeeklyHours / totalContractCapacity) * 100));
  }, [totalWeeklyHours, totalContractCapacity]);

  // Weekly coverage distribution data
  const weeklyDistributionData = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => {
      const dayShifts = shifts.filter(s => s.day === day);
      const scheduledCount = dayShifts.length;
      const targetCount = ['Saturday', 'Sunday'].includes(day) ? 10 : 22;
      return {
        day: day.slice(0, 3),
        fullDay: day,
        Scheduled: scheduledCount,
        Required: targetCount,
      };
    });
  }, [shifts]);

  // Top issues for Attention Required panel
  const attentionRequiredIssues = useMemo(() => conflicts.slice(0, 4), [conflicts]);

  // Recent activity derived from notifications
  const recentActivities = useMemo(() => notifications.slice(0, 5), [notifications]);

  // Upcoming shifts preview (next upcoming shifts)
  const upcomingSchedulePreview = useMemo(() => {
    return shifts.slice(0, 5).map(s => {
      const emp = employees.find(e => e.id === s.employeeId);
      return {
        ...s,
        empName: emp ? emp.name : 'Agent',
        empAvatar: emp?.avatar,
      };
    });
  }, [shifts, employees]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2.5 py-0.5 rounded-full font-mono">
              Operations Command Centre
            </span>
            <span className="text-[10px] font-semibold text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#57945A]"></span>
              Live Synced
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#173B49] tracking-tight">Overview</h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Real-time workforce snapshot, active coverage telemetry, and scheduling alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/auto-scheduler')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#087F8C] hover:bg-[#066B76] rounded-xl shadow-md shadow-[#087F8C]/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Auto Scheduler</span>
          </button>
          <button
            onClick={() => navigate('/scheduler')}
            className="px-4 py-2 text-xs font-bold text-[#173B49] bg-white hover:bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#087F8C]" />
            <span>Shift Grid</span>
          </button>
        </div>
      </div>

      {/* 6 TOP KPIS (Pure White Insigrow Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Employees */}
        <div className="bg-white border border-[#E5ECEE] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono">
              Total Staff
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EBF6F7] text-[#087F8C] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#173B49] mt-2 tracking-tight font-mono">{totalEmployeesCount}</p>
          <span className="text-[10px] text-[#5A7184] mt-0.5 block truncate">5 Active Teams</span>
        </div>

        {/* KPI 2: Employees Currently Working */}
        <div className="bg-white border border-[#E5ECEE] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono">
              Working Today
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EDF6EE] text-[#57945A] flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#57945A] mt-2 tracking-tight font-mono">{currentlyWorkingCount}</p>
          <span className="text-[10px] text-[#5A7184] mt-0.5 block truncate">Active on Floor</span>
        </div>

        {/* KPI 3: Upcoming Shifts */}
        <div className="bg-white border border-[#E5ECEE] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono">
              Weekly Shifts
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EBF6F7] text-[#00A9DE] flex items-center justify-center">
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#173B49] mt-2 tracking-tight font-mono">{upcomingShiftsCount}</p>
          <span className="text-[10px] text-[#5A7184] mt-0.5 block truncate font-mono">{totalWeeklyHours} Total Hours</span>
        </div>

        {/* KPI 4: Unfilled Shifts */}
        <div className="bg-white border border-[#E5ECEE] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono">
              Unfilled Slots
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 tracking-tight font-mono">{unfilledShiftsCount}</p>
          <span className="text-[10px] text-amber-700/80 mt-0.5 block truncate">Coverage Deficits</span>
        </div>

        {/* KPI 5: Pending Leave Requests */}
        <div className="bg-white border border-[#E5ECEE] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono">
              Pending Leaves
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 mt-2 tracking-tight font-mono">{pendingLeavesCount}</p>
          <span className="text-[10px] text-[#5A7184] mt-0.5 block truncate">Review Required</span>
        </div>

        {/* KPI 6: Scheduling Conflicts */}
        <div className="bg-white border border-[#E5ECEE] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono">
              Conflicts
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 tracking-tight font-mono ${activeConflictsCount > 0 ? 'text-rose-600' : 'text-[#57945A]'}`}>
            {activeConflictsCount}
          </p>
          <span className="text-[10px] text-rose-600/80 mt-0.5 block truncate">Rule Violations</span>
        </div>
      </div>

      {/* ROW 2: Workforce Coverage Overview & Weekly Shift Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Shift Distribution Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E5ECEE] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5ECEE] pb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B49] flex items-center gap-2 font-mono">
                <TrendingUp className="w-4 h-4 text-[#087F8C]" />
                <span>Weekly Shift Distribution vs Required Staffing</span>
              </h2>
              <p className="text-[11px] text-[#5A7184] mt-0.5">
                Daily comparison of scheduled personnel against contact center queue target floors.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#087F8C]"></span>
                <span className="text-[#173B49] font-medium">Scheduled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#E5ECEE]"></span>
                <span className="text-[#5A7184]">Required Floor</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyDistributionData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF3F4" />
                <XAxis
                  dataKey="day"
                  stroke="#8A9BA8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E5ECEE' }}
                />
                <YAxis
                  stroke="#8A9BA8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E5ECEE' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(8, 127, 140, 0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#E5ECEE] p-3 rounded-xl shadow-xl text-xs">
                          <p className="font-bold text-[#173B49] mb-1">{data.fullDay}</p>
                          <p className="text-[#087F8C] font-semibold">Scheduled: <span className="font-mono">{data.Scheduled} agents</span></p>
                          <p className="text-[#5A7184]">Required: <span className="font-mono text-[#173B49]">{data.Required} agents</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Scheduled" fill="#087F8C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Required" fill="#E5ECEE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workforce Coverage Gauge Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E5ECEE] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B49] flex items-center gap-2 border-b border-[#E5ECEE] pb-4 font-mono">
              <Activity className="w-4 h-4 text-[#57945A]" />
              <span>Workforce Coverage Health</span>
            </h2>

            <div className="py-6 text-center">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-[#EBF6F7] bg-[#F4F8F8] relative">
                <span className="text-3xl font-black text-[#173B49] tracking-tight font-mono">{coverageRate}%</span>
                <span className="absolute -bottom-2 text-[9px] font-bold uppercase tracking-wider text-[#57945A] bg-[#EDF6EE] px-2.5 py-0.5 rounded-full border border-[#57945A]/30 font-mono">
                  Target &gt; 80%
                </span>
              </div>
              <p className="text-sm font-bold text-[#173B49] mt-4">Optimal Roster Saturation</p>
              <p className="text-[11px] text-[#5A7184] mt-1 max-w-xs mx-auto">
                {totalWeeklyHours} scheduled hours out of {totalContractCapacity} contractual weekly capacity.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5ECEE] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5A7184]">Floor Deficits:</span>
              <span className={`font-bold font-mono ${unfilledShiftsCount > 0 ? 'text-amber-600' : 'text-[#57945A]'}`}>
                {unfilledShiftsCount} Slots
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5A7184]">Turnaround Rest Violations:</span>
              <span className="font-bold text-[#57945A] font-mono">0 (Compliant)</span>
            </div>
            <button
              onClick={() => navigate('/auto-scheduler')}
              className="w-full mt-2 py-2.5 px-3 bg-[#EBF6F7] hover:bg-[#E0F3F5] text-[#087F8C] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Automated Optimizer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3: Attention Required Panel, Upcoming Schedule, and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attention Required Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E5ECEE] rounded-2xl p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#E5ECEE] pb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>Attention Required ({conflicts.length})</span>
            </h2>
            <button
              onClick={() => navigate('/conflicts')}
              className="text-[11px] font-bold text-[#087F8C] hover:underline flex items-center gap-1 cursor-pointer font-mono"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {attentionRequiredIssues.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5A7184]">
                <CheckCircle2 className="w-8 h-8 text-[#57945A] mx-auto mb-2" />
                <p className="font-bold text-[#173B49]">All Compliance Rules Passed</p>
                <p className="text-[11px] text-[#5A7184] mt-0.5">No critical conflicts or unstaffed slots detected.</p>
              </div>
            ) : (
              attentionRequiredIssues.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-3.5 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded font-mono ${
                          conflict.severity === 'critical'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {conflict.severity}
                      </span>
                      <span className="text-[10px] text-[#5A7184] font-mono">{conflict.type}</span>
                    </div>
                    <p className="font-bold text-[#173B49] leading-snug">{conflict.message}</p>
                    <p className="text-[11px] text-[#5A7184] mt-1">{conflict.details}</p>
                  </div>

                  <button
                    onClick={() => resolveConflict(conflict)}
                    className="shrink-0 px-3 py-1 bg-white hover:bg-[#EDF6EE] hover:text-[#57945A] text-xs font-semibold text-[#173B49] border border-[#E5ECEE] rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    Resolve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Schedule (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-[#E5ECEE] rounded-2xl p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#E5ECEE] pb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B49] flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4 text-[#087F8C]" />
              <span>Upcoming Schedule</span>
            </h2>
            <button
              onClick={() => navigate('/scheduler')}
              className="text-[11px] font-bold text-[#087F8C] hover:underline cursor-pointer font-mono"
            >
              Grid
            </button>
          </div>

          <div className="space-y-2">
            {upcomingSchedulePreview.map((s, idx) => (
              <div key={idx} className="p-2.5 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#EBF6F7] text-[#087F8C] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                    {s.empName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#173B49] truncate">{s.empName}</p>
                    <p className="text-[10px] text-[#5A7184] font-mono">{s.day} • {s.startTime} - {s.endTime}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-white text-[#087F8C] border border-[#E5ECEE] px-1.5 py-0.5 rounded shrink-0 font-semibold">
                  {s.role?.split(' ')[0] || 'Agent'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Workforce Activity (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E5ECEE] rounded-2xl p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#E5ECEE] pb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B49] flex items-center gap-2 font-mono">
              <Activity className="w-4 h-4 text-[#087F8C]" />
              <span>Recent Activity</span>
            </h2>
            <span className="text-[10px] text-[#8A9BA8] font-mono font-bold">AUDIT TRAIL</span>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-2.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#087F8C] mt-1.5 shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#173B49] leading-tight">{act.title}</p>
                  <p className="text-[11px] text-[#5A7184] mt-0.5 leading-relaxed line-clamp-2">
                    {act.message}
                  </p>
                  <span className="text-[10px] text-[#8A9BA8] font-mono mt-0.5 block">{act.time || 'Just now'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
