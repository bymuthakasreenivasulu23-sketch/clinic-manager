import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');
    const filter = searchParams.get('filter'); // due_today, due_7d, due_30d, overdue, all
    const search = searchParams.get('search')?.toLowerCase() || '';

    const where: any = {};

    if (user.role === 'OWNER') {
      where.pet = { ownerId: user.id };
    }

    if (petId) {
      where.petId = petId;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (filter === 'due_today') {
      where.nextDueDate = { gte: todayStart, lte: todayEnd };
    } else if (filter === 'due_7d') {
      where.nextDueDate = { gte: todayStart, lte: sevenDaysLater };
    } else if (filter === 'due_30d') {
      where.nextDueDate = { gte: todayStart, lte: thirtyDaysLater };
    } else if (filter === 'overdue') {
      where.nextDueDate = { lt: todayStart };
    }

    if (search) {
      where.OR = [
        { vaccineName: { contains: search } },
        { pet: { name: { contains: search } } },
        { batchNumber: { contains: search } },
      ];
    }

    const vaccinations = await prisma.vaccination.findMany({
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
      },
      orderBy: { nextDueDate: 'asc' },
    });

    return apiSuccess(vaccinations);
  } catch (error: any) {
    console.error('Error fetching vaccinations:', error);
    return apiError('Failed to fetch vaccinations.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    // Only Clinic Staff, Veterinarians, or Admin can record vaccinations
    if (user.role === 'OWNER') {
      return apiError('Only clinic veterinarians and staff can record vaccinations.', 403);
    }

    const body = await req.json();
    const {
      petId,
      vaccineName,
      vaccineType,
      dateAdministered,
      nextDueDate,
      dose,
      batchNumber,
      notes,
      veterinarianId,
      status,
    } = body;

    if (!petId || !vaccineName || !dateAdministered || !nextDueDate) {
      return apiError('Pet, vaccine name, date administered, and next due date are required.', 400);
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { owner: true },
    });

    if (!pet) return apiError('Pet not found', 404);

    const record = await prisma.vaccination.create({
      data: {
        petId,
        vaccineName: vaccineName.trim(),
        vaccineType: vaccineType ? vaccineType.trim() : null,
        dateAdministered: new Date(dateAdministered),
        nextDueDate: new Date(nextDueDate),
        dose: dose ? dose.trim() : null,
        batchNumber: batchNumber ? batchNumber.trim() : null,
        notes: notes ? notes.trim() : null,
        veterinarianId: veterinarianId || null,
        status: status || 'COMPLETED',
      },
      include: {
        pet: true,
      },
    });

    // Notify Pet Owner
    await prisma.notification.create({
      data: {
        userId: pet.ownerId,
        title: 'New Vaccination Logged',
        message: `${vaccineName} was administered to ${pet.name}. Next booster is scheduled for ${new Date(nextDueDate).toLocaleDateString()}.`,
        type: 'VACCINATION',
        link: '/vaccinations',
      },
    });

    return apiSuccess(record, 201);
  } catch (error: any) {
    console.error('Error recording vaccination:', error);
    return apiError('Failed to record vaccination.', 500);
  }
}
