'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Dog,
  Stethoscope,
  Calendar,
  Clock,
  Syringe,
  CheckCircle2,
  FileText,
  BarChart3,
  Settings,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SessionPayload } from '@/lib/auth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalOwners: 0,
    totalPets: 0,
    totalVets: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    vaccinationsDue: 0,
    completedTreatments: 0,
  });

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData.success) {
          router.push('/login');
          return;
        }
        if (meData.data.user.role !== 'ADMIN') {
          router.push('/clinic/dashboard');
          return;
        }
        setUser(meData.data.user);

        const reportsRes = await fetch('/api/reports');
        const reportsData = await reportsRes.json();
        if (reportsData.success) {
          setStats(reportsData.data.overview);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          user={user}
          onOpenSidebar={() => setSidebarOpen(true)}
          title="Hospital Administration Dashboard"
          subtitle="System oversight, role-based access control, clinical reports, and practice metrics"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Administrator Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
            <div className="relative z-10 space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> High-Level Practice Governance
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Veterinary Clinic Management Console
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Hospital systems are online with zero schema discrepancies. You have administrative privileges to manage roles, inspect medical records, authorize doctor accounts, and review compliance reports.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/admin/users"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors"
                >
                  <Users className="w-4 h-4" /> User Management
                </Link>
                <Link
                  href="/admin/reports"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" /> Practice Analytics
                </Link>
              </div>
            </div>
          </div>

          {/* Core Administrator Statistics (Section 14) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <StatCard
              title="Total Owners"
              value={stats.totalOwners}
              subtitle="Registered clients"
              icon={Users}
              color="emerald"
              onClick={() => router.push('/clinic/owners')}
            />
            <StatCard
              title="Total Pets"
              value={stats.totalPets}
              subtitle="Patient registry"
              icon={Dog}
              color="teal"
              onClick={() => router.push('/clinic/pets')}
            />
            <StatCard
              title="Veterinarians"
              value={stats.totalVets}
              subtitle="Licensed doctors"
              icon={Stethoscope}
              color="blue"
              onClick={() => router.push('/clinic/veterinarians')}
            />
            <StatCard
              title="Appointments"
              value={stats.totalAppointments}
              subtitle="Lifetime bookings"
              icon={Calendar}
              color="indigo"
              onClick={() => router.push('/clinic/appointments')}
            />
            <StatCard
              title="Pending Visits"
              value={stats.pendingAppointments}
              subtitle="Awaiting triage"
              icon={Clock}
              color="amber"
              onClick={() => router.push('/clinic/appointments?status=PENDING')}
            />
            <StatCard
              title="Vaccines Due"
              value={stats.vaccinationsDue}
              subtitle="Overdue boosters"
              icon={Syringe}
              color="rose"
              onClick={() => router.push('/clinic/vaccinations?filter=overdue')}
            />
            <StatCard
              title="Treatments"
              value={stats.completedTreatments}
              subtitle="Completed visits"
              icon={CheckCircle2}
              color="teal"
              onClick={() => router.push('/clinic/treatments')}
            />
          </div>

          {/* Admin Management Sections (Section 14) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Hospital Administration Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Users & Accounts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">User & Role Management</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Review registered users, switch role authorizations (OWNER, VETERINARIAN, STAFF, ADMIN), and deactivate accounts.
                  </p>
                </div>
                <Link
                  href="/admin/users"
                  className="text-xs font-bold text-purple-700 hover:text-purple-800 inline-flex items-center gap-1.5 pt-2"
                >
                  Manage System Users <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Medical Operations */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Doctor & Clinical Staff</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Add new veterinarian staff profiles, assign licenses, track doctor experience, and configure availability schedules.
                  </p>
                </div>
                <Link
                  href="/clinic/veterinarians"
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1.5 pt-2"
                >
                  Manage Doctors <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Analytics & Reports */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Reports & Analytics</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Visualize monthly appointments, pet patient inflow, vaccine compliance ratios, and top diagnoses.
                  </p>
                </div>
                <Link
                  href="/admin/reports"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 pt-2"
                >
                  View Clinical Reports <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
