import React from 'react';
import Link from 'next/link';
import { Stethoscope, Heart, Shield, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
                <Stethoscope className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                VetClinic<span className="text-teal-400">Manager</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A comprehensive clinical management system connecting pet parents and veterinary teams. Streamlining health records, vaccination schedules, surgery histories, and appointment bookings with medical-grade reliability.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-teal-400 font-medium">
                <Shield className="w-3.5 h-3.5" /> HIPAA & Clinical Security Ready
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Pet Owner Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Clinic Staff & Vet Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Hospital Admin Portal
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-teal-400 transition-colors">
                  Veterinary Services
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-teal-400 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Clinical Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  General Checkups
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Vaccination Tracking
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Dental Prophylaxis
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Specialized Surgery
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Emergency Diagnostics
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Emergency & Care
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>450 Animal Health Ave, Suite 100, New York, NY</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+1 (555) 738-2273</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>care@vetclinicmanager.com</span>
              </li>
              <li className="pt-2 text-xs text-slate-400">
                <strong className="text-slate-300">Mon - Sat:</strong> 8:00 AM - 8:00 PM<br />
                <strong className="text-slate-300">Sunday:</strong> 9:00 AM - 4:00 PM (Urgent Care)
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Veterinary Clinic Manager. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
