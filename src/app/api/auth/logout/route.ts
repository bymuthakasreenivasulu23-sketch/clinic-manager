import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';
import { apiSuccess } from '@/lib/utils';

export async function POST() {
  const response = apiSuccess({ message: 'Logged out successfully.' });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
