import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    secondary: 'bg-teal-50 text-teal-700 border-teal-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const norm = status?.toUpperCase() || '';
  let variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' = 'default';

  if (norm === 'CONFIRMED' || norm === 'COMPLETED' || norm === 'ACTIVE') {
    variant = 'success';
  } else if (norm === 'PENDING') {
    variant = 'warning';
  } else if (norm === 'CANCELLED' || norm === 'REJECTED' || norm === 'OVERDUE' || norm === 'INACTIVE') {
    variant = 'danger';
  } else if (norm === 'DUE_SOON' || norm === 'DUE_TODAY') {
    variant = 'info';
  }

  return (
    <Badge variant={variant}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {status}
    </Badge>
  );
}
