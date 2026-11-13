import React, { useState } from 'react';
import {
  Clock,
  ArrowRightLeft,
  Calendar,
  Check,
  X,
  User,
  AlertCircle,
  ShieldCheck,
  FileText,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShiftRequestsModal = ({ isOpen, onClose }) => {
  const {
    leaveRequests,
    swapRequests,
    availabilityRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    approveSwapRequest,
    rejectSwapRequest,
    approveAvailabilityRequest,
    rejectAvailabilityRequest,
  } = useApp();

  const [activeTab, setActiveTab] = useState('leave'); // 'leave' | 'swaps' | 'avail'

  if (!isOpen) return null;

  const pendingLeaveCount = leaveRequests.filter(l => l.status === 'Pending').length;
  const pendingSwapCount = swapRequests.filter(s => s.status === 'Pending').length;
  const pendingAvailCount = availabilityRequests.filter(a => a.status === 'Pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Employee Approvals & Requests Center
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review employee leave applications, shift trade proposals, and weekly availability updates.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('leave')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'leave'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Leave Requests</span>
            {pendingLeaveCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'leave' ? 'bg-white text-indigo-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingLeaveCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('swaps')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'swaps'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Shift Swaps</span>
            {pendingSwapCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'swaps' ? 'bg-white text-indigo-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingSwapCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('avail')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'avail'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Availability Changes</span>
            {pendingAvailCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'avail' ? 'bg-white text-indigo-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingAvailCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
          {/* TAB 1: LEAVE REQUESTS */}
          {activeTab === 'leave' && (
            <div className="space-y-3">
              {leaveRequests.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No leave requests submitted yet.</p>
              ) : (
                leaveRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{req.employeeName}</span>
                        <span className="text-[10px] text-slate-400">({req.employeeId} • {req.department})</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : req.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold text-indigo-700">{req.type}</span>
                        <span className="font-bold text-slate-900">{req.startDate} to {req.endDate} ({req.daysCount || 1} days)</span>
                      </div>
                      <p className="text-slate-600 italic text-[11px]">"{req.reason}"</p>
                    </div>

                    {req.status === 'Pending' ? (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Submitted {req.submittedAt}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => rejectLeaveRequest(req.id)}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-200/80 rounded-lg font-semibold cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => approveLeaveRequest(req.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve Leave</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Reviewed by {req.reviewedBy || 'Manager'}</span>
                        <span>{req.submittedAt}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SHIFT SWAP TRADES */}
          {activeTab === 'swaps' && (
            <div className="space-y-3">
              {swapRequests.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No shift swaps requested yet.</p>
              ) : (
                swapRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Shift Exchange
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : req.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80">
                      <div>
                        <p className="font-bold text-slate-900">{req.requesterName}</p>
                        <p className="text-[11px] text-slate-500">{req.requesterDay} • {req.requesterTiming}</p>
                      </div>
                      <div className="p-1.5 bg-slate-100 text-indigo-600 rounded-lg mx-2 shrink-0">
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{req.targetName}</p>
                        <p className="text-[11px] text-slate-500">{req.targetDay} • {req.targetTiming}</p>
                      </div>
                    </div>

                    <p className="text-slate-600 italic text-[11px]">"{req.reason}"</p>

                    {req.status === 'Pending' ? (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Submitted {req.submittedAt}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => rejectSwapRequest(req.id)}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-200/80 rounded-lg font-semibold cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => approveSwapRequest(req.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve & Swap Roster</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{req.status === 'Approved' ? 'Changes applied to live calendar' : 'Swap proposal declined'}</span>
                        <span>{req.submittedAt}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: AVAILABILITY UPDATES */}
          {activeTab === 'avail' && (
            <div className="space-y-3">
              {availabilityRequests.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No availability preference updates pending.</p>
              ) : (
                availabilityRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{req.employeeName}</span>
                        <span className="text-[10px] text-slate-400">({req.employeeId})</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : req.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Requested Working Days:</span>
                        <p className="font-semibold text-indigo-700">
                          {req.requestedAvailability?.join(', ') || 'Monday - Friday'}
                        </p>
                      </div>
                      {req.preferredShiftTypes && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Preferred Shift Windows:</span>
                          <p className="text-slate-700">{req.preferredShiftTypes.join(', ')}</p>
                        </div>
                      )}
                      <p className="text-slate-600 italic text-[11px]">"{req.reason}"</p>
                    </div>

                    {req.status === 'Pending' ? (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Submitted {req.submittedAt}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => rejectAvailabilityRequest(req.id)}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-200/80 rounded-lg font-semibold cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => approveAvailabilityRequest(req.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Update Profile Availability</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{req.status === 'Approved' ? 'Employee profile updated' : 'Request rejected'}</span>
                        <span>{req.submittedAt}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
