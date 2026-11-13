import React, { useState, useMemo } from 'react';
import {
  Sliders,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { DAYS_OF_WEEK } from '../../data/mockData';

export const AvailabilityPage = () => {
  const { currentUser } = useAuth();
  const { employees, availabilityRequests, submitAvailabilityRequest } = useApp();

  const myId = currentUser?.employeeId || 'EMP-1001';
  const myProfile = employees.find(e => e.id === myId || e.id === currentUser?.dbEmployeeId);

  // Current availability days from employee profile
  const currentDays = myProfile?.availability || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const [selectedDays, setSelectedDays] = useState(currentDays);
  const [preferredShifts, setPreferredShifts] = useState(['General Shift (09:00 - 17:00)', 'Morning Shift (06:00 - 14:00)']);
  const [reason, setReason] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleShift = (shiftName) => {
    setPreferredShifts(prev =>
      prev.includes(shiftName) ? prev.filter(s => s !== shiftName) : [...prev, shiftName]
    );
  };

  const myRequests = useMemo(() => {
    return availabilityRequests.filter(a => a.employeeId === myId || a.employeeId === currentUser?.dbEmployeeId);
  }, [availabilityRequests, myId, currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitAvailabilityRequest({
      employeeId: myId,
      employeeName: currentUser?.name || 'Agent',
      department: currentUser?.department || 'Customer Support',
      currentAvailability: currentDays,
      requestedAvailability: selectedDays,
      preferredShiftTypes: preferredShifts,
      reason: reason || 'Updated weekly working preference',
    });

    setIsSuccess(true);
    setReason('');
    setTimeout(() => setIsSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-mono font-semibold">
              Working Window Contract
            </span>
            <span className="text-[11px] text-[#5A7184] font-mono">
              Optimizer Constraint Model
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">Agent Availability & Preferences</h1>
          <p className="text-xs text-[#5A7184] mt-0.5">
            Submit your recurring weekly availability and preferred shift windows for supervisor evaluation.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 rounded-xl bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20 self-start sm:self-auto shadow-xs">
          {currentDays.length} Working Days Enrolled
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E5ECEE] shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[#111827] mb-1 font-mono uppercase tracking-wider">
              Available Working Days
            </h3>
            <p className="text-xs text-[#5A7184] mb-3.5">
              Days you are certified and contractually available to accept automated shift assignments.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-mono ${
                      isSelected
                        ? 'bg-[#57945A] text-white border-[#57945A] shadow-xs font-bold'
                        : 'bg-[#F4F8F8] text-[#5A7184] border-[#E5ECEE] hover:border-[#57945A]/40 hover:text-[#111827]'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block opacity-90">{day.slice(0, 3)}</span>
                    <span className="text-xs font-bold block mt-1">{isSelected ? 'Active' : 'Off'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-5 border-t border-[#E5ECEE]">
            <h3 className="text-sm font-bold text-[#111827] mb-1 font-mono uppercase tracking-wider">
              Preferred Shift Types
            </h3>
            <p className="text-xs text-[#5A7184] mb-3">
              The optimizer prioritizes these shift profiles during automated scheduling generation.
            </p>
            <div className="space-y-2.5 mt-2">
              {[
                'Morning Shift (06:00 - 14:00)',
                'General Shift (09:00 - 17:00)',
                'Peak Support Shift (11:00 - 19:00)',
                'Evening Shift (14:00 - 22:00)',
                'Night Shift (22:00 - 06:00)',
              ].map(shiftName => {
                const isChecked = preferredShifts.includes(shiftName);
                return (
                  <label
                    key={shiftName}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition-colors ${
                      isChecked
                        ? 'bg-[#EBF6F7] border-[#087F8C]/40 text-[#111827]'
                        : 'bg-[#F4F8F8] border-[#E5ECEE] text-[#5A7184] hover:text-[#111827]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleShift(shiftName)}
                      className="w-4 h-4 rounded text-[#087F8C] focus:ring-[#087F8C] accent-[#087F8C]"
                    />
                    <span className="font-semibold">{shiftName}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-5 border-t border-[#E5ECEE]">
            <label className="block font-bold text-[#111827] text-xs mb-1.5 font-mono uppercase tracking-wider">
              Reason for Availability Change
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Academic schedule, family care commitments, transit changes..."
              className="w-full text-xs p-3 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#087F8C]"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            {isSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57945A] font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#57945A]" />
                <span>Request logged for supervisor review!</span>
              </span>
            )}
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#57945A] hover:bg-[#497F4C] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Availability Update</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: History */}
        <div className="bg-white p-6 rounded-xl border border-[#E5ECEE] shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider font-mono pb-3 border-b border-[#E5ECEE]">
            Request History
          </h3>

          <div className="space-y-3">
            {myRequests.length === 0 ? (
              <p className="text-xs text-[#8A9BA8] text-center py-8">No previous availability requests on record.</p>
            ) : (
              myRequests.map((req) => (
                <div key={req.id} className="p-3.5 rounded-xl border border-[#E5ECEE] bg-[#F4F8F8] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#111827] font-mono text-[11px]">{req.submittedAt}</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                        req.status === 'Approved'
                          ? 'bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20'
                          : req.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#087F8C] font-mono font-medium">
                    Days: {req.requestedAvailability?.join(', ')}
                  </p>
                  {req.reason && <p className="text-[11px] text-[#5A7184] italic">"{req.reason}"</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
