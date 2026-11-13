import React, { useState } from 'react';
import {
  Building,
  Clock,
  Database,
  RotateCcw,
  Download,
  CheckCircle2,
  Save,
  Sliders,
  Shield,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage = () => {
  const { settings, setSettings, resetToDemoData, addNotification } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetModal, setResetModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    setSavedSuccess(true);
    addNotification({
      title: 'Settings Saved',
      message: 'Platform scheduling parameters updated successfully.',
      type: 'success',
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const exportAllJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      settings: formData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shiftflow_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2 py-0.5 rounded-full">
              Platform Configuration
            </span>
            <span className="text-[10px] font-mono text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-semibold">
              Enterprise Policy
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight flex items-center gap-2.5">
            Settings &amp; Preferences
          </h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Configure contact center scheduling constraints, overtime thresholds, and labor law rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportAllJSON}
            className="px-3 py-1.5 text-[#111827] hover:bg-[#F4F8F8] bg-white border border-[#E5ECEE] font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#087F8C]" />
            <span>Backup Config</span>
          </button>
          <button
            onClick={() => setResetModal(true)}
            className="px-3 py-1.5 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Organization Settings */}
        <div className="bg-white p-5 rounded-xl border border-[#E5ECEE] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E5ECEE] flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[#087F8C]" />
              <span>Contact Center Organization Profile</span>
            </h2>
            <span className="text-[10px] text-[#5A7184] font-mono">APEX-CORP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#111827] mb-1.5">Organization Name</label>
              <input
                type="text"
                value={formData.centerName || 'Apex Contact Solutions'}
                onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] text-xs focus:outline-none focus:border-[#087F8C]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111827] mb-1.5">Primary Timezone</label>
              <select
                value={formData.timezone || 'America/New_York (EST)'}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] text-xs focus:outline-none focus:border-[#087F8C] cursor-pointer"
              >
                <option value="America/New_York (EST)">America/New_York (EST / UTC-5)</option>
                <option value="America/Chicago (CST)">America/Chicago (CST / UTC-6)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST / UTC-8)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT / UTC+0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Scheduling Rules & Policy */}
        <div className="bg-white p-5 rounded-xl border border-[#E5ECEE] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E5ECEE]">
            <h2 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#087F8C]" />
              <span>Labor Law &amp; Operational Roster Rules</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#111827] mb-1.5">Standard Weekly Cap</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="20"
                  max="60"
                  value={formData.maxHoursPerWeek || 40}
                  onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: Number(e.target.value) })}
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] text-xs focus:outline-none focus:border-[#087F8C]"
                />
                <span className="text-[#5A7184] font-mono">hrs</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#111827] mb-1.5">Min Rest Turnaround</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="8"
                  max="16"
                  value={formData.minRestBetweenShifts || 11}
                  onChange={(e) => setFormData({ ...formData, minRestBetweenShifts: Number(e.target.value) })}
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] text-xs focus:outline-none focus:border-[#087F8C]"
                />
                <span className="text-[#5A7184] font-mono">hrs</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#111827] mb-1.5">Max Consecutive Days</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="4"
                  max="7"
                  value={formData.maxConsecutiveDays || 5}
                  onChange={(e) => setFormData({ ...formData, maxConsecutiveDays: Number(e.target.value) })}
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] text-xs focus:outline-none focus:border-[#087F8C]"
                />
                <span className="text-[#5A7184] font-mono">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#57945A]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Platform settings updated successfully</span>
            </div>
          ) : <div></div>}

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#087F8C] hover:bg-[#066B76] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E5ECEE] text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">Reset All Workspace Data?</h3>
            <p className="text-xs text-[#5A7184] mt-1">
              Restores the default seed roster with 28 agents, baseline schedules, and templates.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setResetModal(false)}
                className="px-4 py-2 bg-[#F4F8F8] hover:bg-slate-100 text-[#5A7184] rounded-xl font-semibold text-xs border border-[#E5ECEE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDemoData();
                  setResetModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
