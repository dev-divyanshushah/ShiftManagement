import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Check,
  Filter,
  ChevronRight,
  Sparkles,
  Zap,
  Users,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ConflictAlertsPage = () => {
  const navigate = useNavigate();
  const { conflicts, resolveConflict, dismissConflict, employees, shifts } = useApp();

  const [severityFilter, setSeverityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [resolvingId, setResolvingId] = useState(null);

  const filteredConflicts = useMemo(() => {
    return conflicts.filter(c => {
      if (severityFilter !== 'All' && c.severity !== severityFilter) return false;
      if (typeFilter !== 'All' && c.type !== typeFilter) return false;
      return true;
    });
  }, [conflicts, severityFilter, typeFilter]);

  const criticalCount = conflicts.filter(c => c.severity === 'critical').length;
  const warningCount = conflicts.filter(c => c.severity === 'warning').length;
  const infoCount = conflicts.filter(c => c.severity === 'info').length;

  const handleResolveClick = (conflict) => {
    setResolvingId(conflict.id);
    setTimeout(() => {
      resolveConflict(conflict);
      setResolvingId(null);
    }, 300);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-mono">
              Live Compliance Engine
            </span>
            <span className="text-[10px] font-mono font-bold text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2.5 py-0.5 rounded-full">
              Real-time Validator Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173B49] tracking-tight flex items-center gap-2.5">
            Conflict Center
          </h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Automated detection and guided resolution for overlapping shifts, turnaround breaches, understaffing, and overtime caps.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/auto-scheduler')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#087F8C] hover:bg-[#066B76] rounded-xl shadow-md shadow-[#087F8C]/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Auto Resolve All</span>
          </button>
          <button
            onClick={() => navigate('/scheduler')}
            className="px-4 py-2 text-xs font-bold text-[#173B49] bg-white hover:bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <span>Open Scheduler Grid</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#087F8C]" />
          </button>
        </div>
      </div>

      {/* Severity Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E5ECEE] p-4.5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider block font-mono">
            Total Issues
          </span>
          <p className="text-2xl font-black text-[#173B49] mt-1 tracking-tight font-mono">{conflicts.length}</p>
          <span className="text-[11px] text-[#5A7184] block mt-0.5">Active Violations</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4.5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block font-mono">
            Critical Deficits
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1 tracking-tight font-mono">{criticalCount}</p>
          <span className="text-[11px] text-[#5A7184] block mt-0.5">Overlaps & Staff Deficits</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4.5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block font-mono">
            Policy Warnings
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1 tracking-tight font-mono">{warningCount}</p>
          <span className="text-[11px] text-[#5A7184] block mt-0.5">Overtime & Availability</span>
        </div>

        <div className="bg-white border border-[#E5ECEE] p-4.5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-[#087F8C] uppercase tracking-wider block font-mono">
            Info Notices
          </span>
          <p className="text-2xl font-black text-[#087F8C] mt-1 tracking-tight font-mono">{infoCount}</p>
          <span className="text-[11px] text-[#5A7184] block mt-0.5">Operational Guidance</span>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5ECEE] text-xs shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'critical', 'warning', 'info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer capitalize font-mono text-xs ${
                severityFilter === sev
                  ? 'bg-[#EBF6F7] text-[#087F8C] shadow-2xs border border-[#087F8C]/30'
                  : 'text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8]'
              }`}
            >
              {sev === 'All' ? 'All Severities' : `${sev} (${conflicts.filter(c => c.severity === sev).length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8A9BA8] uppercase tracking-wider font-mono font-bold">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-1.5 text-[#173B49] text-xs font-medium focus:outline-none focus:border-[#087F8C] cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="understaffed">Understaffed</option>
            <option value="overlap">Overlap Conflict</option>
            <option value="overtime">Overtime Breach</option>
            <option value="availability">Unavailability</option>
          </select>
        </div>
      </div>

      {/* Conflicts List */}
      <div className="space-y-3.5">
        {filteredConflicts.length === 0 ? (
          <div className="bg-white border border-[#E5ECEE] rounded-2xl p-12 text-center text-xs text-[#5A7184] shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-[#57945A] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#173B49]">No Active Conflicts Detected</h3>
            <p className="text-xs text-[#5A7184] mt-1 max-w-sm mx-auto">
              All weekly shifts satisfy legal turnaround intervals, availability preferences, and minimum staffing thresholds.
            </p>
          </div>
        ) : (
          filteredConflicts.map((c) => {
            const isCritical = c.severity === 'critical';
            const isWarning = c.severity === 'warning';

            return (
              <div
                key={c.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md ${
                  isCritical
                    ? 'border-rose-200'
                    : isWarning
                    ? 'border-amber-200'
                    : 'border-[#E5ECEE]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : isWarning
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-[#EBF6F7] text-[#087F8C] border border-[#087F8C]/20'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                            isCritical
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isWarning
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-[#EBF6F7] text-[#087F8C] border border-[#087F8C]/20'
                          }`}
                        >
                          {c.severity}
                        </span>

                        <span className="text-[10px] text-[#5A7184] font-mono bg-[#F4F8F8] px-2 py-0.5 rounded border border-[#E5ECEE]">
                          {c.type}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#173B49] tracking-tight">{c.message}</h3>
                      <p className="text-xs text-[#5A7184] leading-relaxed">{c.details}</p>

                      {/* Suggested Resolution Box */}
                      <div className="mt-3 p-3 bg-[#F4F8F8] rounded-xl border border-[#E5ECEE] flex items-center gap-2 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#57945A] font-mono">
                          Suggested Fix:
                        </span>
                        <span className="text-[#173B49] font-medium">
                          {c.type === 'understaffed'
                            ? 'Assign an available agent with matching skills to satisfy the minimum staffing floor.'
                            : c.type === 'overlap'
                            ? 'Reassign one shift to an off day or another available agent.'
                            : c.type === 'overtime'
                            ? 'Cap weekly schedule at 40 hours to avoid labor standards penalty.'
                            : 'Adjust shift day to align with employee availability preference.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleResolveClick(c)}
                      disabled={resolvingId === c.id}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#57945A] hover:bg-[#497F4C] rounded-xl shadow-md shadow-[#57945A]/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {resolvingId === c.id ? (
                        <span>Resolving...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Auto-Resolve</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => navigate('/scheduler')}
                      className="px-3 py-1.5 text-[11px] font-semibold text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8] rounded-lg transition-colors cursor-pointer"
                    >
                      Review in Grid
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
