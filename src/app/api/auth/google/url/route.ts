import { NextResponse } from 'next/server';
import { getGoogleOAuthUrl } from '@/lib/google-calendar/client';

export async function GET() {
  try {
    const authUrl = getGoogleOAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Failed to generate OAuth URL:', error);
    return NextResponse.json({ error: 'Failed to generate OAuth URL' }, { status: 500 });
  }
}
