import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  FileText,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const LeaveManagementPage = () => {
  const { currentUser } = useAuth();
  const { leaveRequests, submitLeaveRequest } = useApp();

  const myId = currentUser?.employeeId || 'EMP-1001';

  const [showModal, setShowModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Paid Time Off (PTO)');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Filter only my leave requests
  const myLeaves = useMemo(() => {
    return leaveRequests.filter(l => l.employeeId === myId || l.employeeId === currentUser?.dbEmployeeId);
  }, [leaveRequests, myId, currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    // Calculate approximate days count
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = Math.abs(d2 - d1);
    const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    submitLeaveRequest({
      employeeId: myId,
      employeeName: currentUser?.name || 'Agent',
      department: currentUser?.department || 'Customer Support',
      type: leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
    });

    setShowModal(false);
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-mono font-semibold">
              Time Off Management
            </span>
            <span className="text-[11px] text-[#5A7184] font-mono">
              Live Balance Synced
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">Leave & PTO Requests</h1>
          <p className="text-xs text-[#5A7184]">Submit planned vacation, medical leave, or personal time-off for supervisor approval.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-[#57945A] hover:bg-[#497F4C] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
        <div className="p-4 rounded-xl bg-white border border-[#E5ECEE] shadow-xs">
          <span className="font-bold text-[#5A7184] uppercase tracking-wider text-[10px] block font-mono">Annual PTO Remaining</span>
          <p className="text-2xl font-bold text-[#111827] mt-1 tracking-tight font-mono">16 Days</p>
          <span className="text-[11px] text-[#57945A] block mt-0.5 font-medium">Standard Benefit Accrued</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5ECEE] shadow-xs">
          <span className="font-bold text-[#5A7184] uppercase tracking-wider text-[10px] block font-mono">Medical / Sick Leave</span>
          <p className="text-2xl font-bold text-[#087F8C] mt-1 tracking-tight font-mono">8 Days</p>
          <span className="text-[11px] text-[#087F8C] block mt-0.5 font-medium">Fully available</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5ECEE] shadow-xs">
          <span className="font-bold text-[#5A7184] uppercase tracking-wider text-[10px] block font-mono">Pending Approvals</span>
          <p className="text-2xl font-bold text-amber-600 mt-1 tracking-tight font-mono">
            {myLeaves.filter(l => l.status === 'Pending').length}
          </p>
          <span className="text-[11px] text-[#8A9BA8] block mt-0.5">Awaiting supervisor review</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5ECEE] shadow-xs">
          <span className="font-bold text-[#5A7184] uppercase tracking-wider text-[10px] block font-mono">Approved Time-Off</span>
          <p className="text-2xl font-bold text-[#57945A] mt-1 tracking-tight font-mono">
            {myLeaves.filter(l => l.status === 'Approved').length}
          </p>
          <span className="text-[11px] text-[#8A9BA8] block mt-0.5">Scheduled on master roster</span>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-[#E5ECEE] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E5ECEE] flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#111827] uppercase tracking-wider font-mono">Leave Applications Log</h2>
          <span className="text-[11px] text-[#5A7184] font-mono">{myLeaves.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8F8] border-b border-[#E5ECEE] uppercase tracking-wider text-[10px] text-[#5A7184] font-bold font-mono">
              <tr>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-3">Date Range</th>
                <th className="py-3 px-3">Days</th>
                <th className="py-3 px-3">Reason</th>
                <th className="py-3 px-3">Submitted</th>
                <th className="py-3 px-3">Reviewed By</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5ECEE]">
              {myLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8A9BA8]">
                    No leave requests found. Click "Apply for Leave" above to submit one.
                  </td>
                </tr>
              ) : (
                myLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F4F8F8]/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#111827]">{req.type}</td>
                    <td className="py-3.5 px-3 font-mono font-medium text-[#087F8C]">
                      {req.startDate} to {req.endDate}
                    </td>
                    <td className="py-3.5 px-3 text-[#111827] font-mono">{req.daysCount || 1} day(s)</td>
                    <td className="py-3.5 px-3 text-[#5A7184] italic max-w-xs truncate">
                      "{req.reason}"
                    </td>
                    <td className="py-3.5 px-3 text-[#8A9BA8] font-mono text-[11px]">{req.submittedAt}</td>
                    <td className="py-3.5 px-3 text-[#111827] font-medium">
                      {req.reviewedBy || 'Pending Supervisor'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                          req.status === 'Approved'
                            ? 'bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5ECEE]">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5ECEE]">
              <h3 className="text-sm font-bold text-[#111827]">Apply for Time Off</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8A9BA8] hover:text-[#111827] p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#111827] mb-1.5 font-mono text-[11px]">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2.5 text-[#111827] focus:outline-none focus:border-[#087F8C] cursor-pointer"
                >
                  <option value="Paid Time Off (PTO)">Paid Time Off (PTO)</option>
                  <option value="Medical / Sick Leave">Medical / Sick Leave</option>
                  <option value="Personal Emergency">Personal Emergency</option>
                  <option value="Bereavement Leave">Bereavement Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111827] mb-1.5 font-mono text-[11px]">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#087F8C]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111827] mb-1.5 font-mono text-[11px]">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#087F8C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#111827] mb-1.5 font-mono text-[11px]">Reason / Justification</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context for manager coverage evaluation..."
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl p-3 text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#087F8C]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5ECEE] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-[#5A7184] hover:text-[#111827] hover:bg-[#F4F8F8] rounded-xl font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#57945A] hover:bg-[#497F4C] text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
