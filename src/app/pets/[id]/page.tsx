'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Dog,
  Calendar,
  Syringe,
  FileText,
  AlertCircle,
  Clock,
  ArrowLeft,
  Plus,
  ShieldCheck,
  User,
  Heart,
  Activity,
  CheckCircle2,
  CalendarPlus,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { SPECIES_EMOJIS, formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function PetProfilePage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;

  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'vaccinations' | 'treatments' | 'appointments'>('overview');

  useEffect(() => {
    async function loadPet() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData.success) {
          router.push('/login');
          return;
        }
        setUser(meData.data.user);

        const res = await fetch(`/api/pets/${petId}`);
        const data = await res.json();
        if (data.success) {
          setPet(data.data);
        } else {
          router.push('/pets');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (petId) loadPet();
  }, [petId, router]);

  if (loading || !user || !pet) {
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
          title={`${pet.name}'s Medical Chart`}
          subtitle={`${pet.species} • ${pet.breed}`}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Back Navigation & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href={user.role === 'OWNER' ? '/pets' : '/clinic/pets'}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Pet Directory
            </Link>

            <Link
              href={`/appointments?petId=${pet.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <CalendarPlus className="w-4 h-4" /> Book Appointment for {pet.name}
            </Link>
          </div>

          {/* Pet Hero Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-sm">
                {SPECIES_EMOJIS[pet.species] || '🐾'}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {pet.name}
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    {pet.species}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {pet.gender}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {pet.breed} • {pet.color || 'Standard coloration'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>
                    <strong>Owner:</strong> {pet.owner?.name} ({pet.owner?.email})
                  </span>
                  {pet.microchipId && (
                    <span>
                      <strong>Microchip:</strong> #{pet.microchipId}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick vitals metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center shrink-0">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Age</span>
                  <strong className="text-base font-bold text-slate-800">
                    {pet.age ? `${pet.age} yrs` : 'N/A'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight</span>
                  <strong className="text-base font-bold text-slate-800">
                    {pet.weight ? `${pet.weight} kg` : 'N/A'}
                  </strong>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Visits</span>
                  <strong className="text-base font-bold text-teal-600">
                    {pet.treatmentRecords?.length || 0}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Medical Overview
            </button>
            <button
              onClick={() => setActiveTab('vaccinations')}
              className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'vaccinations'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Vaccinations
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                {pet.vaccinations?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('treatments')}
              className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'treatments'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Treatment Records
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                {pet.treatmentRecords?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'appointments'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Appointments
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                {pet.appointments?.length || 0}
              </span>
            </button>
          </div>

          {/* TAB CONTENT: 1. Medical Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Allergies & Alerts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <span>Allergies & Sensitivities</span>
                </div>
                {pet.allergies ? (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm leading-relaxed">
                    {pet.allergies}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    No documented allergies or adverse reactions on file.
                  </p>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Existing Conditions</h4>
                  {pet.existingConditions ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed">
                      {pet.existingConditions}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      No chronic existing conditions documented.
                    </p>
                  )}
                </div>
              </div>

              {/* Clinical Notes & Biological Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span>General & Behavioral Notes</span>
                </div>
                {pet.notes ? (
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {pet.notes}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic">No special handling instructions added.</p>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Date of Birth:</span>
                    <span className="font-semibold">{formatDate(pet.dateOfBirth)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Record Created:</span>
                    <span className="font-semibold">{formatDate(pet.createdAt)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Primary Contact Phone:</span>
                    <span className="font-semibold">{pet.owner?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. Vaccinations */}
          {activeTab === 'vaccinations' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Vaccination History</h3>
                  <p className="text-xs text-slate-500">Immunization schedule and booster due dates</p>
                </div>
                {user.role !== 'OWNER' && (
                  <Link
                    href={`/clinic/vaccinations?petId=${pet.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" /> Add Vaccine
                  </Link>
                )}
              </div>

              {pet.vaccinations?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No vaccination records found for {pet.name}.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-5">Vaccine</th>
                        <th className="py-3.5 px-5">Type / Dose</th>
                        <th className="py-3.5 px-5">Administered</th>
                        <th className="py-3.5 px-5">Next Due</th>
                        <th className="py-3.5 px-5">Batch #</th>
                        <th className="py-3.5 px-5">Doctor</th>
                        <th className="py-3.5 px-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pet.vaccinations.map((vac: any) => (
                        <tr key={vac.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-800">{vac.vaccineName}</td>
                          <td className="py-4 px-5 text-slate-600">
                            {vac.vaccineType || 'Standard'} • {vac.dose || 'Booster'}
                          </td>
                          <td className="py-4 px-5 text-slate-600">{formatDate(vac.dateAdministered)}</td>
                          <td className="py-4 px-5 font-semibold text-slate-800">{formatDate(vac.nextDueDate)}</td>
                          <td className="py-4 px-5 font-mono text-slate-500">{vac.batchNumber || '—'}</td>
                          <td className="py-4 px-5 text-slate-600">{vac.veterinarian?.user?.name || 'Clinic Team'}</td>
                          <td className="py-4 px-5">
                            <StatusBadge status={vac.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: 3. Treatment Records */}
          {activeTab === 'treatments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Treatment & Clinical History</h3>
                  <p className="text-xs text-slate-500">Chronological medical visits, findings, and medications</p>
                </div>
                {user.role !== 'OWNER' && (
                  <Link
                    href={`/clinic/treatments?petId=${pet.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" /> Add Medical Record
                  </Link>
                )}
              </div>

              {pet.treatmentRecords?.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  No medical treatment records recorded yet for {pet.name}.
                </div>
              ) : (
                <div className="space-y-4">
                  {pet.treatmentRecords.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                            Visit Date: {formatDate(item.visitDate)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Attending: <strong className="text-slate-800">{item.veterinarian?.user?.name || 'Dr. James Wilson'}</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">Presenting Symptoms</span>
                          <p className="text-slate-700 font-medium">{item.symptoms}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">Diagnosis</span>
                          <p className="text-slate-900 font-bold text-sm text-teal-900">{item.diagnosis}</p>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Treatment Administered</span>
                        <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {item.treatment}
                        </p>
                      </div>

                      {/* Prescriptions */}
                      {item.prescriptions && item.prescriptions.length > 0 && (
                        <div className="pt-2">
                          <span className="text-slate-500 font-bold text-xs block mb-2">Prescriptions & Medication:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.prescriptions.map((p: any) => (
                              <div
                                key={p.id}
                                className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 text-xs text-teal-950"
                              >
                                <strong className="block text-teal-900">{p.medication}</strong>
                                <span className="text-teal-700">
                                  {p.dosage} • {p.frequency || 'Daily'} • {p.duration}
                                </span>
                                {p.instructions && (
                                  <p className="text-[11px] text-teal-800/80 mt-1 italic">
                                    &ldquo;{p.instructions}&rdquo;
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vitals & Follow up */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                        <div className="flex items-center gap-4">
                          {item.weight && <span>Weight: <strong>{item.weight} kg</strong></span>}
                          {item.temperature && <span>Temp: <strong>{item.temperature} °C</strong></span>}
                        </div>
                        {item.followUpDate && (
                          <div className="text-amber-800 font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Follow-up: {formatDate(item.followUpDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: 4. Appointments */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Appointment History</h3>
                  <p className="text-xs text-slate-500">Upcoming bookings and past completed clinic visits</p>
                </div>
                <Link
                  href={`/appointments?petId=${pet.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> Book Appointment
                </Link>
              </div>

              {pet.appointments?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No appointments on record for {pet.name}.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-5">Date & Time</th>
                        <th className="py-3.5 px-5">Reason</th>
                        <th className="py-3.5 px-5">Doctor</th>
                        <th className="py-3.5 px-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pet.appointments.map((appt: any) => (
                        <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-800">
                            {formatDate(appt.appointmentDate)} at {appt.timeSlot}
                          </td>
                          <td className="py-4 px-5 text-slate-700">{appt.reason}</td>
                          <td className="py-4 px-5 text-slate-600">
                            {appt.veterinarian?.user?.name || 'Clinic Team'}
                          </td>
                          <td className="py-4 px-5">
                            <StatusBadge status={appt.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
