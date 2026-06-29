import { createClient } from '@/lib/supabase/server';
import { createCalendarEvent, listCalendarEvents, deleteCalendarEvent, refreshAccessToken } from '@/lib/google-calendar/client';
import { NextResponse } from 'next/server';
import { formatBookingAsCalendarEvent } from '@/lib/google-calendar/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, slotId, bookingId, studentId } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get admin's Google Calendar tokens
    const { data: admin, error: adminError } = await supabase
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

      // Update stored tokens
      await supabase
        .from('students')
        .update({
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token || admin.google_refresh_token,
          google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        })
        .eq('email', user.email);
    }

    // Handle different sync actions
    switch (action) {
      case 'create_booking': {
        // Create calendar event for booking
        const { data: booking } = await supabase
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

        // Update booking with event ID
        await supabase
          .from('bookings')
          .update({ google_calendar_event_id: eventId })
          .eq('id', bookingId);

        return NextResponse.json({ success: true, eventId });
      }

      case 'delete_booking': {
        // Delete calendar event
        const { data: booking } = await supabase
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
        // Sync slots from Google Calendar
        const { start, end } = body;

        const events = await listCalendarEvents(accessToken, start, end);

        // Process events and update slots
        // This would need more complex logic to match events to slots
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ connected: false });
    }

    // Get admin's Google Calendar status
    const { data: admin, error } = await supabase
      .from('students')
      .select('google_calendar_enabled, google_calendar_id')
      .eq('email', user.email)
      .single();

    if (error) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: admin?.google_calendar_enabled || false,
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

    // Remove Google Calendar tokens
    const { error } = await supabase
      .from('students')
      .update({
        google_access_token: null,
        google_refresh_token: null,
        google_token_expires_at: null,
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
