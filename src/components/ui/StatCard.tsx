import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'teal' | 'blue' | 'amber' | 'rose' | 'indigo';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'teal',
  onClick,
}: StatCardProps) {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      gradient: 'from-emerald-500/10 to-transparent',
      hover: 'hover:border-emerald-300',
    },
    teal: {
      bg: 'bg-teal-50 text-teal-600 border-teal-100',
      gradient: 'from-teal-500/10 to-transparent',
      hover: 'hover:border-teal-300',
    },
    blue: {
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
      gradient: 'from-sky-500/10 to-transparent',
      hover: 'hover:border-sky-300',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      gradient: 'from-amber-500/10 to-transparent',
      hover: 'hover:border-amber-300',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      gradient: 'from-rose-500/10 to-transparent',
      hover: 'hover:border-rose-300',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      gradient: 'from-indigo-500/10 to-transparent',
      hover: 'hover:border-indigo-300',
    },
  };

  const scheme = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm transition-all duration-200',
        onClick ? 'cursor-pointer hover:shadow-md ' + scheme.hover : ''
      )}
    >
      <div className={cn('absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br', scheme.gradient)} />
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 pt-0.5">{subtitle}</p>}
        </div>
        <div className={cn('p-3.5 rounded-xl border', scheme.bg)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
