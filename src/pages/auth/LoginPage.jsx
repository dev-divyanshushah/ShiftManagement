import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin, DEMO_ACCOUNTS } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await login(email, password, rememberMe);
    setIsSubmitting(false);

    if (result.success) {
      if (result.user.role === 'Manager') {
        const fromPath = location.state?.from?.pathname;
        const target = fromPath && !fromPath.startsWith('/employee') && fromPath !== '/login' ? fromPath : '/';
        navigate(target, { replace: true });
      } else {
        const fromPath = location.state?.from?.pathname;
        const target = fromPath && fromPath.startsWith('/employee') && fromPath !== '/login' ? fromPath : '/employee/dashboard';
        navigate(target, { replace: true });
      }
    } else {
      setErrorMsg(result.error || 'Authentication failed');
    }
  };

  const handleFillDemo = (role) => {
    if (role === 'Manager') {
      setEmail(DEMO_ACCOUNTS.manager.email);
      setPassword(DEMO_ACCOUNTS.manager.password);
    } else {
      setEmail(DEMO_ACCOUNTS.employee.email);
      setPassword(DEMO_ACCOUNTS.employee.password);
    }
    setErrorMsg('');
  };

  const handleOneClickDemo = (role) => {
    const user = demoLogin(role);
    if (user.role === 'Manager') {
      navigate('/', { replace: true });
    } else {
      navigate('/employee/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 tracking-tight text-xl leading-none flex items-center gap-1.5">
              ShiftFlow
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">
                WFM
              </span>
            </span>
            <span className="text-[11px] font-medium text-slate-500">Contact Centre Platform</span>
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Role-Based Access for Workforce Managers & Floor Agents
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-7 px-6 sm:px-8 rounded-3xl shadow-card border border-slate-200/80">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@shiftflow.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                />
                <span className="text-slate-600 font-medium">Remember my session</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign in to ShiftFlow'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Demo Credentials
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Manager Demo */}
              <div className="p-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Manager POV</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">manager@shiftflow.com</p>
                  <p className="text-[10px] text-slate-400 font-mono">Manager@123</p>
                </div>

                <div className="flex items-center gap-1 mt-2.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('Manager')}
                    className="flex-1 py-1 text-[10px] font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOneClickDemo('Manager')}
                    className="flex-1 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </div>

              {/* Employee Demo */}
              <div className="p-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs mb-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Employee POV</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">employee@shiftflow.com</p>
                  <p className="text-[10px] text-slate-400 font-mono">Employee@123</p>
                </div>

                <div className="flex items-center gap-1 mt-2.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('Employee')}
                    className="flex-1 py-1 text-[10px] font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOneClickDemo('Employee')}
                    className="flex-1 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          ShiftFlow Enterprise WFM • Simulated RBAC Architecture
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Reset Your Password</h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="py-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Recovery Link Dispatched</h4>
                <p className="text-[11px] text-slate-500">
                  Password reset instructions sent to <span className="font-semibold">{forgotEmail || email}</span>.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSent(true);
                }}
                className="space-y-3.5 mt-4 text-xs"
              >
                <p className="text-[11px] text-slate-500">
                  Enter your organization email address and we'll send you an administrative verification token.
                </p>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail || email}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@shiftflow.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

