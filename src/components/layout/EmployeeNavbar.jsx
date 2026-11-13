import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatDateRange } from '../../utils/dateUtils';

export const EmployeeNavbar = () => {
  const navigate = useNavigate();
  const { currentUser, loginAsDemo } = useAuth();
  const { notifications, currentWeekStart, markNotificationAsRead } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const myNotifications = notifications.filter(
    n => !n.targetEmployeeId || n.targetEmployeeId === currentUser?.employeeId || n.targetEmployeeId === currentUser?.dbEmployeeId
  );
  const unreadCount = myNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#E5ECEE] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 shadow-2xs">
      {/* Left: Personalized Greeting & Floor Role */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-[#EDF6EE] border border-[#57945A]/20 flex items-center justify-center text-[#57945A]">
            <Clock className="w-4 h-4" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#57945A]"></span>
        </div>

        <div>
          <h1 className="text-xs sm:text-sm font-bold text-[#173B49] tracking-tight leading-none flex items-center gap-2">
            <span>Welcome back, {currentUser?.name || 'Sarah Jenkins'}</span>
            <span className="hidden md:inline-flex text-[10px] font-mono text-[#57945A] bg-[#EDF6EE] px-1.5 py-0.2 rounded border border-[#57945A]/20">
              ● Active Today
            </span>
          </h1>
          <p className="text-[11px] text-[#5A7184] mt-0.5 hidden sm:block">
            {currentUser?.department || 'Customer Support'} • {currentUser?.title || 'Senior Support Specialist'}
          </p>
        </div>
      </div>

      {/* Right: Week indicator, Manager Switcher & Notification Bell */}
      <div className="flex items-center gap-2.5">
        {/* Switch to Manager Portal shortcut */}
        <button
          onClick={async () => {
            if (loginAsDemo) await loginAsDemo('Manager');
            navigate('/overview');
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#087F8C] bg-[#EBF6F7] hover:bg-[#E0F3F5] border border-[#087F8C]/30 rounded-lg transition-colors cursor-pointer shadow-2xs"
          title="Switch to Manager Portal"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#087F8C]" />
          <span>Manager View</span>
        </button>

        {/* Week Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F8F8] border border-[#E5ECEE] rounded-lg text-xs font-semibold text-[#173B49] font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#57945A]" />
          <span>{formatDateRange(currentWeekStart)}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8] border border-transparent hover:border-[#E5ECEE] transition-colors cursor-pointer"
            title="My Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-sm"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5ECEE] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
              <div className="p-3.5 border-b border-[#E5ECEE] flex items-center justify-between bg-[#F4F8F8]">
                <span className="font-bold text-xs text-[#173B49]">My Notifications</span>
                <span className="text-[10px] text-[#5A7184] font-mono">{unreadCount} unread</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E5ECEE]/60 text-xs">
                {myNotifications.length === 0 ? (
                  <p className="p-6 text-center text-[#5A7184]">No notifications.</p>
                ) : (
                  myNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3.5 hover:bg-[#F4F8F8] transition-colors cursor-pointer flex gap-3 ${
                        !notif.read ? 'bg-[#EDF6EE]/40' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {notif.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#57945A]" />
                        ) : notif.type === 'critical' || notif.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Info className="w-4 h-4 text-[#087F8C]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#173B49] truncate">{notif.title}</p>
                          <span className="text-[10px] text-[#8A9BA8] ml-2 shrink-0 font-mono">{notif.time || 'Recent'}</span>
                        </div>
                        <p className="text-[11px] text-[#5A7184] mt-0.5 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
