export interface CalendarSlot {
  id: string;
  start: Date;
  end: Date;
  title?: string;
  available: boolean;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  studentName?: string;
  studentEmail?: string;
  packageName?: string;
  isRecurring: boolean;
}

export interface BookingFormData {
  slotId: string;
  studentName: string;
  studentEmail: string;
  packageId?: string;
  notes?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
