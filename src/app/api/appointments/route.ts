import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const veterinarianId = searchParams.get('veterinarianId');
    const dateParam = searchParams.get('date');
    const search = searchParams.get('search')?.toLowerCase() || '';

    const where: any = {};

    // Role filtering:
    // If OWNER, only their own appointments
    if (user.role === 'OWNER') {
      where.ownerId = user.id;
    } else if (user.role === 'VETERINARIAN') {
      // If veterinarian, allow filtering by their vet profile or view all if specified
      const vetProfile = await prisma.veterinarianProfile.findUnique({
        where: { userId: user.id },
      });
      if (veterinarianId) {
        where.veterinarianId = veterinarianId;
      } else if (vetProfile && searchParams.get('myOnly') === 'true') {
        where.veterinarianId = vetProfile.id;
      }
    } else if (veterinarianId && veterinarianId !== 'ALL') {
      where.veterinarianId = veterinarianId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (dateParam) {
      const targetDate = new Date(dateParam);
      where.appointmentDate = {
        gte: startOfDay(targetDate),
        lte: endOfDay(targetDate),
      };
    }

    if (search) {
      where.OR = [
        { reason: { contains: search } },
        { pet: { name: { contains: search } } },
        { owner: { name: { contains: search } } },
        { owner: { phone: { contains: search } } },
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        pet: {
          select: { id: true, name: true, species: true, breed: true, photo: true },
        },
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        veterinarian: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        treatmentRecord: {
          select: { id: true, diagnosis: true, treatment: true },
        },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    return apiSuccess(appointments);
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return apiError('Failed to fetch appointments.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const { petId, veterinarianId, appointmentDate, timeSlot, reason, notes, ownerId } = body;

    if (!petId || !appointmentDate || !timeSlot || !reason) {
      return apiError('Pet, appointment date, time slot, and reason are required.', 400);
    }

    const apptDate = new Date(appointmentDate);

    // Verify pet exists
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { owner: true },
    });

    if (!pet) {
      return apiError('Selected pet not found.', 404);
    }

    // If caller is OWNER, ensure pet is theirs
    if (user.role === 'OWNER' && pet.ownerId !== user.id) {
      return apiError('You can only book appointments for your own pets.', 403);
    }

    const targetOwnerId = pet.ownerId;

    // Check double booking for veterinarian (if veterinarian specified)
    if (veterinarianId) {
      const existingVetAppt = await prisma.appointment.findFirst({
        where: {
          veterinarianId,
          appointmentDate: {
            gte: startOfDay(apptDate),
            lte: endOfDay(apptDate),
          },
          timeSlot,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (existingVetAppt) {
        return apiError('This appointment slot is no longer available for the selected veterinarian.', 409);
      }
    }

    // Check if pet already has an appointment in that time slot
    const existingPetAppt = await prisma.appointment.findFirst({
      where: {
        petId,
        appointmentDate: {
          gte: startOfDay(apptDate),
          lte: endOfDay(apptDate),
        },
        timeSlot,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existingPetAppt) {
      return apiError('This pet already has an appointment scheduled at this date and time slot.', 409);
    }

    const initialStatus = user.role === 'OWNER' ? 'PENDING' : 'CONFIRMED';

    const newAppointment = await prisma.appointment.create({
      data: {
        petId,
        ownerId: targetOwnerId,
        veterinarianId: veterinarianId || null,
        appointmentDate: apptDate,
        timeSlot,
        reason: reason.trim(),
        notes: notes ? notes.trim() : null,
        status: initialStatus,
      },
      include: {
        pet: true,
        veterinarian: {
          include: { user: true },
        },
      },
    });

    // Notify Clinic Staff and Veterinarian
    const staffAndVets = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'VETERINARIAN', 'ADMIN'] } },
    });

    for (const staffMember of staffAndVets) {
      await prisma.notification.create({
        data: {
          userId: staffMember.id,
          title: 'New Appointment Booking',
          message: `${pet.name} (${pet.species}) booked for ${apptDate.toLocaleDateString()} at ${timeSlot}: ${reason}`,
          type: 'APPOINTMENT',
          link: '/clinic/appointments',
        },
      });
    }

    // Notify Owner
    await prisma.notification.create({
      data: {
        userId: targetOwnerId,
        title: user.role === 'OWNER' ? 'Appointment Booking Received' : 'Appointment Confirmed',
        message: `Your appointment for ${pet.name} on ${apptDate.toLocaleDateString()} at ${timeSlot} is ${initialStatus.toLowerCase()}.`,
        type: 'APPOINTMENT',
        link: '/appointments',
      },
    });

    return apiSuccess(newAppointment, 201);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return apiError('Failed to schedule appointment.', 500);
  }
}
