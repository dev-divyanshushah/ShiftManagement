import React, { useState, useMemo } from 'react';
import {
  Coffee,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Check,
  Clock,
  Users,
  Activity,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { HOURLY_CALL_CURVE } from '../data/mockData';

export const BreakManagementPage = () => {
  const { breaks, autoAllocateBreaks, updateBreakStatus, employees } = useApp();

  const [searchAgent, setSearchAgent] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAllocating, setIsAllocating] = useState(false);

  // Filtered breaks
  const filteredBreaks = useMemo(() => {
    return breaks.filter(b => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (searchAgent.trim() !== '') {
        const q = searchAgent.toLowerCase();
        const matchesName = b.employeeName.toLowerCase().includes(q);
        const matchesRole = b.role?.toLowerCase().includes(q);
        if (!matchesName && !matchesRole) return false;
      }
      return true;
    });
  }, [breaks, statusFilter, searchAgent]);

  // Aggregate breaks by hour to overlay on the Call Volume curve
  const hourlyBreaksCount = useMemo(() => {
    const counts = {};
    breaks.forEach(b => {
      const hour = b.breakStart?.split(':')[0];
      if (hour) {
        counts[hour] = (counts[hour] || 0) + 1;
      }
    });
    return counts;
  }, [breaks]);

  // Combined chart data: Call Volume curve + Staff on break
  const breakDemandData = useMemo(() => {
    return HOURLY_CALL_CURVE.filter((_, idx) => idx >= 7 && idx <= 20).map(item => {
      const hourNum = item.hour.split(':')[0];
      const onBreakCount = hourlyBreaksCount[hourNum] || 0;
      return {
        hour: item.label,
        Calls: item.callVolume,
        StaffOnBreak: onBreakCount,
      };
    });
  }, [hourlyBreaksCount]);

  const handleAutoAllocate = () => {
    setIsAllocating(true);
    setTimeout(() => {
      autoAllocateBreaks();
      setIsAllocating(false);
    }, 450);
  };

  const completedCount = breaks.filter(b => b.status === 'Completed').length;
  const inProgressCount = breaks.filter(b => b.status === 'In Progress').length;
  const scheduledCount = breaks.filter(b => b.status === 'Scheduled').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2.5 py-0.5 rounded-full font-mono">
              Queue Protection Telemetry
            </span>
            <span className="text-[10px] font-mono font-bold text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2.5 py-0.5 rounded-full">
              Staggered Dispatch
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173B49] tracking-tight flex items-center gap-2.5">
            Break Management
          </h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Staggered rest interval schedules aligned with forecasted call volume troughs to maintain floor service levels.
          </p>
        </div>

        <button
          onClick={handleAutoAllocate}
          disabled={isAllocating}
          className="px-4 py-2 text-xs font-bold text-white bg-[#087F8C] hover:bg-[#066B76] disabled:opacity-50 rounded-xl shadow-md shadow-[#087F8C]/20 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAllocating ? 'Staggering Intervals...' : 'Auto-Stagger Breaks'}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E5ECEE] p-4.5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider block font-mono">
            Total Allocated
          </span>
          <p className="text-2xl font-black text-[#173B49] mt-1 tracking-tight font-mono">{breaks.length}</p>
          <span className="text-[11px] text-[#5A7184] block mt-0.5">Today's Roster Slots</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4.5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block font-mono">
            In Progress Now
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1 tracking-tight font-mono">{inProgressCount}</p>
          <span className="text-[11px] text-[#5A7184] block mt-0.5">Active Rest Slots</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4.5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-[#087F8C] uppercase tracking-wider block font-mono">
            Upcoming Breaks
          </span>
          <p className="text-2xl font-black text-[#087F8C] mt-1 tracking-tight font-mono">{scheduledCount}</p>
          <span className="text-[11px] text-[#5A7184] block mt-0.5">Next in Sequence</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4.5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-[#57945A] uppercase tracking-wider block font-mono">
            Completed Today
          </span>
          <p className="text-2xl font-black text-[#57945A] mt-1 tracking-tight font-mono">{completedCount}</p>
          <span className="text-[11px] text-[#5A7184] block mt-0.5">Returned to Queue</span>
        </div>
      </div>

      {/* Break Distribution Chart Overlaid on Inbound Call Curve */}
      <div className="bg-white border border-[#E5ECEE] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5ECEE] pb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B49] flex items-center gap-2 font-mono">
              <Activity className="w-4 h-4 text-[#087F8C]" />
              <span>Queue Volume vs Break Staggering Timeline</span>
            </h2>
            <p className="text-[11px] text-[#5A7184] mt-0.5">
              Rest intervals are algorithmically scheduled during call troughs (10:00–11:00 &amp; 14:00–15:30) to preserve queue coverage.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#EBF6F7] border border-[#087F8C]/40"></span>
              <span className="text-[#5A7184]">Inbound Calls</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#087F8C]"></span>
              <span className="text-[#087F8C] font-semibold">Staff on Break</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={breakDemandData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF3F4" />
              <XAxis dataKey="hour" stroke="#8A9BA8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5ECEE' }} />
              <YAxis yAxisId="left" stroke="#8A9BA8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5ECEE' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#087F8C" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5ECEE' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-[#E5ECEE] p-3 rounded-xl shadow-xl text-xs">
                        <p className="font-bold text-[#173B49] mb-1">{data.hour}</p>
                        <p className="text-[#5A7184]">Inbound Calls: <span className="font-semibold text-[#173B49] font-mono">{data.Calls} calls</span></p>
                        <p className="text-[#087F8C] font-semibold">Agents on Break: <span className="font-mono text-[#173B49]">{data.StaffOnBreak} agents</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area yAxisId="left" type="monotone" dataKey="Calls" fill="#EBF6F7" fillOpacity={0.6} stroke="#087F8C" strokeWidth={2} />
              <Bar yAxisId="right" dataKey="StaffOnBreak" fill="#087F8C" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Break Schedules Directory */}
      <div className="bg-white rounded-2xl border border-[#E5ECEE] p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5ECEE] pb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B49] font-mono">
              Agent Break Roster
            </h2>
            <span className="text-[10px] text-[#5A7184] font-mono font-semibold">({filteredBreaks.length} slots)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-[#8A9BA8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                placeholder="Filter agent..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#173B49] placeholder-[#8A9BA8] text-xs focus:outline-none focus:border-[#087F8C]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-1.5 text-[#173B49] text-xs font-medium focus:outline-none focus:border-[#087F8C] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBreaks.map((b) => {
            const isCompleted = b.status === 'Completed';
            const isInProgress = b.status === 'In Progress';

            return (
              <div
                key={b.id}
                className="bg-[#F4F8F8] border border-[#E5ECEE] hover:border-[#087F8C]/40 rounded-xl p-4 transition-all text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#173B49]">{b.employeeName}</span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                        isCompleted
                          ? 'bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                          : 'bg-white text-[#5A7184] border border-[#E5ECEE]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5A7184] truncate">{b.shiftName}</p>

                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-[#173B49] font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#087F8C]" />
                      <span>{b.breakStart}</span>
                    </div>
                    <span className="text-[#8A9BA8]">•</span>
                    <span className="text-[#5A7184] font-mono font-medium">{b.durationMinutes} minutes</span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-[#E5ECEE] flex items-center justify-end gap-1.5">
                  {!isCompleted && !isInProgress && (
                    <button
                      onClick={() => updateBreakStatus(b.id, 'In Progress')}
                      className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#087F8C] hover:bg-[#066B76] rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Start Break
                    </button>
                  )}
                  {isInProgress && (
                    <button
                      onClick={() => updateBreakStatus(b.id, 'Completed')}
                      className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#57945A] hover:bg-[#497F4C] rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
