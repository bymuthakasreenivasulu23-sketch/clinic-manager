'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Stethoscope,
  LayoutDashboard,
  Dog,
  Calendar,
  Syringe,
  FileText,
  Users,
  UserCheck,
  BarChart3,
  Bell,
  User,
  LogOut,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Role } from '@/types';

interface SidebarProps {
  role: Role;
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // Build menu items based on role
  const getNavItems = () => {
    if (role === 'ADMIN') {
      return [
        { label: 'Admin Overview', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Directory', href: '/admin/users', icon: Users },
        { label: 'Owner Accounts', href: '/clinic/owners', icon: UserCheck },
        { label: 'All Pets', href: '/clinic/pets', icon: Dog },
        { label: 'Appointments', href: '/clinic/appointments', icon: Calendar },
        { label: 'Veterinarians', href: '/clinic/veterinarians', icon: Stethoscope },
        { label: 'Vaccinations', href: '/clinic/vaccinations', icon: Syringe },
        { label: 'Treatment Records', href: '/clinic/treatments', icon: FileText },
        { label: 'Clinical Reports', href: '/admin/reports', icon: BarChart3 },
        { label: 'Notifications', href: '/notifications', icon: Bell },
        { label: 'My Profile', href: '/profile', icon: User },
      ];
    }

    if (role === 'VETERINARIAN' || role === 'STAFF') {
      return [
        { label: 'Clinic Dashboard', href: '/clinic/dashboard', icon: LayoutDashboard },
        { label: 'Appointments', href: '/clinic/appointments', icon: Calendar },
        { label: 'Pet Patients', href: '/clinic/pets', icon: Dog },
        { label: 'Owners', href: '/clinic/owners', icon: Users },
        { label: 'Vaccinations', href: '/clinic/vaccinations', icon: Syringe },
        { label: 'Medical Treatments', href: '/clinic/treatments', icon: FileText },
        { label: 'Doctor Team', href: '/clinic/veterinarians', icon: Stethoscope },
        { label: 'Notifications', href: '/notifications', icon: Bell },
        { label: 'My Profile', href: '/profile', icon: User },
      ];
    }

    // Default: OWNER
    return [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Pets', href: '/pets', icon: Dog },
      { label: 'Appointments', href: '/appointments', icon: Calendar },
      { label: 'Vaccinations', href: '/vaccinations', icon: Syringe },
      { label: 'Medical History', href: '/treatments', icon: FileText },
      { label: 'Notifications', href: '/notifications', icon: Bell },
      { label: 'My Profile', href: '/profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-slate-800',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
              <Stethoscope className="w-5 h-5 text-slate-950" />
            </div>
            <div className="overflow-hidden">
              <span className="text-base font-bold tracking-tight text-white block truncate">
                VetClinic<span className="text-teal-400">Manager</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-teal-400 tracking-wider block">
                {role} Portal
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform group-hover:scale-105',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
