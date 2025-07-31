import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  const { pathname } = request.nextUrl;

  // Log for debugging
  console.log('Middleware:', { pathname, hasToken: !!token, role: token?.role, email: token?.email });

  // Skip NextAuth API routes and static files
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.includes('/api/auth/callback') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Skip static files
  ) {
    return NextResponse.next();
  }

  // Allow access to dashboard during authentication process
  // This prevents redirect loops during Google OAuth
  if (pathname === '/dashboard' && !token) {
    // Don't redirect to login immediately, let the page handle authentication
    return NextResponse.next();
  }

  // If user is authenticated
  if (token) {
    // Redirect from auth pages to appropriate dashboard
    if (pathname === '/login' || pathname === '/signup') {
      const redirectUrl = token.role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    // Handle root path redirects for authenticated users
    if (pathname === '/') {
      const redirectUrl = token.role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    // Handle role-based access to protected routes
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      // Non-admin users trying to access admin pages
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (pathname.startsWith('/dashboard') && token.role === 'admin') {
      // Admin users accessing dashboard, redirect to admin
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  } else {
    // If user is not authenticated
    // Only redirect from protected pages to login, not from auth callback
    if ((pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) && 
        !pathname.includes('/api/auth/callback')) {
      const loginUrl = new URL('/login', request.url);
      // Don't add callbackUrl to prevent infinite loops
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/dashboard/:path*', '/login', '/signup']
}; 
