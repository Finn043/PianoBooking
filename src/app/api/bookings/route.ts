import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { APP_CONFIG } from '@/lib/constants';
import { createCalendarEvent, refreshAccessToken, formatBookingAsCalendarEvent } from '@/lib/google-calendar/client';
import { sendBookingConfirmationEmail } from '@/lib/email/notifications';

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

    // Send booking confirmation email
    await sendBookingConfirmationEmail(
      booking.students.name,
      booking.students.email,
      booking.slots.start_time,
      booking.slots.end_time
    );

    // Create Google Calendar events if auto-confirmed
    let adminGoogleEventId = null;
    let studentGoogleEventId = null;

    if (autoConfirm) {
      try {
        // 1. Create event in admin's calendar
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

          // Create calendar event in admin's calendar
          const eventData = formatBookingAsCalendarEvent(
            studentName,
            studentEmail,
            slot.start_time,
            slot.end_time
          );

          adminGoogleEventId = await createCalendarEvent(accessToken, eventData);
          console.log('✅ Admin calendar event created:', adminGoogleEventId);
        }

        // 2. Create event in student's calendar (if they have Google Calendar connected)
        const { data: studentUser } = await supabaseAdmin
          .from('students')
          .select('google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id')
          .eq('email', studentEmail)
          .single();

        if (studentUser?.google_access_token) {
          let accessToken = studentUser.google_access_token;

          // Check if token needs refresh
          if (studentUser.google_token_expires_at && new Date(studentUser.google_token_expires_at) < new Date()) {
            const tokens = await refreshAccessToken(studentUser.google_refresh_token);
            accessToken = tokens.access_token;

            // Update stored tokens
            await supabaseAdmin
              .from('students')
              .update({
                google_access_token: tokens.access_token,
                google_refresh_token: tokens.refresh_token || studentUser.google_refresh_token,
                google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
              })
              .eq('email', studentEmail);
          }

          // Create calendar event in student's calendar
          const studentEventData = formatBookingAsCalendarEvent(
            studentName,
            studentEmail,
            slot.start_time,
            slot.end_time
          );

          studentGoogleEventId = await createCalendarEvent(accessToken, studentEventData);
          console.log('✅ Student calendar event created:', studentGoogleEventId);
        } else {
          console.log('ℹ️ Student does not have Google Calendar connected');
        }

        // Update booking with both event IDs
        await supabaseAdmin
          .from('bookings')
          .update({
            google_calendar_event_id: adminGoogleEventId,
            student_calendar_event_id: studentGoogleEventId,
          })
          .eq('id', booking.id);
      } catch (calendarError) {
        console.error('Google Calendar sync error:', calendarError);
        // Don't fail booking if calendar sync fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: { ...booking },
        message: autoConfirm
          ? 'Booking confirmed! Calendar invitations sent.'
          : 'Booking submitted! See you in class.',
        calendarSync: {
          admin: !!adminGoogleEventId,
          student: !!studentGoogleEventId,
        },
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
