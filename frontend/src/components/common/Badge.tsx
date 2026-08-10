import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'primary'
  | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  danger: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
  info: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20',
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20',
  purple: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs transition-colors ${sizeClasses} ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
};
