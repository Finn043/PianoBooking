/**
 * Frontend UI Types
 *
 * For API contract types, see src/types/api.ts
 * API responses use database field names (snake_case)
 * Frontend components can use camelCase for UI display
 */

// Re-export API types for convenience
export type {
  CalendarSlot,
  Slot,
  Booking,
  Student,
  ApiResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  mapSlotToCalendarSlot,
  mapBookingWithRelations,
} from './api';

// Legacy type aliases for compatibility
export interface BookingFormData {
  slotId: string;
  studentName: string;
  studentEmail: string;
  packageId?: string;
  notes?: string;
}
