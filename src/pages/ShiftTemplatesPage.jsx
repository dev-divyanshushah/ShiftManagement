import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Clock,
  Users,
  Coffee,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_ROLES } from '../data/mockData';

export const ShiftTemplatesPage = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate, shifts } = useApp();

  const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', data: null });
  const [deleteId, setDeleteId] = useState(null);

  const openCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      data: {
        name: '',
        code: 'CUSTOM',
        startTime: '09:00',
        endTime: '17:00',
        durationHours: 8,
        breakDurationMinutes: 45,
        minStaffing: 8,
        color: '#0EA5E9',
        description: 'Operational queue coverage template',
        requiredRoles: ['Support Specialist'],
      },
    });
  };

  const openEditModal = (tmpl) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      data: { ...tmpl },
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const { mode, data } = modalState;
    if (mode === 'create') {
      addTemplate(data);
    } else {
      updateTemplate(data.id, data);
    }
    setModalState({ isOpen: false, mode: 'create', data: null });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2 py-0.5 rounded-full">
              Workforce Standards
            </span>
            <span className="text-[10px] font-mono text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-semibold">
              {templates.length} Active Blocks
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight flex items-center gap-2.5">
            Shift Templates
          </h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Standardized operational shift blocks, required headcount rules, and break allocations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#087F8C] hover:bg-[#066B76] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tmpl) => {
          const usageCount = shifts.filter(s => s.templateId === tmpl.id).length;

          return (
            <div
              key={tmpl.id}
              className="bg-white rounded-xl border border-[#E5ECEE] p-4.5 flex flex-col justify-between hover:border-[#087F8C]/40 transition-all shadow-xs"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm"
                      style={{ backgroundColor: tmpl.color || '#087F8C' }}
                    ></span>
                    <div>
                      <h3 className="text-sm font-bold text-[#111827] leading-tight">
                        {tmpl.name}
                      </h3>
                      <span className="text-[10px] font-mono text-[#087F8C] font-semibold">
                        {tmpl.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(tmpl)}
                      className="p-1.5 text-[#5A7184] hover:text-[#111827] hover:bg-[#F4F8F8] rounded-lg transition-colors cursor-pointer"
                      title="Edit Template"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(tmpl.id)}
                      className="p-1.5 text-[#8A9BA8] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#5A7184] mb-4 leading-relaxed">
                  {tmpl.description || 'General shift block assigned to queue agents.'}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-2.5 bg-[#F4F8F8] rounded-xl border border-[#E5ECEE] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#087F8C] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#8A9BA8] font-mono uppercase">Window</p>
                      <p className="text-[#111827] font-mono font-semibold truncate">{tmpl.startTime} - {tmpl.endTime}</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#F4F8F8] rounded-xl border border-[#E5ECEE] flex items-center gap-2">
                    <Coffee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#8A9BA8] font-mono uppercase">Break</p>
                      <p className="text-[#111827] font-mono font-semibold">{tmpl.breakDurationMinutes} mins</p>
                    </div>
                  </div>
                </div>

                {/* Min Staffing & Roles */}
                <div className="space-y-2 pt-2 border-t border-[#E5ECEE] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5A7184]">Floor Target Floor:</span>
                    <span className="font-semibold text-[#57945A] font-mono">
                      {tmpl.minStaffing || 8} Agents
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#5A7184]">Active Roster Assignments:</span>
                    <span className="font-semibold text-[#111827] font-mono">{usageCount} shifts</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5ECEE] flex justify-end">
                <button
                  onClick={() => openEditModal(tmpl)}
                  className="text-xs font-semibold text-[#087F8C] hover:underline cursor-pointer"
                >
                  Configure Rules →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Create / Edit Template */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5ECEE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECEE]">
              <h3 className="text-base font-bold text-[#111827]">
                {modalState.mode === 'create' ? 'Create Shift Template' : 'Edit Shift Template'}
              </h3>
              <button
                onClick={() => setModalState({ isOpen: false, mode: 'create', data: null })}
                className="text-[#8A9BA8] hover:text-[#111827] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#111827] mb-1">Template Name</label>
                <input
                  required
                  value={modalState.data.name}
                  onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  placeholder="e.g. Dawn Queue Coverage"
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#087F8C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Shift Code</label>
                  <input
                    required
                    value={modalState.data.code}
                    onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, code: e.target.value.toUpperCase() } }))}
                    placeholder="DAWN"
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] font-mono focus:outline-none focus:border-[#087F8C]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={modalState.data.color || '#087F8C'}
                    onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, color: e.target.value } }))}
                    className="w-full h-9 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={modalState.data.startTime}
                    onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, startTime: e.target.value } }))}
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#087F8C]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={modalState.data.endTime}
                    onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, endTime: e.target.value } }))}
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#087F8C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Break Minutes</label>
                  <input
                    type="number"
                    value={modalState.data.breakDurationMinutes}
                    onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, breakDurationMinutes: Number(e.target.value) } }))}
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#087F8C]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Min Staffing</label>
                  <input
                    type="number"
                    value={modalState.data.minStaffing}
                    onChange={(e) => setModalState(prev => ({ ...prev, data: { ...prev.data, minStaffing: Number(e.target.value) } }))}
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#087F8C]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5ECEE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'create', data: null })}
                  className="px-3.5 py-2 text-[#5A7184] hover:text-[#111827] hover:bg-[#F4F8F8] rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#087F8C] hover:bg-[#066B76] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E5ECEE] text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">Delete Template?</h3>
            <p className="text-xs text-[#5A7184] mt-1">
              Existing shifts using this template will retain their assigned hours.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-[#F4F8F8] hover:bg-slate-100 text-[#5A7184] rounded-xl font-semibold text-xs border border-[#E5ECEE] cursor-pointer"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  deleteTemplate(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
