import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return apiSuccess(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return apiError('Failed to fetch notifications.', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: { id: notificationId, userId: user.id },
        data: { isRead: true },
      });
    } else {
      // Mark all as read for this user
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    }

    return apiSuccess({ message: 'Notifications marked as read' });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return apiError('Failed to update notifications.', 500);
  }
}
