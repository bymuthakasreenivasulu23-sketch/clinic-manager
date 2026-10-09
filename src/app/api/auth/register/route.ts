import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signJWT, COOKIE_NAME } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = ['OWNER', 'VETERINARIAN', 'STAFF', 'ADMIN'] as const;
type RegistrationRole = typeof ALLOWED_ROLES[number];

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, confirmPassword, role = 'OWNER' } = await req.json();

    // 1. Validate required fields
    if (!name || !email || !password) {
      return apiError('Name, email, and password are required.', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters long.', 400);
    }

    if (confirmPassword && password !== confirmPassword) {
      return apiError('Passwords do not match.', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError('Please provide a valid email address.', 400);
    }

    // 2. Validate selected role
    const normalizedRole = (role || 'OWNER').toUpperCase().trim() as RegistrationRole;
    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      return apiError('Invalid account type selected. Please choose Pet Owner, Veterinarian, Clinic Staff, or Admin.', 400);
    }

    // 3. Security Rule: Admin accounts CANNOT be created via public registration
    if (normalizedRole === 'ADMIN') {
      return apiError(
        'Administrator accounts cannot be created via public registration. An authorized clinic administrator must provision or invite your account.',
        403
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return apiError('An account with this email address already exists.', 409);
    }

    const hashedPassword = await hashPassword(password);

    // 4. Security Enforcement:
    // Public self-registration ALWAYS creates an active OWNER account in the database.
    // Privileged roles (VETERINARIAN, STAFF) are stored in `requestedRole` awaiting administrator verification.
    const isPrivilegedRequest = normalizedRole === 'VETERINARIAN' || normalizedRole === 'STAFF';
    const effectiveRole = 'OWNER';

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        role: effectiveRole,
        requestedRole: normalizedRole,
        status: 'ACTIVE',
      },
    });

    // 5. Create notifications based on role
    if (isPrivilegedRequest) {
      const displayRoleName = normalizedRole === 'VETERINARIAN' ? 'Veterinarian' : 'Clinic Staff';

      // Notification for the newly registered user
      await prisma.notification.create({
        data: {
          userId: newUser.id,
          title: `${displayRoleName} Access Under Review`,
          message: `Your request for ${displayRoleName} privileges has been queued for administrator verification. You currently have Pet Owner access while your credentials are being reviewed.`,
          type: 'SYSTEM',
          link: '/dashboard',
        },
      });

      // Notification for existing administrators
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: 'Staff Credential Approval Request',
            message: `${name.trim()} (${normalizedEmail}) registered and requested ${displayRoleName} access. You can review and upgrade their role in User Management.`,
            type: 'SYSTEM',
            link: '/admin/users',
          })),
        });
      }
    } else {
      // Standard Pet Owner welcome notification
      await prisma.notification.create({
        data: {
          userId: newUser.id,
          title: 'Welcome to Veterinary Clinic Manager!',
          message: 'Your account is ready. Add your first pet profile to get started.',
          type: 'SYSTEM',
          link: '/pets',
        },
      });
    }

    const payload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as any,
    };

    const token = await signJWT(payload);

    const successMessage = isPrivilegedRequest
      ? `Registration successful! Your request for ${normalizedRole === 'VETERINARIAN' ? 'Veterinarian' : 'Clinic Staff'} access has been submitted for administrator approval. You have been granted standard access in the meantime.`
      : 'Registration successful! Welcome to Veterinary Clinic Manager.';

    const response = apiSuccess(
      {
        user: payload,
        requestedRole: normalizedRole,
        message: successMessage,
      },
      201
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return apiError('Internal server error during registration.', 500);
  }
}
