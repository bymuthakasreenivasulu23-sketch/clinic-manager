import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    const appt = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        pet: true,
        owner: { select: { id: true, name: true, email: true, phone: true } },
        veterinarian: { include: { user: true } },
        treatmentRecord: { include: { prescriptions: true } },
      },
    });

    if (!appt) return apiError('Appointment not found', 404);
    if (user.role === 'OWNER' && appt.ownerId !== user.id) {
      return apiError('Forbidden', 403);
    }

    return apiSuccess(appt);
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    return apiError('Failed to fetch appointment', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    const apptId = params.id;
    const existing = await prisma.appointment.findUnique({
      where: { id: apptId },
      include: { pet: true, owner: true },
    });

    if (!existing) return apiError('Appointment not found', 404);

    const body = await req.json();
    const { status, appointmentDate, timeSlot, veterinarianId, notes } = body;

    // Permissions:
    // If user is OWNER, they can only CANCEL their own pending/confirmed appointment
    if (user.role === 'OWNER') {
      if (existing.ownerId !== user.id) {
        return apiError('Forbidden', 403);
      }
      if (status && status !== 'CANCELLED') {
        return apiError('Owners can only cancel appointments. Contact clinic for changes.', 403);
      }
    }

    const updateData: any = {};
    let notificationTitle = '';
    let notificationMessage = '';

    if (status) {
      updateData.status = status;
      if (status === 'CONFIRMED') {
        notificationTitle = 'Appointment Confirmed';
        notificationMessage = `Your appointment for ${existing.pet.name} has been confirmed.`;
      } else if (status === 'COMPLETED') {
        notificationTitle = 'Appointment Completed';
        notificationMessage = `Your visit with ${existing.pet.name} has been completed. Check medical records for visit summary.`;
      } else if (status === 'CANCELLED') {
        notificationTitle = 'Appointment Cancelled';
        notificationMessage = `The appointment for ${existing.pet.name} has been cancelled.`;
      } else if (status === 'REJECTED') {
        notificationTitle = 'Appointment Declined';
        notificationMessage = `The appointment request for ${existing.pet.name} could not be accepted. Please choose another time slot.`;
      }
    }

    if (appointmentDate || timeSlot) {
      const newDate = appointmentDate ? new Date(appointmentDate) : existing.appointmentDate;
      const newSlot = timeSlot || existing.timeSlot;
      const vetToCheck = veterinarianId !== undefined ? veterinarianId : existing.veterinarianId;

      // Check slot conflict if veterinarian is assigned
      if (vetToCheck) {
        const conflict = await prisma.appointment.findFirst({
          where: {
            id: { not: apptId },
            veterinarianId: vetToCheck,
            appointmentDate: {
              gte: startOfDay(newDate),
              lte: endOfDay(newDate),
            },
            timeSlot: newSlot,
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        });

        if (conflict) {
          return apiError('This slot is already booked for the chosen veterinarian.', 409);
        }
      }

      updateData.appointmentDate = newDate;
      updateData.timeSlot = newSlot;

      if (!status) {
        notificationTitle = 'Appointment Rescheduled';
        notificationMessage = `Your appointment for ${existing.pet.name} was rescheduled to ${newDate.toLocaleDateString()} at ${newSlot}.`;
      }
    }

    if (veterinarianId !== undefined) {
      updateData.veterinarianId = veterinarianId || null;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updated = await prisma.appointment.update({
      where: { id: apptId },
      data: updateData,
      include: {
        pet: true,
        veterinarian: { include: { user: true } },
      },
    });

    // Send notification to Owner if status or schedule changed
    if (notificationTitle) {
      await prisma.notification.create({
        data: {
          userId: existing.ownerId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'APPOINTMENT',
          link: '/appointments',
        },
      });
    }

    return apiSuccess(updated);
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return apiError('Failed to update appointment.', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return apiError('Unauthorized', 401);

    const appt = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appt) return apiError('Appointment not found', 404);

    if (user.role === 'OWNER' && appt.ownerId !== user.id) {
      return apiError('Forbidden', 403);
    }

    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return apiSuccess({ message: 'Appointment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    return apiError('Failed to delete appointment', 500);
  }
}
