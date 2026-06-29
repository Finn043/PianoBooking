import { APP_CONFIG } from '@/lib/constants';

/**
 * Generate slots from a time range
 * @param startTime - Start time in ISO format
 * @param endTime - End time in ISO format
 * @returns Array of slot objects with start/end times
 */
export function generateSlotsFromRange(
  startTime: string,
  endTime: string
): Array<{ start_time: string; end_time: string }> {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const slots: Array<{ start_time: string; end_time: string }> = [];

  let currentStart = new Date(start);

  while (currentStart < end) {
    const currentEnd = new Date(currentStart);
    currentEnd.setMinutes(currentEnd.getMinutes() + APP_CONFIG.slotDuration);

    // Don't create slot that goes past end time
    if (currentEnd > end) {
      break;
    }

    slots.push({
      start_time: currentStart.toISOString(),
      end_time: currentEnd.toISOString(),
    });

    currentStart = currentEnd;
  }

  return slots;
}

/**
 * Generate slots for a week from availability patterns
 * @param weekStart - Start of the week (Monday)
 * @param patterns - Array of availability patterns
 * @returns Array of slot objects
 */
export function generateWeeklySlots(
  weekStart: Date,
  patterns: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
): Array<{ start_time: string; end_time: string }> {
  const slots: Array<{ start_time: string; end_time: string }> = [];

  for (const pattern of patterns) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + pattern.dayOfWeek);

    const [startHours, startMinutes] = pattern.startTime.split(':').map(Number);
    const [endHours, endMinutes] = pattern.endTime.split(':').map(Number);

    const dayStartTime = new Date(dayDate);
    dayStartTime.setHours(startHours, startMinutes, 0, 0);

    const dayEndTime = new Date(dayDate);
    dayEndTime.setHours(endHours, endMinutes, 0, 0);

    const daySlots = generateSlotsFromRange(
      dayStartTime.toISOString(),
      dayEndTime.toISOString()
    );

    slots.push(...daySlots);
  }

  return slots;
}

/**
 * Format date for display
 */
export function formatSlotDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatSlotTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
