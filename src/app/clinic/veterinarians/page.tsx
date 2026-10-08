'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Plus,
  Mail,
  Phone,
  Award,
  Clock,
  ShieldCheck,
  Calendar,
  Syringe,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Modal } from '@/components/ui/Modal';
import { SessionPayload } from '@/lib/auth';

export default function ClinicVeterinariansPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Password123!',
    specialization: '',
    licenseNumber: '',
    experience: '5',
    availability: 'Mon - Fri: 9:00 AM - 5:00 PM',
    bio: '',
  });

  const fetchVets = async () => {
    try {
      const res = await fetch('/api/veterinarians');
      const data = await res.json();
      if (data.success) {
        setVets(data.data);
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
        await fetchVets();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateVet = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/veterinarians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Failed to add veterinarian');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      await fetchVets();
    } catch {
      setFormError('Network communication error');
    } finally {
      setSubmitting(false);
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
          title="Veterinary Clinical Staff"
          subtitle="Hospital clinicians, specializations, surgery accreditations, and rosters"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Action */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Doctor Team</h3>
              <p className="text-xs text-slate-500">Board-certified veterinarians on staff</p>
            </div>

            {user.role === 'ADMIN' && (
              <button
                onClick={() => {
                  setFormError('');
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Veterinarian Doctor
              </button>
            )}
          </div>

          {/* Veterinarians Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vets.map((vet) => (
              <div
                key={vet.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-extrabold text-lg shadow-sm border border-teal-200">
                        {vet.user.name.split(' ')[1]?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 leading-tight">
                          {vet.user.name}
                        </h4>
                        <p className="text-xs text-teal-700 font-semibold mt-0.5">
                          {vet.specialization}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">License Number:</span>
                      <strong className="text-slate-800 font-mono">{vet.licenseNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Experience:</span>
                      <strong className="text-slate-800">{vet.experience} Years</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Availability:</span>
                      <span className="text-slate-800 font-medium text-right">{vet.availability}</span>
                    </div>
                  </div>

                  {vet.bio && (
                    <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-3">
                      &ldquo;{vet.bio}&rdquo;
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vet.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vet.user.phone || '+1 (555) 738-2273'}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Snapshot */}
                <div className="pt-4 border-t border-slate-100 mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-slate-400 text-[10px] block font-bold">APPOINTMENTS</span>
                    <strong className="text-slate-800 text-sm">{vet._count?.appointments || 0}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-slate-400 text-[10px] block font-bold">VACCINES</span>
                    <strong className="text-slate-800 text-sm">{vet._count?.vaccinations || 0}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-slate-400 text-[10px] block font-bold">TREATMENTS</span>
                    <strong className="text-slate-800 text-sm">{vet._count?.treatmentRecords || 0}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ADD VETERINARIAN MODAL */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add Veterinarian to Clinical Team"
            subtitle="Register new doctor credentials, license information, and clinic schedule"
            maxWidth="xl"
          >
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateVet} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Dr. Jennifer Adams, DVM"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="doctor@vetclinic.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 882-9912"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="text"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    required
                    placeholder="e.g. Feline Internal Medicine, Oncology"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    required
                    placeholder="e.g. VET-NY-91820"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Clinic Availability
                  </label>
                  <input
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Biography & Qualifications
                </label>
                <textarea
                  name="bio"
                  rows={2}
                  placeholder="Doctor's clinical background, degrees, certifications..."
                  value={formData.bio}
                  onChange={handleInputChange}
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
                  Register Veterinarian
                </button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
