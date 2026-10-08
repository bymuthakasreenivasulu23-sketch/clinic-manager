'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Phone,
  Mail,
  Dog,
  Calendar,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function ClinicOwnersPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOwners = async () => {
    try {
      const res = await fetch(`/api/admin/users?role=OWNER&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setOwners(data.data);
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
        await fetchOwners();
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
          title="Pet Owner Client Directory"
          subtitle="Client roster, registered contact details, and associated patient profiles"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search owners by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Owners Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Client Directory</h3>
                <p className="text-xs text-slate-500">
                  {owners.length} registered pet owners
                </p>
              </div>
            </div>

            {owners.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No pet owners found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-5">Owner Name</th>
                      <th className="py-3.5 px-5">Email Address</th>
                      <th className="py-3.5 px-5">Phone Number</th>
                      <th className="py-3.5 px-5">Registered Pets</th>
                      <th className="py-3.5 px-5">Appointments Booked</th>
                      <th className="py-3.5 px-5">Client Since</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {owners.map((owner) => (
                      <tr key={owner.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5">
                          <strong className="text-slate-900 text-sm block">{owner.name}</strong>
                          <span className="text-[11px] text-teal-700 font-semibold">Active Client</span>
                        </td>

                        <td className="py-4 px-5 text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {owner.email}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {owner.phone || 'N/A'}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-100">
                            {owner._count?.pets || 0} Pets
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                            {owner._count?.appointments || 0} Bookings
                          </span>
                        </td>

                        <td className="py-4 px-5 text-slate-600">{formatDate(owner.createdAt)}</td>

                        <td className="py-4 px-5 text-right">
                          <Link
                            href={`/clinic/pets?search=${encodeURIComponent(owner.name)}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-bold text-xs"
                          >
                            View Pets →
                          </Link>
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
