import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    try {
      // Create Supabase client for server-side
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get session from request
      const { data: { session } } = await supabase.auth.getSession();

      // If no session, redirect to login
      if (!session) {
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Optional: Check if user has admin role
      // You can add user metadata checks here
      // const isAdmin = session.user.user_metadata?.role === 'admin';
      // if (!isAdmin) {
      //   return NextResponse.redirect(new URL('/unauthorized', request.url));
      // }
    } catch (error) {
      console.error('Middleware auth error:', error);
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
