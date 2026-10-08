# Veterinary Clinic Manager

A modern, production-grade, full-stack veterinary clinic management platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**. 

Veterinary Clinic Manager provides a centralized hub where pet parents can register their pets, book veterinary appointments, and monitor vaccination schedules and treatment histories, while clinic staff, veterinarians, and hospital administrators manage daily patient rosters, electronic medical records (EMR), prescriptions, doctor teams, and practice analytics.

---

## 🌟 Key Features

### 🐾 For Pet Owners (`OWNER` Role)
- **Personal Pet Dashboard**: Overview of registered pets, upcoming appointments, vaccination alerts (due soon, due today, overdue), and latest medical treatments.
- **Pet Management**: Add, view, edit, and delete pet profiles with species (Dog, Cat, Bird, Rabbit, Other), breed, age, weight, microchip ID, allergies, and chronic medical notes.
- **Appointment Booking**: Online scheduling with doctor selection, date picker, real-time slot selection, double-booking prevention, and instant confirmation notifications.
- **Vaccination Records**: Digital immunization tracker with alerts for due and overdue boosters.
- **Treatment & Prescription History**: Chronological timeline of veterinary diagnoses, vitals, prescriptions, and follow-up care instructions.

### 🩺 For Veterinarians & Clinic Staff (`VETERINARIAN` & `STAFF` Roles)
- **Clinical Operations Dashboard**: Real-time counter of today's visits, pending reviews, patient admissions, and vaccinations due.
- **Appointment Queue & Triage**: Confirm, complete, reject, or reschedule appointments with instant notifications to pet parents.
- **Calendar & Table Views**: Seamlessly switch between daily list queues and multi-day calendar views.
- **Vaccination Registry**: Administer and log vaccine batches, calculate next booster dates, and issue immunization records.
- **Electronic Medical Records (EMR)**: Complete SOAP documentation including symptoms, diagnosis, clinical procedures, body weight, temperature, follow-ups, and itemized multi-drug prescriptions.
- **Patient Census & Client Directory**: Searchable registry by pet name, microchip ID, owner phone number, and species.

### 🛡️ For Administrators (`ADMIN` Role)
- **Executive Dashboard**: Practice metrics across owners, pets, appointments, veterinarians, and completed treatments.
- **User & Security Administration**: Manage role authorizations (`OWNER`, `VETERINARIAN`, `STAFF`, `ADMIN`), view user registrations, and deactivate or reactivate accounts.
- **Doctor Team Management**: Onboard new veterinarians, assign license numbers, specializations, experience levels, and availability schedules.
- **Clinical Reports & Analytics**: Interactive charts for monthly appointment volumes, new patient signups, vaccination compliance rates, patient species breakdowns, and top clinical diagnoses.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions / API Routes)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Lucide React icons
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) (configured with SQLite for zero-setup local execution, ready for PostgreSQL deployment)
- **Authentication**: Secure bcrypt password hashing, Edge-compatible JWT via `jose`, HTTP-only secure cookies, and role-based authorization guards
- **Charts & Data Viz**: [Recharts](https://recharts.org/)
- **Date Handling**: [date-fns](https://date-fns.org/)

---

## 🔑 Demo Login Credentials

For testing and demonstration, use the convenient **One-Click Demo Access buttons** on the `/login` page or use the following pre-seeded credentials:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Pet Owner** | `owner@example.com` | `Password123!` | Pet parent with 3 pets (Bruno, Tommy, Kitty) |
| **Veterinarian** | `vet@example.com` | `Password123!` | Dr. James Wilson, DVM (Small Animal Surgery) |
| **Clinic Staff** | `staff@example.com` | `Password123!` | Emma Watson (Clinic Frontdesk & Triage) |
| **Administrator** | `admin@example.com` | `Password123!` | Dr. Sarah Mitchell (Hospital Medical Director) |

---

## 📁 Folder Structure

```
├── prisma/
│   ├── schema.prisma         # Prisma database schema definition
│   └── seed.ts               # Realistic clinical test database seeder
├── public/                   # Static icons and assets
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/        # Sign in with 1-click demo buttons
│   │   │   ├── register/     # Public pet owner registration
│   │   │   └── forgot-password/
│   │   ├── admin/
│   │   │   ├── dashboard/    # Practice governance overview
│   │   │   ├── reports/      # Longitudinal visual reports & charts
│   │   │   └── users/        # User role administration
│   │   ├── api/
│   │   │   ├── admin/users/  # User roles & account status API
│   │   │   ├── appointments/ # Appointment booking & rescheduling API
│   │   │   ├── auth/         # Login, register, logout, session API
│   │   │   ├── notifications/# Notifications & alerts API
│   │   │   ├── pets/         # Pet profiles CRUD API
│   │   │   ├── reports/      # Aggregated practice statistics API
│   │   │   ├── treatments/   # EMR & prescriptions API
│   │   │   ├── vaccinations/ # Vaccine records & alerts API
│   │   │   └── veterinarians/# Doctor profiles API
│   │   ├── appointments/     # Owner appointment booking page
│   │   ├── clinic/
│   │   │   ├── appointments/ # Clinic queue & calendar schedule
│   │   │   ├── dashboard/    # Clinical operations command center
│   │   │   ├── owners/       # Client directory
│   │   │   ├── pets/         # Hospital patient census
│   │   │   ├── treatments/   # EMR documentation & prescriptions
│   │   │   ├── vaccinations/ # Immunization administration & alerts
│   │   │   └── veterinarians/# Doctor staff management
│   │   ├── dashboard/        # Pet Owner portal dashboard
│   │   ├── notifications/    # Interactive notification center
│   │   ├── pets/             # Pet directory & detail charts
│   │   ├── profile/          # User account & credentials
│   │   ├── treatments/       # Owner medical history timeline
│   │   ├── vaccinations/     # Owner vaccination tracker
│   │   ├── globals.css       # Tailwind base & custom styles
│   │   ├── layout.tsx        # App root layout & metadata
│   │   ├── page.tsx          # Public commercial landing page
│   │   ├── error.tsx         # 500 error boundary
│   │   └── not-found.tsx     # 404 page
│   ├── components/
│   │   ├── layout/           # Navbar, Footer, Sidebar, Header
│   │   └── ui/               # Badge, Modal, StatCard, etc.
│   ├── lib/
│   │   ├── auth.ts           # JWT cookies & password hashing
│   │   ├── prisma.ts         # Prisma client singleton
│   │   └── utils.ts          # Helpers, formatters, and status colors
│   └── types/                # TypeScript interface definitions
├── .env.example              # Environment variable documentation
├── next.config.mjs
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.17` or newer (`v20+` recommended)
- **npm** or **pnpm** or **yarn**

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file from the provided `.env.example`:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="veterinary_clinic_manager_super_secure_secret_key_2026_xyz123"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
Generate the Prisma client, create the database schema, and seed realistic demo records:
```bash
# Push the schema to create tables
npx prisma db push

# Seed 5 owners, 10 pets, 3 vets, 15 appointments, 10 vaccinations, 10 treatments
npm run prisma:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build & Verification

To verify that the application compiles and builds without any type errors or warnings:
```bash
npm run build
npm run start
```

---

## 🌐 Deploying to Production (Vercel, Render, PostgreSQL)

### Switching to Managed PostgreSQL (e.g., Supabase, Neon, Railway)
1. Open `prisma/schema.prisma` and update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In your deployment dashboard (e.g., Vercel, Render), set the environment variables:
   - `DATABASE_URL`: `postgresql://user:password@host:5432/vetclinic?sslmode=require`
   - `SESSION_SECRET`: A secure 32+ character random secret string
   - `NEXT_PUBLIC_APP_URL`: Your production domain URL (e.g. `https://vetclinic.example.com`)
3. Run migrations on the production database:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

---

## 🔒 Security Best Practices Implemented
- **Password Security**: Passwords hashed with `bcryptjs` (salt rounds: 10). Passwords are never returned in API responses.
- **Session Protection**: JWTs signed with standard HMAC-SHA256, transmitted exclusively inside `HTTPOnly`, `SameSite=Lax`, and `Secure` cookies.
- **Role-Based Authorization**: API endpoints and pages strictly verify session tokens and enforce role boundaries.
- **SQL Injection Prevention**: All database queries executed via Prisma ORM parameterized statements.
- **Input Validation**: Backend guards reject past appointment bookings, duplicate time slots, and malformed emails.

---

## 📄 License
MIT License. Crafted for modern veterinary healthcare practices.
