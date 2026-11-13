import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LogOut,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Info,
  UserRound,
  Search,
  Building2,
  HelpCircle,
  Sparkles,
  Command,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateRange } from '../../utils/dateUtils';

export const Navbar = ({ toggleSidebar, isSidebarCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, loginAsDemo } = useAuth();
  const {
    currentWeekStart,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    notifications,
    markNotificationAsRead,
    clearNotifications,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSwitchToEmployee = async () => {
    setShowProfileMenu(false);
    if (loginAsDemo) {
      await loginAsDemo('Employee');
    }
    navigate('/employee/dashboard');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#E5ECEE] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 shadow-2xs">
      {/* Left: Workspace Branding & Week Navigator */}
      <div className="flex items-center gap-3">
        {/* Workspace Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#F4F8F8] border border-[#E5ECEE] rounded-lg text-xs">
          <Building2 className="w-3.5 h-3.5 text-[#087F8C]" />
          <span className="font-bold text-[#173B49]">Apex Contact Solutions</span>
          <span className="text-[10px] text-[#5A7184] font-medium">WFM Operations</span>
        </div>

        <div className="hidden sm:block h-4 w-px bg-[#E5ECEE]"></div>

        {/* Week Navigator */}
        <div className="flex items-center bg-[#F4F8F8] border border-[#E5ECEE] rounded-lg p-0.5 text-xs">
          <button
            onClick={goToPrevWeek}
            title="Previous Week"
            className="p-1.5 rounded hover:bg-white text-[#5A7184] hover:text-[#173B49] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={goToCurrentWeek}
            className="flex items-center gap-1.5 px-3 py-1 font-semibold text-[#173B49] hover:bg-white rounded transition-colors cursor-pointer font-mono text-xs"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#087F8C]" />
            <span>{formatDateRange(currentWeekStart)}</span>
          </button>

          <button
            onClick={goToNextWeek}
            title="Next Week"
            className="p-1.5 rounded hover:bg-white text-[#5A7184] hover:text-[#173B49] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Search, Switcher, Notifications, Help & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Search / Command Palette Trigger */}
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F4F8F8] hover:bg-[#EEF3F4] border border-[#E5ECEE] rounded-lg text-xs text-[#5A7184] hover:text-[#173B49] transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#8A9BA8]" />
          <span>Quick Find...</span>
          <kbd className="text-[10px] bg-white border border-[#E5ECEE] px-1.5 py-0.2 rounded font-mono text-[#5A7184] shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* 1-Click Switch to Employee Portal */}
        <button
          onClick={handleSwitchToEmployee}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#57945A] bg-[#EDF6EE] hover:bg-[#E0F0E2] border border-[#57945A]/30 rounded-lg transition-colors cursor-pointer shadow-2xs"
          title="Switch to Employee Self-Service Portal"
        >
          <UserRound className="w-3.5 h-3.5 text-[#57945A]" />
          <span>Employee View</span>
        </button>

        <div className="h-4 w-px bg-[#E5ECEE]"></div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8] border border-transparent hover:border-[#E5ECEE] transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-sm"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5ECEE] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
              <div className="p-3.5 border-b border-[#E5ECEE] flex items-center justify-between bg-[#F4F8F8]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#173B49]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] font-semibold text-[#087F8C] hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E5ECEE]/60 text-xs">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-[#5A7184]">No active alerts or notifications.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3.5 hover:bg-[#F4F8F8] transition-colors cursor-pointer flex gap-3 ${
                        !notif.read ? 'bg-[#EBF6F7]/50' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {notif.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#57945A]" />
                        ) : notif.type === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        ) : notif.type === 'warning' ? (
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

        {/* Help & Support Button */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-2 rounded-lg text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8] border border-transparent hover:border-[#E5ECEE] transition-colors cursor-pointer"
          title="Help & Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Profile Avatar with dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#F4F8F8] border border-transparent hover:border-[#E5ECEE] transition-colors cursor-pointer"
          >
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'Manager'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E5ECEE]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#57945A] ring-2 ring-white"></span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-[#173B49] leading-tight">
                {currentUser?.name || 'Alexandra Vance'}
              </p>
              <p className="text-[10px] text-[#5A7184] leading-none mt-0.5">Operations Lead</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5ECEE] rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in duration-150">
              <div className="px-4 py-3 border-b border-[#E5ECEE] bg-[#F4F8F8]">
                <p className="text-xs font-bold text-[#173B49]">{currentUser?.name || 'Alexandra Vance'}</p>
                <p className="text-[11px] text-[#5A7184] truncate">{currentUser?.email || 'manager@shiftflow.com'}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#57945A]"></span>
                  <span className="text-[10px] text-[#57945A] font-semibold">Enterprise Admin Clearance</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8] flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#087F8C]" />
                  <span>Settings & Preferences</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/conflicts');
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8] flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Review Conflicts</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/auto-scheduler');
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-[#5A7184] hover:text-[#173B49] hover:bg-[#F4F8F8] flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#087F8C]" />
                  <span>Auto Scheduler Engine</span>
                </button>

                <div className="border-t border-[#E5ECEE] my-1"></div>

                <button
                  onClick={handleSwitchToEmployee}
                  className="w-full px-4 py-2 text-left text-xs text-[#57945A] hover:bg-[#EDF6EE] flex items-center gap-2.5 font-semibold cursor-pointer"
                >
                  <UserRound className="w-3.5 h-3.5 text-[#57945A]" />
                  <span>Switch to Employee View</span>
                </button>

                <div className="border-t border-[#E5ECEE] my-1"></div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E5ECEE] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5ECEE]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#087F8C]" />
                <h3 className="text-sm font-bold text-[#173B49]">ShiftFlow Workspace Guide</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-[#8A9BA8] hover:text-[#173B49] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-[#5A7184]">
              <p>
                <strong className="text-[#173B49]">Keyboard Shortcuts:</strong> Press <kbd className="px-1.5 py-0.5 bg-[#F4F8F8] border border-[#E5ECEE] rounded font-mono text-[#173B49]">Ctrl + K</kbd> to open the Command Palette.
              </p>
              <p>
                <strong className="text-[#173B49]">Drag & Drop:</strong> In the Shift Scheduler, drag any shift card onto an eligible agent's slot to reassign.
              </p>
              <p>
                <strong className="text-[#173B49]">Auto Scheduler:</strong> Navigate to <span className="text-[#087F8C] font-semibold">Auto Scheduler</span> to satisfy floor coverage rules with one click.
              </p>
              <p>
                <strong className="text-[#173B49]">Role Switching:</strong> Toggle between Manager Operations Hub and Employee Self-Service at any time using the header button.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5ECEE] flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#087F8C] hover:bg-[#066B76] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
