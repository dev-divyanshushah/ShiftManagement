import React, { useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  Activity,
  BarChart3,
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
import { calculateShiftDurationHours } from '../utils/dateUtils';
import { exportScheduleToCSV, exportPayrollSummaryToCSV } from '../utils/exportUtils';

export const ReportsPage = () => {
  const { employees, shifts, templates } = useApp();

  const employeeStats = useMemo(() => {
    const map = {};
    employees.forEach(e => {
      map[e.id] = { scheduled: 0, regular: 0, overtime: 0, max: e.maxHoursPerWeek || 40 };
    });

    shifts.forEach(s => {
      const dur = calculateShiftDurationHours(s.startTime, s.endTime);
      if (map[s.employeeId]) {
        map[s.employeeId].scheduled += dur;
      }
    });

    let totalScheduled = 0;
    let totalOvertime = 0;
    let totalRegular = 0;

    Object.values(map).forEach(stat => {
      stat.regular = Math.min(stat.scheduled, stat.max);
      stat.overtime = Math.max(0, stat.scheduled - stat.max);
      totalScheduled += stat.scheduled;
      totalRegular += stat.regular;
      totalOvertime += stat.overtime;
    });

    const totalContractCapacity = employees.reduce((sum, e) => sum + (e.maxHoursPerWeek || 40), 0);
    const utilizationRate = totalContractCapacity > 0
      ? Math.round((totalRegular / totalContractCapacity) * 100)
      : 0;

    return {
      map,
      totalScheduled,
      totalRegular,
      totalOvertime,
      totalContractCapacity,
      utilizationRate: Math.min(100, utilizationRate),
    };
  }, [employees, shifts]);

  const employeeUtilizationData = useMemo(() => {
    return employees.slice(0, 10).map(emp => {
      const stat = employeeStats.map[emp.id] || { regular: 0, overtime: 0 };
      return {
        name: emp.name.split(' ')[0],
        Regular: stat.regular,
        Overtime: stat.overtime,
      };
    });
  }, [employees, employeeStats]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2 py-0.5 rounded-full">
              Workforce Intelligence
            </span>
            <span className="text-[10px] font-mono text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-semibold">
              Automated Audit Trail
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight flex items-center gap-2.5">
            Reports & Analytics
          </h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Workforce utilization, regular vs overtime hours distribution, and CSV export for payroll.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportPayrollSummaryToCSV(employees, shifts)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#087F8C] hover:bg-[#066B76] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Payroll CSV</span>
          </button>
          <button
            onClick={() => exportScheduleToCSV(shifts, employees, templates)}
            className="px-3.5 py-2 text-xs font-semibold text-[#111827] bg-white hover:bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#087F8C]" />
            <span>Roster CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider block font-mono">
            Scheduled Hours
          </span>
          <p className="text-2xl font-bold text-[#111827] mt-1 tracking-tight">{employeeStats.totalScheduled}h</p>
          <span className="text-[11px] text-[#8A9BA8] block mt-0.5">Across all departments</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-[#57945A] uppercase tracking-wider block font-mono">
            Regular Hours
          </span>
          <p className="text-2xl font-bold text-[#57945A] mt-1 tracking-tight">{employeeStats.totalRegular}h</p>
          <span className="text-[11px] text-[#8A9BA8] block mt-0.5">Standard contract basis</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block font-mono">
            Overtime Logged
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1 tracking-tight">{employeeStats.totalOvertime}h</p>
          <span className="text-[11px] text-[#8A9BA8] block mt-0.5">
            {employeeStats.totalOvertime > 0 ? 'Requires supervisor approval' : 'Within zero-OT policy'}
          </span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-[#087F8C] uppercase tracking-wider block font-mono">
            Capacity Utilization
          </span>
          <p className="text-2xl font-bold text-[#087F8C] mt-1 tracking-tight">{employeeStats.utilizationRate}%</p>
          <span className="text-[11px] text-[#8A9BA8] block mt-0.5">Target: 85% - 95%</span>
        </div>
      </div>

      {/* Utilization Distribution Bar Chart */}
      <div className="bg-white border border-[#E5ECEE] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5ECEE] pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Agent Workload &amp; Overtime Distribution
            </h2>
            <p className="text-[11px] text-[#5A7184] mt-0.5">
              Weekly hours distribution across agents highlighting standard capacity and overtime spikes.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#087F8C]"></span>
              <span className="text-[#5A7184]">Regular Hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
              <span className="text-amber-600 font-medium">Overtime</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeUtilizationData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5ECEE" />
              <XAxis dataKey="name" stroke="#8A9BA8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5ECEE' }} />
              <YAxis stroke="#8A9BA8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5ECEE' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-[#E5ECEE] p-3 rounded-xl shadow-xl text-xs">
                        <p className="font-bold text-[#111827] mb-1">{data.name}</p>
                        <p className="text-[#087F8C] font-medium">Regular: <span className="font-semibold text-[#111827]">{data.Regular}h</span></p>
                        <p className="text-amber-600 font-medium">Overtime: <span className="font-semibold text-[#111827]">{data.Overtime}h</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="Regular" stackId="a" fill="#087F8C" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Overtime" stackId="a" fill="#D97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
