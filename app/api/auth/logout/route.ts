import { NextResponse } from 'next/server';
import { LOGIN_COOKIE, SESSION_COOKIE } from '@/lib/auth/session';

/** Signs the visitor out by clearing the login cookies (including the httpOnly one). */
export async function POST() {
  const response = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  response.cookies.set(LOGIN_COOKIE, '', { sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
