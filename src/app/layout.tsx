import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veterinary Clinic Manager | Modern Pet Care & Clinical Operations',
  description: 'A centralized veterinary clinic management platform for pet owners, clinic staff, and veterinarians. Manage appointments, vaccination records, treatment histories, and clinic reports effortlessly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
