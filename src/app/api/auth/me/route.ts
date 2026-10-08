import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return apiError('Unauthorized', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      veterinarianProfile: true,
    },
  });

  if (!user || user.status === 'INACTIVE') {
    return apiError('User not found or inactive', 401);
  }

  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  });

  return apiSuccess({
    user,
    unreadNotifications: unreadCount,
  });
}
