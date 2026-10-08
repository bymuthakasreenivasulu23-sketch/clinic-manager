export type Role = 'OWNER' | 'VETERINARIAN' | 'STAFF' | 'ADMIN';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export type Species = 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: string;
  createdAt: string;
}

export interface VeterinarianProfileDTO {
  id: string;
  userId: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  availability: string;
  bio?: string | null;
  avatar?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface PetDTO {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  dateOfBirth?: string | null;
  age?: number | null;
  weight?: number | null;
  color?: string | null;
  microchipId?: string | null;
  allergies?: string | null;
  existingConditions?: string | null;
  notes?: string | null;
  photo?: string | null;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  appointments?: AppointmentDTO[];
  vaccinations?: VaccinationDTO[];
  treatmentRecords?: TreatmentRecordDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentDTO {
  id: string;
  petId: string;
  pet?: {
    id: string;
    name: string;
    species: string;
    breed: string;
    photo?: string | null;
  };
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  veterinarianId?: string | null;
  veterinarian?: VeterinarianProfileDTO | null;
  appointmentDate: string;
  timeSlot: string;
  reason: string;
  notes?: string | null;
  status: AppointmentStatus;
  treatmentRecord?: TreatmentRecordDTO | null;
  createdAt: string;
}

export interface VaccinationDTO {
  id: string;
  petId: string;
  pet?: {
    id: string;
    name: string;
    species: string;
    breed: string;
    owner?: {
      name: string;
      email: string;
    };
  };
  veterinarianId?: string | null;
  veterinarian?: {
    user: {
      name: string;
    };
  } | null;
  vaccineName: string;
  vaccineType?: string | null;
  dateAdministered: string;
  nextDueDate: string;
  dose?: string | null;
  batchNumber?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
}

export interface TreatmentRecordDTO {
  id: string;
  petId: string;
  pet?: {
    id: string;
    name: string;
    species: string;
    breed: string;
  };
  appointmentId?: string | null;
  veterinarianId?: string | null;
  veterinarian?: {
    user: {
      name: string;
    };
  } | null;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  weight?: number | null;
  temperature?: number | null;
  followUpDate?: string | null;
  notes?: string | null;
  prescriptions?: PrescriptionDTO[];
  createdAt: string;
}

export interface PrescriptionDTO {
  id: string;
  treatmentRecordId: string;
  medication: string;
  dosage: string;
  frequency?: string | null;
  duration: string;
  instructions?: string | null;
}

export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface OwnerDashboardStats {
  petsCount: number;
  upcomingAppointmentsCount: number;
  vaccinationsDueCount: number;
  completedVisitsCount: number;
}

export interface ClinicDashboardStats {
  todayAppointmentsCount: number;
  totalPetsCount: number;
  totalOwnersCount: number;
  vaccinationsDueCount: number;
  pendingAppointmentsCount: number;
  completedVisitsCount: number;
}
