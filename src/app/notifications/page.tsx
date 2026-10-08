'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Syringe,
  FileText,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { formatDate } from '@/lib/utils';
import { SessionPayload } from '@/lib/auth';

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
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
        await fetchNotifications();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
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

  const getIcon = (type: string) => {
    if (type === 'APPOINTMENT') return <Calendar className="w-5 h-5 text-teal-600" />;
    if (type === 'VACCINATION') return <Syringe className="w-5 h-5 text-amber-600" />;
    if (type === 'TREATMENT') return <FileText className="w-5 h-5 text-indigo-600" />;
    return <Bell className="w-5 h-5 text-slate-500" />;
  };

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
          title="Notification Center"
          subtitle="Alerts, appointment confirmations, booster reminders, and clinical updates"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Activity & Care Alerts</h3>
              <p className="text-xs text-slate-500">
                {notifications.filter((n) => !n.isRead).length} unread notifications
              </p>
            </div>

            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark All as Read
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
                <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No notifications on record.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    n.isRead
                      ? 'bg-white border-slate-200/80 shadow-sm'
                      : 'bg-teal-50/50 border-teal-200 shadow-sm'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-white border border-slate-100 shrink-0 shadow-sm">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                      <span className="text-[11px] text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                    <div className="pt-2 flex items-center justify-between">
                      {n.link ? (
                        <Link
                          href={n.link}
                          className="text-xs font-bold text-teal-600 hover:text-teal-800 inline-flex items-center gap-1"
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <div />
                      )}

                      {!n.isRead && (
                        <button
                          onClick={() => markSingleRead(n.id)}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-700"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
