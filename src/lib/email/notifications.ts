/**
 * Send booking confirmation email via Supabase Edge Function
 */
export async function sendBookingConfirmationEmail(
  bookingId: string,
  studentName: string,
  studentEmail: string,
  slotStartTime: string,
  slotEndTime: string,
  organizerEmail: string
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-booking-email`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey || '',
      },
      body: JSON.stringify({
        bookingId,
        studentName,
        studentEmail,
        startTime: slotStartTime,
        endTime: slotEndTime,
        organizerEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send booking email:', error);
      // Don't throw - booking should succeed even if email fails
    }
  } catch (error) {
    console.error('Error sending booking email:', error);
    // Don't throw - booking should succeed even if email fails
  }
}
