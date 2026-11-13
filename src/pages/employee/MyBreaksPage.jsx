import React from 'react';
import {
  Coffee,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const MyBreaksPage = () => {
  const { currentUser } = useAuth();
  const { breaks, updateBreakStatus } = useApp();

  const myId = currentUser?.employeeId || 'EMP-1001';
  const myBreaks = breaks.filter(b => b.employeeId === myId || b.employeeId === currentUser?.dbEmployeeId);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-mono font-semibold">
              Workforce Compliance
            </span>
            <span className="text-[11px] text-[#5A7184] font-mono">
              Dynamic Staggering Active
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">My Scheduled Breaks</h1>
          <p className="text-xs text-[#5A7184] mt-0.5">
            Allocated rest and meal intervals synchronized with floor queue volume forecasts.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto shadow-xs">
          {myBreaks.length} Slots Allocated Today
        </span>
      </div>

      {/* Break Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myBreaks.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-xl border border-[#E5ECEE] p-12 text-center text-[#5A7184] shadow-xs">
            <Coffee className="w-10 h-10 mx-auto mb-3 text-[#8A9BA8]" />
            <h3 className="text-sm font-semibold text-[#111827]">No Breaks Scheduled Today</h3>
            <p className="text-xs mt-1 text-[#5A7184]">No active rest intervals allocated for your current shift slot.</p>
          </div>
        ) : (
          myBreaks.map((b) => {
            const isCompleted = b.status === 'Completed';
            const isInProgress = b.status === 'In Progress';

            return (
              <div
                key={b.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isInProgress
                    ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-400/40'
                    : isCompleted
                    ? 'border-[#E5ECEE] bg-white'
                    : 'border-[#E5ECEE] hover:border-[#087F8C]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#E5ECEE] mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        isInProgress
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isCompleted
                          ? 'bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20'
                          : 'bg-[#F4F8F8] text-[#5A7184] border border-[#E5ECEE]'
                      }`}>
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#111827] text-xs">Rest & Meal Interval</h3>
                        <p className="text-[11px] text-[#5A7184]">{b.shiftName || 'Floor Shift'}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg ${
                        isCompleted
                          ? 'bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : 'bg-[#F4F8F8] text-[#5A7184] border border-[#E5ECEE]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="p-3.5 bg-[#F4F8F8] rounded-xl border border-[#E5ECEE]">
                      <span className="text-[10px] font-mono font-bold text-[#8A9BA8] uppercase tracking-wider block">Window Start</span>
                      <p className="text-base font-bold text-[#111827] font-mono mt-0.5">{b.breakStart}</p>
                    </div>

                    <div className="p-3.5 bg-[#F4F8F8] rounded-xl border border-[#E5ECEE]">
                      <span className="text-[10px] font-mono font-bold text-[#8A9BA8] uppercase tracking-wider block">Duration</span>
                      <p className="text-base font-bold text-[#111827] font-mono mt-0.5">{b.durationMinutes} mins</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#E5ECEE] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#5A7184]">Floor Queue Status:</span>
                  <div className="flex items-center gap-2">
                    {!isCompleted && !isInProgress && (
                      <button
                        onClick={() => updateBreakStatus(b.id, 'In Progress')}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start Break</span>
                      </button>
                    )}
                    {isInProgress && (
                      <button
                        onClick={() => updateBreakStatus(b.id, 'Completed')}
                        className="px-3.5 py-1.5 bg-[#57945A] hover:bg-[#497F4C] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>End Break</span>
                      </button>
                    )}
                    {isCompleted && (
                      <span className="text-xs font-semibold text-[#57945A] flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Logged Complete</span>
                      </span>
                    )}
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
