import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signJWT, COOKIE_NAME } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, confirmPassword } = await req.json();

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

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return apiError('An account with this email address already exists.', 409);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        role: 'OWNER', // Public registration defaults to OWNER
        status: 'ACTIVE',
      },
    });

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: 'Welcome to Veterinary Clinic Manager!',
        message: 'Your account is ready. Add your first pet profile to get started.',
        type: 'SYSTEM',
        link: '/pets',
      },
    });

    const payload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as any,
    };

    const token = await signJWT(payload);

    const response = apiSuccess(
      {
        user: payload,
        message: 'Registration successful! Welcome to Veterinary Clinic Manager.',
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
