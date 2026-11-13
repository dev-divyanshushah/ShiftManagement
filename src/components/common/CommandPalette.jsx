import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Users,
  Sparkles,
  Coffee,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Send,
  X,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { employees, optimizeRoster, autoAllocateBreaks, publishSchedule, conflicts } = useApp();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'opt',
      title: 'Run AI Roster Optimization',
      category: 'Smart Actions',
      icon: Sparkles,
      color: 'text-[#087F8C]',
      action: () => {
        navigate('/auto-scheduler');
        optimizeRoster();
        setIsOpen(false);
      },
    },
    {
      id: 'breaks',
      title: 'Auto-Allocate Staggered Breaks',
      category: 'Smart Actions',
      icon: Coffee,
      color: 'text-amber-600',
      action: () => {
        navigate('/breaks');
        autoAllocateBreaks();
        setIsOpen(false);
      },
    },
    {
      id: 'conflicts',
      title: 'Audit Constraint & Compliance Issues',
      category: 'Compliance',
      icon: AlertTriangle,
      color: 'text-rose-600',
      action: () => {
        navigate('/conflicts');
        setIsOpen(false);
      },
    },
    {
      id: 'publish',
      title: 'Publish Master Roster to Agents',
      category: 'Operations',
      icon: Send,
      color: 'text-[#57945A]',
      action: () => {
        publishSchedule();
        setIsOpen(false);
      },
    },
  ];

  const pages = [
    { title: 'Overview Dashboard', path: '/overview', icon: TrendingUp },
    { title: 'Shift Scheduler Calendar', path: '/scheduler', icon: Calendar },
    { title: 'Auto Scheduler Optimizer', path: '/auto-scheduler', icon: Sparkles },
    { title: 'Employee Directory', path: '/employees', icon: Users },
    { title: 'Break Management Matrix', path: '/breaks', icon: Coffee },
    { title: 'Demand & Queue Forecast', path: '/forecast', icon: TrendingUp },
    { title: 'Reports & Export Center', path: '/reports', icon: FileSpreadsheet },
    { title: 'Settings & Constraint Rules', path: '/settings', icon: Settings },
  ];

  const filteredActions = quickActions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredEmployees = employees
    .filter(
      (e) =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.department.toLowerCase().includes(query.toLowerCase()) ||
        e.role.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#E5ECEE] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E5ECEE] flex items-center gap-3 bg-[#F4F8F8]">
          <Search className="w-4 h-4 text-[#8A9BA8] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, employee name, or jump to page... (ESC to exit)"
            className="w-full bg-transparent text-sm text-[#173B49] placeholder-[#8A9BA8] focus:outline-none font-medium"
          />
          <span className="text-[10px] font-bold text-[#5A7184] bg-white px-2 py-0.5 rounded border border-[#E5ECEE] shrink-0 font-mono shadow-2xs">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-3.5 text-xs">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <p className="px-2.5 py-1 text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono">
                Quick Actions
              </p>
              <div className="space-y-1">
                {filteredActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full p-2.5 rounded-xl hover:bg-[#EBF6F7] flex items-center justify-between text-left transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg bg-[#F4F8F8] group-hover:bg-white ${item.color} shadow-2xs`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#173B49] group-hover:text-[#087F8C]">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5A7184] font-medium font-mono">{item.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Pages */}
          {filteredPages.length > 0 && (
            <div>
              <p className="px-2.5 py-1 text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono">
                Navigation
              </p>
              <div className="space-y-1">
                {filteredPages.map((page) => (
                  <button
                    key={page.title}
                    onClick={() => {
                      navigate(page.path);
                      setIsOpen(false);
                    }}
                    className="w-full p-2 rounded-xl hover:bg-[#F4F8F8] flex items-center gap-2.5 text-left text-[#5A7184] font-medium hover:text-[#087F8C] transition-colors cursor-pointer"
                  >
                    <page.icon className="w-3.5 h-3.5 text-[#8A9BA8]" />
                    <span>{page.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Employees */}
          {query.trim() !== '' && filteredEmployees.length > 0 && (
            <div>
              <p className="px-2.5 py-1 text-[10px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono">
                Personnel
              </p>
              <div className="space-y-1">
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      navigate('/employees');
                      setIsOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#F4F8F8] flex items-center gap-3 text-left transition-colors cursor-pointer"
                  >
                    <img src={emp.avatar} alt={emp.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-[#E5ECEE]" />
                    <div>
                      <p className="font-bold text-[#173B49] leading-tight">{emp.name}</p>
                      <p className="text-[10px] text-[#5A7184]">{emp.department} • {emp.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F4F8F8] border-t border-[#E5ECEE] flex items-center justify-between text-[11px] text-[#5A7184]">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-[#E5ECEE] rounded text-[10px] font-mono shadow-2xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-[#E5ECEE] rounded text-[10px] font-mono shadow-2xs">K</kbd> anywhere</span>
          <span className="font-mono text-[#087F8C] font-semibold">ShiftFlow WFM Engine</span>
        </div>
      </div>
    </div>
  );
};
