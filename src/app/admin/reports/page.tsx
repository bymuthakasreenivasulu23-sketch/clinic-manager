'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  Syringe,
  Dog,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SessionPayload } from '@/lib/auth';

const COLORS = ['#0d9488', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function AdminReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData.success) {
          router.push('/login');
          return;
        }
        if (meData.data.user.role !== 'ADMIN' && meData.data.user.role !== 'VETERINARIAN') {
          router.push('/dashboard');
          return;
        }
        setUser(meData.data.user);

        const repRes = await fetch('/api/reports');
        const repData = await repRes.json();
        if (repData.success) {
          setReportData(repData.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading || !user || !reportData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { overview, monthlyTrends, speciesDistribution, statusDistribution, commonDiagnoses } =
    reportData;

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
          title="Hospital Analytics & Clinical Reports"
          subtitle="Longitudinal performance metrics, patient species breakdown, and diagnosis statistics"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Appointments"
              value={overview.totalAppointments}
              subtitle="All-time hospital visits"
              icon={Calendar}
              color="teal"
            />
            <StatCard
              title="New Registered Pets"
              value={overview.totalPets}
              subtitle="Active companion patients"
              icon={Dog}
              color="emerald"
            />
            <StatCard
              title="Vaccines Administered"
              value={overview.administeredVaccinations}
              subtitle="Protected immunizations"
              icon={Syringe}
              color="blue"
            />
            <StatCard
              title="Completed Treatments"
              value={overview.completedTreatments}
              subtitle="Documented doctor visits"
              icon={CheckCircle2}
              color="indigo"
            />
          </div>

          {/* Charts Row 1: Monthly Trends (Appointments, Pets, Vaccines, Treatments) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Monthly Clinical Activity (Past 6 Months)
                </h3>
                <p className="text-xs text-slate-500">
                  Track appointment volume, new patient intakes, and treatment interventions
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                Monthly Breakdown
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="appointments" name="Appointments" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pets" name="New Pets" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="vaccinations" name="Vaccinations" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="treatments" name="Treatments" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2: Species Distribution & Top Diagnoses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Species Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Patient Species Breakdown</h3>
                <p className="text-xs text-slate-500">
                  Distribution of registered dogs, cats, birds, rabbits, and exotics
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={speciesDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {speciesDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                {speciesDistribution.map((entry: any, idx: number) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700">
                      {entry.name}: {entry.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Common Treatment Diagnoses */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Most Common Diagnoses</h3>
                <p className="text-xs text-slate-500">
                  Top clinical diagnoses observed across doctor treatments
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {commonDiagnoses.length === 0 ? (
                  <p className="text-xs text-slate-400">No diagnosis records available yet.</p>
                ) : (
                  commonDiagnoses.map((item: any, idx: number) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <span className="text-slate-500 font-bold">{item.count} cases</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{
                            width: `${Math.min(100, (item.count / overview.completedTreatments) * 100 || 50)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
