'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dog,
  Calendar,
  Syringe,
  FileText,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { SPECIES_EMOJIS, formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function OwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData.success) {
          router.push('/login');
          return;
        }

        // If staff/admin logged in, redirect to clinic dashboard
        if (meData.data.user.role === 'ADMIN') {
          router.push('/admin/dashboard');
          return;
        } else if (meData.data.user.role === 'VETERINARIAN' || meData.data.user.role === 'STAFF') {
          router.push('/clinic/dashboard');
          return;
        }

        setUser(meData.data.user);

        // Fetch Pets
        const petsRes = await fetch('/api/pets');
        const petsData = await petsRes.json();
        if (petsData.success) setPets(petsData.data);

        // Fetch Appointments
        const apptRes = await fetch('/api/appointments');
        const apptData = await apptRes.json();
        if (apptData.success) setAppointments(apptData.data);

        // Fetch Vaccinations
        const vacRes = await fetch('/api/vaccinations');
        const vacData = await vacRes.json();
        if (vacData.success) setVaccinations(vacData.data);

        // Fetch Treatments
        const treatRes = await fetch('/api/treatments');
        const treatData = await treatRes.json();
        if (treatData.success) setTreatments(treatData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading your pet records...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );
  const completedVisits = appointments.filter((a) => a.status === 'COMPLETED').length;

  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Vaccinations due alerts: Due today, due within 30 days, or overdue
  const dueVaccinations = vaccinations.filter((v) => {
    const d = new Date(v.nextDueDate);
    return d <= thirtyDaysLater || v.status === 'OVERDUE' || v.status === 'PENDING';
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
          title="Pet Owner Dashboard"
          subtitle="Overview of your furry family, upcoming care, and vaccination alerts"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white p-6 sm:p-8 shadow-lg shadow-teal-700/10">
            <div className="relative z-10 space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-teal-200" /> Owner Health Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {getGreeting()}, {user.name}
              </h2>
              <p className="text-teal-50 text-sm leading-relaxed">
                You have <strong className="text-white underline">{upcomingAppointments.length} upcoming appointments</strong> and{' '}
                <strong className="text-white underline">{dueVaccinations.length} vaccination notifications</strong> requiring attention.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/appointments"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-teal-800 font-bold text-xs shadow-sm hover:bg-teal-50 transition-colors"
                >
                  <Calendar className="w-4 h-4" /> Book Appointment
                </Link>
                <Link
                  href="/pets"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800/60 hover:bg-teal-800 text-white font-semibold text-xs border border-teal-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add New Pet
                </Link>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute right-0 bottom-0 top-0 w-80 opacity-10 flex items-center justify-center pointer-events-none text-9xl">
              🐾
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Registered Pets"
              value={pets.length}
              subtitle="Active companion profiles"
              icon={Dog}
              color="teal"
              onClick={() => router.push('/pets')}
            />
            <StatCard
              title="Upcoming Appointments"
              value={upcomingAppointments.length}
              subtitle="Scheduled clinic visits"
              icon={Calendar}
              color="emerald"
              onClick={() => router.push('/appointments')}
            />
            <StatCard
              title="Vaccinations Due"
              value={dueVaccinations.length}
              subtitle="Due or upcoming within 30d"
              icon={Syringe}
              color="amber"
              onClick={() => router.push('/vaccinations')}
            />
            <StatCard
              title="Completed Visits"
              value={completedVisits}
              subtitle="Total lifetime clinic records"
              icon={CheckCircle2}
              color="blue"
              onClick={() => router.push('/treatments')}
            />
          </div>

          {/* Vaccination Alerts Section */}
          {dueVaccinations.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Vaccination Health Alerts</span>
                </div>
                <Link
                  href="/vaccinations"
                  className="text-xs font-semibold text-amber-800 hover:underline"
                >
                  View All Vaccinations →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dueVaccinations.slice(0, 3).map((v) => {
                  const dueDate = new Date(v.nextDueDate);
                  const isOverdue = dueDate < now;
                  const isToday =
                    dueDate.getDate() === now.getDate() &&
                    dueDate.getMonth() === now.getMonth() &&
                    dueDate.getFullYear() === now.getFullYear();

                  let statusText = `Due ${formatDate(v.nextDueDate)}`;
                  let badgeVariant: 'danger' | 'warning' | 'info' = 'warning';

                  if (isOverdue) {
                    statusText = 'OVERDUE!';
                    badgeVariant = 'danger';
                  } else if (isToday) {
                    statusText = 'DUE TODAY!';
                    badgeVariant = 'info';
                  }

                  return (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-sm flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>{v.pet?.name}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-amber-800">{v.vaccineName}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">Dose: {v.dose || 'Booster'}</p>
                      </div>
                      <Badge variant={badgeVariant}>{statusText}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Grid: My Pets & Upcoming Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: My Pets (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">My Pets</h3>
                  <p className="text-xs text-slate-500">Your registered pets and their records</p>
                </div>
                <Link
                  href="/pets"
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Manage All Pets ({pets.length}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {pets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center text-2xl">
                    🐾
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">No pets added yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Register your first pet to start tracking vaccinations, treatments, and appointments.
                  </p>
                  <Link
                    href="/pets"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-sm hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" /> Add Pet Now
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl font-bold border border-teal-100">
                            {SPECIES_EMOJIS[pet.species] || '🐾'}
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                            {pet.gender}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{pet.name}</h4>
                          <p className="text-xs text-slate-500">
                            {pet.breed} • {pet.species}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl text-slate-600">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Age</span>
                            <span className="font-semibold">{pet.age ? `${pet.age} yrs` : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Weight</span>
                            <span className="font-semibold">{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                        <Link
                          href={`/pets/${pet.id}`}
                          className="w-full text-center py-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-bold text-xs transition-colors"
                        >
                          View Profile & Records
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Upcoming Appointments (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upcoming Appointments</h3>
                  <p className="text-xs text-slate-500">Your booked hospital slots</p>
                </div>
                <Link
                  href="/appointments"
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Book New <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                  <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">No scheduled visits</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Keep your pets protected with periodic veterinary checkups.
                  </p>
                  <Link
                    href="/appointments"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-sm hover:bg-teal-700"
                  >
                    Schedule an Appointment
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 4).map((appt) => (
                    <div
                      key={appt.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                            {SPECIES_EMOJIS[appt.pet?.species] || '🐾'}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-800 block">
                              {appt.pet?.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {appt.reason}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={appt.status} />
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>
                            {formatDate(appt.appointmentDate)} at {appt.timeSlot}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {appt.veterinarian?.user?.name || 'Assigned on arrival'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Medical History / Treatments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Medical Treatments</h3>
                <p className="text-xs text-slate-500">Latest veterinary diagnoses and clinical care</p>
              </div>
              <Link
                href="/treatments"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View Complete History ({treatments.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {treatments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
                No past treatment records found for your pets.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {treatments.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg">
                        {item.pet?.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(item.visitDate)}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.diagnosis}</p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.treatment}</p>
                    </div>

                    {item.prescriptions && item.prescriptions.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                        <strong className="text-slate-800 block text-[10px] uppercase">Prescription:</strong>
                        <span>
                          {item.prescriptions[0].medication} ({item.prescriptions[0].dosage})
                        </span>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 pt-1">
                      Attending: {item.veterinarian?.user?.name || 'Clinic Team'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
