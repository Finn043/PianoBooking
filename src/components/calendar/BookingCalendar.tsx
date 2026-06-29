"use client";

import { useState } from "react";
import { CalendarSlot } from "@/types";
import { format } from "date-fns";

interface BookingCalendarProps {
  initialSlots: CalendarSlot[];
  onSlotSelect: (slot: CalendarSlot) => void;
}

export function BookingCalendar({ initialSlots, onSlotSelect }: BookingCalendarProps) {
  const [userTimezone] = useState("Australia/Sydney");

  // Group slots by date
  const slotsByDate = initialSlots.reduce((acc, slot) => {
    const dateKey = format(slot.start, "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, CalendarSlot[]>);

  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <div className="space-y-6">
      {/* Timezone notice */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-muted">
        <h3 className="text-lg font-display font-semibold text-ink-900">
          This Week
        </h3>
        <div className="text-sm text-ink-700">
          <span>Your timezone: </span>
          <span className="font-medium">{userTimezone}</span>
          <span className="mx-2 text-muted">|</span>
          <span>Teacher timezone: Australia/Sydney</span>
        </div>
      </div>

      {/* Slots grid */}
      <div className="space-y-8">
        {sortedDates.map((dateKey) => {
          const date = new Date(dateKey);
          const slots = slotsByDate[dateKey];

          return (
            <div key={dateKey}>
              {/* Date header */}
              <h4 className="text-lg font-display font-semibold text-ink-900 mb-4">
                {format(date, "EEEE, MMMM d, yyyy")}
              </h4>

              {/* Time slots */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && onSlotSelect(slot)}
                    disabled={!slot.available}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${slot.available
                        ? "border-success bg-success/10 hover:bg-success/20 active:scale-95 cursor-pointer"
                        : "border-error bg-error/10 opacity-60 cursor-not-allowed"
                      }
                      ${!slot.available && "pointer-events-none"}
                    `}
                    style={{ minHeight: "88px" }}
                  >
                    {/* Time */}
                    <div className="font-display font-semibold text-ink-900 text-sm mb-1">
                      {format(slot.start, "h:mm a")}
                    </div>
                    <div className="text-xs text-ink-700 mb-2">
                      {format(slot.end, "h:mm a")}
                    </div>

                    {/* Status */}
                    {slot.available ? (
                      <div className="inline-flex items-center gap-1 text-success font-medium text-xs">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                        Available
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-error font-medium text-xs">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                        </svg>
                        Booked
                      </div>
                    )}

                    {/* Student name if booked */}
                    {slot.title && !slot.available && (
                      <div className="mt-1 text-xs text-ink-700 truncate">
                        {slot.title}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-muted text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success/20 border-2 border-success"></div>
          <span className="text-ink-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-error/20 border-2 border-error"></div>
          <span className="text-ink-700">Booked</span>
        </div>
      </div>
    </div>
  );
}
