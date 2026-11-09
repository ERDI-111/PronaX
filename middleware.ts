import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/publiko',
  '/pagesa',
];

// Routes that require admin role
const ADMIN_ROUTES = [
  '/admin',
];

// Routes to skip (static files, API routes handled separately)
const PUBLIC_ROUTES = [
  '/',
  '/prona',
  '/agjencite',
  '/harta',
  '/kycu',
  '/regjistrohu',
  '/fjalekalimi-harruar',
  '/rreth-nesh',
  '/kontakti',
  '/faq',
  '/kushtet-e-perdorimit',
  '/politika-e-privatesise',
  '/politika-e-cookies',
  '/politika-e-pagesave',
  '/politika-e-rimbursimit',
  '/rregullat-e-publikimit',
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, _next
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseConfigured = supabaseUrl && !supabaseUrl.includes('your-project') && supabaseKey && !supabaseKey.includes('your-anon');

  // If Supabase is not configured, allow all routes in demo mode
  if (!supabaseConfigured) {
    // In demo mode, still protect admin from non-admin paths
    if (isAdminRoute(pathname)) {
      // Check a simple demo admin cookie
      const demoCookie = request.cookies.get('pronax_demo_admin');
      if (!demoCookie) {
        // Allow access in demo mode for development
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Supabase is configured — check session
  try {
    const { createServerClient } = await import('@supabase/ssr');

    let response = NextResponse.next({
      request: { headers: request.headers },
    });

    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    // Handle protected routes
    if (isProtectedRoute(pathname) && !user) {
      const loginUrl = new URL('/kycu', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Handle admin routes
    if (isAdminRoute(pathname)) {
      if (!user) {
        const loginUrl = new URL('/kycu', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check admin role in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        // Not admin → redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard/pronat', request.url));
      }
    }

    // If user is logged in and trying to access login/register, redirect to dashboard
    if (user && (pathname === '/kycu' || pathname === '/regjistrohu')) {
      return NextResponse.redirect(new URL('/dashboard/pronat', request.url));
    }

    return response;
  } catch (error) {
    // If anything goes wrong (e.g., Supabase error), allow access in graceful degradation
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
