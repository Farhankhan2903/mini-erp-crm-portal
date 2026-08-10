import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 transition-all duration-200 hover:border-slate-300 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  iconBg?: string;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  iconBg = 'bg-indigo-50 text-indigo-600',
  trend,
  trendPositive = true,
}) => {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center text-xs font-semibold">
              <span className={trendPositive ? 'text-emerald-600' : 'text-rose-600'}>
                {trendPositive ? '↑' : '↓'} {trend}
              </span>
              <span className="ml-1 text-slate-400 font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl shrink-0 ${iconBg}`}>{icon}</div>
      </div>
    </Card>
  );
};
