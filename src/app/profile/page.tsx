'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

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
          title="User Account & Security"
          subtitle="Manage credentials, contact preferences, and hospital authorization"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto w-full">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-teal-600/20">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{user.name}</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 mt-1">
                  <Shield className="w-3.5 h-3.5" /> {user.role} Authorization
                </span>
              </div>
            </div>

            {/* Profile fields */}
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Full Name</span>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Email Address</span>
                  <p className="font-semibold text-slate-800">{user.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Phone Number</span>
                  <p className="font-semibold text-slate-800">{user.phone || 'None provided'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Member Since</span>
                  <p className="font-semibold text-slate-800">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              {/* If doctor, show doctor credentials */}
              {user.veterinarianProfile && (
                <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-3">
                  <h4 className="font-bold text-sm text-teal-950">Veterinarian Clinical Profile</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-teal-700 font-medium">Specialization:</span>
                      <strong className="block text-teal-950">
                        {user.veterinarianProfile.specialization}
                      </strong>
                    </div>
                    <div>
                      <span className="text-teal-700 font-medium">License Number:</span>
                      <strong className="block text-teal-950">
                        {user.veterinarianProfile.licenseNumber}
                      </strong>
                    </div>
                    <div>
                      <span className="text-teal-700 font-medium">Experience:</span>
                      <strong className="block text-teal-950">
                        {user.veterinarianProfile.experience} Years
                      </strong>
                    </div>
                    <div>
                      <span className="text-teal-700 font-medium">Hours / Schedule:</span>
                      <strong className="block text-teal-950">
                        {user.veterinarianProfile.availability}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
