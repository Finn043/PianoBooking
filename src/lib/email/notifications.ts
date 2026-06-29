/**
 * Send booking confirmation email via Supabase Edge Function
 */
export async function sendBookingConfirmationEmail(
  studentName: string,
  studentEmail: string,
  slotStartTime: string,
  slotEndTime: string
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-booking-email`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName,
        studentEmail,
        startTime: slotStartTime,
        endTime: slotEndTime,
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
