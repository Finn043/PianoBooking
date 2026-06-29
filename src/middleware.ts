import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Check for auth cookie or header
    const authCookie = request.cookies.get('adminAuth');
    const authHeader = request.headers.get('authorization');

    // For demo: check localStorage equivalent via cookie
    // In production: validate JWT/session properly
    if (!authCookie && !authHeader) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
