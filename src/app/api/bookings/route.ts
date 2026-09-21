import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { APP_CONFIG } from '@/lib/constants';
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
    const slotId = typeof body.slotId === 'string' ? body.slotId : '';
    const studentName = typeof body.studentName === 'string' ? body.studentName.trim() : '';
    const studentEmail = typeof body.studentEmail === 'string' ? body.studentEmail.trim().toLowerCase() : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';

    // Validate input
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slotId) || !studentName || studentName.length > 100 || !/^\S+@\S+\.\S+$/.test(studentEmail) || studentEmail.length > 255 || notes.length > 2000) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid booking details' } },
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

    // The database locks the slot while assigning one of the two pianos.
    const { data: bookingId, error: reservationError } = await supabaseAdmin.rpc('reserve_piano_slot', {
      p_slot_id: slotId,
      p_student_id: studentId,
      p_notes: notes || null,
    });

    if (reservationError || !bookingId) {
      return NextResponse.json(
        { success: false, error: { message: reservationError?.message || 'Slot not available' } },
        { status: 409 }
      );
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, slots(*), students(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to create booking' } },
        { status: 500 }
      );
    }

    const lessonEndTime = new Date(
      new Date(slot.start_time).getTime() + APP_CONFIG.lessonDuration * 60_000
    ).toISOString();
    let organizerEmail = APP_CONFIG.adminEmail;
    if (!organizerEmail) {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
      organizerEmail = data.users[0]?.email || '';
    }

    // Send a standard calendar invitation that supports accept/decline in email clients.
    await sendBookingConfirmationEmail(
      booking.id,
      booking.students.name,
      booking.students.email,
      booking.slots.start_time,
      lessonEndTime,
      organizerEmail
    );

    return NextResponse.json({
      success: true,
      data: {
        booking: { ...booking },
        message: 'Booking confirmed!',
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
