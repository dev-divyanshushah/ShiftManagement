import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Coffee,
  Sliders,
  ArrowRightLeft,
  CalendarDays,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const EmployeeSidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { leaveRequests, swapRequests, notifications } = useApp();

  const myId = currentUser?.employeeId || 'EMP-1001';
  const myPendingLeaves = leaveRequests.filter(l => (l.employeeId === myId || l.employeeId === currentUser?.dbEmployeeId) && l.status === 'Pending').length;
  const myPendingSwaps = swapRequests.filter(s => (s.requesterId === myId || s.requesterId === currentUser?.dbEmployeeId) && s.status === 'Pending').length;
  const myUnreadNotifs = notifications.filter(n => (!n.targetEmployeeId || n.targetEmployeeId === myId) && !n.read).length;

  const navGroups = [
    {
      group: 'MY WORKSPACE',
      items: [
        { name: 'My Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
        { name: 'My Schedule', href: '/employee/schedule', icon: Calendar },
        { name: 'My Breaks', href: '/employee/breaks', icon: Coffee },
      ],
    },
    {
      group: 'MY REQUESTS',
      items: [
        { name: 'Availability', href: '/employee/availability', icon: Sliders },
        {
          name: 'Shift Swap',
          href: '/employee/swaps',
          icon: ArrowRightLeft,
          count: myPendingSwaps > 0 ? myPendingSwaps : undefined,
          countColor: 'green',
        },
        {
          name: 'Leave Requests',
          href: '/employee/leave',
          icon: CalendarDays,
          count: myPendingLeaves > 0 ? myPendingLeaves : undefined,
          countColor: 'green',
        },
      ],
    },
    {
      group: 'PERSONAL',
      items: [
        {
          name: 'Notifications',
          href: '/employee/notifications',
          icon: Bell,
          count: myUnreadNotifs > 0 ? myUnreadNotifs : undefined,
          countColor: 'teal',
        },
        { name: 'My Profile', href: '/employee/profile', icon: User },
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
        <NavLink to="/employee/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#57945A] to-[#087F8C] flex items-center justify-center text-white shadow-md shadow-[#57945A]/20 shrink-0">
            <span className="font-extrabold text-xs tracking-tight">SF</span>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-[#173B49] text-sm leading-tight tracking-tight flex items-center gap-1.5">
                ShiftFlow
                <span className="text-[9px] font-bold text-[#57945A] bg-[#EDF6EE] px-1.5 py-0.2 rounded border border-[#57945A]/20">
                  Agent
                </span>
              </span>
              <span className="text-[10px] text-[#5A7184] truncate font-medium">Agent Self-Service</span>
            </div>
          )}
        </NavLink>

        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8] transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Grouped Nav Items */}
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
                        ? 'bg-[#EDF6EE] text-[#57945A] font-semibold border-l-3 border-[#57945A] shadow-2xs'
                        : 'text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8]'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#57945A]'
                            : 'text-[#5A7184] group-hover:text-[#57945A]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && item.count !== undefined && item.count > 0 && (
                      <span
                        className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                          item.countColor === 'teal'
                            ? 'text-[#087F8C] bg-[#EBF6F7] border border-[#087F8C]/20'
                            : 'text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Agent Footer with Status */}
      <div className="p-3.5 border-t border-[#E5ECEE] bg-[#F4F8F8]/60 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'Agent'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E5ECEE]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#57945A] ring-2 ring-white"></span>
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#173B49] truncate leading-tight">
                  {currentUser?.name || 'Sarah Jenkins'}
                </p>
                <p className="text-[10px] text-[#57945A] truncate font-mono font-semibold">
                  {currentUser?.employeeId || 'EMP-1001'}
                </p>
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
