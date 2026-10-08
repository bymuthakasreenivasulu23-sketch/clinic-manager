'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  UserCheck,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `/api/admin/users?role=${roleFilter}&status=${statusFilter}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
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
        if (meData.data.user.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }
        setUser(meData.data.user);
        await fetchUsers();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [roleFilter, statusFilter, search]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.message || 'Failed to update role');
      }
    } catch {
      alert('Error updating user');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;

    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch {
      alert('Error changing status');
    } finally {
      setUpdatingId(null);
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
          title="User & Security Administration"
          subtitle="Manage authorized staff, veterinary licenses, pet owners, and account activations"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Roles</option>
                <option value="OWNER">Pet Owner</option>
                <option value="VETERINARIAN">Veterinarian</option>
                <option value="STAFF">Clinic Staff</option>
                <option value="ADMIN">Administrator</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Accounts</option>
                <option value="INACTIVE">Deactivated Accounts</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">User Directory</h3>
                <p className="text-xs text-slate-500">{users.length} registered system accounts</p>
              </div>
            </div>

            {users.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No users found matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-5">User</th>
                      <th className="py-3.5 px-5">Contact Details</th>
                      <th className="py-3.5 px-5">Role Authorization</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">Registered On</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5">
                          <strong className="text-slate-900 text-sm block">{u.name}</strong>
                          <span className="text-[11px] text-slate-400">ID: {u.id.slice(0, 10)}...</span>
                        </td>

                        <td className="py-4 px-5 text-slate-700">
                          <div className="space-y-0.5">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}
                            </span>
                            {u.phone && (
                              <span className="flex items-center gap-1.5 text-slate-500">
                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {u.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <select
                            value={u.role}
                            disabled={updatingId === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="VETERINARIAN">VETERINARIAN</option>
                            <option value="STAFF">STAFF</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>

                        <td className="py-4 px-5">
                          <StatusBadge status={u.status} />
                        </td>

                        <td className="py-4 px-5 text-slate-600">{formatDate(u.createdAt)}</td>

                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            disabled={updatingId === u.id || u.id === user.id}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
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
