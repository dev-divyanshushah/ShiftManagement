import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Briefcase,
  UserRound,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Layers,
  Coffee,
  Users,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthLandingPage = () => {
  const navigate = useNavigate();
  const { loginAsDemo, demoLogin } = useAuth();

  const handleQuickDemo = async (role) => {
    const fn = loginAsDemo || demoLogin;
    if (fn) {
      await fn(role);
    }
    if (role?.toUpperCase() === 'MANAGER') {
      navigate('/overview', { replace: true });
    } else {
      navigate('/employee/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8F8] text-[#111827] flex flex-col justify-between selection:bg-[#087F8C] selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#E5ECEE] px-6 sm:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#087F8C] flex items-center justify-center text-white shadow-xs">
            <span className="font-bold text-sm tracking-wider font-mono">SF</span>
          </div>
          <div>
            <span className="font-bold text-[#111827] tracking-tight text-lg leading-none flex items-center gap-2">
              ShiftFlow
              <span className="text-[10px] font-mono font-bold bg-[#EBF6F7] text-[#087F8C] border border-[#087F8C]/20 px-2 py-0.5 rounded-full">
                WFM Enterprise
              </span>
            </span>
            <p className="text-[11px] font-medium text-[#5A7184]">Workforce Management & Optimization</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuickDemo('Manager')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#087F8C] hover:text-[#066B76] px-3.5 py-1.5 rounded-xl bg-[#EBF6F7] hover:bg-[#EBF6F7]/80 border border-[#087F8C]/20 transition-colors cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#087F8C]" />
            <span>Try Manager Demo</span>
          </button>
          <button
            onClick={() => handleQuickDemo('Employee')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#57945A] hover:text-[#497F4C] px-3.5 py-1.5 rounded-xl bg-[#EDF6EE] hover:bg-[#EDF6EE]/80 border border-[#57945A]/20 transition-colors cursor-pointer shadow-xs"
          >
            <UserRound className="w-3.5 h-3.5 text-[#57945A]" />
            <span>Try Employee Demo</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-16 flex flex-col items-center justify-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF6F7] border border-[#087F8C]/20 text-[#087F8C] text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#087F8C]" />
          <span>Next-Generation Contact Centre Scheduling Engine</span>
        </div>

        {/* Main Title & Tagline */}
        <div className="text-center max-w-3xl mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight leading-tight">
            Workforce Management. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#087F8C] to-[#57945A]">Simplified.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#5A7184] leading-relaxed max-w-2xl mx-auto">
            Intelligent shift scheduling, constraint-based roster optimization, automated break staggering, and transparent employee self-service.
          </p>
        </div>

        {/* TWO PROMINENT PORTAL OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* OPTION 1: Manager Portal */}
          <div className="bg-white rounded-2xl p-8 border border-[#E5ECEE] shadow-sm hover:border-[#087F8C]/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#EBF6F7] border border-[#087F8C]/20 flex items-center justify-center text-[#087F8C] mb-6 group-hover:scale-105 group-hover:bg-[#087F8C] group-hover:text-white transition-all duration-200 shadow-xs">
                <Briefcase className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] px-2.5 py-0.5 rounded-full border border-[#087F8C]/20">
                  Operations & Supervision
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Manager Login</h2>
              <p className="mt-3 text-sm text-[#5A7184] leading-relaxed">
                Manage employees, build schedules, forecast call volume, and resolve compliance conflicts.
              </p>

              {/* Feature Checklist */}
              <div className="mt-6 space-y-2.5 pt-4 border-t border-[#E5ECEE] text-xs text-[#5A7184]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#087F8C] shrink-0" />
                  <span>AI Automated Schedule Generator (7 Constraints)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#087F8C] shrink-0" />
                  <span>Leave & Shift Swap Approvals Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#087F8C] shrink-0" />
                  <span>Demand Forecasting & Conflict Compliance</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => navigate('/auth/manager')}
                className="w-full py-3.5 px-6 rounded-xl bg-[#087F8C] hover:bg-[#066B76] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 group-hover:gap-3 transition-all cursor-pointer"
              >
                <span>Continue as Manager</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* OPTION 2: Employee Portal */}
          <div className="bg-white rounded-2xl p-8 border border-[#E5ECEE] shadow-sm hover:border-[#57945A]/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#EDF6EE] border border-[#57945A]/20 flex items-center justify-center text-[#57945A] mb-6 group-hover:scale-105 group-hover:bg-[#57945A] group-hover:text-white transition-all duration-200 shadow-xs">
                <UserRound className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#57945A] bg-[#EDF6EE] px-2.5 py-0.5 rounded-full border border-[#57945A]/20">
                  Agent Self-Service Portal
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Employee Login</h2>
              <p className="mt-3 text-sm text-[#5A7184] leading-relaxed">
                View your shifts, manage weekly availability, request time-off, and track breaks.
              </p>

              {/* Feature Checklist */}
              <div className="mt-6 space-y-2.5 pt-4 border-t border-[#E5ECEE] text-xs text-[#5A7184]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#57945A] shrink-0" />
                  <span>Personal Weekly Calendar & Working Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#57945A] shrink-0" />
                  <span>Peer-to-Peer Shift Swap Proposals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#57945A] shrink-0" />
                  <span>Staggered Break Timer & Leave Tracker</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => navigate('/auth/employee')}
                className="w-full py-3.5 px-6 rounded-xl bg-[#57945A] hover:bg-[#497F4C] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 group-hover:gap-3 transition-all cursor-pointer"
              >
                <span>Continue as Employee</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Demo Accounts Banner */}
        <div className="mt-12 w-full max-w-4xl bg-white rounded-2xl p-6 text-[#111827] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-[#E5ECEE]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#087F8C]" />
              <span className="text-xs font-mono font-bold text-[#087F8C] uppercase tracking-wider">
                Instant Interactive Demo
              </span>
            </div>
            <p className="text-sm font-medium text-[#5A7184]">
              Explore ShiftFlow immediately with pre-configured Enterprise demonstration credentials.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleQuickDemo('Manager')}
              className="px-4 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066B76] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Launch Manager POV</span>
            </button>
            <button
              onClick={() => handleQuickDemo('Employee')}
              className="px-4 py-2.5 rounded-xl bg-[#57945A] hover:bg-[#497F4C] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserRound className="w-4 h-4" />
              <span>Launch Employee POV</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5ECEE] bg-white py-5 px-6 text-center text-xs text-[#8A9BA8] font-mono">
        <p>ShiftFlow Enterprise Workforce Management • Role-Based Access Control Architecture</p>
      </footer>
    </div>
  );
};
