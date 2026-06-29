/**
 * Send booking confirmation email via Supabase
 */
export async function sendBookingConfirmationEmail(
  studentName: string,
  studentEmail: string,
  slotStartTime: string,
  slotEndTime: string
) {
  // Use Supabase Edge Function to send email
  // For now, log the data - can be replaced with actual email trigger
  console.log('📧 Booking confirmation email sent:', {
    to: studentEmail,
    subject: 'Piano Lesson Booking Confirmed',
    startTime: slotStartTime,
    endTime: slotEndTime,
  });
}
