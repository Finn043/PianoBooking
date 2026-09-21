// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "onboarding@resend.dev";

interface BookingEmailData {
  bookingId: string;
  studentName: string;
  studentEmail: string;
  startTime: string;
  endTime: string;
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[character] || character));

const escapeIcsParameter = (value: string) => value.replace(/["\r\n]/g, '');
const toIcsDate = (value: string) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const toBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

export default {
  fetch: async (req, _ctx) => {
    // Only allow POST requests
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    // Check for API key
    if (!RESEND_API_KEY) {
      return Response.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    try {
      const { bookingId, studentName, studentEmail, startTime, endTime }: BookingEmailData = await req.json();

      // Validate required fields
      if (!bookingId || !studentName || !studentEmail || !startTime || !endTime) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Format dates nicely
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      const formattedDate = startDate.toLocaleDateString('en-AU', {
        timeZone: 'Australia/Melbourne',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = `${startDate.toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit' })}`;
      const safeName = escapeHtml(studentName);
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Hannah Piano Class//Booking System//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:piano-lesson-${bookingId}@hannah-piano-booking.netlify.app`,
        `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
        `DTSTART:${toIcsDate(startTime)}`,
        `DTEND:${toIcsDate(endTime)}`,
        'SUMMARY:Piano Lesson',
        'LOCATION:Hannah Piano Studio',
        'DESCRIPTION:Piano lesson with Hannah Piano Class.',
        `ORGANIZER;CN="Hannah Piano Class":mailto:${FROM_EMAIL}`,
        `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="${escapeIcsParameter(studentName)}":mailto:${studentEmail}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #173c38; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎹 Piano Lesson Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${safeName},</p>
              <p>Your piano lesson has been successfully booked. Here are your details:</p>

              <div class="booking-details">
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
                <p><strong>⏰ Time:</strong> ${formattedTime}</p>
                <p><strong>Duration:</strong> 45 minutes</p>
              </div>

              <p>A calendar invitation is attached. Open it and choose Accept or Decline to respond.</p>
              <p>Please arrive 5 minutes early. If you need to cancel or reschedule, please let us know at least 24 hours in advance.</p>

              <p>See you in class!</p>

              <div class="footer">
                <p>Hannah Piano Class</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `Hannah Piano Class <${FROM_EMAIL}>`,
          to: [studentEmail],
          subject: "Piano Lesson Booking Confirmed",
          html,
          attachments: [{
            filename: 'invite.ics',
            content: toBase64(ics),
            content_type: 'text/calendar; method=REQUEST; charset=UTF-8',
          }],
          headers: {
            'Content-Class': 'urn:content-classes:calendarmessage',
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Resend API error:", data);
        return Response.json({ error: data }, { status: res.status });
      }

      return Response.json({ success: true, data });
    } catch (error) {
      console.error("Email function error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
};
