/**
 * API Contract Types - Single source of truth for API interfaces
 *
 * IMPORTANT: All API responses must use database field names (snake_case)
 * Frontend components map these to their preferred format if needed
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// ============================================================================
// Database Entity Types (snake_case - matches DB columns)
// ============================================================================

export interface Slot {
  id: string;
  start_time: string;      // ISO datetime
  end_time: string;        // ISO datetime
  is_available: boolean;
  google_calendar_event_id?: string;
  created_from_pattern?: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  slot_id: string;
  student_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  is_recurring?: boolean;
  recurring_pattern?: Record<string, unknown>;
  session_number?: number;
  notes?: string;
  google_calendar_event_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  package_id?: string;
  remaining_sessions: number;
  total_purchased: number;
  notes?: string;
  google_access_token?: string;
  google_refresh_token?: string;
  google_token_expires_at?: string;
  google_calendar_id?: string;
  google_calendar_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// /api/slots
export interface SlotsListResponse {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface CreateSlotsRequest {
  slots: Array<{
    start_time: string;
    end_time: string;
  }>;
}

// /api/bookings
export interface CreateBookingRequest {
  slotId: string;
  studentName: string;
  studentEmail: string;
  packageId?: string;
  notes?: string;
}

export interface BookingWithRelations extends Booking {
  slots: Slot;
  students: Student;
}

export interface CreateBookingResponse {
  booking: BookingWithRelations;
  message: string;
}

// /api/auth/google/url
export interface GoogleOAuthUrlResponse {
  authUrl: string;
}

// /api/sync/calendar
export interface CalendarStatusResponse {
  connected: boolean;
  calendarId: string | null;
}

export interface CalendarSyncRequest {
  action: 'create_booking' | 'delete_booking' | 'sync_slots';
  bookingId?: string;
  slotId?: string;
  studentId?: string;
  start?: string;
  end?: string;
}

// ============================================================================
// Frontend Types (can use camelCase for UI components)
// ============================================================================

export interface CalendarSlot {
  id: string;
  start: Date;
  end: Date;
  title?: string;
  available: boolean;
  status?: Booking['status'];
  studentName?: string;
  studentEmail?: string;
  packageName?: string;
  isRecurring?: boolean;
}

// ============================================================================
// Helper Functions for Type-Safe API Mapping
// ============================================================================

/**
 * Maps database Slot to frontend CalendarSlot
 * Use this consistently across all components
 */
export function mapSlotToCalendarSlot(dbSlot: Slot): CalendarSlot {
  return {
    id: dbSlot.id,
    start: new Date(dbSlot.start_time),
    end: new Date(dbSlot.end_time),
    available: dbSlot.is_available,
  };
}

/**
 * Maps database BookingWithRelations to display format
 */
export function mapBookingWithRelations(booking: BookingWithRelations) {
  return {
    id: booking.id,
    slotId: booking.slot_id,
    studentId: booking.student_id,
    status: booking.status,
    notes: booking.notes,
    studentName: booking.students.name,
    studentEmail: booking.students.email,
    startTime: booking.slots.start_time,
    endTime: booking.slots.end_time,
  };
}
