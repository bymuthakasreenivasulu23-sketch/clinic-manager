import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    if (user.role === 'OWNER') {
      return apiError('Owners cannot modify medical records.', 403);
    }

    const body = await req.json();
    const { status, nextDueDate, notes } = body;

    const updated = await prisma.vaccination.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(nextDueDate && { nextDueDate: new Date(nextDueDate) }),
        ...(notes !== undefined && { notes }),
      },
    });

    return apiSuccess(updated);
  } catch (error: any) {
    console.error('Error updating vaccination:', error);
    return apiError('Failed to update vaccination.', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    if (user.role === 'OWNER') {
      return apiError('Unauthorized', 403);
    }

    await prisma.vaccination.delete({
      where: { id: params.id },
    });

    return apiSuccess({ message: 'Vaccination record deleted' });
  } catch (error: any) {
    console.error('Error deleting vaccination:', error);
    return apiError('Failed to delete vaccination', 500);
  }
}
