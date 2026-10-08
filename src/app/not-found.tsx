'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-6 shadow-sm border border-teal-100">
        <Stethoscope className="w-8 h-8" />
      </div>

      <span className="text-sm font-bold uppercase tracking-wider text-teal-600">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 mb-3">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-8">
        The clinical chart, pet record, or destination you are searching for does not exist or may have been relocated.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Home className="w-4 h-4" /> Return to Homepage
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs shadow-sm transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
