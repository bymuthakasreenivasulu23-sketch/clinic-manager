'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Bell, Search, CheckCircle2, User, ChevronDown } from 'lucide-react';
import { SessionPayload } from '@/lib/auth';
import { NotificationDTO } from '@/types';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  user: SessionPayload;
  onOpenSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ user, onOpenSidebar, title, subtitle }: HeaderProps) {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        const unread = data.data.filter((n: NotificationDTO) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile trigger & Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          {title && <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Right: Notification Bell & User profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                  {unreadCount > 0 && (
                    <Badge variant="warning">{unreadCount} new</Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link || '#'}
                      onClick={() => setShowNotifications(false)}
                      className={`block p-2.5 rounded-xl text-xs transition-colors ${
                        item.isRead ? 'bg-slate-50/70 hover:bg-slate-100' : 'bg-teal-50/60 hover:bg-teal-100/60 border border-teal-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{item.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">{item.message}</p>
                    </Link>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center mt-2">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold block py-1"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">
              {user.name}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
