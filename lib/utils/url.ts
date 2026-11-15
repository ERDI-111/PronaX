import { NextRequest } from 'next/server';

/**
 * Accurately determines the public URL of the application,
 * avoiding internal container ports like localhost:10000 on Render.com.
 */
export function getPublicBaseUrl(req?: NextRequest): string {
  // 1. Check Reverse Proxy forwarded headers (Render, Cloudflare, etc.)
  if (req) {
    const forwardedHost = req.headers.get('x-forwarded-host');
    const host = forwardedHost || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';

    if (host && !host.includes('localhost:10000') && !host.includes('127.0.0.1:10000')) {
      return `${proto}://${host}`;
    }
  }

  // 2. Check NEXT_PUBLIC_APP_URL environment variable
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost:10000')) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  // 3. Render production domain fallback
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    return 'https://pronax.onrender.com';
  }

  // 4. Local development default
  return 'http://localhost:3000';
}
