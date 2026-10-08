'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stethoscope, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Login failed. Please check credentials.');
        setLoading(false);
        return;
      }

      // Route based on role
      const role = data.data.user.role;
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (role === 'VETERINARIAN' || role === 'STAFF') {
        router.push('/clinic/dashboard');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'Password123!' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Demo login failed');
        setLoading(false);
        return;
      }

      const role = data.data.user.role;
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (role === 'VETERINARIAN' || role === 'STAFF') {
        router.push('/clinic/dashboard');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      setError('Failed to perform demo login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-7 h-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            VetClinic<span className="text-teal-600">Manager</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Or{' '}
          <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-500">
            register as a new pet owner
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-center mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ⚡ Quick Demo One-Click Access
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Password is pre-configured as <code className="text-slate-600 font-mono">Password123!</code>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('owner@example.com')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 font-semibold text-left transition-colors"
              >
                🐾 Pet Owner
                <span className="block text-[10px] font-normal text-emerald-600">owner@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('vet@example.com')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/60 text-teal-800 font-semibold text-left transition-colors"
              >
                🩺 Veterinarian
                <span className="block text-[10px] font-normal text-teal-600">vet@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('staff@example.com')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100/60 text-sky-800 font-semibold text-left transition-colors"
              >
                📋 Clinic Staff
                <span className="block text-[10px] font-normal text-sky-600">staff@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@example.com')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/60 text-purple-800 font-semibold text-left transition-colors"
              >
                🛡️ Admin
                <span className="block text-[10px] font-normal text-purple-600">admin@example.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
