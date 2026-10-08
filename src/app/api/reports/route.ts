import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'VETERINARIAN')) {
      return apiError('Unauthorized', 403);
    }

    // 1. Overall metric counts
    const totalOwners = await prisma.user.count({ where: { role: 'OWNER' } });
    const totalPets = await prisma.pet.count();
    const totalVets = await prisma.veterinarianProfile.count();
    const totalAppointments = await prisma.appointment.count();
    const pendingAppointments = await prisma.appointment.count({ where: { status: 'PENDING' } });
    const confirmedAppointments = await prisma.appointment.count({ where: { status: 'CONFIRMED' } });
    const completedAppointments = await prisma.appointment.count({ where: { status: 'COMPLETED' } });
    
    const now = new Date();
    const overdueVaccinations = await prisma.vaccination.count({
      where: { nextDueDate: { lt: now } },
    });
    const administeredVaccinations = await prisma.vaccination.count();
    const completedTreatments = await prisma.treatmentRecord.count();

    // 2. Monthly Trend (Past 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const label = format(monthDate, 'MMM yyyy');

      const apptsCount = await prisma.appointment.count({
        where: { createdAt: { gte: start, lte: end } },
      });

      const petsCount = await prisma.pet.count({
        where: { createdAt: { gte: start, lte: end } },
      });

      const vaccsCount = await prisma.vaccination.count({
        where: { createdAt: { gte: start, lte: end } },
      });

      const treatsCount = await prisma.treatmentRecord.count({
        where: { createdAt: { gte: start, lte: end } },
      });

      monthlyData.push({
        month: label,
        appointments: apptsCount,
        pets: petsCount,
        vaccinations: vaccsCount,
        treatments: treatsCount,
      });
    }

    // 3. Species breakdown
    const speciesGroups = await prisma.pet.groupBy({
      by: ['species'],
      _count: { id: true },
    });

    const speciesDistribution = speciesGroups.map((g) => ({
      name: g.species,
      count: g._count.id,
    }));

    // 4. Appointment Status Breakdown
    const statusGroups = await prisma.appointment.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const statusDistribution = statusGroups.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));

    // 5. Common Diagnoses / Treatment types
    const treatments = await prisma.treatmentRecord.findMany({
      select: { diagnosis: true },
      take: 50,
    });

    const diagnosisMap: Record<string, number> = {};
    treatments.forEach((t) => {
      // Shorten diagnosis category
      const words = t.diagnosis.split(' ').slice(0, 3).join(' ');
      diagnosisMap[words] = (diagnosisMap[words] || 0) + 1;
    });

    const commonDiagnoses = Object.entries(diagnosisMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return apiSuccess({
      overview: {
        totalOwners,
        totalPets,
        totalVets,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        overdueVaccinations,
        administeredVaccinations,
        completedTreatments,
      },
      monthlyTrends: monthlyData,
      speciesDistribution,
      statusDistribution,
      commonDiagnoses,
    });
  } catch (error: any) {
    console.error('Reports error:', error);
    return apiError('Failed to generate reports', 500);
  }
}
