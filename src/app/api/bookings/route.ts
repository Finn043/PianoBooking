import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { APP_CONFIG } from '@/lib/constants';
import { createCalendarEvent, refreshAccessToken, formatBookingAsCalendarEvent } from '@/lib/google-calendar/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    let query = supabaseAdmin
      .from('bookings')
      .select('*, slots(*), students(*)')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('slots.start_time', startDate);
    }
    if (endDate) {
      query = query.lte('slots.start_time', endDate);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: 'Server error' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, studentName, studentEmail, packageId, notes } = body;

    // Validate input
    if (!slotId || !studentName || !studentEmail) {
      return NextResponse.json(
        { success: false, error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Check slot availability
    const { data: slot, error: slotError } = await supabaseAdmin
      .from('slots')
      .select('*')
      .eq('id', slotId)
      .single();

    if (slotError || !slot || !slot.is_available) {
      return NextResponse.json(
        { success: false, error: { message: 'Slot not available' } },
        { status: 400 }
      );
    }

    // Check if slot already has a booking
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('slot_id', slotId)
      .neq('status', 'cancelled')
      .single();

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: { message: 'Slot already booked' } },
        { status: 400 }
      );
    }

    // Find or create student
    let studentId: string;
    const { data: existingStudent } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('email', studentEmail)
      .single();

    if (existingStudent) {
      studentId = existingStudent.id;
    } else {
      // Create new student (without package dependency for now)
      const { data: newStudent, error: studentError } = await supabaseAdmin
        .from('students')
        .insert({
          name: studentName,
          email: studentEmail,
          remaining_sessions: 0,
          total_purchased: 0,
        })
        .select('id')
        .single();

      if (studentError || !newStudent) {
        return NextResponse.json(
          { success: false, error: { message: 'Failed to create student' } },
          { status: 500 }
        );
      }
      studentId = newStudent.id;
    }

    // Check auto-confirm setting
    const autoConfirm = true; // Default to true for now

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        slot_id: slotId,
        student_id: studentId,
        status: autoConfirm ? 'confirmed' : 'pending',
        notes: notes || null,
      })
      .select('*, slots(*), students(*)')
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to create booking' } },
        { status: 500 }
      );
    }

    // Update slot availability
    await supabaseAdmin
      .from('slots')
      .update({ is_available: false })
      .eq('id', slotId);

    // Create Google Calendar event if auto-confirmed
    let googleEventId = null;
    if (autoConfirm) {
      try {
        // Get admin's Google Calendar tokens (using admin email from env or first admin user)
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@pianoclass.com';

        const { data: adminUser } = await supabaseAdmin
          .from('students')
          .select('google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id')
          .eq('email', adminEmail)
          .single();

        if (adminUser?.google_access_token) {
          let accessToken = adminUser.google_access_token;

          // Check if token needs refresh
          if (adminUser.google_token_expires_at && new Date(adminUser.google_token_expires_at) < new Date()) {
            const tokens = await refreshAccessToken(adminUser.google_refresh_token);
            accessToken = tokens.access_token;

            // Update stored tokens
            await supabaseAdmin
              .from('students')
              .update({
                google_access_token: tokens.access_token,
                google_refresh_token: tokens.refresh_token || adminUser.google_refresh_token,
                google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
              })
              .eq('email', adminEmail);
          }

          // Create calendar event
          const eventData = formatBookingAsCalendarEvent(
            studentName,
            studentEmail,
            slot.start_time,
            slot.end_time
          );

          googleEventId = await createCalendarEvent(accessToken, eventData);

          // Update booking with event ID
          await supabaseAdmin
            .from('bookings')
            .update({ google_calendar_event_id: googleEventId })
            .eq('id', booking.id);
        }
      } catch (calendarError) {
        console.error('Google Calendar sync error:', calendarError);
        // Don't fail booking if calendar sync fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: { ...booking, google_calendar_event_id: googleEventId },
        message: autoConfirm
          ? 'Booking confirmed! Check your email for confirmation.'
          : 'Booking submitted! You will receive a confirmation email shortly.',
      },
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Server error' } },
      { status: 500 }
    );
  }
}
