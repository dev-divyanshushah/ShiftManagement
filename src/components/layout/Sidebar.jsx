import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Layers,
  Zap,
  Coffee,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { conflicts, notifications } = useApp();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const navGroups = [
    {
      group: 'WORKSPACE',
      items: [
        { name: 'Overview', href: '/overview', icon: LayoutDashboard },
        { name: 'Shift Scheduler', href: '/scheduler', icon: Calendar },
        { name: 'Employees', href: '/employees', icon: Users },
        { name: 'Shift Templates', href: '/templates', icon: Layers },
      ],
    },
    {
      group: 'WORKFORCE OPERATIONS',
      items: [
        { name: 'Auto Scheduler', href: '/auto-scheduler', icon: Zap, badge: 'AI' },
        { name: 'Break Management', href: '/breaks', icon: Coffee },
        {
          name: 'Conflict Center',
          href: '/conflicts',
          icon: AlertTriangle,
          count: conflicts.length,
          countVariant: conflicts.length > 0 ? 'rose' : 'slate',
        },
        { name: 'Demand Forecast', href: '/forecast', icon: TrendingUp },
      ],
    },
    {
      group: 'MANAGEMENT',
      items: [
        { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-[#E5ECEE] flex flex-col h-screen select-none shrink-0 transition-all duration-300 z-30 shadow-xs ${
        isCollapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5ECEE] shrink-0 bg-white">
        <NavLink to="/overview" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#087F8C] to-[#00A9DE] flex items-center justify-center text-white shadow-md shadow-[#087F8C]/20 shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-[#173B49] text-sm leading-tight tracking-tight flex items-center gap-1.5">
                ShiftFlow
                <span className="text-[9px] font-bold text-[#087F8C] bg-[#EBF6F7] px-1.5 py-0.2 rounded border border-[#087F8C]/20">
                  WFM
                </span>
              </span>
              <span className="text-[10px] text-[#5A7184] truncate font-medium">Apex Contact Solutions</span>
            </div>
          )}
        </NavLink>

        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8] transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Grouped Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.group}>
            {!isCollapsed && (
              <p className="px-2.5 mb-1.5 text-[10px] font-bold text-[#8A9BA8] tracking-wider uppercase font-mono">
                {group.group}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-[#EBF6F7] text-[#087F8C] font-semibold border-l-3 border-[#087F8C] shadow-2xs'
                        : 'text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8]'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#087F8C]'
                            : 'text-[#5A7184] group-hover:text-[#087F8C]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && item.count !== undefined && item.count > 0 && (
                      <span
                        className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                          item.countVariant === 'rose'
                            ? 'text-rose-700 bg-rose-50 border border-rose-200'
                            : 'text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/30 px-1.5 py-0.2 rounded font-mono">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Status Footer */}
      <div className="p-3.5 border-t border-[#E5ECEE] bg-[#F4F8F8]/60 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'Manager'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E5ECEE]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#57945A] ring-2 ring-white"></span>
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#173B49] truncate leading-tight">
                  {currentUser?.name || 'Alexandra Vance'}
                </p>
                <p className="text-[10px] text-[#5A7184] truncate">Operations Lead</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-1.5 text-[#5A7184] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
