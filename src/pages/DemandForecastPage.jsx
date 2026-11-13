import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  PhoneCall,
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { DAYS_OF_WEEK } from '../data/mockData';

export const DemandForecastPage = () => {
  const { employees, shifts, getHourlyDemandForDay } = useApp();

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [volumeModifier, setVolumeModifier] = useState(0);

  const forecastData = useMemo(() => {
    return getHourlyDemandForDay(selectedDay, volumeModifier);
  }, [selectedDay, volumeModifier, getHourlyDemandForDay, shifts]);

  const dailyMetrics = useMemo(() => {
    const totalCalls = forecastData.reduce((sum, h) => sum + h.callVolume, 0);
    const peakHour = [...forecastData].sort((a, b) => b.callVolume - a.callVolume)[0];
    const totalDeficitHours = forecastData.filter(h => h.isShortage).length;
    const maxShortage = Math.max(0, ...forecastData.map(h => h.deficit));

    return {
      totalCalls,
      peakHour: `${peakHour?.hour || '11:00'} (${peakHour?.callVolume || 530} calls)`,
      totalDeficitHours,
      maxShortage,
    };
  }, [forecastData]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2 py-0.5 rounded-full">
              Predictive Telemetry
            </span>
            <span className="text-[10px] font-mono text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-semibold">
              Erlang-C Modeling
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight flex items-center gap-2.5">
            Demand Forecast
          </h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Predictive hourly inbound queue distributions mapped against actual scheduled staff in real-time.
          </p>
        </div>

        {/* 7-Day Day Selector */}
        <div className="flex items-center gap-1 bg-white border border-[#E5ECEE] p-1 rounded-xl text-xs font-medium text-[#5A7184] overflow-x-auto shadow-xs">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-mono text-xs ${
                selectedDay === day
                  ? 'bg-[#087F8C] text-white font-bold shadow-xs'
                  : 'hover:text-[#111827] hover:bg-[#F4F8F8]'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider block font-mono">
            Forecasted Calls ({selectedDay})
          </span>
          <p className="text-2xl font-bold text-[#111827] mt-1 tracking-tight">{dailyMetrics.totalCalls.toLocaleString()}</p>
          <span className="text-[11px] text-[#8A9BA8] block mt-0.5">80/20 SLA Target</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-[#087F8C] uppercase tracking-wider block font-mono">
            Peak Inbound Rush
          </span>
          <p className="text-xl font-bold text-[#087F8C] mt-1 tracking-tight">{dailyMetrics.peakHour}</p>
          <span className="text-[11px] text-[#8A9BA8] block mt-0.5">Maximum queue density</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block font-mono">
            Deficit Intervals
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1 tracking-tight">{dailyMetrics.totalDeficitHours} Hours</p>
          <span className="text-[11px] text-[#8A9BA8] block mt-0.5">Understaffed slots</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-[#57945A] uppercase tracking-wider block font-mono">
            Max Headcount Deficit
          </span>
          <p className="text-2xl font-bold text-[#57945A] mt-1 tracking-tight">
            {dailyMetrics.maxShortage > 0 ? `-${dailyMetrics.maxShortage} Agents` : '0 (Fully Staffed)'}
          </p>
          <span className="text-[11px] text-[#8A9BA8] block mt-0.5">Queue buffer threshold</span>
        </div>
      </div>

      {/* Main Demand vs Staffing Chart */}
      <div className="bg-white border border-[#E5ECEE] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5ECEE] pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Hourly Call Density vs Scheduled Agents
            </h2>
            <p className="text-[11px] text-[#5A7184] mt-0.5">
              Live mapping of {selectedDay}'s call curve against on-shift agents.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#087F8C]"></span>
              <span className="text-[#5A7184]">Calls</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#57945A]"></span>
              <span className="text-[#57945A] font-medium">Scheduled Staff</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-amber-600 font-medium">Required</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5ECEE" />
              <XAxis dataKey="label" stroke="#8A9BA8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5ECEE' }} />
              <YAxis yAxisId="left" stroke="#8A9BA8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5ECEE' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#087F8C" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5ECEE' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-[#E5ECEE] p-3 rounded-xl shadow-xl text-xs">
                        <p className="font-bold text-[#111827] mb-1">{data.label}</p>
                        <p className="text-[#5A7184]">Expected Calls: <span className="font-semibold text-[#111827]">{data.callVolume}</span></p>
                        <p className="text-amber-600 font-medium">Required Staff: <span className="font-semibold text-[#111827]">{data.requiredStaff} agents</span></p>
                        <p className="text-[#57945A] font-medium">Scheduled Staff: <span className="font-semibold text-[#111827]">{data.scheduledStaff} agents</span></p>
                        {data.isShortage && (
                          <p className="text-rose-600 mt-1 font-bold">Deficit: -{data.deficit} agents</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area yAxisId="left" type="monotone" dataKey="callVolume" fill="#087F8C" fillOpacity={0.12} stroke="#087F8C" strokeWidth={2} />
              <Bar yAxisId="right" dataKey="scheduledStaff" fill="#57945A" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="requiredStaff" stroke="#D97706" strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
