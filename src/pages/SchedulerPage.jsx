import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Filter,
  Check,
  Trash2,
  Edit2,
  Clock,
  User,
  AlertTriangle,
  Send,
  Download,
  Search,
  CheckCircle2,
  RefreshCw,
  X,
  Layers,
  Calendar as CalendarIcon,
  Copy,
  GripVertical,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DAYS_OF_WEEK, INITIAL_DEPARTMENTS, INITIAL_ROLES } from '../data/mockData';
import { formatDateRange, getDaysOfWeekWithDates, calculateShiftDurationHours } from '../utils/dateUtils';
import { exportScheduleToCSV } from '../utils/exportUtils';

export const SchedulerPage = () => {
  const navigate = useNavigate();
  const {
    employees,
    shifts,
    templates,
    currentWeekStart,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    addShift,
    updateShift,
    deleteShift,
    moveShift,
    addEmployee,
    optimizeRoster,
    scheduleStatus,
    publishSchedule,
    conflicts,
    addNotification,
  } = useApp();

  // Filters state
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedShiftType, setSelectedShiftType] = useState('All');
  const [searchAgent, setSearchAgent] = useState('');

  // Drag and drop cell highlighting state
  const [dragOverCell, setDragOverCell] = useState(null); // 'empId_dayName'
  const [draggedItem, setDraggedItem] = useState(null);

  // Modals state
  const [shiftModal, setShiftModal] = useState({ isOpen: false, mode: 'create', data: null });
  const [addEmployeeModal, setAddEmployeeModal] = useState(false);
  const [deleteConfirmShift, setDeleteConfirmShift] = useState(null);

  // Days columns with date numbers
  const weekDays = useMemo(() => getDaysOfWeekWithDates(currentWeekStart), [currentWeekStart]);

  // Total hours assigned per employee
  const employeeHoursMap = useMemo(() => {
    const map = {};
    employees.forEach(e => { map[e.id] = 0; });
    shifts.forEach(shift => {
      const dur = calculateShiftDurationHours(shift.startTime, shift.endTime);
      map[shift.employeeId] = (map[shift.employeeId] || 0) + dur;
    });
    return map;
  }, [employees, shifts]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (selectedDept !== 'All' && emp.department !== selectedDept) return false;
      if (selectedRole !== 'All' && emp.role !== selectedRole) return false;
      if (searchAgent.trim() !== '') {
        const query = searchAgent.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(query);
        const matchesId = emp.id.toLowerCase().includes(query);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  }, [employees, selectedDept, selectedRole, searchAgent]);

  // Helper to get shifts for an employee on a specific day
  const getShiftsForCell = (empId, dayName) => {
    return shifts.filter(s => {
      if (s.employeeId !== empId || s.day !== dayName) return false;
      if (selectedShiftType !== 'All') {
        const tmpl = templates.find(t => t.id === s.templateId);
        if (tmpl && tmpl.code !== selectedShiftType) return false;
      }
      return true;
    });
  };

  // Template color helper (Insigrow light enterprise palette)
  const getTemplateStyle = (templateId) => {
    const tmpl = templates.find(t => t.id === templateId);
    if (!tmpl) {
      return {
        bg: 'bg-[#EBF6F7] text-[#087F8C] border-[#087F8C]/30',
        badge: 'bg-[#087F8C]',
        name: 'Shift',
      };
    }
    if (tmpl.code === 'MORNING') {
      return {
        bg: 'bg-[#EBF6F7] text-[#087F8C] border-[#087F8C]/30',
        badge: 'bg-[#087F8C]',
        name: tmpl.name,
      };
    }
    if (tmpl.code === 'GENERAL') {
      return {
        bg: 'bg-[#EBF3FA] text-[#00A9DE] border-[#00A9DE]/30',
        badge: 'bg-[#00A9DE]',
        name: tmpl.name,
      };
    }
    if (tmpl.code === 'EVENING') {
      return {
        bg: 'bg-[#EDF6EE] text-[#57945A] border-[#57945A]/30',
        badge: 'bg-[#57945A]',
        name: tmpl.name,
      };
    }
    if (tmpl.code === 'NIGHT') {
      return {
        bg: 'bg-[#FAF0F8] text-[#D06EBF] border-[#D06EBF]/30',
        badge: 'bg-[#D06EBF]',
        name: tmpl.name,
      };
    }
    return {
      bg: 'bg-[#EBF6F7] text-[#087F8C] border-[#087F8C]/30',
      badge: 'bg-[#087F8C]',
      name: tmpl.name,
    };
  };

  // --- HTML5 Drag-and-Drop Handlers ---
  const handleShiftDragStart = (e, shift) => {
    const payload = { type: 'MOVE_SHIFT', shiftId: shift.id, fromEmpId: shift.employeeId, fromDay: shift.day };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(payload);
  };

  const handleTemplateDragStart = (e, tmpl) => {
    const payload = { type: 'NEW_TEMPLATE_SHIFT', templateId: tmpl.id };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedItem(payload);
  };

  const handleCellDragOver = (e, empId, dayName) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedItem?.type === 'MOVE_SHIFT' ? 'move' : 'copy';
    const cellKey = `${empId}_${dayName}`;
    if (dragOverCell !== cellKey) {
      setDragOverCell(cellKey);
    }
  };

  const handleCellDragLeave = (e, empId, dayName) => {
    const cellKey = `${empId}_${dayName}`;
    if (dragOverCell === cellKey) {
      setDragOverCell(null);
    }
  };

  const handleCellDrop = (empId, dayName, e) => {
    e.preventDefault();
    setDragOverCell(null);
    setDraggedItem(null);

    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.type === 'MOVE_SHIFT') {
        moveShift(data.shiftId, empId, dayName);
      } else if (data.type === 'NEW_TEMPLATE_SHIFT') {
        const emp = employees.find(x => x.id === empId);
        const tmpl = templates.find(t => t.id === data.templateId);

        const existingShift = shifts.find(s => s.employeeId === empId && s.day === dayName);
        if (existingShift) {
          addNotification({
            title: 'Shift Assignment Conflict',
            message: `${emp.name} is already assigned on ${dayName}.`,
            type: 'warning',
          });
          return;
        }

        addShift({
          employeeId: empId,
          day: dayName,
          templateId: data.templateId,
          startTime: tmpl ? tmpl.startTime : '09:00',
          endTime: tmpl ? tmpl.endTime : '17:00',
          role: emp?.role || 'Support Specialist',
          department: emp?.department || 'Customer Support',
        });
      }
    } catch (err) {
      console.error('Drop error', err);
    }
  };

  const handleDuplicateToWeekdays = (shift) => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let addedCount = 0;

    weekdays.forEach(day => {
      if (day !== shift.day) {
        const exists = shifts.some(s => s.employeeId === shift.employeeId && s.day === day);
        if (!exists) {
          addShift({
            employeeId: shift.employeeId,
            day,
            templateId: shift.templateId,
            startTime: shift.startTime,
            endTime: shift.endTime,
            role: shift.role,
            department: shift.department,
          });
          addedCount++;
        }
      }
    });

    addNotification({
      title: 'Shift Cloned Across Week',
      message: `Replicated shift across ${addedCount} available weekdays for employee.`,
      type: 'success',
    });
  };

  const handleEmptyCellClick = (empId, dayName) => {
    const emp = employees.find(e => e.id === empId);
    setShiftModal({
      isOpen: true,
      mode: 'create',
      data: {
        employeeId: empId,
        day: dayName,
        templateId: templates[0]?.id || 'tmpl-2',
        role: emp?.role || 'Support Specialist',
        department: emp?.department || 'Customer Support',
        startTime: '09:00',
        endTime: '17:00',
      },
    });
  };

  const handleShiftBlockClick = (shift, e) => {
    e.stopPropagation();
    setShiftModal({
      isOpen: true,
      mode: 'edit',
      data: { ...shift },
    });
  };

  const handleShiftSubmit = (e) => {
    e.preventDefault();
    const { mode, data } = shiftModal;
    const selectedTmpl = templates.find(t => t.id === data.templateId);

    const shiftPayload = {
      ...data,
      startTime: selectedTmpl ? selectedTmpl.startTime : data.startTime,
      endTime: selectedTmpl ? selectedTmpl.endTime : data.endTime,
    };

    if (mode === 'create') {
      addShift(shiftPayload);
    } else {
      updateShift(data.id, shiftPayload);
    }
    setShiftModal({ isOpen: false, mode: 'create', data: null });
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5ECEE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20 px-2.5 py-0.5 rounded-full font-mono">
              Workforce Roster Centerpiece
            </span>
            <span className="text-[10px] font-mono font-bold text-[#57945A] bg-[#EDF6EE] px-2.5 py-0.5 rounded-full border border-[#57945A]/20">
              {scheduleStatus === 'Published' ? '● Master Published' : '○ Draft Mode'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173B49] tracking-tight">Shift Scheduler</h1>
          <p className="text-xs text-[#5A7184] mt-0.5">
            Spacious weekly scheduling grid with drag-and-drop reallocation, shift templates, and live constraint checks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Week Navigator */}
          <div className="flex items-center bg-white border border-[#E5ECEE] p-0.5 rounded-xl text-xs shadow-2xs">
            <button
              onClick={goToPrevWeek}
              className="p-1.5 hover:bg-[#F4F8F8] rounded-lg text-[#5A7184] hover:text-[#173B49] transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-[#173B49] px-3 flex items-center gap-1.5 font-mono">
              <CalendarIcon className="w-3.5 h-3.5 text-[#087F8C]" />
              {formatDateRange(currentWeekStart)}
            </span>
            <button
              onClick={goToNextWeek}
              className="p-1.5 hover:bg-[#F4F8F8] rounded-lg text-[#5A7184] hover:text-[#173B49] transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Auto Optimize */}
          <button
            onClick={() => navigate('/auto-scheduler')}
            className="px-4 py-2 bg-[#087F8C] hover:bg-[#066B76] text-white font-bold text-xs rounded-xl shadow-md shadow-[#087F8C]/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Auto Schedule</span>
          </button>

          {/* Publish Schedule */}
          {scheduleStatus === 'Draft' ? (
            <button
              onClick={publishSchedule}
              className="px-4 py-2 bg-[#57945A] hover:bg-[#497F4C] text-white font-bold text-xs rounded-xl shadow-md shadow-[#57945A]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/30 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Published</span>
            </div>
          )}

          <button
            onClick={() => exportScheduleToCSV(shifts, employees, templates)}
            className="p-2 bg-white hover:bg-[#F4F8F8] text-[#5A7184] hover:text-[#173B49] rounded-xl border border-[#E5ECEE] transition-colors cursor-pointer shadow-2xs"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Quick Palette Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5ECEE] text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Employee */}
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-[#8A9BA8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchAgent}
              onChange={(e) => setSearchAgent(e.target.value)}
              placeholder="Search agent..."
              className="w-full pl-8 pr-2.5 py-2 bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl text-[#173B49] placeholder-[#8A9BA8] focus:outline-none focus:border-[#087F8C] text-xs transition-colors"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#173B49] text-xs font-medium focus:outline-none focus:border-[#087F8C] cursor-pointer"
          >
            <option value="All">All Departments</option>
            {INITIAL_DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#173B49] text-xs font-medium focus:outline-none focus:border-[#087F8C] cursor-pointer"
          >
            <option value="All">All Roles</option>
            {INITIAL_ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {(selectedDept !== 'All' || selectedRole !== 'All' || selectedShiftType !== 'All' || searchAgent) && (
            <button
              onClick={() => {
                setSelectedDept('All');
                setSelectedRole('All');
                setSelectedShiftType('All');
                setSearchAgent('');
              }}
              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Quick Shift Template Palette */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-[#8A9BA8] font-bold uppercase tracking-wider hidden lg:inline font-mono">
            Drag to Assign:
          </span>
          {templates.map(tmpl => {
            const style = getTemplateStyle(tmpl.id);
            return (
              <div
                key={tmpl.id}
                draggable
                onDragStart={(e) => handleTemplateDragStart(e, tmpl)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-grab active:cursor-grabbing hover:scale-102 transition-all flex items-center gap-1.5 shadow-2xs ${style.bg}`}
                title={`Drag onto empty slot to assign ${tmpl.name}`}
              >
                <span className={`w-2 h-2 rounded-full ${style.badge}`}></span>
                <span>{tmpl.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({tmpl.startTime.slice(0, 5)})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl border border-[#E5ECEE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[1100px]">
            {/* Header: Monday to Sunday */}
            <thead>
              <tr className="bg-[#F4F8F8] border-b border-[#E5ECEE]">
                <th className="w-72 p-4 text-xs font-bold text-[#173B49] sticky left-0 bg-[#F4F8F8] z-10 border-r border-[#E5ECEE] uppercase tracking-wider font-mono">
                  <div className="flex items-center justify-between">
                    <span>Employee & Role</span>
                    <span className="text-[10px] text-[#5A7184]">Hours / Cap</span>
                  </div>
                </th>
                {weekDays.map(({ dayName, dateFormatted, isToday }) => (
                  <th
                    key={dayName}
                    className={`p-3.5 text-xs border-r border-[#E5ECEE] last:border-r-0 text-center ${
                      isToday ? 'bg-[#EBF6F7] text-[#087F8C]' : 'text-[#173B49]'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-[#8A9BA8]">
                        {dayName.slice(0, 3)}
                      </span>
                      <span className={`text-sm mt-0.5 font-bold font-mono ${isToday ? 'text-[#087F8C]' : 'text-[#173B49]'}`}>
                        {dateFormatted}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Employee Rows */}
            <tbody className="divide-y divide-[#E5ECEE]">
              {filteredEmployees.map((emp) => {
                const assignedHours = employeeHoursMap[emp.id] || 0;
                const maxHours = emp.maxHoursPerWeek || 40;
                const isOvertime = assignedHours > maxHours;

                return (
                  <tr key={emp.id} className="hover:bg-[#F4F8F8]/50 transition-colors group">
                    {/* Employee Profile Column */}
                    <td className="p-3.5 sticky left-0 bg-white group-hover:bg-[#F4F8F8]/80 z-10 border-r border-[#E5ECEE] transition-colors">
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-[#E5ECEE]"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#173B49] truncate leading-tight">
                              {emp.name}
                            </p>
                            <p className="text-[10px] text-[#5A7184] truncate mt-0.5">
                              {emp.role}
                            </p>
                            <span className="text-[9px] text-[#8A9BA8] uppercase tracking-wider font-mono font-medium">
                              {emp.department}
                            </span>
                          </div>
                        </div>

                        {/* Hours Meter Badge */}
                        <div className="shrink-0 text-right">
                          <span
                            className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                              isOvertime
                                ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                                : assignedHours >= maxHours
                                ? 'bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20'
                                : 'bg-[#F4F8F8] text-[#5A7184] border border-[#E5ECEE]'
                            }`}
                          >
                            {assignedHours}/{maxHours}h
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Monday to Sunday Day Cells (Drop Targets) */}
                    {DAYS_OF_WEEK.map((dayName) => {
                      const cellShifts = getShiftsForCell(emp.id, dayName);
                      const isAvailable = emp.availability ? emp.availability.includes(dayName) : true;
                      const cellKey = `${emp.id}_${dayName}`;
                      const isDraggedOver = dragOverCell === cellKey;

                      return (
                        <td
                          key={dayName}
                          onClick={() => handleEmptyCellClick(emp.id, dayName)}
                          onDragOver={(e) => handleCellDragOver(e, emp.id, dayName)}
                          onDragLeave={(e) => handleCellDragLeave(e, emp.id, dayName)}
                          onDrop={(e) => handleCellDrop(emp.id, dayName, e)}
                          className={`p-2 align-top border-r border-[#E5ECEE] last:border-r-0 min-w-[140px] transition-all cursor-pointer relative ${
                            isDraggedOver
                              ? 'bg-[#EBF6F7] ring-2 ring-[#087F8C] ring-inset'
                              : !isAvailable
                              ? 'bg-[#F4F8F8]/60'
                              : 'hover:bg-[#F4F8F8]'
                          }`}
                        >
                          <div className="min-h-[72px] flex flex-col gap-1.5">
                            {cellShifts.map((shift) => {
                              const style = getTemplateStyle(shift.templateId);
                              const hasConflict = conflicts.some(c => c.shiftIds?.includes(shift.id));

                              return (
                                <div
                                  key={shift.id}
                                  draggable
                                  onDragStart={(e) => handleShiftDragStart(e, shift)}
                                  onClick={(e) => handleShiftBlockClick(shift, e)}
                                  className={`p-2.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all hover:scale-[1.02] cursor-grab active:cursor-grabbing relative group/shift ${style.bg} ${
                                    hasConflict ? 'ring-2 ring-rose-500 animate-pulse' : ''
                                  }`}
                                >
                                  {hasConflict && (
                                    <div
                                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs"
                                      title="Schedule conflict detected on this shift"
                                    >
                                      !
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="font-bold text-[11px] truncate">{style.name}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/shift:opacity-100 transition-opacity">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDuplicateToWeekdays(shift);
                                        }}
                                        title="Clone shift across weekdays"
                                        className="p-1 rounded bg-white hover:bg-slate-100 text-[#5A7184] hover:text-[#087F8C] shadow-2xs"
                                      >
                                        <Copy className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 text-[10px] font-mono opacity-90">
                                    <Clock className="w-3 h-3 shrink-0" />
                                    <span>{shift.startTime} – {shift.endTime}</span>
                                  </div>

                                  <div className="text-[10px] opacity-75 truncate mt-0.5">
                                    {shift.role}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Drop zone placeholder */}
                            {cellShifts.length === 0 && (
                              <div className={`h-full flex-1 flex items-center justify-center transition-all ${
                                isDraggedOver ? 'opacity-100 text-[#087F8C] font-bold' : 'opacity-0 hover:opacity-100'
                              }`}>
                                <span className="p-1.5 rounded-xl bg-white text-[#087F8C] border border-[#E5ECEE] text-[10px] font-bold flex items-center gap-0.5 shadow-2xs">
                                  <Plus className="w-3 h-3" />
                                  <span>{isDraggedOver ? 'Drop Here' : 'Assign'}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Assign / Edit Shift (Insigrow Light Palette) */}
      {shiftModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5ECEE]">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5ECEE]">
              <h3 className="text-base font-bold text-[#173B49]">
                {shiftModal.mode === 'create' ? 'Assign New Shift' : 'Modify Assigned Shift'}
              </h3>
              <button
                onClick={() => setShiftModal({ isOpen: false, mode: 'create', data: null })}
                className="text-[#8A9BA8] hover:text-[#173B49] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleShiftSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#173B49] mb-1 font-mono text-[11px]">Employee</label>
                <select
                  value={shiftModal.data.employeeId}
                  onChange={(e) => {
                    const emp = employees.find(x => x.id === e.target.value);
                    setShiftModal(prev => ({
                      ...prev,
                      data: {
                        ...prev.data,
                        employeeId: e.target.value,
                        role: emp?.role || prev.data.role,
                        department: emp?.department || prev.data.department,
                      }
                    }));
                  }}
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2.5 text-[#173B49] font-medium focus:outline-none focus:border-[#087F8C] cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department} • {emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#173B49] mb-1 font-mono text-[11px]">Day of Week</label>
                <select
                  value={shiftModal.data.day}
                  onChange={(e) => setShiftModal(prev => ({ ...prev, data: { ...prev.data, day: e.target.value } }))}
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2.5 text-[#173B49] font-medium focus:outline-none focus:border-[#087F8C] cursor-pointer"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#173B49] mb-1 font-mono text-[11px]">Shift Template</label>
                <select
                  value={shiftModal.data.templateId}
                  onChange={(e) => {
                    const tmpl = templates.find(t => t.id === e.target.value);
                    setShiftModal(prev => ({
                      ...prev,
                      data: {
                        ...prev.data,
                        templateId: e.target.value,
                        startTime: tmpl?.startTime || prev.data.startTime,
                        endTime: tmpl?.endTime || prev.data.endTime,
                      }
                    }));
                  }}
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2.5 text-[#173B49] font-medium focus:outline-none focus:border-[#087F8C] cursor-pointer"
                >
                  {templates.map(tmpl => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.startTime} - {tmpl.endTime}, {tmpl.durationHours}h)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#173B49] mb-1 font-mono text-[11px]">Start Time</label>
                  <input
                    type="time"
                    value={shiftModal.data.startTime}
                    onChange={(e) => setShiftModal(prev => ({ ...prev, data: { ...prev.data, startTime: e.target.value } }))}
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#173B49] font-mono focus:outline-none focus:border-[#087F8C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#173B49] mb-1 font-mono text-[11px]">End Time</label>
                  <input
                    type="time"
                    value={shiftModal.data.endTime}
                    onChange={(e) => setShiftModal(prev => ({ ...prev, data: { ...prev.data, endTime: e.target.value } }))}
                    className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2 text-[#173B49] font-mono focus:outline-none focus:border-[#087F8C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#173B49] mb-1 font-mono text-[11px]">Assigned Role</label>
                <select
                  value={shiftModal.data.role}
                  onChange={(e) => setShiftModal(prev => ({ ...prev, data: { ...prev.data, role: e.target.value } }))}
                  className="w-full bg-[#F4F8F8] border border-[#E5ECEE] rounded-xl px-3 py-2.5 text-[#173B49] font-medium focus:outline-none focus:border-[#087F8C] cursor-pointer"
                >
                  {INITIAL_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-[#E5ECEE] flex items-center justify-between">
                {shiftModal.mode === 'edit' ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmShift(shiftModal.data.id)}
                    className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Shift</span>
                  </button>
                ) : <div></div>}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShiftModal({ isOpen: false, mode: 'create', data: null })}
                    className="px-4 py-2 text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8] rounded-xl font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#087F8C] hover:bg-[#066B76] text-white rounded-xl font-bold shadow-md shadow-[#087F8C]/20 cursor-pointer"
                  >
                    {shiftModal.mode === 'create' ? 'Assign Shift' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Shift Confirmation */}
      {deleteConfirmShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E5ECEE] text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#173B49]">Remove Shift Assignment?</h3>
            <p className="text-xs text-[#5A7184] mt-1">
              This shift will be permanently deleted from the weekly roster.
            </p>
            <div className="flex items-center justify-center gap-2.5 mt-5">
              <button
                onClick={() => setDeleteConfirmShift(null)}
                className="px-4 py-2 bg-[#F4F8F8] hover:bg-slate-200 text-[#173B49] rounded-xl font-semibold text-xs cursor-pointer"
              >
                Keep Shift
              </button>
              <button
                onClick={() => {
                  deleteShift(deleteConfirmShift);
                  setDeleteConfirmShift(null);
                  setShiftModal({ isOpen: false, mode: 'create', data: null });
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
