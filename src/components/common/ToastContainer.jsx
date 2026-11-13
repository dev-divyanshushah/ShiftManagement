import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer = () => {
  const { notifications } = useApp();
  const [activeToasts, setActiveToasts] = useState([]);

  // Watch for latest unread notifications and pop them as toasts
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Only show if generated recently (or not in activeToasts)
      setActiveToasts((prev) => {
        if (prev.some((t) => t.id === latest.id)) return prev;
        return [latest, ...prev.slice(0, 3)];
      });

      // Auto dismiss after 4.5 seconds
      const timer = setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== latest.id));
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const removeToast = (id) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {activeToasts.map((toast) => {
        const isCritical = toast.type === 'critical';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl bg-white flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200 transition-all ${
              isCritical
                ? 'border-rose-200 shadow-rose-100/50'
                : isWarning
                ? 'border-amber-200 shadow-amber-100/50'
                : isSuccess
                ? 'border-emerald-200 shadow-emerald-100/50'
                : 'border-indigo-200 shadow-indigo-100/50'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isCritical ? (
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              ) : isWarning ? (
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              ) : isSuccess ? (
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-600 p-0.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

