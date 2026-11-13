import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Building,
  User,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  BadgePercent,
  Hash,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS, AUTHORIZED_INVITE_CODES } from '../../context/AuthContext';
import { INITIAL_DEPARTMENTS } from '../../data/mockData';

export const EmployeeAuthPage = () => {
  const navigate = useNavigate();
  const { loginEmployee, registerEmployee, loginAsDemo, demoLogin } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form states
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [department, setDepartment] = useState(INITIAL_DEPARTMENTS[0]);
  const [inviteCode, setInviteCode] = useState('');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await loginEmployee(loginIdentifier, loginPassword);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/employee/dashboard', { replace: true });
    } else {
      setErrorMsg(res.error || 'Authentication failed');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await registerEmployee({
      fullName,
      employeeId,
      organizationEmail: orgEmail,
      password: regPassword,
      confirmPassword,
      department,
      inviteCode,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Employee registered and verified successfully!');
      setTimeout(() => {
        navigate('/employee/dashboard', { replace: true });
      }, 500);
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  const handleFillDemo = () => {
    setLoginIdentifier(DEMO_ACCOUNTS.employee.employeeId);
    setLoginPassword(DEMO_ACCOUNTS.employee.password);
    setErrorMsg('');
  };

  const handleOneClickDemo = async () => {
    setIsSubmitting(true);
    const fn = loginAsDemo || demoLogin;
    if (fn) {
      await fn('Employee');
    }
    setIsSubmitting(false);
    navigate('/employee/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F4F8F8] text-[#111827] flex flex-col justify-center py-10 sm:px-6 lg:px-8 selection:bg-[#57945A] selection:text-white">
      {/* Back to Role Selection */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A7184] hover:text-[#57945A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Role Selection</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#57945A] text-white mx-auto flex items-center justify-center shadow-xs mb-3">
            <UserRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">Employee Portal</h2>
          <p className="mt-1 text-xs text-[#5A7184]">
            Agent self-service for weekly rosters, break allocations, and shift swaps
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white py-6 px-6 sm:px-8 rounded-2xl shadow-sm border border-[#E5ECEE]">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-[#F4F8F8] p-1 mb-6 text-xs font-mono font-bold border border-[#E5ECEE]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-[#57945A] border border-[#E5ECEE] shadow-xs'
                  : 'text-[#5A7184] hover:text-[#111827]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-[#57945A] border border-[#E5ECEE] shadow-xs'
                  : 'text-[#5A7184] hover:text-[#111827]'
              }`}
            >
              Register Employee
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#EDF6EE] border border-[#57945A]/20 text-[#57945A] text-xs flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#57945A]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#111827] mb-1 font-mono text-[11px]">
                  Employee ID or Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A9BA8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="EMP-1001 or employee@shiftflow.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#57945A] transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-[#111827] font-mono text-[11px]">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-semibold text-[#57945A] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A9BA8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#57945A] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9BA8] hover:text-[#111827] p-0.5 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#57945A] focus:ring-[#57945A] accent-[#57945A]"
                  />
                  <span className="text-[#5A7184] font-medium">Remember Me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#57945A] hover:bg-[#497F4C] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Employee Portal'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-100" />
              </button>

              {/* Try Demo Employee Account */}
              <div className="mt-5 pt-4 border-t border-[#E5ECEE]">
                <div className="p-3 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#57945A] font-bold text-xs font-mono">
                      <UserRound className="w-3.5 h-3.5" />
                      <span>Demo Employee Account</span>
                    </div>
                    <p className="text-[10px] text-[#8A9BA8] font-mono mt-0.5">EMP-1001 • Employee@123</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleFillDemo}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#5A7184] hover:text-[#111827] bg-white hover:bg-slate-50 rounded-lg border border-[#E5ECEE] transition-colors cursor-pointer shadow-xs"
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      onClick={handleOneClickDemo}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#57945A] hover:bg-[#497F4C] rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTRATION */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#111827] mb-1 font-mono text-[11px]">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A9BA8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Liam Evans"
                    className="w-full pl-9 pr-3 py-2 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#57945A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-[#111827] mb-1 font-mono text-[11px]">Employee ID</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-[#8A9BA8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="EMP-1025"
                      className="w-full pl-9 pr-3 py-2 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] uppercase focus:outline-none focus:border-[#57945A] font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-[#111827] mb-1 font-mono text-[11px]">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] focus:outline-none focus:border-[#57945A] cursor-pointer"
                  >
                    {INITIAL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#111827] mb-1 font-mono text-[11px]">Organization Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A9BA8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    placeholder="l.evans@apexcontact.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#57945A] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-[#111827] mb-1 font-mono text-[11px]">Password</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#57945A] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111827] mb-1 font-mono text-[11px]">Confirm Password</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#57945A] font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-[#111827] font-mono text-[11px]">Organization Invitation Code</label>
                  <span className="text-[10px] text-[#8A9BA8]">Issued by supervisor</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#8A9BA8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="e.g. APEX-STAFF-2026"
                    className="w-full pl-9 pr-3 py-2 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] uppercase focus:outline-none focus:border-[#57945A] font-mono tracking-wider"
                  />
                </div>
                <p className="mt-1 text-[10px] text-[#5A7184]">
                  Demo Invite Code: <span className="font-mono text-[#57945A] font-bold">APEX-STAFF-2026</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#57945A] hover:bg-[#497F4C] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{isSubmitting ? 'Registering with Organization...' : 'Register Employee Account'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-100" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E5ECEE]">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5ECEE]">
              <h3 className="text-sm font-bold text-[#111827]">Reset Employee Password</h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-[#8A9BA8] hover:text-[#111827] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="py-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#EDF6EE] border border-[#57945A]/20 text-[#57945A] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#111827]">Recovery Instructions Dispatched</h4>
                <p className="text-[11px] text-[#5A7184]">
                  Password reset link dispatched for <span className="font-semibold text-[#111827]">{forgotInput || loginIdentifier}</span>.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="mt-3 px-4 py-2 bg-[#F4F8F8] hover:bg-slate-100 text-[#111827] border border-[#E5ECEE] font-semibold text-xs rounded-xl cursor-pointer"
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
                <p className="text-[11px] text-[#5A7184]">
                  Enter your registered employee email or Employee ID to receive a verification token.
                </p>
                <div>
                  <label className="block font-semibold text-[#111827] mb-1 font-mono text-[11px]">Employee Email or ID</label>
                  <input
                    type="text"
                    required
                    value={forgotInput || loginIdentifier}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder="EMP-1001 or employee@shiftflow.com"
                    className="w-full px-3 py-2 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#57945A] font-mono"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-1.5 text-[#5A7184] hover:text-[#111827] hover:bg-[#F4F8F8] rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#57945A] hover:bg-[#497F4C] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    Send Recovery Link
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
