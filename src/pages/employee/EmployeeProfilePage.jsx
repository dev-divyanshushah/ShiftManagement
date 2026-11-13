import React from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Award,
  Clock,
  Shield,
  Lock,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const EmployeeProfilePage = () => {
  const { currentUser } = useAuth();
  const { employees, shifts } = useApp();

  const myId = currentUser?.employeeId || 'EMP-1001';
  const profile = employees.find(e => e.id === myId || e.id === currentUser?.dbEmployeeId) || {
    id: myId,
    name: currentUser?.name || 'Sarah Jenkins',
    email: currentUser?.email || 'employee@shiftflow.com',
    department: currentUser?.department || 'Customer Support',
    role: currentUser?.title || 'Senior Support Specialist',
    seniority: 'Senior',
    maxHoursPerWeek: 40,
    status: 'Full-Time',
    skills: ['Omnichannel Zendesk', 'VIP Handling', 'Conflict De-escalation', 'CRM Pro'],
    avatar: currentUser?.avatar,
    hourlyRate: 28.5,
  };

  const myShiftsCount = shifts.filter(s => s.employeeId === myId || s.dbEmployeeId === currentUser?.dbEmployeeId).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-[#E5ECEE] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80`}
            alt={profile.name}
            className="w-16 h-16 rounded-xl object-cover border border-[#E5ECEE]"
          />
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2 py-0.5 rounded-full">
                {profile.id}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20">
                {profile.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">{profile.name}</h1>
            <p className="text-xs text-[#5A7184] mt-0.5">{profile.role} • {profile.department}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE] text-xs">
            <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono block">Assigned Shifts</span>
            <p className="text-lg font-bold text-[#111827] font-mono mt-0.5">{myShiftsCount} this week</p>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F8F8] border border-[#E5ECEE] text-xs">
            <span className="text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono block">Weekly Cap</span>
            <p className="text-lg font-bold text-[#087F8C] font-mono mt-0.5">{profile.maxHoursPerWeek} hrs</p>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Employment Information */}
        <div className="bg-white p-6 rounded-xl border border-[#E5ECEE] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E5ECEE]">
            <h3 className="font-bold text-[#111827] text-sm flex items-center gap-2 font-mono uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-[#087F8C]" />
              <span>Employment & Contract Details</span>
            </h3>
            <span className="flex items-center gap-1 text-[11px] text-[#8A9BA8] font-mono">
              <Lock className="w-3 h-3 text-[#8A9BA8]" />
              <span>Read-Only</span>
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between py-2 border-b border-[#E5ECEE]">
              <span className="text-[#5A7184]">Employee Identifier</span>
              <span className="font-bold text-[#111827] font-mono">{profile.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E5ECEE]">
              <span className="text-[#5A7184]">Department</span>
              <span className="font-semibold text-[#111827]">{profile.department}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E5ECEE]">
              <span className="text-[#5A7184]">Designation</span>
              <span className="font-semibold text-[#111827]">{profile.role}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E5ECEE]">
              <span className="text-[#5A7184]">Seniority Tier</span>
              <span className="font-semibold text-[#111827]">{profile.seniority}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E5ECEE]">
              <span className="text-[#5A7184]">Weekly Hours Limit</span>
              <span className="font-semibold text-[#111827] font-mono">{profile.maxHoursPerWeek} hours / week</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#5A7184]">Corporate Email</span>
              <span className="font-semibold text-[#087F8C] font-mono">{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Skills & Certifications */}
        <div className="bg-white p-6 rounded-xl border border-[#E5ECEE] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E5ECEE]">
            <h3 className="font-bold text-[#111827] text-sm flex items-center gap-2 font-mono uppercase tracking-wider">
              <Award className="w-4 h-4 text-[#57945A]" />
              <span>Certified Skills & Competencies</span>
            </h3>
            <span className="text-[11px] text-[#57945A] font-mono font-bold bg-[#EDF6EE] px-2.5 py-0.5 rounded-lg border border-[#57945A]/20">
              Verified
            </span>
          </div>

          <p className="text-xs text-[#5A7184]">
            Certified competencies recognized by the scheduling solver for queue assignment:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {profile.skills?.map(skill => (
              <span
                key={skill}
                className="px-3 py-1 bg-[#EBF6F7] text-[#087F8C] font-semibold rounded-xl border border-[#087F8C]/20 text-xs font-mono"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="p-4 bg-[#F4F8F8] rounded-xl border border-[#E5ECEE] text-[11px] text-[#5A7184] mt-4 leading-relaxed">
            <span className="font-semibold text-[#111827] block mb-0.5">Need profile updates?</span>
            To update skills, contractual hours, or job roles, please submit a request to your Operations Supervisor.
          </div>
        </div>
      </div>
    </div>
  );
};
