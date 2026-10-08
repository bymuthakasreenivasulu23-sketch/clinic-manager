import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signJWT, COOKIE_NAME } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return apiError('Email and password are required.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return apiError('Invalid email or password.', 401);
    }

    if (user.status === 'INACTIVE') {
      return apiError('Your account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return apiError('Invalid email or password.', 401);
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
    };

    const token = await signJWT(payload);

    const response = apiSuccess({
      user: payload,
      message: 'Successfully logged in.',
    });

    // Set HTTP-only secure cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return apiError('Internal server error during authentication.', 500);
  }
}
