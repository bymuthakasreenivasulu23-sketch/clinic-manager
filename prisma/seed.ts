import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.treatmentRecord.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.veterinarianProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding demo users...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Mitchell (Admin)',
      email: 'admin@example.com',
      password: passwordHash,
      phone: '+1 (555) 100-0001',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 2. Staff
  const staff = await prisma.user.create({
    data: {
      name: 'Emma Watson (Clinic Staff)',
      email: 'staff@example.com',
      password: passwordHash,
      phone: '+1 (555) 100-0002',
      role: 'STAFF',
      status: 'ACTIVE',
    },
  });

  // 3. Primary Veterinarian
  const vetUser1 = await prisma.user.create({
    data: {
      name: 'Dr. James Wilson, DVM',
      email: 'vet@example.com',
      password: passwordHash,
      phone: '+1 (555) 100-0003',
      role: 'VETERINARIAN',
      status: 'ACTIVE',
    },
  });

  const vetProfile1 = await prisma.veterinarianProfile.create({
    data: {
      userId: vetUser1.id,
      specialization: 'Small Animal Surgery & Internal Medicine',
      licenseNumber: 'VET-NY-98421',
      experience: 12,
      availability: 'Mon - Fri: 8:30 AM - 4:30 PM',
      bio: 'Board-certified veterinarian with over a decade of compassionate surgical and companion pet care.',
    },
  });

  // 4. Second Veterinarian
  const vetUser2 = await prisma.user.create({
    data: {
      name: 'Dr. Emily Chen, BVSc',
      email: 'emily.chen@vetclinic.com',
      password: passwordHash,
      phone: '+1 (555) 100-0004',
      role: 'VETERINARIAN',
      status: 'ACTIVE',
    },
  });

  const vetProfile2 = await prisma.veterinarianProfile.create({
    data: {
      userId: vetUser2.id,
      specialization: 'Feline Specialist & Dermatology',
      licenseNumber: 'VET-NY-77312',
      experience: 8,
      availability: 'Tue - Sat: 9:00 AM - 5:00 PM',
      bio: 'Feline behaviorist and dermatology specialist passionate about stress-free clinic experiences.',
    },
  });

  // 5. Third Veterinarian
  const vetUser3 = await prisma.user.create({
    data: {
      name: 'Dr. Marcus Vance, DVM',
      email: 'marcus.vance@vetclinic.com',
      password: passwordHash,
      phone: '+1 (555) 100-0005',
      role: 'VETERINARIAN',
      status: 'ACTIVE',
    },
  });

  const vetProfile3 = await prisma.veterinarianProfile.create({
    data: {
      userId: vetUser3.id,
      specialization: 'Avian & Exotic Animal Care',
      licenseNumber: 'VET-NY-44190',
      experience: 6,
      availability: 'Mon, Wed, Fri: 10:00 AM - 6:00 PM',
      bio: 'Dedicated practitioner for birds, reptiles, rabbits, and pocket pets.',
    },
  });

  // 6. Demo Owner
  const demoOwner = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'owner@example.com',
      password: passwordHash,
      phone: '+1 (555) 234-5678',
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });

  // 4 other Owners (total 5 owners)
  const owner2 = await prisma.user.create({
    data: {
      name: 'Sophia Martinez',
      email: 'sophia.m@example.com',
      password: passwordHash,
      phone: '+1 (555) 345-6789',
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Liam Johnson',
      email: 'liam.j@example.com',
      password: passwordHash,
      phone: '+1 (555) 456-7890',
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });

  const owner4 = await prisma.user.create({
    data: {
      name: 'Olivia Brown',
      email: 'olivia.b@example.com',
      password: passwordHash,
      phone: '+1 (555) 567-8901',
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });

  const owner5 = await prisma.user.create({
    data: {
      name: 'Noah Davis',
      email: 'noah.d@example.com',
      password: passwordHash,
      phone: '+1 (555) 678-9012',
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });

  console.log('Seeding 10 pets...');
  // 10 Pets across 5 owners
  const pet1 = await prisma.pet.create({
    data: {
      name: 'Bruno',
      species: 'Dog',
      breed: 'Labrador Retriever',
      gender: 'Male',
      age: 4,
      weight: 31.5,
      color: 'Chocolate Brown',
      microchipId: '985141002938471',
      allergies: 'Chicken protein sensitivity',
      existingConditions: 'None',
      notes: 'Energetic, very friendly with clinic staff.',
      ownerId: demoOwner.id,
    },
  });

  const pet2 = await prisma.pet.create({
    data: {
      name: 'Tommy',
      species: 'Dog',
      breed: 'Golden Retriever',
      gender: 'Male',
      age: 3,
      weight: 29.0,
      color: 'Golden',
      microchipId: '985141002938472',
      allergies: 'None',
      existingConditions: 'Mild hip dysplasia (monitoring)',
      notes: 'Loves treats, very calm during examinations.',
      ownerId: demoOwner.id,
    },
  });

  const pet3 = await prisma.pet.create({
    data: {
      name: 'Kitty',
      species: 'Cat',
      breed: 'Persian Cat',
      gender: 'Female',
      age: 2,
      weight: 4.2,
      color: 'White',
      microchipId: '985141002938473',
      allergies: 'Dust mites',
      existingConditions: 'Sensitive stomach',
      notes: 'Needs quiet examination room.',
      ownerId: demoOwner.id,
    },
  });

  const pet4 = await prisma.pet.create({
    data: {
      name: 'Max',
      species: 'Dog',
      breed: 'Beagle',
      gender: 'Male',
      age: 5,
      weight: 12.8,
      color: 'Tricolor',
      microchipId: '985141002938474',
      allergies: 'None',
      existingConditions: 'Prone to ear infections',
      notes: 'Regular ear flushes advised.',
      ownerId: owner2.id,
    },
  });

  const pet5 = await prisma.pet.create({
    data: {
      name: 'Coco',
      species: 'Bird',
      breed: 'African Grey Parrot',
      gender: 'Female',
      age: 7,
      weight: 0.42,
      color: 'Grey & Red Tail',
      microchipId: '985141002938475',
      allergies: 'Aerosol/Teflon sensitive',
      existingConditions: 'None',
      notes: 'Vocal, easily startled by sudden movements.',
      ownerId: owner2.id,
    },
  });

  const pet6 = await prisma.pet.create({
    data: {
      name: 'Luna',
      species: 'Cat',
      breed: 'Siamese',
      gender: 'Female',
      age: 1,
      weight: 3.6,
      color: 'Seal Point',
      microchipId: '985141002938476',
      allergies: 'None',
      existingConditions: 'None',
      notes: 'Kitten wellness plan completed.',
      ownerId: owner3.id,
    },
  });

  const pet7 = await prisma.pet.create({
    data: {
      name: 'Rocky',
      species: 'Dog',
      breed: 'German Shepherd',
      gender: 'Male',
      age: 6,
      weight: 36.0,
      color: 'Black & Tan',
      microchipId: '985141002938477',
      allergies: 'Grass pollens',
      existingConditions: 'Mild osteoarthritis',
      notes: 'Requires joint supplements.',
      ownerId: owner3.id,
    },
  });

  const pet8 = await prisma.pet.create({
    data: {
      name: 'Bella',
      species: 'Rabbit',
      breed: 'Holland Lop',
      gender: 'Female',
      age: 2,
      weight: 1.8,
      color: 'Fawn',
      microchipId: '985141002938478',
      allergies: 'None',
      existingConditions: 'Dental spurs check needed biannually',
      notes: 'Enjoys timothy hay treats.',
      ownerId: owner4.id,
    },
  });

  const pet9 = await prisma.pet.create({
    data: {
      name: 'Milo',
      species: 'Cat',
      breed: 'Maine Coon',
      gender: 'Male',
      age: 3,
      weight: 7.5,
      color: 'Tabby Silver',
      microchipId: '985141002938479',
      allergies: 'None',
      existingConditions: 'None',
      notes: 'Gentle giant, easy to groom.',
      ownerId: owner4.id,
    },
  });

  const pet10 = await prisma.pet.create({
    data: {
      name: 'Charlie',
      species: 'Dog',
      breed: 'French Bulldog',
      gender: 'Male',
      age: 2,
      weight: 11.2,
      color: 'Brindle',
      microchipId: '985141002938480',
      allergies: 'Wheat grains',
      existingConditions: 'Brachycephalic respiratory monitoring',
      notes: 'Avoid extreme heat exposure.',
      ownerId: owner5.id,
    },
  });

  console.log('Seeding 15 appointments...');
  const today = new Date();
  
  // Date helpers
  const daysFromNow = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d;
  };

  const appt1 = await prisma.appointment.create({
    data: {
      petId: pet1.id,
      ownerId: demoOwner.id,
      veterinarianId: vetProfile1.id,
      appointmentDate: daysFromNow(1),
      timeSlot: '09:30 AM',
      reason: 'Annual Comprehensive Physical Checkup',
      notes: 'Owner requested weight review and heart check.',
      status: 'CONFIRMED',
    },
  });

  const appt2 = await prisma.appointment.create({
    data: {
      petId: pet2.id,
      ownerId: demoOwner.id,
      veterinarianId: vetProfile1.id,
      appointmentDate: daysFromNow(3),
      timeSlot: '11:00 AM',
      reason: 'Rabies Booster & Dental Inspection',
      notes: 'Has slight tartar buildup on rear molars.',
      status: 'PENDING',
    },
  });

  const appt3 = await prisma.appointment.create({
    data: {
      petId: pet3.id,
      ownerId: demoOwner.id,
      veterinarianId: vetProfile2.id,
      appointmentDate: daysFromNow(5),
      timeSlot: '02:00 PM',
      reason: 'Feline Hairball & Digestion Consultation',
      notes: 'Owner noted occasional regurgitation after meals.',
      status: 'CONFIRMED',
    },
  });

  const appt4 = await prisma.appointment.create({
    data: {
      petId: pet4.id,
      ownerId: owner2.id,
      veterinarianId: vetProfile1.id,
      appointmentDate: today,
      timeSlot: '10:00 AM',
      reason: 'Ear Scratching & Shaking Checkup',
      notes: 'Suspected otitis externa in left ear.',
      status: 'CONFIRMED',
    },
  });

  const appt5 = await prisma.appointment.create({
    data: {
      petId: pet5.id,
      ownerId: owner2.id,
      veterinarianId: vetProfile3.id,
      appointmentDate: today,
      timeSlot: '11:30 AM',
      reason: 'Beak and Feather Health Evaluation',
      notes: 'Routine avian wellness visit.',
      status: 'CONFIRMED',
    },
  });

  const appt6 = await prisma.appointment.create({
    data: {
      petId: pet6.id,
      ownerId: owner3.id,
      veterinarianId: vetProfile2.id,
      appointmentDate: today,
      timeSlot: '03:30 PM',
      reason: 'Microchipping verification & nail trim',
      notes: 'Routine grooming and preventive care.',
      status: 'PENDING',
    },
  });

  const appt7 = await prisma.appointment.create({
    data: {
      petId: pet7.id,
      ownerId: owner3.id,
      veterinarianId: vetProfile1.id,
      appointmentDate: daysFromNow(2),
      timeSlot: '01:30 PM',
      reason: 'Senior Dog Mobility & Arthritis Check',
      notes: 'Stiff gait in the mornings.',
      status: 'CONFIRMED',
    },
  });

  const appt8 = await prisma.appointment.create({
    data: {
      petId: pet8.id,
      ownerId: owner4.id,
      veterinarianId: vetProfile3.id,
      appointmentDate: daysFromNow(4),
      timeSlot: '10:00 AM',
      reason: 'Incisor Alignment & GI Stasis Check',
      notes: 'Rabbit preventive wellness.',
      status: 'PENDING',
    },
  });

  const appt9 = await prisma.appointment.create({
    data: {
      petId: pet9.id,
      ownerId: owner4.id,
      veterinarianId: vetProfile2.id,
      appointmentDate: daysFromNow(7),
      timeSlot: '04:00 PM',
      reason: 'Core Vaccine Booster (FVRCP)',
      notes: 'Annual vaccination renewal.',
      status: 'CONFIRMED',
    },
  });

  const appt10 = await prisma.appointment.create({
    data: {
      petId: pet10.id,
      ownerId: owner5.id,
      veterinarianId: vetProfile1.id,
      appointmentDate: daysFromNow(6),
      timeSlot: '11:30 AM',
      reason: 'Skin Fold Dermatitis Checkup',
      notes: 'Redness noted in facial folds.',
      status: 'PENDING',
    },
  });

  // Completed past appointments (with treatments)
  const appt11 = await prisma.appointment.create({
    data: {
      petId: pet1.id,
      ownerId: demoOwner.id,
      veterinarianId: vetProfile1.id,
      appointmentDate: daysFromNow(-14),
      timeSlot: '10:00 AM',
      reason: 'Minor Paw Abrasion Treatment',
      notes: 'Stepped on glass shard in yard.',
      status: 'COMPLETED',
    },
  });

  const appt12 = await prisma.appointment.create({
    data: {
      petId: pet2.id,
      ownerId: demoOwner.id,
      veterinarianId: vetProfile1.id,
      appointmentDate: daysFromNow(-30),
      timeSlot: '02:00 PM',
      reason: 'Kennel Cough Vaccination & Cough Check',
      notes: 'Pre-boarding vaccine verification.',
      status: 'COMPLETED',
    },
  });

  const appt13 = await prisma.appointment.create({
    data: {
      petId: pet3.id,
      ownerId: demoOwner.id,
      veterinarianId: vetProfile2.id,
      appointmentDate: daysFromNow(-45),
      timeSlot: '03:00 PM',
      reason: 'Flea & Tick Prevention Treatment',
      notes: 'Applied broad spectrum topical treatment.',
      status: 'COMPLETED',
    },
  });

  const appt14 = await prisma.appointment.create({
    data: {
      petId: pet4.id,
      ownerId: owner2.id,
      veterinarianId: vetProfile1.id,
      appointmentDate: daysFromNow(-10),
      timeSlot: '11:00 AM',
      reason: 'Dietary Gastroenteritis Follow-up',
      notes: 'Recovered well with prescription diet.',
      status: 'COMPLETED',
    },
  });

  const appt15 = await prisma.appointment.create({
    data: {
      petId: pet7.id,
      ownerId: owner3.id,
      veterinarianId: vetProfile1.id,
      appointmentDate: daysFromNow(-5),
      timeSlot: '01:00 PM',
      reason: 'Emergency Nail Crack Repair',
      notes: 'Nail trimmed and antiseptic bandage placed.',
      status: 'COMPLETED',
    },
  });

  console.log('Seeding 10 vaccinations...');
  await prisma.vaccination.create({
    data: {
      petId: pet1.id,
      veterinarianId: vetProfile1.id,
      vaccineName: 'Rabies (3-Year)',
      vaccineType: 'Core Inactivated',
      dateAdministered: daysFromNow(-350),
      nextDueDate: daysFromNow(5), // Due in 5 days! (Alert: due soon)
      dose: 'Annual Booster',
      batchNumber: 'RAB-2025-998',
      notes: 'Administered right hind leg subcutaneously. No adverse reaction.',
      status: 'PENDING',
    },
  });

  await prisma.vaccination.create({
    data: {
      petId: pet1.id,
      veterinarianId: vetProfile1.id,
      vaccineName: 'DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)',
      vaccineType: 'Core Modified Live',
      dateAdministered: daysFromNow(-180),
      nextDueDate: daysFromNow(185),
      dose: '3rd Booster',
      batchNumber: 'DHPP-8820',
      notes: 'Left shoulder subcutaneous.',
      status: 'COMPLETED',
    },
  });

  await prisma.vaccination.create({
    data: {
      petId: pet2.id,
      veterinarianId: vetProfile1.id,
      vaccineName: 'Bordetella (Kennel Cough)',
      vaccineType: 'Intranasal',
      dateAdministered: daysFromNow(-30),
      nextDueDate: daysFromNow(335),
      dose: 'Single 1ml',
      batchNumber: 'BOR-4421',
      notes: 'Tolerated well.',
      status: 'COMPLETED',
    },
  });

  await prisma.vaccination.create({
    data: {
      petId: pet2.id,
      veterinarianId: vetProfile1.id,
      vaccineName: 'Leptospirosis 4-Way',
      vaccineType: 'Non-Core Inactivated',
      dateAdministered: daysFromNow(-370),
      nextDueDate: daysFromNow(-5), // 5 days OVERDUE! (Alert: Overdue)
      dose: 'Annual Booster',
      batchNumber: 'LEP-1092',
      notes: 'Booster overdue notice sent to owner.',
      status: 'OVERDUE',
    },
  });

  await prisma.vaccination.create({
    data: {
      petId: pet3.id,
      veterinarianId: vetProfile2.id,
      vaccineName: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
      vaccineType: 'Core Modified Live',
      dateAdministered: daysFromNow(-200),
      nextDueDate: daysFromNow(165),
      dose: 'Annual Booster',
      batchNumber: 'FVRCP-771',
      notes: 'Administered right shoulder.',
      status: 'COMPLETED',
    },
  });

  await prisma.vaccination.create({
    data: {
      petId: pet3.id,
      veterinarianId: vetProfile2.id,
      vaccineName: 'Feline Leukemia Virus (FeLV)',
      vaccineType: 'Non-core Recombinant',
      dateAdministered: daysFromNow(-365),
      nextDueDate: today, // DUE TODAY! (Alert: Due today)
      dose: 'Annual Booster',
      batchNumber: 'FELV-331',
      notes: 'Scheduled for review today.',
      status: 'PENDING',
    },
  });

  await prisma.vaccination.create({
    data: {
      petId: pet4.id,
      veterinarianId: vetProfile1.id,
      vaccineName: 'Rabies (1-Year)',
      vaccineType: 'Core Inactivated',
      dateAdministered: daysFromNow(-100),
      nextDueDate: daysFromNow(265),
      dose: 'Annual Booster',
      batchNumber: 'RAB-5591',
      notes: 'Subcutaneous right flank.',
      status: 'COMPLETED',
    },
  });

  await prisma.vaccination.create({
    data: {
      petId: pet6.id,
      veterinarianId: vetProfile2.id,
      vaccineName: 'FVRCP Kitten Series 3',
      vaccineType: 'Core',
      dateAdministered: daysFromNow(-60),
      nextDueDate: daysFromNow(305),
      dose: 'Final Puppy/Kitten booster',
      batchNumber: 'FVRCP-902',
      notes: 'Completed full juvenile immunization series.',
      status: 'COMPLETED',
    },
  });

  await prisma.vaccination.create({
    data: {
      petId: pet7.id,
      veterinarianId: vetProfile1.id,
      vaccineName: 'Lyme Disease Vaccine',
      vaccineType: 'Bacterin',
      dateAdministered: daysFromNow(-380),
      nextDueDate: daysFromNow(-15), // OVERDUE!
      dose: 'Annual Booster',
      batchNumber: 'LYM-1120',
      notes: 'Tick-heavy area precaution.',
      status: 'OVERDUE',
    },
  });

  await prisma.vaccination.create({
    data: {
      petId: pet10.id,
      veterinarianId: vetProfile1.id,
      vaccineName: 'Canine Influenza (H3N2/H3N8)',
      vaccineType: 'Bivalent Inactivated',
      dateAdministered: daysFromNow(-15),
      nextDueDate: daysFromNow(350),
      dose: 'Primary 1ml',
      batchNumber: 'CIV-2299',
      notes: 'Well tolerated.',
      status: 'COMPLETED',
    },
  });

  console.log('Seeding 10 treatment records with prescriptions...');
  // Treatment 1: Bruno paw abrasion
  const treat1 = await prisma.treatmentRecord.create({
    data: {
      petId: pet1.id,
      appointmentId: appt11.id,
      veterinarianId: vetProfile1.id,
      visitDate: daysFromNow(-14),
      symptoms: 'Limping on right front paw, localized bleeding, licking paw pad.',
      diagnosis: 'Superficial pad laceration with mild localized inflammation.',
      treatment: 'Wound irrigation with sterile saline, chlorhexidine antiseptic flush, light protective bandage.',
      weight: 31.5,
      temperature: 38.6,
      followUpDate: daysFromNow(7),
      notes: 'Keep paw clean and dry. Use protective e-collar if pet licks.',
      prescriptions: {
        create: [
          {
            medication: 'Cephalexin 500mg',
            dosage: '1 capsule',
            frequency: 'Twice daily with meals',
            duration: '7 days',
            instructions: 'Antibiotic for skin infection prevention.',
          },
          {
            medication: 'Carprofen (Rimadyl) 75mg',
            dosage: '1/2 tablet',
            frequency: 'Every 24 hours',
            duration: '4 days',
            instructions: 'NSAID pain and inflammation relief.',
          },
        ],
      },
    },
  });

  // Treatment 2: Tommy dental check
  const treat2 = await prisma.treatmentRecord.create({
    data: {
      petId: pet2.id,
      appointmentId: appt12.id,
      veterinarianId: vetProfile1.id,
      visitDate: daysFromNow(-30),
      symptoms: 'Mild halitosis, tartar on upper premolars.',
      diagnosis: 'Stage 1 Gingivitis and dental calculus.',
      treatment: 'Ultrasonic dental scale and polish recommended; prescribed enzymatic oral gel.',
      weight: 29.2,
      temperature: 38.4,
      followUpDate: daysFromNow(60),
      notes: 'Owner advised to initiate daily enzymatic dental wipes.',
      prescriptions: {
        create: [
          {
            medication: 'C.E.T. Enzymatic Toothpaste & Gel',
            dosage: 'Pea-sized amount',
            frequency: 'Once daily after evening meal',
            duration: 'Ongoing',
            instructions: 'Apply along gum line.',
          },
        ],
      },
    },
  });

  // Treatment 3: Kitty hairball / gastropathy
  const treat3 = await prisma.treatmentRecord.create({
    data: {
      petId: pet3.id,
      appointmentId: appt13.id,
      veterinarianId: vetProfile2.id,
      visitDate: daysFromNow(-45),
      symptoms: 'Intermittent dry coughing, gagging, trichobezoar expelled in home.',
      diagnosis: 'Feline Trichobezoar (Hairball) Gastric Irritation.',
      treatment: 'Gastrointestinal lubricant administered; nutritional fiber counseling provided.',
      weight: 4.2,
      temperature: 38.5,
      followUpDate: null,
      notes: 'Switching to high-fiber digestive formula food.',
      prescriptions: {
        create: [
          {
            medication: 'Laxatone Maple Gel',
            dosage: '1/2 teaspoon',
            frequency: '2-3 times weekly',
            duration: '30 days',
            instructions: 'Place on front paw or nose for licking.',
          },
        ],
      },
    },
  });

  // Treatment 4: Max ear infection
  const treat4 = await prisma.treatmentRecord.create({
    data: {
      petId: pet4.id,
      appointmentId: appt14.id,
      veterinarianId: vetProfile1.id,
      visitDate: daysFromNow(-10),
      symptoms: 'Head shaking, brown discharge in left auditory canal, odor.',
      diagnosis: 'Otitis Externa (Malassezia yeast overgrowth).',
      treatment: 'Deep ear canal flush with ceruminolytic solution, topical otic suspension applied.',
      weight: 12.8,
      temperature: 38.8,
      followUpDate: daysFromNow(14),
      notes: 'Recheck cytology scheduled at follow-up.',
      prescriptions: {
        create: [
          {
            medication: 'Posatex Otic Suspension',
            dosage: '4 drops into left ear',
            frequency: 'Once daily',
            duration: '7 days',
            instructions: 'Massage ear canal base gently after instilling drops.',
          },
        ],
      },
    },
  });

  // Treatment 5: Rocky nail crack
  const treat5 = await prisma.treatmentRecord.create({
    data: {
      petId: pet7.id,
      appointmentId: appt15.id,
      veterinarianId: vetProfile1.id,
      visitDate: daysFromNow(-5),
      symptoms: 'Slight bleeding from dewclaw, sensitive to touch.',
      diagnosis: 'Fractured dewclaw at quick.',
      treatment: 'Local nerve block, loose nail segment removed, silver nitrate cautery, sterile wrap.',
      weight: 35.8,
      temperature: 38.5,
      followUpDate: daysFromNow(5),
      notes: 'Wrap to be removed in 48 hours at home.',
      prescriptions: {
        create: [
          {
            medication: 'Tramadol 50mg',
            dosage: '1 tablet',
            frequency: 'Every 8-12 hours as needed for discomfort',
            duration: '3 days',
            instructions: 'Administer with food.',
          },
        ],
      },
    },
  });

  // Additional 5 treatment records to satisfy 10 total
  await prisma.treatmentRecord.create({
    data: {
      petId: pet1.id,
      veterinarianId: vetProfile1.id,
      visitDate: daysFromNow(-120),
      symptoms: 'Seasonal pruritus, scratching flank and belly.',
      diagnosis: 'Atopic Environmental Dermatitis.',
      treatment: 'Cytopoint monoclonal antibody injection administered.',
      weight: 31.0,
      temperature: 38.4,
      notes: 'Excellent relief observed for 6-8 weeks.',
      prescriptions: {
        create: [
          {
            medication: 'Douxo S3 Calm Mousse',
            dosage: '2 pumps',
            frequency: 'Every 3 days',
            duration: '21 days',
            instructions: 'Massage into dry coat.',
          },
        ],
      },
    },
  });

  await prisma.treatmentRecord.create({
    data: {
      petId: pet2.id,
      veterinarianId: vetProfile1.id,
      visitDate: daysFromNow(-200),
      symptoms: 'Slight stiffness rising after long rest.',
      diagnosis: 'Early Hip Joint Stiffness / Mild Osteoarthritis.',
      treatment: 'Started on marine chondroitin and glucosamine regimen.',
      weight: 29.5,
      temperature: 38.3,
      notes: 'Maintain lean body weight and moderate daily exercise.',
      prescriptions: {
        create: [
          {
            medication: 'Dasuquin Advanced with ESM',
            dosage: '1 chewable tablet',
            frequency: 'Once daily morning',
            duration: 'Ongoing',
            instructions: 'Joint health maintenance.',
          },
        ],
      },
    },
  });

  await prisma.treatmentRecord.create({
    data: {
      petId: pet5.id,
      veterinarianId: vetProfile3.id,
      visitDate: daysFromNow(-60),
      symptoms: 'Overgrown beak tip and flaky flight feathers.',
      diagnosis: 'Mild nutritional calcium-vitamin D3 imbalance.',
      treatment: 'Avian beak dremel shaping, mineral block enrichment placed.',
      weight: 0.42,
      temperature: 40.5,
      notes: 'Advised full-spectrum avian lamp installation in aviary.',
      prescriptions: {
        create: [
          {
            medication: 'Harrison\'s High Potency Pellets & Avi-Era Vitamin Drop',
            dosage: '1/4 scoop into diet',
            frequency: 'Daily',
            duration: 'Ongoing',
            instructions: 'Mix with fresh chop greens.',
          },
        ],
      },
    },
  });

  await prisma.treatmentRecord.create({
    data: {
      petId: pet8.id,
      veterinarianId: vetProfile3.id,
      visitDate: daysFromNow(-80),
      symptoms: 'Reduced fecal pellet output, mild lethargy.',
      diagnosis: 'Early Gastrointestinal Hypomotility (GI Stasis).',
      treatment: 'Subcutaneous fluids (60ml Lactated Ringers), critical care syringe feed assistance.',
      weight: 1.8,
      temperature: 38.9,
      notes: 'Normal appetite restored within 24 hours.',
      prescriptions: {
        create: [
          {
            medication: 'Metoclopramide 1mg/ml',
            dosage: '0.9 ml',
            frequency: 'Every 12 hours orally',
            duration: '5 days',
            instructions: 'Prokinetic GI agent.',
          },
          {
            medication: 'Oxbow Critical Care Apple-Banana',
            dosage: '15 ml syringe slurry',
            frequency: 'Every 6 hours',
            duration: '3 days',
            instructions: 'Provide warm water alongside.',
          },
        ],
      },
    },
  });

  await prisma.treatmentRecord.create({
    data: {
      petId: pet10.id,
      veterinarianId: vetProfile1.id,
      visitDate: daysFromNow(-15),
      symptoms: 'Snorting sound during brisk walk, nasal fold erythema.',
      diagnosis: 'Skin Fold Pyoderma & Stage 1 Brachycephalic Airway Syndrome.',
      treatment: 'Medicated wipe cleansing, weight loss guidance.',
      weight: 11.4,
      temperature: 38.6,
      notes: 'Advised chest harness rather than neck collar.',
      prescriptions: {
        create: [
          {
            medication: 'Mal-A-Ket Facial Wipes',
            dosage: '1 wipe',
            frequency: 'Daily after walks',
            duration: '14 days',
            instructions: 'Wipe nose fold gently and allow to dry.',
          },
        ],
      },
    },
  });

  console.log('Seeding notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: demoOwner.id,
        title: 'Appointment Confirmed',
        message: 'Your appointment for Bruno on tomorrow at 09:30 AM has been confirmed with Dr. James Wilson.',
        type: 'APPOINTMENT',
        isRead: false,
        link: '/appointments',
      },
      {
        userId: demoOwner.id,
        title: 'Vaccination Due Soon',
        message: 'Bruno is due for Rabies (3-Year) vaccination in 5 days. Please ensure booking an appointment.',
        type: 'VACCINATION',
        isRead: false,
        link: '/vaccinations',
      },
      {
        userId: demoOwner.id,
        title: 'Vaccination Due Today',
        message: 'Kitty is due for Feline Leukemia Virus (FeLV) booster today.',
        type: 'VACCINATION',
        isRead: false,
        link: '/vaccinations',
      },
      {
        userId: demoOwner.id,
        title: 'Treatment Record Added',
        message: 'Dr. James Wilson has updated the medical notes for Bruno\'s recent paw care.',
        type: 'TREATMENT',
        isRead: true,
        link: '/pets/' + pet1.id,
      },
      {
        userId: vetUser1.id,
        title: 'New Appointment Scheduled',
        message: 'New physical checkup appointment confirmed for tomorrow with Bruno (Labrador Retriever).',
        type: 'APPOINTMENT',
        isRead: false,
        link: '/clinic/appointments',
      },
      {
        userId: staff.id,
        title: 'Pending Appointment Review',
        message: 'Tommy (Golden Retriever) has a pending booking awaiting clinic confirmation.',
        type: 'APPOINTMENT',
        isRead: false,
        link: '/clinic/appointments',
      },
    ],
  });

  console.log('Database successfully seeded with realistic commercial veterinary clinic data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
