import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import type { ToastType } from '../../context/ToastContext';

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-50 text-emerald-900',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
  },
  error: {
    bg: 'bg-rose-50 text-rose-900',
    border: 'border-rose-200',
    text: 'text-rose-800',
    icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  },
  info: {
    bg: 'bg-sky-50 text-sky-900',
    border: 'border-sky-200',
    text: 'text-sky-800',
    icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all animate-in slide-in-from-top-2 duration-200 ${style.bg} ${style.border}`}
          >
            {style.icon}
            <div className={`flex-1 text-xs font-medium ${style.text}`}>{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
