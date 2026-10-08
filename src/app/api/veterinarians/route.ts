import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET() {
  try {
    const veterinarians = await prisma.veterinarianProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        appointments: {
          take: 5,
          orderBy: { appointmentDate: 'desc' },
          include: { pet: true },
        },
        _count: {
          select: {
            appointments: true,
            vaccinations: true,
            treatmentRecords: true,
          },
        },
      },
      orderBy: { experience: 'desc' },
    });

    return apiSuccess(veterinarians);
  } catch (error: any) {
    console.error('Error fetching veterinarians:', error);
    return apiError('Failed to fetch veterinarians.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return apiError('Only administrators can add veterinarian staff.', 403);
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      specialization,
      licenseNumber,
      experience,
      availability,
      bio,
      avatar,
    } = body;

    if (!name || !email || !specialization || !licenseNumber) {
      return apiError('Name, email, specialization, and license number are required.', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return apiError('User with this email already exists.', 409);
    }

    const hashedPassword = await hashPassword(password || 'Vet123!Safe');

    // Create user and profile in a transaction
    const newVet = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone ? phone.trim() : null,
          password: hashedPassword,
          role: 'VETERINARIAN',
          status: 'ACTIVE',
        },
      });

      const profile = await tx.veterinarianProfile.create({
        data: {
          userId: user.id,
          specialization: specialization.trim(),
          licenseNumber: licenseNumber.trim(),
          experience: experience ? parseInt(experience, 10) : 1,
          availability: availability || 'Mon - Fri: 9:00 AM - 5:00 PM',
          bio: bio || null,
          avatar: avatar || null,
        },
        include: { user: true },
      });

      return profile;
    });

    return apiSuccess(newVet, 201);
  } catch (error: any) {
    console.error('Error adding veterinarian:', error);
    return apiError('Failed to create veterinarian profile.', 500);
  }
}
