/**
 * Session management using JWT + HTTP-only cookies
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from './env';

const COOKIE_NAME = 'primer_session';
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  return new TextEncoder().encode(env().JWT_SECRET);
}

/**
 * Create a session token and set it as an HTTP-only cookie
 */
export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL,
    path: '/',
  });

  return token;
}

/**
 * Get the current session from cookies
 * Returns the userId if valid, null otherwise
 */
export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return (payload.userId as string) || null;
  } catch {
    return null;
  }
}

/**
 * Destroy the current session by clearing the cookie
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
