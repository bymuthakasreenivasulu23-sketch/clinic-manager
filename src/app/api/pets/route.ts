import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const species = searchParams.get('species') || '';
    const ownerIdParam = searchParams.get('ownerId');

    const where: any = {};

    // If role is OWNER, strictly restrict to their own pets
    if (user.role === 'OWNER') {
      where.ownerId = user.id;
    } else if (ownerIdParam) {
      where.ownerId = ownerIdParam;
    }

    if (species && species !== 'ALL') {
      where.species = species;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { breed: { contains: search } },
        { microchipId: { contains: search } },
        { owner: { name: { contains: search } } },
      ];
    }

    const pets = await prisma.pet.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 3,
        },
        vaccinations: {
          orderBy: { nextDueDate: 'asc' },
        },
        treatmentRecords: {
          orderBy: { visitDate: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(pets);
  } catch (error: any) {
    console.error('Error fetching pets:', error);
    return apiError('Failed to fetch pets.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return apiError('Unauthorized', 401);
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
      ownerId,
    } = body;

    if (!name || !species || !breed || !gender) {
      return apiError('Name, species, breed, and gender are required.', 400);
    }

    // Determine target owner:
    // If user is OWNER, target owner is user.id.
    // If staff/admin and ownerId is provided, use that ownerId.
    const targetOwnerId = user.role === 'OWNER' ? user.id : (ownerId || user.id);

    const newPet = await prisma.pet.create({
      data: {
        name: name.trim(),
        species,
        breed: breed.trim(),
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        age: age ? parseInt(age, 10) : null,
        weight: weight ? parseFloat(weight) : null,
        color: color ? color.trim() : null,
        microchipId: microchipId ? microchipId.trim() : null,
        allergies: allergies ? allergies.trim() : null,
        existingConditions: existingConditions ? existingConditions.trim() : null,
        notes: notes ? notes.trim() : null,
        photo: photo || null,
        ownerId: targetOwnerId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return apiSuccess(newPet, 201);
  } catch (error: any) {
    console.error('Error creating pet:', error);
    return apiError('Failed to register pet profile.', 500);
  }
}
