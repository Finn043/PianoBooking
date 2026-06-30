import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getAccessToken } from '@/lib/google-calendar/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Use server client only for auth check (identity)
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      new URL('/login?error=not_authenticated', request.url)
    );
  }

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
    const tokens = await getAccessToken(code);

    // Use supabaseAdmin (service role) to bypass RLS
    // Use upsert to create admin row if it doesn't exist in students table
    const { error: upsertError } = await supabaseAdmin
      .from('students')
      .upsert(
        {
          email: user.email,
          name: user.email?.split('@')[0] || 'Admin',
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
          google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          google_calendar_enabled: true,
          google_calendar_id: 'primary',
          remaining_sessions: 0,
          total_purchased: 0,
        },
        { onConflict: 'email' }
      );

    if (upsertError) {
      console.error('Failed to store Google tokens:', upsertError);
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
