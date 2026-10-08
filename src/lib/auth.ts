import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SECRET_KEY = process.env.SESSION_SECRET || 'veterinary_clinic_manager_super_secure_secret_key_2026_xyz123';
const key = new TextEncoder().encode(SECRET_KEY);

export const COOKIE_NAME = 'vet_session';

export interface SessionPayload {
  id: string;
  email: string;
  role: 'OWNER' | 'VETERINARIAN' | 'STAFF' | 'ADMIN';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJWT(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyJWT(token);
  } catch {
    return null;
  }
}

export async function requireAuth(allowedRoles?: string[]): Promise<{ user: SessionPayload } | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }
  return { user };
}
