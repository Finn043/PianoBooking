export const APP_CONFIG = {
  slotDuration: 60, // minutes (1 hour)
  defaultTimeZone: 'Australia/Sydney',
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  adminEmail: process.env.ADMIN_EMAIL || '',
  lowSessionThreshold: 2, // Alert when remaining sessions <= 2
} as const;

export const PACKAGE_DEFAULTS = {
  singleSession: { price: 30, sessions: 1, name: '1 Session' },
  bundle5: { price: 140, sessions: 5, name: 'Bundle 5 Sessions', perSession: 28 },
  bundle10: { price: 260, sessions: 10, name: 'Bundle 10 Sessions', perSession: 26 },
  fourWeek2x: { price: 190, sessions: 8, name: '4-Week Package (2 sessions/week)', weeks: 4 },
  fourWeek3x: { price: 270, sessions: 12, name: '4-Week Package (3 sessions/week)', weeks: 4 },
} as const;

export const EMAIL_TEMPLATES = {
  bookingConfirmed: 'booking-confirmed',
  bookingPending: 'booking-pending',
  lowSession: 'low-session-alert',
  sessionExpired: 'session-expired',
  cancellation: 'cancellation-notice',
} as const;
