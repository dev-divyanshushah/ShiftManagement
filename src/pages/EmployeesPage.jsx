import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Trash2,
  Edit,
  X,
  Mail,
  Phone,
  Clock,
  Shield,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_DEPARTMENTS, INITIAL_ROLES, DAYS_OF_WEEK } from '../data/mockData';
import { calculateShiftDurationHours } from '../utils/dateUtils';

export const EmployeesPage = () => {
  const { employees, shifts, templates, addEmployee, updateEmployee, deleteEmployee } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals / Drawers
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [createModal, setCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Compute assigned hours per employee
  const employeeHoursMap = useMemo(() => {
    const map = {};
    employees.forEach(e => { map[e.id] = 0; });
    shifts.forEach(s => {
      const dur = calculateShiftDurationHours(s.startTime, s.endTime);
      map[s.employeeId] = (map[s.employeeId] || 0) + dur;
    });
    return map;
  }, [employees, shifts]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (departmentFilter !== 'All' && emp.department !== departmentFilter) return false;
      if (statusFilter !== 'All' && emp.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesId = emp.id.toLowerCase().includes(q);
        const matchesRole = emp.role.toLowerCase().includes(q);
        const matchesSkill = emp.skills?.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesId && !matchesRole && !matchesSkill) return false;
      }
      return true;
    });
  }, [employees, departmentFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2 py-0.5 rounded-full">
              Personnel Directory
            </span>
            <span className="text-[10px] font-mono text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-semibold">
              {employees.length} Active Agents
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight flex items-center gap-2.5">
            Employees
          </h1>
          <p className="text-xs text-[#5A7184] mt-1">
            Manage workforce profiles, certified skill proficiencies, availability matrices, and weekly capacity.
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#087F8C] hover:bg-[#066B76] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5ECEE] text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-52">
            <Search className="w-3.5 h-3.5 text-[#8A9BA8] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, ID, role, skill..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-[#F4F8F8] border border-[#E5ECEE] rounded-lg text-[#111827] placeholder-[#8A9BA8] text-xs focus:outline-none focus:border-[#087F8C]"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-[#F4F8F8] border border-[#E5ECEE] rounded-lg px-2.5 py-1.5 text-[#111827] text-xs focus:outline-none focus:border-[#087F8C] cursor-pointer"
          >
            <option value="All">All Departments</option>
            {INITIAL_DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F4F8F8] border border-[#E5ECEE] rounded-lg px-2.5 py-1.5 text-[#111827] text-xs focus:outline-none focus:border-[#087F8C] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
          </select>
        </div>

        <span className="text-[11px] text-[#5A7184] font-mono">
          Showing {filteredEmployees.length} of {employees.length} personnel
        </span>
      </div>

      {/* Employees Directory Table */}
      <div className="bg-white rounded-xl border border-[#E5ECEE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead>
              <tr className="bg-[#F4F8F8] border-b border-[#E5ECEE] text-[10px] font-bold text-[#5A7184] uppercase tracking-wider font-mono">
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Role & Seniority</th>
                <th className="p-3.5">Weekly Capacity</th>
                <th className="p-3.5">Skills</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5ECEE] text-xs">
              {filteredEmployees.map((emp) => {
                const assignedHours = employeeHoursMap[emp.id] || 0;
                const maxHours = emp.maxHoursPerWeek || 40;
                const capacityPct = Math.min(100, Math.round((assignedHours / maxHours) * 100));

                return (
                  <tr key={emp.id} className="hover:bg-[#F4F8F8]/60 transition-colors">
                    {/* Employee info */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-[#E5ECEE]"
                        />
                        <div>
                          <p className="font-bold text-[#111827]">{emp.name}</p>
                          <span className="text-[11px] text-[#5A7184] font-mono">{emp.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-3.5">
                      <span className="text-xs text-[#5A7184] font-medium">{emp.department}</span>
                    </td>

                    {/* Role & Seniority */}
                    <td className="p-3.5">
                      <div>
                        <p className="font-semibold text-[#111827]">{emp.role}</p>
                        <span className="text-[10px] text-[#087F8C] font-mono font-medium">{emp.seniority} Level</span>
                      </div>
                    </td>

                    {/* Weekly Capacity */}
                    <td className="p-3.5">
                      <div className="w-36 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-[#111827] font-semibold">{assignedHours} / {maxHours}h</span>
                          <span className={assignedHours > maxHours ? 'text-rose-600 font-bold' : 'text-[#5A7184]'}>
                            {capacityPct}%
                          </span>
                        </div>
                        <div className="w-full bg-[#F4F8F8] h-1.5 rounded-full overflow-hidden border border-[#E5ECEE]">
                          <div
                            className={`h-full rounded-full ${
                              assignedHours > maxHours
                                ? 'bg-rose-500'
                                : assignedHours >= maxHours
                                ? 'bg-[#57945A]'
                                : 'bg-[#087F8C]'
                            }`}
                            style={{ width: `${Math.min(100, capacityPct)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Skills */}
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {emp.skills?.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#F4F8F8] text-[#5A7184] border border-[#E5ECEE]"
                          >
                            {skill}
                          </span>
                        ))}
                        {emp.skills?.length > 2 && (
                          <span className="text-[10px] text-[#8A9BA8] self-center">
                            +{emp.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedProfile(emp)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#087F8C] hover:bg-[#EBF6F7] rounded-md border border-transparent hover:border-[#087F8C]/20 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setEditModal({ isOpen: true, data: { ...emp } })}
                          className="p-1.5 text-[#5A7184] hover:text-[#111827] hover:bg-[#F4F8F8] rounded-md transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(emp.id)}
                          className="p-1.5 text-[#8A9BA8] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add New Employee */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5ECEE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECEE]">
              <h3 className="text-base font-bold text-[#111827]">Add New Team Member</h3>
              <button onClick={() => setCreateModal(false)} className="text-[#8A9BA8] hover:text-[#111827] p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                addEmployee({
                  name: form.empName.value,
                  email: form.empEmail.value,
                  department: form.empDept.value,
                  role: form.empRole.value,
                  seniority: form.empSeniority.value,
                  maxHoursPerWeek: Number(form.empHours.value) || 40,
                  hourlyRate: 28,
                  status: 'Full-Time',
                  skills: ['Omnichannel Zendesk', 'Conflict De-escalation'],
                  availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                });
                setCreateModal(false);
              }}
              className="space-y-3.5 mt-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-[#111827] mb-1">Full Name</label>
                <input
                  name="empName"
                  required
                  placeholder="e.g. Jordan Miller"
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#087F8C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111827] mb-1">Corporate Email</label>
                <input
                  name="empEmail"
                  type="email"
                  required
                  placeholder="jordan.miller@shiftflow.internal"
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] placeholder-[#8A9BA8] focus:outline-none focus:border-[#087F8C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Department</label>
                  <select
                    name="empDept"
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-2.5 py-2 text-[#111827] focus:outline-none focus:border-[#087F8C] cursor-pointer"
                  >
                    {INITIAL_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Role</label>
                  <select
                    name="empRole"
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-2.5 py-2 text-[#111827] focus:outline-none focus:border-[#087F8C] cursor-pointer"
                  >
                    {INITIAL_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Seniority</label>
                  <select
                    name="empSeniority"
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-2.5 py-2 text-[#111827] focus:outline-none focus:border-[#087F8C] cursor-pointer"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Team Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Weekly Cap (Hours)</label>
                  <input
                    name="empHours"
                    type="number"
                    defaultValue={40}
                    min={10}
                    max={60}
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#087F8C]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5ECEE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-3.5 py-2 text-[#5A7184] hover:text-[#111827] hover:bg-[#F4F8F8] rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#087F8C] hover:bg-[#066B76] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Add to Directory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: View Employee Profile & Assigned Shifts */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E5ECEE] rounded-2xl max-w-md w-full h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5ECEE]">
                <h3 className="text-sm font-bold text-[#111827]">Employee Dossier</h3>
                <button onClick={() => setSelectedProfile(null)} className="text-[#8A9BA8] hover:text-[#111827] p-1 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-5 text-center border-b border-[#E5ECEE]">
                <img
                  src={selectedProfile.avatar}
                  alt={selectedProfile.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-[#087F8C] mx-auto mb-3"
                />
                <h4 className="text-base font-bold text-[#111827]">{selectedProfile.name}</h4>
                <p className="text-xs text-[#087F8C] font-medium">{selectedProfile.role} • {selectedProfile.seniority}</p>
                <span className="text-[10px] text-[#5A7184] font-mono">{selectedProfile.id}</span>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider block font-mono">
                    Department
                  </span>
                  <p className="text-[#111827] font-medium mt-0.5">{selectedProfile.department}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider block font-mono">
                    Certified Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedProfile.skills?.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-[#EBF6F7] text-[#087F8C] border border-[#087F8C]/20 rounded-md font-mono text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider block font-mono">
                    Availability
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {DAYS_OF_WEEK.map(d => {
                      const avail = selectedProfile.availability?.includes(d);
                      return (
                        <span
                          key={d}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            avail
                              ? 'bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20 font-semibold'
                              : 'bg-[#F4F8F8] text-[#8A9BA8] line-through'
                          }`}
                        >
                          {d.slice(0, 3)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5ECEE] flex justify-end">
              <button
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 bg-[#F4F8F8] hover:bg-slate-100 text-[#111827] text-xs font-semibold rounded-xl border border-[#E5ECEE] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E5ECEE] text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">Delete Employee Record?</h3>
            <p className="text-xs text-[#5A7184] mt-1">
              All active shifts and break allocations for this employee will be cancelled.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-[#F4F8F8] hover:bg-slate-100 text-[#5A7184] rounded-xl font-semibold text-xs border border-[#E5ECEE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteEmployee(deleteConfirmId);
                  setDeleteConfirmId(null);
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
