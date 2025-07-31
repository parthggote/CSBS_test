import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Log for debugging
  console.log('Middleware:', { pathname, hasToken: !!token, role: token?.role });

  // Skip NextAuth API routes and static files
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.includes('/api/auth/callback')
  ) {
    return NextResponse.next();
  }

  // If user is authenticated
  if (token) {
    // Redirect from auth pages to appropriate dashboard
    if (pathname === '/login' || pathname === '/signup') {
      const redirectUrl = token.role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  } else {
    // If user is not authenticated
    // Redirect from protected pages to login (without callbackUrl to prevent loops)
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/login', request.url);
      // Don't add callbackUrl to prevent infinite loops
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/signup']
}; 