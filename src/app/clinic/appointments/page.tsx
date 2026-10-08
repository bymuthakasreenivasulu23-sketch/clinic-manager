'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  List,
  CalendarDays,
  User,
  Plus,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SPECIES_EMOJIS, formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function ClinicAppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vetFilter, setVetFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Reschedule Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      let url = `/api/appointments?status=${statusFilter}&veterinarianId=${vetFilter}&search=${encodeURIComponent(
        search
      )}`;
      if (dateFilter) url += `&date=${dateFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      }

      const resVets = await fetch('/api/veterinarians');
      const dataVets = await resVets.json();
      if (dataVets.success) {
        setVets(dataVets.data);
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
        if (meData.data.user.role === 'OWNER') {
          router.push('/dashboard');
          return;
        }
        setUser(meData.data.user);
        await fetchAppointments();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [statusFilter, vetFilter, dateFilter, search]);

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
        await fetchAppointments();
      } else {
        alert(data.message || 'Failed to update');
      }
    } catch {
      alert('Error updating status');
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
        await fetchAppointments();
      } else {
        alert(data.message || 'Failed to reschedule');
      }
    } catch {
      alert('Error communicating with server');
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

  // Group appointments by date for Calendar view
  const groupedAppointments: Record<string, any[]> = {};
  appointments.forEach((appt) => {
    const key = new Date(appt.appointmentDate).toISOString().split('T')[0];
    if (!groupedAppointments[key]) groupedAppointments[key] = [];
    groupedAppointments[key].push(appt);
  });

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
          title="Clinical Appointment Schedule"
          subtitle="Hospital booking oversight, calendar view, triage, and doctor allocations"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by pet, owner name, phone, or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* View toggle (List vs Calendar) */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start md:self-auto">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-4 h-4" /> Table View
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    viewMode === 'calendar'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" /> Calendar View
                </button>
              </div>
            </div>

            {/* Sub-filters row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending (Action Required)</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Attending Doctor
                </label>
                <select
                  value={vetFilter}
                  onChange={(e) => setVetFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="ALL">All Veterinarians</option>
                  {vets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Specific Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter('')}
                      className="px-2.5 py-1 text-slate-400 hover:text-slate-700 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hospital Appointment Schedule</h3>
                  <p className="text-xs text-slate-500">
                    Showing {appointments.length} appointment entries
                  </p>
                </div>
              </div>

              {appointments.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                  <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No appointments found matching filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-5">Pet Patient</th>
                        <th className="py-3.5 px-5">Owner</th>
                        <th className="py-3.5 px-5">Date & Slot</th>
                        <th className="py-3.5 px-5">Reason</th>
                        <th className="py-3.5 px-5">Veterinarian</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span>{SPECIES_EMOJIS[appt.pet?.species] || '🐾'}</span>
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
                            <span className="text-[11px] text-slate-500">{appt.owner?.phone}</span>
                          </td>

                          <td className="py-4 px-5">
                            <strong className="text-slate-800 block">
                              {formatDate(appt.appointmentDate)}
                            </strong>
                            <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {appt.timeSlot}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-slate-700 max-w-xs">
                            <span className="line-clamp-2">{appt.reason}</span>
                          </td>

                          <td className="py-4 px-5 text-slate-700">
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
                                title="View Patient Chart"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>

                              {appt.status === 'PENDING' && (
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                                  title="Confirm Appointment"
                                >
                                  Confirm
                                </button>
                              )}

                              {appt.status === 'CONFIRMED' && (
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold"
                                  title="Mark Completed"
                                >
                                  Complete
                                </button>
                              )}

                              {appt.status === 'PENDING' && (
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'REJECTED')}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold"
                                  title="Reject Request"
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
          )}

          {/* CALENDAR VIEW */}
          {viewMode === 'calendar' && (
            <div className="space-y-6">
              {Object.keys(groupedAppointments).length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                  No appointments to display on the calendar.
                </div>
              ) : (
                Object.keys(groupedAppointments)
                  .sort()
                  .map((dateKey) => {
                    const dayAppointments = groupedAppointments[dateKey];
                    const isToday =
                      dateKey === new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={dateKey}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                      >
                        <div
                          className={`p-4 border-b flex items-center justify-between ${
                            isToday
                              ? 'bg-teal-50 border-teal-100'
                              : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              className={`w-5 h-5 ${
                                isToday ? 'text-teal-600' : 'text-slate-500'
                              }`}
                            />
                            <h4 className="font-bold text-sm text-slate-900">
                              {formatDate(dateKey)}
                            </h4>
                            {isToday && <Badge variant="info">Today</Badge>}
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            {dayAppointments.length} Appointments
                          </span>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {dayAppointments.map((appt) => (
                            <div
                              key={appt.id}
                              className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all bg-white shadow-sm space-y-2 text-xs"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <span>{SPECIES_EMOJIS[appt.pet?.species] || '🐾'}</span>
                                  <div>
                                    <strong className="text-slate-900 block font-bold">
                                      {appt.pet?.name}
                                    </strong>
                                    <span className="text-[11px] text-slate-500">
                                      Owner: {appt.owner?.name}
                                    </span>
                                  </div>
                                </div>
                                <StatusBadge status={appt.status} />
                              </div>

                              <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-50">
                                <span className="font-bold text-teal-800 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> {appt.timeSlot}
                                </span>
                                <span className="text-slate-500 font-medium">
                                  {appt.veterinarian?.user?.name || 'Any Doctor'}
                                </span>
                              </div>

                              <p className="text-slate-700 bg-slate-50 p-2 rounded-lg line-clamp-2">
                                {appt.reason}
                              </p>

                              <div className="pt-2 flex items-center justify-end gap-1.5">
                                {appt.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                                    className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                                  >
                                    Confirm
                                  </button>
                                )}
                                {appt.status === 'CONFIRMED' && (
                                  <button
                                    onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                                    className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold"
                                  >
                                    Complete
                                  </button>
                                )}
                                <Link
                                  href={`/pets/${appt.pet?.id}`}
                                  className="px-2 py-1 rounded text-slate-500 hover:bg-slate-100"
                                >
                                  View Chart
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}

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
