import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      return apiError('Unauthorized access', 403);
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() || '';

    const where: any = {};
    if (role && role !== 'ALL') where.role = role;
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        requestedRole: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            pets: true,
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return apiError('Failed to fetch user accounts', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return apiError('Only administrators can modify user permissions.', 403);
    }

    const body = await req.json();
    const { userId, role, status } = body;

    if (!userId) return apiError('User ID is required', 400);

    // Prevent deactivating own account
    if (userId === session.id && status === 'INACTIVE') {
      return apiError('Cannot deactivate your own administrator account', 400);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(status && { status }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return apiSuccess(updated);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return apiError('Failed to update user', 500);
  }
}
