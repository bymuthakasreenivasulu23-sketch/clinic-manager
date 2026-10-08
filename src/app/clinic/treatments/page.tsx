'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Pill,
  Thermometer,
  Weight,
  Clock,
  Eye,
  Trash2,
  AlertCircle,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Modal } from '@/components/ui/Modal';
import { SPECIES_EMOJIS, formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

function ClinicTreatmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPetId = searchParams.get('petId') || '';

  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    petId: initialPetId,
    visitDate: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    treatment: '',
    weight: '',
    temperature: '38.5',
    followUpDate: '',
    notes: '',
    veterinarianId: '',
    // Dynamic Prescription fields
    medication: '',
    dosage: '',
    frequency: 'Twice daily',
    duration: '7 days',
    instructions: '',
  });

  const fetchData = async () => {
    try {
      const resTreat = await fetch(`/api/treatments?search=${encodeURIComponent(search)}`);
      const dataTreat = await resTreat.json();
      if (dataTreat.success) setTreatments(dataTreat.data);

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
  }, [search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const prescriptionsPayload = formData.medication
        ? [
            {
              medication: formData.medication,
              dosage: formData.dosage,
              frequency: formData.frequency,
              duration: formData.duration,
              instructions: formData.instructions,
            },
          ]
        : [];

      const payload = {
        petId: formData.petId,
        visitDate: formData.visitDate,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        weight: formData.weight,
        temperature: formData.temperature,
        followUpDate: formData.followUpDate || null,
        notes: formData.notes,
        veterinarianId: formData.veterinarianId || null,
        prescriptions: prescriptionsPayload,
      };

      const res = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Failed to create treatment record');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      // Reset form
      setFormData({
        petId: pets[0]?.id || '',
        visitDate: new Date().toISOString().split('T')[0],
        symptoms: '',
        diagnosis: '',
        treatment: '',
        weight: '',
        temperature: '38.5',
        followUpDate: '',
        notes: '',
        veterinarianId: '',
        medication: '',
        dosage: '',
        frequency: 'Twice daily',
        duration: '7 days',
        instructions: '',
      });

      await fetchData();
    } catch {
      setFormError('Network communication error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this medical record?')) return;
    try {
      const res = await fetch(`/api/treatments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      } else {
        alert(data.message || 'Only administrators can delete medical records');
      }
    } catch {
      alert('Error communicating with server');
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
          title="Clinical Treatment Records"
          subtitle="Electronic medical records (EMR), SOAP notes, prescription charting, and diagnoses"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search diagnosis, medication, symptoms, pet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              onClick={() => {
                setFormError('');
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Treatment Record
            </button>
          </div>

          {/* Treatment Records List */}
          <div className="space-y-4">
            {treatments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No medical treatments found.</p>
              </div>
            ) : (
              treatments.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 hover:border-teal-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xl">
                        {SPECIES_EMOJIS[item.pet?.species] || '🐾'}
                      </div>
                      <div>
                        <Link
                          href={`/pets/${item.pet?.id}`}
                          className="font-bold text-slate-900 hover:text-teal-600 hover:underline block text-sm"
                        >
                          {item.pet?.name}
                        </Link>
                        <span className="text-xs text-slate-500">
                          {item.pet?.species} • Owner: {item.pet?.owner?.name} ({item.pet?.owner?.phone})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                        Visit: {formatDate(item.visitDate)}
                      </span>
                      <span className="text-slate-500">
                        Doctor: <strong className="text-slate-800">{item.veterinarian?.user?.name || 'Dr. James Wilson'}</strong>
                      </span>
                      {user.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Presenting Symptoms</span>
                      <p className="text-slate-700 font-medium leading-relaxed">{item.symptoms}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 space-y-1">
                      <span className="text-teal-700 font-bold uppercase text-[10px]">Diagnosis</span>
                      <p className="text-teal-950 font-bold text-sm leading-relaxed">{item.diagnosis}</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Treatment Administered</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      {item.treatment}
                    </p>
                  </div>

                  {/* Prescriptions */}
                  {item.prescriptions && item.prescriptions.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-teal-600" /> Prescribed Medications:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

                  {/* Vitals footer */}
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
                        <Clock className="w-3.5 h-3.5" /> Follow-up Scheduled: {formatDate(item.followUpDate)}
                      </div>
                    )}

                    <Link
                      href={`/pets/${item.petId}`}
                      className="text-teal-600 hover:text-teal-700 font-bold inline-flex items-center gap-1"
                    >
                      View Complete Pet Chart →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CREATE TREATMENT MODAL */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Create Clinical Medical Record"
            subtitle="Document findings, official diagnosis, treatment plan, and prescriptions"
            maxWidth="2xl"
          >
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTreatment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Select Pet Patient *
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
                        {pet.name} ({pet.species} - {pet.breed}) [Owner: {pet.owner?.name}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Visit Date *
                  </label>
                  <input
                    type="date"
                    name="visitDate"
                    required
                    value={formData.visitDate}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Patient Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="e.g. 29.5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Body Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    placeholder="e.g. 38.5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Presenting Symptoms *
                </label>
                <textarea
                  name="symptoms"
                  required
                  rows={2}
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  placeholder="e.g. Lethargy, cough, limping on right front paw, reduced appetite..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  name="diagnosis"
                  required
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  placeholder="e.g. Acute Otitis Externa, Minor pad laceration, Canine Gastroenteritis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Treatment Administered & In-Clinic Procedures *
                </label>
                <textarea
                  name="treatment"
                  required
                  rows={2}
                  value={formData.treatment}
                  onChange={handleInputChange}
                  placeholder="e.g. Wound cleaned with chlorhexidine solution, subcutaneous fluid therapy 100ml..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Prescription Section */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 block">
                  💊 Take-Home Prescription (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Medication Name</label>
                    <input
                      type="text"
                      name="medication"
                      value={formData.medication}
                      onChange={handleInputChange}
                      placeholder="e.g. Amoxicillin 250mg"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      name="dosage"
                      value={formData.dosage}
                      onChange={handleInputChange}
                      placeholder="e.g. 1 tablet"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                    <input
                      type="text"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      placeholder="e.g. Every 12 hours with meals"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g. 7 days"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Instructions for Owner</label>
                    <input
                      type="text"
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      placeholder="e.g. Complete full course even if pet seems fully recovered."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Follow-Up Date
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
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
                    <option value="">Current Attending Doctor</option>
                    {vets.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.user.name} ({v.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Additional Internal Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Confidential clinician notes, prognosis, next steps..."
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
                  Save Medical Record
                </button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}

export default function ClinicTreatmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClinicTreatmentsContent />
    </Suspense>
  );
}
