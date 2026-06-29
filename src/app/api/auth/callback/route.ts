import { createClient } from '@/lib/supabase/server';
import { getAccessToken } from '@/lib/google-calendar/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const supabase = await createClient();

  // Check for user authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      new URL('/login?error=not_authenticated', request.url)
    );
  }

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/settings?calendar_error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/admin/settings?calendar_error=no_code', request.url)
    );
  }

  try {
    // Exchange authorization code for access token
    const tokens = await getAccessToken(code);

    // Store or update tokens in students table (matched by email)
    const { error: updateError } = await supabase
      .from('students')
      .update({
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        google_calendar_enabled: true,
        google_calendar_id: 'primary',
      })
      .eq('email', user.email);

    if (updateError) {
      console.error('Failed to store Google tokens:', updateError);
      return NextResponse.redirect(
        new URL('/admin/settings?calendar_error=store_failed', request.url)
      );
    }

    return NextResponse.redirect(
      new URL('/admin/settings?calendar_success=connected', request.url)
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/admin/settings?calendar_error=exchange_failed', request.url)
    );
  }
}
