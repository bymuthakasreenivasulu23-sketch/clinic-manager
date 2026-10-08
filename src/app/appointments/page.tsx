'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Stethoscope,
  Dog,
  CalendarDays,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { SPECIES_EMOJIS, formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

const AVAILABLE_TIME_SLOTS = [
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
  '04:30 PM',
];

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPetId = searchParams.get('petId');

  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modal & Form State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    petId: preselectedPetId || '',
    veterinarianId: '',
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    reason: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const apptRes = await fetch(
        `/api/appointments?status=${statusFilter}&search=${encodeURIComponent(search)}`
      );
      const apptData = await apptRes.json();
      if (apptData.success) setAppointments(apptData.data);

      const petsRes = await fetch('/api/pets');
      const petsData = await petsRes.json();
      if (petsData.success) setPets(petsData.data);

      const vetsRes = await fetch('/api/veterinarians');
      const vetsData = await vetsRes.json();
      if (vetsData.success) setVets(vetsData.data);
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
        setUser(meData.data.user);
        await fetchData();

        if (preselectedPetId) {
          setIsBookModalOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [statusFilter, search, router, preselectedPetId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Failed to book appointment');
        setSubmitting(false);
        return;
      }

      const bookedPet = pets.find((p) => p.id === formData.petId);
      const petName = bookedPet ? bookedPet.name : 'your pet';
      setSuccessMessage(
        `Appointment successfully booked for ${petName} on ${formatDate(formData.appointmentDate)} at ${formData.timeSlot}.`
      );

      setIsBookModalOpen(false);
      setFormData({
        petId: pets[0]?.id || '',
        veterinarianId: '',
        appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: '10:00 AM',
        reason: '',
        notes: '',
      });

      await fetchData();
    } catch {
      setFormError('Network communication error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (apptId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const res = await fetch(`/api/appointments/${apptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      } else {
        alert(data.message || 'Failed to cancel');
      }
    } catch {
      alert('Error cancelling appointment');
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
          title="Appointments & Bookings"
          subtitle="Schedule clinic consultations, vaccinations, and physical exams"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage('')}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by reason or pet name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => {
                setFormError('');
                setIsBookModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Book Appointment
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Appointment Schedule</h3>
                <p className="text-xs text-slate-500">
                  Showing {appointments.length} appointment {appointments.length === 1 ? 'record' : 'records'}
                </p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No appointments scheduled</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Reserve a time with our veterinary professionals for checkups, dental exams, or vaccinations.
                </p>
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold shadow-sm hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> Book Appointment Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-5">Pet Patient</th>
                      <th className="py-3.5 px-5">Date & Time</th>
                      <th className="py-3.5 px-5">Doctor</th>
                      <th className="py-3.5 px-5">Reason for Visit</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">
                              {SPECIES_EMOJIS[appt.pet?.species] || '🐾'}
                            </span>
                            <div>
                              <strong className="text-slate-800 text-sm block">
                                {appt.pet?.name}
                              </strong>
                              <span className="text-[11px] text-slate-500">
                                {appt.pet?.breed}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <strong className="text-slate-800 block text-xs">
                            {formatDate(appt.appointmentDate)}
                          </strong>
                          <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {appt.timeSlot}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-slate-700">
                          {appt.veterinarian?.user?.name || (
                            <span className="text-slate-400 italic">General Staff</span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-slate-700 max-w-xs">
                          <span className="line-clamp-2">{appt.reason}</span>
                          {appt.notes && (
                            <span className="text-[11px] text-slate-400 block mt-0.5 italic">
                              Note: {appt.notes}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5">
                          <StatusBadge status={appt.status} />
                        </td>

                        <td className="py-4 px-5 text-right">
                          {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleCancelAppointment(appt.id)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Modal
            isOpen={isBookModalOpen}
            onClose={() => setIsBookModalOpen(false)}
            title="Book Veterinary Appointment"
            subtitle="Choose your pet, preferred doctor, and time slot"
            maxWidth="xl"
          >
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Select Pet *
                  </label>
                  <select
                    name="petId"
                    required
                    value={formData.petId}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">-- Choose Pet --</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species} - {pet.breed})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Select Veterinarian
                  </label>
                  <select
                    name="veterinarianId"
                    value={formData.veterinarianId}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">First Available Doctor</option>
                    {vets.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.user.name} ({v.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Available Time Slot *
                  </label>
                  <select
                    name="timeSlot"
                    required
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {AVAILABLE_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Reason for Visit *
                </label>
                <input
                  type="text"
                  name="reason"
                  required
                  placeholder="e.g. Annual Vaccination, Limping leg, Routine checkup"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Additional Notes / Symptoms
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Describe when symptoms began, medications given, etc..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Booking
                </button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AppointmentsContent />
    </Suspense>
  );
}
