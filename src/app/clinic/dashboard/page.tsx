'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Dog,
  Users,
  Syringe,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  AlertCircle,
  FileText,
  Stethoscope,
  Filter,
  Plus,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SPECIES_EMOJIS, formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function ClinicDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Stats & Lists
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    totalPets: 0,
    totalOwners: 0,
    vaccinationsDue: 0,
    pendingCount: 0,
    completedVisits: 0,
  });

  // Reschedule Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // Appointments for today
      const resToday = await fetch(`/api/appointments?date=${todayStr}`);
      const dataToday = await resToday.json();
      if (dataToday.success) {
        setTodayAppointments(dataToday.data);
      }

      // All appointments for counters
      const resAll = await fetch('/api/appointments');
      const dataAll = await resAll.json();
      if (dataAll.success) {
        setAllAppointments(dataAll.data);
      }

      // Reports/Analytics endpoint for global totals
      const resReports = await fetch('/api/reports');
      const dataReports = await resReports.json();
      if (dataReports.success) {
        const ov = dataReports.data.overview;
        setStats({
          todayCount: dataToday.data?.length || 0,
          totalPets: ov.totalPets,
          totalOwners: ov.totalOwners,
          vaccinationsDue: ov.overdueVaccinations,
          pendingCount: ov.pendingAppointments,
          completedVisits: ov.completedAppointments,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData.success) {
          router.push('/login');
          return;
        }

        // If OWNER logged in, redirect to owner dashboard
        if (meData.data.user.role === 'OWNER') {
          router.push('/dashboard');
          return;
        }

        setUser(meData.data.user);
        await fetchDashboardData();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const handleUpdateStatus = async (apptId: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/appointments/${apptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDashboardData();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch {
      alert('Error connecting to server');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !newDate || !newTime) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDate: newDate,
          timeSlot: newTime,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRescheduleModalOpen(false);
        await fetchDashboardData();
      } else {
        alert(data.message || 'Failed to reschedule');
      }
    } catch {
      alert('Error rescheduling');
    } finally {
      setActionLoading(false);
    }
  };

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
          title="Clinical Operations Dashboard"
          subtitle={`Welcome Dr./Staff ${user.name} • Live Hospital Queue`}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Dashboard Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Today's Visits"
              value={stats.todayCount}
              subtitle="Daily roster"
              icon={Calendar}
              color="teal"
            />
            <StatCard
              title="Pending Approval"
              value={stats.pendingCount}
              subtitle="Requires review"
              icon={Clock}
              color="amber"
              onClick={() => router.push('/clinic/appointments?status=PENDING')}
            />
            <StatCard
              title="Total Pets"
              value={stats.totalPets}
              subtitle="Active patients"
              icon={Dog}
              color="blue"
              onClick={() => router.push('/clinic/pets')}
            />
            <StatCard
              title="Pet Owners"
              value={stats.totalOwners}
              subtitle="Registered clients"
              icon={Users}
              color="emerald"
              onClick={() => router.push('/clinic/owners')}
            />
            <StatCard
              title="Vaccines Due"
              value={stats.vaccinationsDue}
              subtitle="Needs booster"
              icon={Syringe}
              color="rose"
              onClick={() => router.push('/clinic/vaccinations?filter=overdue')}
            />
            <StatCard
              title="Completed Visits"
              value={stats.completedVisits}
              subtitle="Concluded visits"
              icon={CheckCircle2}
              color="indigo"
              onClick={() => router.push('/clinic/appointments?status=COMPLETED')}
            />
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick Shortcuts:
              </span>
              <Link
                href="/clinic/vaccinations"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors"
              >
                <Syringe className="w-3.5 h-3.5" /> Log Vaccine
              </Link>
              <Link
                href="/clinic/treatments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> New Medical Record
              </Link>
            </div>

            <Link
              href="/clinic/appointments"
              className="text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              Open Full Calendar Schedule →
            </Link>
          </div>

          {/* TODAY'S APPOINTMENTS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today&apos;s Appointments Queue</h3>
                <p className="text-xs text-slate-500">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 self-start sm:self-auto">
                {todayAppointments.length} Scheduled Today
              </span>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No appointments scheduled for today yet.</p>
                <p>Check the full appointment management page to view upcoming days.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-5">Pet Patient</th>
                      <th className="py-3.5 px-5">Owner / Contact</th>
                      <th className="py-3.5 px-5">Time Slot</th>
                      <th className="py-3.5 px-5">Reason for Visit</th>
                      <th className="py-3.5 px-5">Attending Doctor</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Queue Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todayAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">
                              {SPECIES_EMOJIS[appt.pet?.species] || '🐾'}
                            </span>
                            <div>
                              <Link
                                href={`/pets/${appt.pet?.id}`}
                                className="font-bold text-slate-900 hover:text-teal-600 hover:underline block"
                              >
                                {appt.pet?.name}
                              </Link>
                              <span className="text-[11px] text-slate-500">
                                {appt.pet?.breed}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <strong className="text-slate-800 block">{appt.owner?.name}</strong>
                          <span className="text-[11px] text-slate-500">{appt.owner?.phone || appt.owner?.email}</span>
                        </td>

                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            {appt.timeSlot}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-slate-700 max-w-xs">
                          <span className="line-clamp-2">{appt.reason}</span>
                        </td>

                        <td className="py-4 px-5 text-slate-700 font-medium">
                          {appt.veterinarian?.user?.name || (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-4 px-5">
                          <StatusBadge status={appt.status} />
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={`/pets/${appt.pet?.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              title="View Pet Chart"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {appt.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs"
                                title="Confirm Appointment"
                              >
                                Confirm
                              </button>
                            )}

                            {appt.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                                title="Mark as Completed"
                              >
                                Complete
                              </button>
                            )}

                            {appt.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'REJECTED')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs"
                                title="Reject"
                              >
                                Reject
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedAppt(appt);
                                setNewDate(new Date(appt.appointmentDate).toISOString().split('T')[0]);
                                setNewTime(appt.timeSlot);
                                setRescheduleModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              title="Reschedule"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RESCHEDULE MODAL */}
          <Modal
            isOpen={rescheduleModalOpen}
            onClose={() => setRescheduleModalOpen(false)}
            title="Reschedule Appointment"
            subtitle={`Reschedule visit for ${selectedAppt?.pet?.name}`}
          >
            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  New Date *
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  New Time Slot *
                </label>
                <select
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {[
                    '09:00 AM',
                    '09:30 AM',
                    '10:00 AM',
                    '10:30 AM',
                    '11:00 AM',
                    '11:30 AM',
                    '01:30 PM',
                    '02:00 PM',
                    '02:30 PM',
                    '03:00 PM',
                    '03:30 PM',
                    '04:00 PM',
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
