import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    const petId = params.id;
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        appointments: {
          include: {
            veterinarian: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
          orderBy: { appointmentDate: 'desc' },
        },
        vaccinations: {
          include: {
            veterinarian: {
              include: { user: { select: { name: true } } },
            },
          },
          orderBy: { nextDueDate: 'asc' },
        },
        treatmentRecords: {
          include: {
            veterinarian: {
              include: { user: { select: { name: true } } },
            },
            prescriptions: true,
          },
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    if (!pet) {
      return apiError('Pet profile not found.', 404);
    }

    // Role check: If OWNER, ensure pet belongs to user
    if (user.role === 'OWNER' && pet.ownerId !== user.id) {
      return apiError('Access denied to this pet record.', 403);
    }

    return apiSuccess(pet);
  } catch (error: any) {
    console.error('Error fetching pet:', error);
    return apiError('Failed to fetch pet details.', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    const petId = params.id;
    const existingPet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!existingPet) {
      return apiError('Pet not found.', 404);
    }

    if (user.role === 'OWNER' && existingPet.ownerId !== user.id) {
      return apiError('Forbidden', 403);
    }

    const body = await req.json();
    const {
      name,
      species,
      breed,
      gender,
      dateOfBirth,
      age,
      weight,
      color,
      microchipId,
      allergies,
      existingConditions,
      notes,
      photo,
    } = body;

    const updated = await prisma.pet.update({
      where: { id: petId },
      data: {
        ...(name && { name: name.trim() }),
        ...(species && { species }),
        ...(breed && { breed: breed.trim() }),
        ...(gender && { gender }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(age !== undefined && { age: age ? parseInt(age, 10) : null }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(color !== undefined && { color: color?.trim() }),
        ...(microchipId !== undefined && { microchipId: microchipId?.trim() }),
        ...(allergies !== undefined && { allergies: allergies?.trim() }),
        ...(existingConditions !== undefined && { existingConditions: existingConditions?.trim() }),
        ...(notes !== undefined && { notes: notes?.trim() }),
        ...(photo !== undefined && { photo }),
      },
    });

    return apiSuccess(updated);
  } catch (error: any) {
    console.error('Error updating pet:', error);
    return apiError('Failed to update pet record.', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    const petId = params.id;
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      return apiError('Pet not found.', 404);
    }

    if (user.role === 'OWNER' && pet.ownerId !== user.id) {
      return apiError('Forbidden', 403);
    }

    await prisma.pet.delete({
      where: { id: petId },
    });

    return apiSuccess({ message: 'Pet profile removed successfully.' });
  } catch (error: any) {
    console.error('Error deleting pet:', error);
    return apiError('Failed to delete pet.', 500);
  }
}
