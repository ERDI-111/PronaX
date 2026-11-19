import { NextRequest } from 'next/server';

/** Proxies may append values ("https, http"); the first one is the client-facing value. */
function firstHeaderValue(value: string | null): string {
  return (value || '').split(',')[0].trim();
}

function isValidHost(host: string): boolean {
  return /^(\[[0-9a-f:.]+\]|[a-z0-9.-]+)(:\d{1,5})?$/i.test(host);
}

function isInternalRenderHost(host: string): boolean {
  return host.includes('localhost:10000') || host.includes('127.0.0.1:10000');
}

function isLocalHost(host: string): boolean {
  const name = host.replace(/:\d+$/, '').toLowerCase();
  return name === 'localhost' || name === '127.0.0.1' || name === '[::1]';
}

/**
 * Accurately determines the public URL of the application,
 * avoiding internal container ports like localhost:10000 on Render.com.
 */
export function getPublicBaseUrl(req?: NextRequest): string {
  // 1. Check Reverse Proxy forwarded headers (Render, Cloudflare, etc.)
  if (req) {
    const host = [req.headers.get('x-forwarded-host'), req.headers.get('host')]
      .map(firstHeaderValue)
      .find((candidate) => candidate && isValidHost(candidate) && !isInternalRenderHost(candidate));

    if (host) {
      const forwardedProto = firstHeaderValue(req.headers.get('x-forwarded-proto')).toLowerCase();
      const proto =
        forwardedProto === 'http' || forwardedProto === 'https'
          ? forwardedProto
          : isLocalHost(host)
            ? 'http'
            : 'https';
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
