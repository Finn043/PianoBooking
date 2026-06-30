import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createCalendarEvent, listCalendarEvents, deleteCalendarEvent, refreshAccessToken } from '@/lib/google-calendar/client';
import { NextResponse } from 'next/server';
import { formatBookingAsCalendarEvent } from '@/lib/google-calendar/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, slotId, bookingId, studentId } = body;

    // Use server client only for auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use supabaseAdmin (service role) to bypass RLS on students table
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('students')
      .select('google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id')
      .eq('email', user.email)
      .single();

    if (adminError || !admin?.google_access_token) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }

    let accessToken = admin.google_access_token;

    // Check if token needs refresh
    if (admin.google_token_expires_at && new Date(admin.google_token_expires_at) < new Date()) {
      const tokens = await refreshAccessToken(admin.google_refresh_token);
      accessToken = tokens.access_token;

      await supabaseAdmin
        .from('students')
        .update({
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token || admin.google_refresh_token,
          google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        })
        .eq('email', user.email);
    }

    switch (action) {
      case 'create_booking': {
        const { data: booking } = await supabaseAdmin
          .from('bookings')
          .select(`
            *,
            slots:slot_id (*),
            students:student_id (*)
          `)
          .eq('id', bookingId)
          .single();

        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const eventData = formatBookingAsCalendarEvent(
          booking.students.name,
          booking.students.email,
          booking.slots.start_time,
          booking.slots.end_time
        );

        const eventId = await createCalendarEvent(accessToken, eventData);

        await supabaseAdmin
          .from('bookings')
          .update({ google_calendar_event_id: eventId })
          .eq('id', bookingId);

        return NextResponse.json({ success: true, eventId });
      }

      case 'delete_booking': {
        const { data: booking } = await supabaseAdmin
          .from('bookings')
          .select('google_calendar_event_id')
          .eq('id', bookingId)
          .single();

        if (!booking?.google_calendar_event_id) {
          return NextResponse.json({ error: 'No calendar event found' }, { status: 404 });
        }

        await deleteCalendarEvent(accessToken, booking.google_calendar_event_id);

        return NextResponse.json({ success: true });
      }

      case 'sync_slots': {
        const { start, end } = body;

        const events = await listCalendarEvents(accessToken, start, end);

        return NextResponse.json({ success: true, events: events.length });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Use server client for auth check only
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ connected: false });
    }

    // Use supabaseAdmin to bypass RLS
    const { data: admin, error } = await supabaseAdmin
      .from('students')
      .select('google_access_token, google_calendar_id')
      .eq('email', user.email)
      .single();

    if (error) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: !!admin?.google_access_token,
      calendarId: admin?.google_calendar_id || null,
    });
  } catch (error) {
    console.error('Calendar status check error:', error);
    return NextResponse.json({ connected: false });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use supabaseAdmin to bypass RLS
    const { error } = await supabaseAdmin
      .from('students')
      .update({
        google_access_token: null,
        google_refresh_token: null,
        google_token_expires_at: null,
        google_calendar_id: null,
        google_calendar_enabled: false,
      })
      .eq('email', user.email);

    if (error) {
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Calendar disconnect error:', error);
    return NextResponse.json({ error: 'Disconnect failed' }, { status: 500 });
  }
}
