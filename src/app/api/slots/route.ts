import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { APP_CONFIG } from '@/lib/constants';

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

    // Return raw slot data for calendar page compatibility
    const slots = data?.map(slot => ({
      id: slot.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: slot.is_available,
    })) || [];

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

    if (slots.some(slot => !slot?.start_time || Number.isNaN(Date.parse(slot.start_time)))) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid slot start time' } },
        { status: 400 }
      );
    }

    const normalizedSlots = slots.map(slot => {
      const start = new Date(slot.start_time);
      return {
        start_time: start.toISOString(),
        end_time: new Date(start.getTime() + APP_CONFIG.slotDuration * 60_000).toISOString(),
        is_available: true,
        created_from_pattern: false,
      };
    });

    const { data, error } = await supabaseAdmin
      .from('slots')
      .insert(normalizedSlots)
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
