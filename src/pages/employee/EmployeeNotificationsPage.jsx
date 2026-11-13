import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Check,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const EmployeeNotificationsPage = () => {
  const { currentUser } = useAuth();
  const { notifications, markNotificationAsRead } = useApp();

  const myNotifications = notifications.filter(
    n => !n.targetEmployeeId || n.targetEmployeeId === currentUser?.employeeId || n.targetEmployeeId === currentUser?.dbEmployeeId
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5ECEE] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#57945A] bg-[#EDF6EE] border border-[#57945A]/20 px-2 py-0.5 rounded-full font-mono font-semibold">
              Live Feed
            </span>
            <span className="text-[11px] text-[#5A7184] font-mono">
              {myNotifications.filter(n => !n.read).length} Unread Updates
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">Activity & Schedule Notifications</h1>
          <p className="text-xs text-[#5A7184] mt-0.5">
            Shift updates, roster publications, leave approvals, and operational announcements.
          </p>
        </div>

        <button
          onClick={() => myNotifications.forEach(n => markNotificationAsRead(n.id))}
          className="px-3.5 py-2 bg-white hover:bg-[#F4F8F8] text-[#111827] font-semibold text-xs rounded-xl border border-[#E5ECEE] hover:border-[#087F8C]/40 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {myNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5ECEE] p-12 text-center text-[#5A7184] shadow-xs">
            <Bell className="w-10 h-10 mx-auto mb-3 text-[#8A9BA8]" />
            <h3 className="text-sm font-semibold text-[#111827]">No Notifications</h3>
            <p className="text-xs mt-1 text-[#5A7184]">You are all caught up with your schedule and requests.</p>
          </div>
        ) : (
          myNotifications.map((n) => {
            return (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`rounded-xl border p-4 shadow-xs transition-all flex items-start gap-3.5 cursor-pointer hover:border-[#087F8C]/40 ${
                  !n.read ? 'border-[#087F8C]/40 bg-[#EBF6F7]/30' : 'bg-white border-[#E5ECEE]'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {n.type === 'success' ? (
                    <div className="w-8 h-8 rounded-xl bg-[#EDF6EE] text-[#57945A] border border-[#57945A]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : n.type === 'warning' || n.type === 'critical' ? (
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-[#EBF6F7] text-[#087F8C] border border-[#087F8C]/20 flex items-center justify-center">
                      <Info className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#111827]">{n.title}</h4>
                    <span className="text-[10px] text-[#8A9BA8] font-mono">{n.time}</span>
                  </div>
                  <p className="text-xs text-[#5A7184] mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-[#087F8C] shrink-0 self-center"></span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
