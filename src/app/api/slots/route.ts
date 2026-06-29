import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const availableOnly = searchParams.get('available') === 'true';

    const now = new Date();
    const maxDate = endDate ? new Date(endDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let query = supabaseAdmin
      .from('slots')
      .select('*, bookings(*, students(*))')
      .gte('start_time', startDate || now.toISOString())
      .lte('start_time', maxDate.toISOString())
      .order('start_time');

    if (availableOnly) {
      query = query.eq('is_available', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      );
    }

    // Transform data to include booking info
    const slots = data?.map(slot => {
      const booking = slot.bookings?.[0];
      return {
        id: slot.id,
        start: slot.start_time,
        end: slot.end_time,
        available: slot.is_available && !booking,
        title: booking ? `Booked by ${booking.students?.name}` : 'Available',
        status: booking?.status || 'available',
        studentName: booking?.students?.name,
        studentEmail: booking?.students?.email,
        packageName: booking?.students?.packages?.name,
        isRecurring: booking?.is_recurring || false,
      };
    }) || [];

    return NextResponse.json({ success: true, data: slots });
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
    const { slots } = body;

    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid slots data' } },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('slots')
      .insert(
        slots.map(slot => ({
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: true,
          created_from_pattern: false,
        }))
      )
      .select();

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
