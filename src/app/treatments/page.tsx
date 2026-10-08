'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Calendar,
  Clock,
  Pill,
  Thermometer,
  Weight,
  User,
  ArrowRight,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SPECIES_EMOJIS, formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function OwnerTreatmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTreatments = async () => {
    try {
      const res = await fetch(`/api/treatments?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setTreatments(data.data);
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
        setUser(meData.data.user);
        await fetchTreatments();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [search]);

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
          title="Medical & Treatment History"
          subtitle="Chronological clinical consultations, doctor findings, and prescription regimens"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by diagnosis, treatment, symptoms, or pet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Timeline of treatments */}
          {treatments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-800">No medical treatments found</p>
              <p>Your pets currently do not have any recorded medical treatments.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {treatments.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 hover:border-teal-300 transition-all"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xl">
                        {SPECIES_EMOJIS[item.pet?.species] || '🐾'}
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">
                          {item.pet?.name}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {item.pet?.species} • {item.pet?.breed}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                        Visit: {formatDate(item.visitDate)}
                      </span>
                      <span>
                        Doctor:{' '}
                        <strong className="text-slate-800">
                          {item.veterinarian?.user?.name || 'Dr. James Wilson'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Diagnosis & Symptoms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Presenting Symptoms</span>
                      <p className="text-slate-700 font-medium leading-relaxed">{item.symptoms}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 space-y-1">
                      <span className="text-teal-700 uppercase font-bold text-[10px]">Clinical Diagnosis</span>
                      <p className="text-teal-950 font-bold text-sm leading-relaxed">{item.diagnosis}</p>
                    </div>
                  </div>

                  {/* Treatment plan */}
                  <div className="text-xs space-y-1">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">Treatment Administered</span>
                    <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                      {item.treatment}
                    </p>
                  </div>

                  {/* Prescriptions */}
                  {item.prescriptions && item.prescriptions.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-teal-600" /> Prescribed Medications:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {item.prescriptions.map((rx: any) => (
                          <div
                            key={rx.id}
                            className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950"
                          >
                            <strong className="text-emerald-900 block">{rx.medication}</strong>
                            <span className="text-emerald-700">
                              {rx.dosage} • {rx.frequency || 'Daily'} • {rx.duration}
                            </span>
                            {rx.instructions && (
                              <p className="text-[11px] text-emerald-800/80 mt-1 italic">
                                &ldquo;{rx.instructions}&rdquo;
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Vitals & Follow up */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
                    <div className="flex items-center gap-4">
                      {item.weight && (
                        <span className="flex items-center gap-1">
                          <Weight className="w-3.5 h-3.5 text-slate-400" /> {item.weight} kg
                        </span>
                      )}
                      {item.temperature && (
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-slate-400" /> {item.temperature} °C
                        </span>
                      )}
                    </div>

                    {item.followUpDate && (
                      <div className="text-amber-800 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Follow-up Date: {formatDate(item.followUpDate)}
                      </div>
                    )}

                    <Link
                      href={`/pets/${item.petId}`}
                      className="text-teal-600 hover:text-teal-700 font-bold inline-flex items-center gap-1"
                    >
                      Pet Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
