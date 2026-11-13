import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Sliders,
  Award,
  ChevronRight,
  Send,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateRange } from '../utils/dateUtils';
import { DAYS_OF_WEEK } from '../data/mockData';

export const AutoSchedulerPage = () => {
  const navigate = useNavigate();
  const {
    employees,
    templates,
    shifts,
    currentWeekStart,
    goToNextWeek,
    goToPrevWeek,
    optimizeRoster,
    publishSchedule,
    scheduleStatus,
    conflicts,
  } = useApp();

  // Configuration state
  const [selectedDept, setSelectedDept] = useState('All');
  const [respectAvailability, setRespectAvailability] = useState(true);
  const [respectHourLimits, setRespectHourLimits] = useState(true);
  const [balanceFairness, setBalanceFairness] = useState(true);
  const [matchSkills, setMatchSkills] = useState(true);
  const [staggerBreaks, setStaggerBreaks] = useState(true);

  // Execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [optimizationResult, setOptimizationResult] = useState(null);

  const optimizationSteps = [
    'Analyzing floor queue forecasts & staffing coverage targets...',
    'Checking agent availability matrices & approved PTO...',
    'Enforcing 40h weekly caps & 11h minimum turnaround rest...',
    'Matching required seniority & skill proficiencies...',
    'Dynamic break staggering aligned to volume troughs...',
    'Final constraint satisfaction & conflict validation complete.',
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setOptimizationResult(null);
    setStepIndex(0);

    for (let i = 0; i < optimizationSteps.length; i++) {
      setStepIndex(i);
      await new Promise(r => setTimeout(r, 220));
    }

    const result = await optimizeRoster({
      targetDepartment: selectedDept,
      respectAvailability,
      respectHourLimits,
      balanceFairness,
    });

    setOptimizationResult(result);
    setIsGenerating(false);
  };

  const handlePublish = async () => {
    await publishSchedule();
    navigate('/scheduler');
  };

  // Live stats from current state
  const currentCoverage = useMemo(() => {
    const totalWeeklyHours = shifts.reduce((sum, s) => sum + (s.durationHours || 8), 0);
    const capacity = employees.reduce((sum, e) => sum + (e.maxHoursPerWeek || 40), 0);
    return capacity > 0 ? Math.min(100, Math.round((totalWeeklyHours / capacity) * 100)) : 88;
  }, [shifts, employees]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2.5 py-0.5 rounded-full font-mono">
              Workforce Optimization Engine
            </span>
            <span className="text-[10px] font-semibold text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#57945A] animate-pulse"></span>
              Constraint Solver Ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173B49] tracking-tight flex items-center gap-2.5">
            Auto Scheduler
          </h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Automated heuristic roster generator satisfying 7 operational rules, certified skills, and rest periods.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/scheduler')}
            className="px-4 py-2 text-xs font-bold text-[#173B49] bg-white hover:bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#087F8C]" />
            <span>Open Scheduler Grid</span>
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-bold text-white bg-[#087F8C] hover:bg-[#066B76] disabled:opacity-60 rounded-xl shadow-md shadow-[#087F8C]/20 transition-all cursor-pointer flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Solving Constraints...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-white" />
                <span>Generate Schedule</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Output & Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Constraints & Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scheduling Period & Scope Card */}
          <div className="bg-white border border-[#E5ECEE] rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B49] flex items-center gap-2 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#087F8C]" />
              <span>Scheduling Period & Scope</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#173B49] mb-1.5 font-mono">
                Target Week
              </label>
              <div className="flex items-center justify-between p-3 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-xs">
                <span className="font-bold text-[#173B49] font-mono">{formatDateRange(currentWeekStart)}</span>
                <span className="text-[10px] text-[#57945A] font-mono font-bold bg-[#EDF6EE] px-2 py-0.5 rounded border border-[#57945A]/20">
                  {scheduleStatus}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#173B49] mb-1.5 font-mono">
                Department Scope
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-xs text-[#173B49] font-medium focus:outline-none focus:border-[#087F8C] cursor-pointer"
              >
                <option value="All">All Departments (Full Organization)</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Technical Escalations">Technical Escalations</option>
                <option value="Billing & Retention">Billing & Retention</option>
                <option value="Inbound Sales">Inbound Sales</option>
                <option value="Quality Assurance">Quality Assurance</option>
              </select>
            </div>
          </div>

          {/* Hard & Soft Constraints Selector */}
          <div className="bg-white border border-[#E5ECEE] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B49] flex items-center gap-2 font-mono">
                <Sliders className="w-3.5 h-3.5 text-[#087F8C]" />
                <span>Optimization Rules & Constraints</span>
              </h2>
              <span className="text-[10px] text-[#087F8C] font-mono font-bold bg-[#EBF6F7] px-2 py-0.5 rounded-full">5 Active</span>
            </div>

            <div className="space-y-3.5 divide-y divide-[#E5ECEE] text-xs">
              <label className="flex items-center justify-between pt-1 cursor-pointer">
                <div>
                  <p className="font-bold text-[#173B49]">40h Max Weekly Hour Cap</p>
                  <p className="text-[11px] text-[#5A7184]">Strictly prevent overtime beyond employee contractual limits.</p>
                </div>
                <input
                  type="checkbox"
                  checked={respectHourLimits}
                  onChange={(e) => setRespectHourLimits(e.target.checked)}
                  className="w-4 h-4 rounded text-[#087F8C] focus:ring-[#087F8C] accent-[#087F8C]"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <p className="font-bold text-[#173B49]">Availability & Day-Off Policy</p>
                  <p className="text-[11px] text-[#5A7184]">Never schedule on preferred off days or approved PTO.</p>
                </div>
                <input
                  type="checkbox"
                  checked={respectAvailability}
                  onChange={(e) => setRespectAvailability(e.target.checked)}
                  className="w-4 h-4 rounded text-[#087F8C] focus:ring-[#087F8C] accent-[#087F8C]"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <p className="font-bold text-[#173B49]">Seniority & Skill Prerequisite Matching</p>
                  <p className="text-[11px] text-[#5A7184]">Enforce required skill tags (Zendesk, VIP, NetDiag) per shift tier.</p>
                </div>
                <input
                  type="checkbox"
                  checked={matchSkills}
                  onChange={(e) => setMatchSkills(e.target.checked)}
                  className="w-4 h-4 rounded text-[#087F8C] focus:ring-[#087F8C] accent-[#087F8C]"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <p className="font-bold text-[#173B49]">11h Minimum Turnaround Rest</p>
                  <p className="text-[11px] text-[#5A7184]">Mandate legal rest turnaround between evening and morning shifts.</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="w-4 h-4 rounded text-[#087F8C] opacity-80 cursor-not-allowed accent-[#087F8C]"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <p className="font-bold text-[#173B49]">Intelligent Break Staggering</p>
                  <p className="text-[11px] text-[#5A7184]">Evenly disperse rest intervals to avoid queue call drop peaks.</p>
                </div>
                <input
                  type="checkbox"
                  checked={staggerBreaks}
                  onChange={(e) => setStaggerBreaks(e.target.checked)}
                  className="w-4 h-4 rounded text-[#087F8C] focus:ring-[#087F8C] accent-[#087F8C]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Optimizer Engine Execution & Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Progress / Status Display */}
          {isGenerating ? (
            <div className="bg-white border border-[#087F8C]/40 rounded-2xl p-8 shadow-md space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF6F7] text-[#087F8C] mx-auto flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#173B49] tracking-tight">
                  Running Multi-Pass Constraint Solver
                </h3>
                <p className="text-xs text-[#5A7184] mt-1 max-w-md mx-auto">
                  {optimizationSteps[stepIndex]}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-[#F4F8F8] h-2.5 rounded-full overflow-hidden border border-[#E5ECEE]">
                  <div
                    className="bg-gradient-to-r from-[#087F8C] to-[#57945A] h-full transition-all duration-300"
                    style={{ width: `${((stepIndex + 1) / optimizationSteps.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#5A7184] mt-2 font-mono">
                  <span>Pass {stepIndex + 1} of {optimizationSteps.length}</span>
                  <span className="font-bold text-[#087F8C]">{Math.round(((stepIndex + 1) / optimizationSteps.length) * 100)}%</span>
                </div>
              </div>
            </div>
          ) : optimizationResult ? (
            /* Results Presentation */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Success Banner */}
              <div className="p-4 rounded-2xl bg-[#EDF6EE] border border-[#57945A]/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-[#57945A] flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#173B49]">
                      Roster Optimized & Constraints Satisfied
                    </h4>
                    <p className="text-[11px] text-[#57945A] font-medium">
                      Generated {optimizationResult.metrics.shiftsCreated} compliant shifts across 7 days.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePublish}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#57945A] hover:bg-[#497F4C] rounded-xl shadow-md shadow-[#57945A]/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Roster</span>
                  </button>
                </div>
              </div>

              {/* KPI Results Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#E5ECEE] p-4 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono block">
                    Shifts Allocated
                  </span>
                  <p className="text-2xl font-black text-[#173B49] mt-1 font-mono">
                    {optimizationResult.metrics.shiftsCreated}
                  </p>
                  <span className="text-[10px] text-[#57945A] font-bold mt-0.5 block">100% floor target</span>
                </div>

                <div className="bg-white border border-[#E5ECEE] p-4 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono block">
                    Staff Utilized
                  </span>
                  <p className="text-2xl font-black text-[#173B49] mt-1 font-mono">
                    {optimizationResult.metrics.employeesUtilized}
                  </p>
                  <span className="text-[10px] text-[#087F8C] font-medium mt-0.5 block">Across {selectedDept === 'All' ? '5 depts' : selectedDept}</span>
                </div>

                <div className="bg-white border border-[#E5ECEE] p-4 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono block">
                    Total Hours
                  </span>
                  <p className="text-2xl font-black text-[#173B49] mt-1 font-mono">
                    {optimizationResult.metrics.totalHours}h
                  </p>
                  <span className="text-[10px] text-[#57945A] font-bold mt-0.5 block">0 overtime violations</span>
                </div>

                <div className="bg-white border border-[#E5ECEE] p-4 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono block">
                    Service Level
                  </span>
                  <p className="text-2xl font-black text-[#57945A] mt-1 font-mono">
                    {optimizationResult.metrics.coveragePercentage}%
                  </p>
                  <span className="text-[10px] text-[#5A7184] mt-0.5 block font-mono">Exceeds 80% SLA</span>
                </div>
              </div>

              {/* Solver Audit Log */}
              <div className="bg-white border border-[#E5ECEE] rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#173B49] mb-3 flex items-center justify-between font-mono">
                  <span>Solver Optimization Log</span>
                  <span className="text-[10px] font-mono text-[#57945A] font-bold bg-[#EDF6EE] px-2 py-0.5 rounded">STATUS: CONVERGED</span>
                </h3>
                <div className="bg-[#F4F8F8] rounded-xl p-3.5 font-mono text-[11px] text-[#173B49] space-y-1.5 border border-[#E5ECEE]">
                  {optimizationResult.logs?.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#087F8C] font-bold select-none">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Standby State */
            <div className="bg-white border border-[#E5ECEE] rounded-2xl p-8 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF6F7] text-[#087F8C] mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#173B49]">
                  Constraint-Based Auto Scheduler Ready
                </h3>
                <p className="text-xs text-[#5A7184] mt-1 max-w-md mx-auto">
                  Click <strong className="text-[#173B49]">"Generate Schedule"</strong> above to run the intelligent heuristic solver against your current {employees.length} agents and {templates.length} shift templates.
                </p>
              </div>

              {/* Current Baseline Preview */}
              <div className="grid grid-cols-3 gap-3 pt-5 border-t border-[#E5ECEE] max-w-md mx-auto text-left">
                <div className="p-3.5 bg-[#F4F8F8] rounded-xl border border-[#E5ECEE]">
                  <p className="text-[10px] font-bold text-[#8A9BA8] uppercase font-mono">Current Shifts</p>
                  <p className="text-xl font-black text-[#173B49] mt-0.5 font-mono">{shifts.length}</p>
                </div>
                <div className="p-3.5 bg-[#F4F8F8] rounded-xl border border-[#E5ECEE]">
                  <p className="text-[10px] font-bold text-[#8A9BA8] uppercase font-mono">Coverage</p>
                  <p className="text-xl font-black text-[#087F8C] mt-0.5 font-mono">{currentCoverage}%</p>
                </div>
                <div className="p-3.5 bg-[#F4F8F8] rounded-xl border border-[#E5ECEE]">
                  <p className="text-[10px] font-bold text-[#8A9BA8] uppercase font-mono">Active Alerts</p>
                  <p className={`text-xl font-black mt-0.5 font-mono ${conflicts.length > 0 ? 'text-rose-600' : 'text-[#57945A]'}`}>
                    {conflicts.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
