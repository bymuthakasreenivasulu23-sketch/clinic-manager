'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Syringe,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SPECIES_EMOJIS, formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

function ClinicVaccinationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPetId = searchParams.get('petId') || '';
  const initialFilter = searchParams.get('filter') || 'all';

  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    petId: initialPetId,
    vaccineName: 'Rabies (3-Year)',
    vaccineType: 'Core Inactivated',
    dateAdministered: new Date().toISOString().split('T')[0],
    nextDueDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    dose: 'Annual Booster',
    batchNumber: 'RAB-' + Math.floor(1000 + Math.random() * 9000),
    notes: 'Administered subcutaneously. No acute adverse signs.',
    veterinarianId: '',
  });

  const fetchData = async () => {
    try {
      const vacRes = await fetch(
        `/api/vaccinations?filter=${filter}&search=${encodeURIComponent(search)}`
      );
      const vacData = await vacRes.json();
      if (vacData.success) setVaccinations(vacData.data);

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
        if (meData.data.user.role === 'OWNER') {
          router.push('/dashboard');
          return;
        }
        setUser(meData.data.user);
        await fetchData();

        if (initialPetId) {
          setIsModalOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [filter, search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/vaccinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Failed to record vaccine');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      await fetchData();
    } catch {
      setFormError('Network communication error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      const res = await fetch(`/api/vaccinations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this vaccination log?')) return;
    try {
      await fetch(`/api/vaccinations/${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const overdueList = vaccinations.filter((v) => new Date(v.nextDueDate) < now);

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
          title="Clinical Vaccination Management"
          subtitle="Record immunization doses, batch records, certificates, and booster alerts"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Overdue alert banner if any */}
          {overdueList.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  <strong>{overdueList.length} pets have overdue vaccinations</strong> requiring immediate clinical outreach or booster renewal.
                </span>
              </div>
              <button
                onClick={() => setFilter('overdue')}
                className="font-bold underline text-rose-700 hover:text-rose-900"
              >
                Filter Overdue Only
              </button>
            </div>
          )}

          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search vaccine, pet, batch number..."
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
                <option value="all">All Records</option>
                <option value="due_today">Due Today</option>
                <option value="due_7d">Due within 7 Days</option>
                <option value="due_30d">Due within 30 Days</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <button
              onClick={() => {
                setFormError('');
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Vaccination Record
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Vaccination Registry</h3>
                <p className="text-xs text-slate-500">
                  {vaccinations.length} vaccination certificates recorded
                </p>
              </div>
            </div>

            {vaccinations.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <Syringe className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No vaccination records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-5">Pet Patient</th>
                      <th className="py-3.5 px-5">Owner</th>
                      <th className="py-3.5 px-5">Vaccine Name</th>
                      <th className="py-3.5 px-5">Type / Dose</th>
                      <th className="py-3.5 px-5">Date Given</th>
                      <th className="py-3.5 px-5">Next Due Date</th>
                      <th className="py-3.5 px-5">Batch #</th>
                      <th className="py-3.5 px-5">Doctor</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
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
                              <div>
                                <Link
                                  href={`/pets/${vac.pet?.id}`}
                                  className="font-bold text-slate-900 hover:text-teal-600 hover:underline block"
                                >
                                  {vac.pet?.name}
                                </Link>
                                <span className="text-[11px] text-slate-500">
                                  {vac.pet?.breed}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <strong className="text-slate-800 block">
                              {vac.pet?.owner?.name}
                            </strong>
                            <span className="text-[11px] text-slate-500">
                              {vac.pet?.owner?.phone}
                            </span>
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
                            {vac.veterinarian?.user?.name || 'Clinic Staff'}
                          </td>

                          <td className="py-4 px-5">
                            {isOverdue ? (
                              <Badge variant="danger">Overdue</Badge>
                            ) : isToday ? (
                              <Badge variant="info">Due Today</Badge>
                            ) : (
                              <StatusBadge status={vac.status} />
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {vac.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleMarkCompleted(vac.id)}
                                  className="px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold"
                                  title="Mark Completed"
                                >
                                  Done
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(vac.id)}
                                className="p-1 rounded text-rose-500 hover:bg-rose-50"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ADD VACCINATION MODAL */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Log Vaccination Administration"
            subtitle="Record an administered immunization dose and calculate next booster alert"
            maxWidth="xl"
          >
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateVaccine} className="space-y-4">
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
                    <option value="">-- Choose Pet Patient --</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species} - {pet.breed}) [Owner: {pet.owner?.name}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Vaccine Name *
                  </label>
                  <input
                    type="text"
                    name="vaccineName"
                    required
                    value={formData.vaccineName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rabies 3-Year, DHPP, Bordetella"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Vaccine Classification
                  </label>
                  <input
                    type="text"
                    name="vaccineType"
                    value={formData.vaccineType}
                    onChange={handleInputChange}
                    placeholder="e.g. Core Inactivated, Modified Live"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Dose Description
                  </label>
                  <input
                    type="text"
                    name="dose"
                    value={formData.dose}
                    onChange={handleInputChange}
                    placeholder="e.g. 1st Dose, Annual Booster, Puppy Series 2"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Date Administered *
                  </label>
                  <input
                    type="date"
                    name="dateAdministered"
                    required
                    value={formData.dateAdministered}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Next Due Date *
                  </label>
                  <input
                    type="date"
                    name="nextDueDate"
                    required
                    value={formData.nextDueDate}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Batch / Lot Number
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. RAB-2026-904"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Attending Veterinarian
                  </label>
                  <select
                    name="veterinarianId"
                    value={formData.veterinarianId}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">Clinic Staff On Duty</option>
                    {vets.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Clinical Administration Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Injection site (e.g. right hind limb SQ), animal tolerance..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  Save Vaccination Log
                </button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}

export default function ClinicVaccinationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClinicVaccinationsContent />
    </Suspense>
  );
}
