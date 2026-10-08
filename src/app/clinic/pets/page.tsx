'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dog,
  Search,
  Filter,
  Eye,
  Plus,
  Syringe,
  FileText,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SPECIES_EMOJIS, formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function ClinicPetsDirectory() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('ALL');

  const fetchPets = async () => {
    try {
      const res = await fetch(`/api/pets?species=${speciesFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setPets(data.data);
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
        await fetchPets();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [speciesFilter, search]);

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
          title="Pet Patient Directory"
          subtitle="Hospital census of registered patients, biological records, and owners"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by pet name, breed, microchip, or owner name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Species</option>
                <option value="Dog">Dogs 🐶</option>
                <option value="Cat">Cats 🐱</option>
                <option value="Bird">Birds 🦜</option>
                <option value="Rabbit">Rabbits 🐰</option>
                <option value="Other">Other 🐾</option>
              </select>
            </div>

            <Link
              href="/pets"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              Register Patient
            </Link>
          </div>

          {/* Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Patient Census</h3>
                <p className="text-xs text-slate-500">
                  Total {pets.length} patient records on file
                </p>
              </div>
            </div>

            {pets.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No pet patients found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-5">Pet Patient</th>
                      <th className="py-3.5 px-5">Species / Breed</th>
                      <th className="py-3.5 px-5">Age / Weight</th>
                      <th className="py-3.5 px-5">Owner / Contact</th>
                      <th className="py-3.5 px-5">Microchip #</th>
                      <th className="py-3.5 px-5">Allergies</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pets.map((pet) => (
                      <tr key={pet.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">
                              {SPECIES_EMOJIS[pet.species] || '🐾'}
                            </span>
                            <div>
                              <Link
                                href={`/pets/${pet.id}`}
                                className="font-bold text-slate-900 hover:text-teal-600 hover:underline block"
                              >
                                {pet.name}
                              </Link>
                              <span className="text-[11px] text-slate-500">{pet.gender}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <strong className="text-slate-800 block">{pet.species}</strong>
                          <span className="text-[11px] text-slate-500">{pet.breed}</span>
                        </td>

                        <td className="py-4 px-5 text-slate-700">
                          <span>{pet.age ? `${pet.age} yrs` : 'N/A'}</span> •{' '}
                          <span>{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
                        </td>

                        <td className="py-4 px-5">
                          <strong className="text-slate-800 block">{pet.owner?.name}</strong>
                          <span className="text-[11px] text-slate-500">{pet.owner?.phone || pet.owner?.email}</span>
                        </td>

                        <td className="py-4 px-5 font-mono text-slate-500">
                          {pet.microchipId ? `#${pet.microchipId}` : '—'}
                        </td>

                        <td className="py-4 px-5 text-slate-600 max-w-xs">
                          {pet.allergies ? (
                            <span className="text-amber-800 font-semibold truncate block">
                              {pet.allergies}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None noted</span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/pets/${pet.id}`}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold"
                              title="Medical Chart"
                            >
                              Chart
                            </Link>
                            <Link
                              href={`/clinic/vaccinations?petId=${pet.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                              title="Add Vaccination"
                            >
                              <Syringe className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/clinic/treatments?petId=${pet.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                              title="Add Treatment"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
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
