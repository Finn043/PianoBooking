/**
 * Google Calendar API client
 * Handles OAuth flow and calendar operations
 */

const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

/**
 * Get OAuth URL for user authorization
 */
export function getGoogleOAuthUrl(): string {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    scope: scopes,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  })}`;

  return authUrl;
}

/**
 * Exchange authorization code for access token
 */
export async function getAccessToken(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange authorization code');
  }

  return await response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  return await response.json();
}

/**
 * Format booking data as Google Calendar event
 */
export function formatBookingAsCalendarEvent(
  studentName: string,
  studentEmail: string,
  startTime: string,
  endTime: string,
  packageName?: string
): {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{ email: string }>;
} {
  return {
    summary: `Piano Lesson - ${studentName}`,
    description: `Package: ${packageName || 'Single Session'}
Student: ${studentName} (${studentEmail})

Booked via Hannah's Piano Class`,
    start: {
      dateTime: startTime,
      timeZone: 'Australia/Sydney',
    },
    end: {
      dateTime: endTime,
      timeZone: 'Australia/Sydney',
    },
    attendees: [{ email: studentEmail }],
  };
}

/**
 * Create calendar event
 */
export async function createCalendarEvent(
  accessToken: string,
  eventData: ReturnType<typeof formatBookingAsCalendarEvent>
): Promise<string> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CALENDAR_ID}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          sendUpdates: 'all',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create calendar event');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Google Calendar create error:', error);
    throw error;
  }
}

/**
 * List calendar events within a time range
 */
export async function listCalendarEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<Array<any>> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CALENDAR_ID}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list calendar events');
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Google Calendar list error:', error);
    throw error;
  }
}

/**
 * Generate a Google Calendar "Add to Calendar" URL (no OAuth required)
 * Students can click this link to add the event to their own Google Calendar
 */
export function generateAddToCalendarUrl(
  studentName: string,
  startTime: string,
  endTime: string
): string {
  const formatForGCal = (isoDate: string) =>
    new Date(isoDate).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Piano Lesson - Hannah's Piano Class`,
    dates: `${formatForGCal(startTime)}/${formatForGCal(endTime)}`,
    details: `Piano lesson for ${studentName}\n\nBooked via Hannah's Piano Class`,
    ctz: 'Australia/Sydney',
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

/**
 * Delete calendar event
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  try {
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CALENDAR_ID}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {
    console.error('Google Calendar delete error:', error);
    throw error;
  }
}
