import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');
    const search = searchParams.get('search')?.toLowerCase() || '';

    const where: any = {};

    if (user.role === 'OWNER') {
      where.pet = { ownerId: user.id };
    }

    if (petId) {
      where.petId = petId;
    }

    if (search) {
      where.OR = [
        { diagnosis: { contains: search } },
        { treatment: { contains: search } },
        { symptoms: { contains: search } },
        { pet: { name: { contains: search } } },
      ];
    }

    const treatments = await prisma.treatmentRecord.findMany({
      where,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            owner: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        veterinarian: {
          include: {
            user: { select: { name: true } },
          },
        },
        appointment: {
          select: { id: true, appointmentDate: true, timeSlot: true, reason: true },
        },
        prescriptions: true,
      },
      orderBy: { visitDate: 'desc' },
    });

    return apiSuccess(treatments);
  } catch (error: any) {
    console.error('Error fetching treatments:', error);
    return apiError('Failed to fetch medical treatment records.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    if (user.role === 'OWNER') {
      return apiError('Owners cannot create medical treatment records.', 403);
    }

    const body = await req.json();
    const {
      petId,
      appointmentId,
      veterinarianId,
      visitDate,
      symptoms,
      diagnosis,
      treatment,
      weight,
      temperature,
      followUpDate,
      notes,
      prescriptions,
    } = body;

    if (!petId || !symptoms || !diagnosis || !treatment) {
      return apiError('Pet, symptoms, diagnosis, and treatment are required fields.', 400);
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { owner: true },
    });

    if (!pet) return apiError('Pet not found', 404);

    // Get current user's vet profile if not specified
    let targetVetId = veterinarianId;
    if (!targetVetId && user.role === 'VETERINARIAN') {
      const myProfile = await prisma.veterinarianProfile.findUnique({
        where: { userId: user.id },
      });
      if (myProfile) targetVetId = myProfile.id;
    }

    const newTreatment = await prisma.treatmentRecord.create({
      data: {
        petId,
        appointmentId: appointmentId || null,
        veterinarianId: targetVetId || null,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        symptoms: symptoms.trim(),
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim(),
        weight: weight ? parseFloat(weight) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes: notes ? notes.trim() : null,
        ...(Array.isArray(prescriptions) && prescriptions.length > 0
          ? {
              prescriptions: {
                create: prescriptions.map((p: any) => ({
                  medication: p.medication.trim(),
                  dosage: p.dosage.trim(),
                  frequency: p.frequency ? p.frequency.trim() : null,
                  duration: p.duration.trim(),
                  instructions: p.instructions ? p.instructions.trim() : null,
                })),
              },
            }
          : {}),
      },
      include: {
        pet: true,
        prescriptions: true,
      },
    });

    // If an appointment was linked, mark it as COMPLETED
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' },
      });
    }

    // Update pet's recorded weight if provided
    if (weight) {
      await prisma.pet.update({
        where: { id: petId },
        data: { weight: parseFloat(weight) },
      });
    }

    // Notify pet owner
    await prisma.notification.create({
      data: {
        userId: pet.ownerId,
        title: 'New Clinical Medical Record',
        message: `Medical notes and diagnosis (${diagnosis}) recorded for ${pet.name}.`,
        type: 'TREATMENT',
        link: `/pets/${pet.id}`,
      },
    });

    if (followUpDate) {
      await prisma.notification.create({
        data: {
          userId: pet.ownerId,
          title: 'Follow-up Recommended',
          message: `A follow-up visit for ${pet.name} is recommended on ${new Date(followUpDate).toLocaleDateString()}.`,
          type: 'TREATMENT',
          link: '/appointments',
        },
      });
    }

    return apiSuccess(newTreatment, 201);
  } catch (error: any) {
    console.error('Error creating treatment record:', error);
    return apiError('Failed to save medical treatment record.', 500);
  }
}
