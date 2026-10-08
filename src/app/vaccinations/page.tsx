'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Syringe,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { SPECIES_EMOJIS, formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function OwnerVaccinationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchVaccinations = async () => {
    try {
      const res = await fetch(
        `/api/vaccinations?filter=${filter}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data.success) {
        setVaccinations(data.data);
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
        await fetchVaccinations();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [filter, search]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const overdueCount = vaccinations.filter((v) => new Date(v.nextDueDate) < now).length;
  const upcomingCount = vaccinations.filter(
    (v) => new Date(v.nextDueDate) >= now && new Date(v.nextDueDate) <= new Date(now.getTime() + 30 * 86400000)
  ).length;

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
          title="Pet Immunization & Vaccines"
          subtitle="Track required core boosters, rabies certifications, and upcoming due dates"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Health Alert Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Vaccinations</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{vaccinations.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Administered on record</p>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                <FileCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700">Due within 30 Days</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">{upcomingCount}</p>
                <p className="text-[11px] text-amber-600/80 mt-0.5">Schedule renewal visit</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-700">Overdue Boosters</p>
                <p className="text-2xl font-bold text-rose-900 mt-1">{overdueCount}</p>
                <p className="text-[11px] text-rose-600/80 mt-0.5">Immediate attention needed</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by vaccine name, pet, batch number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Vaccines</option>
              <option value="due_today">Due Today</option>
              <option value="due_7d">Due in Next 7 Days</option>
              <option value="due_30d">Due in Next 30 Days</option>
              <option value="overdue">Overdue Boosters</option>
            </select>
          </div>

          {/* Vaccinations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Vaccine Records & Certificates</h3>
              <Link
                href="/appointments"
                className="text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                Book Booster Visit →
              </Link>
            </div>

            {vaccinations.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <Syringe className="w-10 h-10 text-slate-300 mx-auto" />
                <p>No vaccination records found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-5">Pet</th>
                      <th className="py-3.5 px-5">Vaccine Name</th>
                      <th className="py-3.5 px-5">Type / Dose</th>
                      <th className="py-3.5 px-5">Date Given</th>
                      <th className="py-3.5 px-5">Next Booster Due</th>
                      <th className="py-3.5 px-5">Batch #</th>
                      <th className="py-3.5 px-5">Doctor</th>
                      <th className="py-3.5 px-5">Alert / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vaccinations.map((vac) => {
                      const dueDate = new Date(vac.nextDueDate);
                      const isOverdue = dueDate < now;
                      const isToday =
                        dueDate.getDate() === now.getDate() &&
                        dueDate.getMonth() === now.getMonth() &&
                        dueDate.getFullYear() === now.getFullYear();

                      return (
                        <tr key={vac.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span>{SPECIES_EMOJIS[vac.pet?.species] || '🐾'}</span>
                              <strong className="text-slate-800 text-sm">{vac.pet?.name}</strong>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-800">{vac.vaccineName}</td>
                          <td className="py-4 px-5 text-slate-600">
                            {vac.vaccineType || 'Core'} • {vac.dose || 'Standard'}
                          </td>
                          <td className="py-4 px-5 text-slate-600">{formatDate(vac.dateAdministered)}</td>
                          <td className="py-4 px-5 font-semibold text-slate-800">
                            {formatDate(vac.nextDueDate)}
                          </td>
                          <td className="py-4 px-5 font-mono text-slate-500">{vac.batchNumber || '—'}</td>
                          <td className="py-4 px-5 text-slate-600">
                            {vac.veterinarian?.user?.name || 'Clinic Team'}
                          </td>
                          <td className="py-4 px-5">
                            {isOverdue ? (
                              <Badge variant="danger">Overdue Booster</Badge>
                            ) : isToday ? (
                              <Badge variant="info">Due Today</Badge>
                            ) : (
                              <StatusBadge status={vac.status} />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
