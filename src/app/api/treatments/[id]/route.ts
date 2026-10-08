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
    if (!user) return apiError('Unauthorized', 401);

    const treatment = await prisma.treatmentRecord.findUnique({
      where: { id: params.id },
      include: {
        pet: {
          include: { owner: true },
        },
        veterinarian: {
          include: { user: true },
        },
        appointment: true,
        prescriptions: true,
      },
    });

    if (!treatment) return apiError('Record not found', 404);

    if (user.role === 'OWNER' && treatment.pet.ownerId !== user.id) {
      return apiError('Forbidden', 403);
    }

    return apiSuccess(treatment);
  } catch (error: any) {
    console.error('Error fetching treatment:', error);
    return apiError('Failed to fetch treatment record', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    if (user.role === 'OWNER') {
      return apiError('Owners cannot edit medical records', 403);
    }

    const body = await req.json();
    const { symptoms, diagnosis, treatment, weight, temperature, followUpDate, notes } = body;

    const updated = await prisma.treatmentRecord.update({
      where: { id: params.id },
      data: {
        ...(symptoms && { symptoms: symptoms.trim() }),
        ...(diagnosis && { diagnosis: diagnosis.trim() }),
        ...(treatment && { treatment: treatment.trim() }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(temperature !== undefined && { temperature: temperature ? parseFloat(temperature) : null }),
        ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }),
        ...(notes !== undefined && { notes }),
      },
      include: { prescriptions: true },
    });

    return apiSuccess(updated);
  } catch (error: any) {
    console.error('Error updating treatment:', error);
    return apiError('Failed to update treatment record', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    if (user.role !== 'ADMIN') {
      return apiError('Only administrators can remove medical records', 403);
    }

    await prisma.treatmentRecord.delete({
      where: { id: params.id },
    });

    return apiSuccess({ message: 'Treatment record deleted' });
  } catch (error: any) {
    console.error('Error deleting treatment:', error);
    return apiError('Failed to delete treatment record', 500);
  }
}
