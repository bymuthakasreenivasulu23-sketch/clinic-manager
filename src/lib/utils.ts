import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';
import { NextResponse } from 'next/server';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(d)) return 'N/A';
    return format(d, 'MMM dd, yyyy');
  } catch {
    return 'N/A';
  }
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(d)) return 'N/A';
    return format(d, 'MMM dd, yyyy h:mm a');
  } catch {
    return 'N/A';
  }
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function apiError(message: string, status: number = 400, errors?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    },
    { status }
  );
}

export const APPOINTMENT_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  COMPLETED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  REJECTED: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
};

export const SPECIES_EMOJIS: Record<string, string> = {
  Dog: '🐶',
  Cat: '🐱',
  Bird: '🦜',
  Rabbit: '🐰',
  Other: '🐾',
};
