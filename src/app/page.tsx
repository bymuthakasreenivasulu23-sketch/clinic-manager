import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  HeartPulse,
  Syringe,
  FileText,
  ShieldCheck,
  Stethoscope,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smile,
  Activity,
  UserCheck,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  const services = [
    {
      title: 'General Checkup',
      desc: 'Comprehensive nose-to-tail clinical physical exams, preventative health assessments, and weight management.',
      icon: Stethoscope,
      badge: 'Preventive',
    },
    {
      title: 'Vaccination Programs',
      desc: 'Complete core and non-core immunization schedules with automated booster notifications and digital certificates.',
      icon: Syringe,
      badge: 'Protection',
    },
    {
      title: 'Dental Care & Prophylaxis',
      desc: 'Ultrasonic scaling, subgingival cleaning, dental X-rays, and periodontitis preventive treatments.',
      icon: Smile,
      badge: 'Dental',
    },
    {
      title: 'Specialized Surgery',
      desc: 'Modern surgical suites for soft tissue, spay/neuter, orthopedics, and advanced surgical interventions.',
      icon: Activity,
      badge: 'Surgical',
    },
    {
      title: 'Emergency Care',
      desc: 'Rapid diagnostic triage, ICU stabilization, acute trauma treatment, and urgent oxygen therapy.',
      icon: HeartPulse,
      badge: 'Emergency',
    },
    {
      title: 'Preventive Care',
      desc: 'Tailored senior wellness plans, juvenile puppy/kitten protocols, and seasonal flea/tick deworming.',
      icon: ShieldCheck,
      badge: 'Wellness',
    },
  ];

  const features = [
    {
      title: 'Easy Appointment Booking',
      desc: 'Book visits with your preferred veterinarian in seconds with real-time slot availability.',
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Digital Pet Records',
      desc: 'Access complete breed, weight, microchip ID, and allergy histories anytime, from any device.',
      icon: FileText,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Vaccination Tracking',
      desc: 'Visual timelines for past immunizations and proactive alerts for upcoming and overdue boosters.',
      icon: Syringe,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      title: 'Treatment History',
      desc: 'Permanent chronological doctor records with diagnoses, vital signs, prescriptions, and follow-ups.',
      icon: Activity,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Veterinarian Management',
      desc: 'Clinic dashboards for doctors and staff to review patient rosters, notes, and daily schedules.',
      icon: UserCheck,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Secure Medical Records',
      desc: 'Role-based access control ensuring sensitive health and clinical notes remain confidential.',
      icon: ShieldCheck,
      color: 'bg-rose-50 text-rose-600',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Register',
      desc: 'Create your owner profile in seconds with simple and secure credentials.',
    },
    {
      step: '02',
      title: 'Add Your Pet',
      desc: 'Record breed, age, weight, microchip, and known allergies for personalized veterinary care.',
    },
    {
      step: '03',
      title: 'Book an Appointment',
      desc: 'Pick your preferred veterinarian, date, and appointment time without phone tag.',
    },
    {
      step: '04',
      title: 'Visit the Clinic',
      desc: 'Bring your pet for care while our doctors log vitals and treatments digitally.',
    },
    {
      step: '05',
      title: 'Track Medical History',
      desc: 'View prescriptions, booster reminders, and doctor follow-up instructions on your phone.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-teal-50/70 via-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headlines & CTA */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 text-teal-800 text-xs font-semibold tracking-wide border border-teal-200">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Next-Generation Veterinary Practice Management
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Complete Veterinary Care Management,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                    All in One Place
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Manage appointments, pets, vaccinations, and treatment history with a simple and secure veterinary clinic platform.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link
                    href="/appointments"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 transition-all transform hover:-translate-y-0.5"
                  >
                    Book an Appointment
                    <Calendar className="w-5 h-5" />
                  </Link>

                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 shadow-sm hover:border-slate-400 transition-all"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </Link>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0 text-left">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">100%</p>
                    <p className="text-xs text-slate-500">Digital Pet Records</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">Zero</p>
                    <p className="text-xs text-slate-500">Double Bookings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">24/7</p>
                    <p className="text-xs text-slate-500">Vaccination Alerts</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Hero Visual Card */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Backdrop glow */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur-xl opacity-30 animate-pulse" />

                  {/* Visual card */}
                  <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5">
                    {/* Header badge */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                          🩺
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">Pet Health Passport</h4>
                          <p className="text-xs text-slate-500">Patient: Bruno (Labrador)</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Vaccinated
                      </span>
                    </div>

                    {/* Vitals snapshot */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">WEIGHT</span>
                        <strong className="text-slate-800 text-sm font-bold">31.5 kg</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">TEMP</span>
                        <strong className="text-slate-800 text-sm font-bold">38.6 °C</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">MICROCHIP</span>
                        <strong className="text-slate-800 text-sm font-bold truncate block">#9851410</strong>
                      </div>
                    </div>

                    {/* Appointment item */}
                    <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-3.5 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-teal-950">
                          <span>Physical Exam & Heart Check</span>
                          <span className="text-teal-700 font-semibold">Tomorrow</span>
                        </div>
                        <p className="text-teal-700 mt-0.5">Dr. James Wilson, DVM • 09:30 AM</p>
                      </div>
                    </div>

                    {/* Vaccination item */}
                    <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3.5 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                        <Syringe className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-amber-950">
                          <span>Rabies 3-Year Booster</span>
                          <span className="text-amber-700 font-semibold">Due in 5 days</span>
                        </div>
                        <p className="text-amber-700 mt-0.5">Batch #RAB-2025-998 • Scheduled</p>
                      </div>
                    </div>

                    {/* Treatment item */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-slate-700 text-white shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <p className="font-bold text-slate-800">Minor Paw Pad Laceration (Cleaned)</p>
                        <p className="text-slate-500 mt-0.5">Prescribed Cephalexin 500mg • Recovered</p>
                      </div>
                    </div>

                    <Link
                      href="/login"
                      className="w-full text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold block transition-colors shadow-sm"
                    >
                      Explore Clinic Portal →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold tracking-wider uppercase text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Designed for Modern Veterinary Excellence
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Everything required to run clinical workflows, satisfy pet parents, and maintain unbroken medical accuracy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-7 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-teal-300 hover:bg-white hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold tracking-wider uppercase text-teal-600 bg-teal-100/60 px-3 py-1 rounded-full border border-teal-200">
                Step-by-Step Experience
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                How It Works
              </h2>
              <p className="text-slate-600 text-base">
                A seamless care continuum from registration to ongoing health monitoring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {steps.map((st, idx) => (
                <div
                  key={st.step}
                  className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-xs font-black tracking-widest text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 inline-block">
                      {st.step}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{st.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-bold tracking-wider uppercase text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                Comprehensive Veterinary Offerings
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Clinical Services Provided
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Expertise covering routine preventative checkups to high-complexity surgeries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((srv) => {
                const Icon = srv.icon;
                return (
                  <div
                    key={srv.title}
                    className="p-7 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                          {srv.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{srv.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed mb-6">{srv.desc}</p>
                    </div>
                    <Link
                      href="/appointments"
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 group"
                    >
                      Book this service{' '}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION SECTION */}
        <section className="py-20 bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Keep Your Pet&apos;s Health Records Safe and Organized.
            </h2>
            <p className="text-base sm:text-lg text-teal-100/80 max-w-2xl mx-auto leading-relaxed">
              Join thousands of pet parents and veterinary practices using our platform to guarantee timely vaccinations, smooth appointment bookings, and comprehensive medical transparency.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base shadow-lg shadow-teal-500/25 transition-all"
              >
                Create Your Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 transition-all"
              >
                Sign In to Existing Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
