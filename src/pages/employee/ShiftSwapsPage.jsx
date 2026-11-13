import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const ShiftSwapsPage = () => {
  const { currentUser } = useAuth();
  const { shifts, employees, swapRequests, submitSwapRequest } = useApp();

  const myId = currentUser?.employeeId || 'EMP-1001';

  const [showModal, setShowModal] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [targetShiftId, setTargetShiftId] = useState('');
  const [reason, setReason] = useState('');

  // My assigned shifts
  const myShifts = useMemo(() => {
    return shifts.filter(s => s.employeeId === myId || s.dbEmployeeId === currentUser?.dbEmployeeId);
  }, [shifts, myId, currentUser]);

  // Eligible peers in same department
  const eligiblePeers = useMemo(() => {
    return employees.filter(e => e.id !== myId && e.id !== currentUser?.dbEmployeeId && (!currentUser?.department || e.department === currentUser?.department));
  }, [employees, myId, currentUser]);

  // Available shifts of the selected target peer
  const targetPeerShifts = useMemo(() => {
    if (!targetEmployeeId) return [];
    return shifts.filter(s => s.employeeId === targetEmployeeId || s.dbEmployeeId === targetEmployeeId);
  }, [shifts, targetEmployeeId]);

  // My swap requests
  const mySwapRequests = useMemo(() => {
    return swapRequests.filter(s => s.requesterId === myId || s.requesterId === currentUser?.dbEmployeeId);
  }, [swapRequests, myId, currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const myShift = myShifts.find(s => s.id === selectedShiftId);
    const targetPeer = employees.find(e => e.id === targetEmployeeId);

    // Selected peer shift or first available shift for target peer
    const peerShift = targetPeerShifts.find(s => s.id === targetShiftId) || targetPeerShifts[0];

    submitSwapRequest({
      requesterId: myId,
      requesterName: currentUser?.name || 'Agent',
      requesterShiftId: selectedShiftId,
      requesterDay: myShift?.day || 'Monday',
      requesterTiming: `${myShift?.startTime} - ${myShift?.endTime}`,
      targetId: targetEmployeeId,
      targetName: targetPeer?.name || 'Colleague',
      targetShiftId: peerShift ? peerShift.id : null,
      targetDay: peerShift ? peerShift.day : 'Alternate Day',
      targetTiming: peerShift ? `${peerShift.startTime} - ${peerShift.endTime}` : 'Flexible',
      reason,
    });

    setShowModal(false);
    setSelectedShiftId('');
    setTargetEmployeeId('');
    setTargetShiftId('');
    setReason('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-mono font-semibold">
              Peer-to-Peer Trades
            </span>
            <span className="text-[11px] text-[#5A7184] font-mono">
              Automated Coverage Check
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">Shift Trades & Swaps</h1>
          <p className="text-xs text-[#5A7184] mt-0.5">
            Propose mutual shift trades with eligible department colleagues. Subject to supervisor verification.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-[#57945A] hover:bg-[#497F4C] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Propose Shift Swap</span>
        </button>
      </div>

      {/* Submitted Swap Requests */}
      <div className="space-y-3.5">
        {mySwapRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5ECEE] p-12 text-center text-[#5A7184] shadow-xs">
            <ArrowRightLeft className="w-10 h-10 mx-auto mb-3 text-[#8A9BA8]" />
            <h3 className="text-sm font-semibold text-[#111827]">No Shift Swaps Requested</h3>
            <p className="text-xs mt-1 text-[#5A7184]">When you need schedule coverage, you can propose a mutual shift exchange with colleagues.</p>
          </div>
        ) : (
          mySwapRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-[#E5ECEE] p-5 shadow-xs space-y-3.5 hover:border-[#087F8C]/40 transition-colors"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E5ECEE]">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-[#EBF6F7] text-[#087F8C] border border-[#087F8C]/20">
                  Trade Proposal #{req.id ? req.id.slice(0, 8) : 'SWAP'}
                </span>
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg ${
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

              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 p-3.5 bg-[#F4F8F8] rounded-xl border border-[#E5ECEE] text-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#8A9BA8] uppercase tracking-wider block">Your Offered Shift</span>
                  <p className="font-bold text-[#111827] font-mono mt-1">{req.requesterDay} ({req.requesterTiming})</p>
                  <span className="text-[11px] text-[#57945A] font-semibold">To be surrendered</span>
                </div>

                <div className="p-2 bg-white rounded-xl border border-[#E5ECEE] justify-self-center text-[#087F8C] shadow-xs">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-mono font-bold text-[#8A9BA8] uppercase tracking-wider block">Colleague Shift Requested</span>
                  <p className="font-bold text-[#111827] font-mono mt-1">{req.targetName} • {req.targetDay}</p>
                  <span className="text-[11px] text-[#087F8C] font-semibold font-mono">{req.targetTiming || 'Flexible'}</span>
                </div>
              </div>

              {req.reason && (
                <p className="text-xs text-[#5A7184]">
                  <span className="font-semibold text-[#111827] font-mono text-[11px]">Reason:</span> "{req.reason}"
                </p>
              )}

              <div className="pt-2.5 border-t border-[#E5ECEE] flex items-center justify-between text-[11px] text-[#8A9BA8] font-mono">
                <span>Submitted {req.submittedAt}</span>
                <span className="text-[#5A7184]">
                  {req.status === 'Approved' ? '✓ Master roster updated' : req.status === 'Pending' ? '◷ Pending supervisor approval' : '✕ Trade declined'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Propose Swap Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5ECEE]">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5ECEE]">
              <h3 className="text-sm font-bold text-[#111827]">Propose Shift Exchange</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8A9BA8] hover:text-[#111827] p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#111827] mb-1.5 font-mono text-[11px]">Select Shift to Trade Away</label>
                <select
                  required
                  value={selectedShiftId}
                  onChange={(e) => setSelectedShiftId(e.target.value)}
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2.5 text-[#111827] focus:outline-none focus:border-[#087F8C] cursor-pointer"
                >
                  <option value="">Choose your assigned shift</option>
                  {myShifts.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.day}: {s.startTime} – {s.endTime} ({s.role || 'Specialist'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#111827] mb-1.5 font-mono text-[11px]">Exchange Partner (Eligible Department Peers)</label>
                <select
                  required
                  value={targetEmployeeId}
                  onChange={(e) => {
                    setTargetEmployeeId(e.target.value);
                    setTargetShiftId('');
                  }}
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2.5 text-[#111827] focus:outline-none focus:border-[#087F8C] cursor-pointer"
                >
                  <option value="">Choose peer colleague</option>
                  {eligiblePeers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role}) - {p.department}
                    </option>
                  ))}
                </select>
              </div>

              {targetEmployeeId && targetPeerShifts.length > 0 && (
                <div>
                  <label className="block font-semibold text-[#111827] mb-1.5 font-mono text-[11px]">Select Colleague's Shift</label>
                  <select
                    value={targetShiftId}
                    onChange={(e) => setTargetShiftId(e.target.value)}
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2.5 text-[#111827] focus:outline-none focus:border-[#087F8C] cursor-pointer"
                  >
                    <option value="">Auto-match first available shift</option>
                    {targetPeerShifts.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.day}: {s.startTime} – {s.endTime} ({s.role || 'Specialist'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#111827] mb-1.5 font-mono text-[11px]">Reason for Shift Exchange</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Appointment, family commitment, study schedule..."
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
                  <span>Send Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
