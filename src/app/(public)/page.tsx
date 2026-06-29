"use client";

import React, { useState, useEffect } from "react";
import { PianoHeader } from "@/components/shared/PianoHeader";
import { BookingCalendar } from "@/components/calendar/BookingCalendar";
import { BookingForm } from "@/components/calendar/BookingForm";
import { CalendarSlot } from "@/types";

export default function HomePage() {
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch('/api/slots?available=true');
      const result = await response.json();

      if (result.success && result.data) {
        setSlots(result.data.map((s: any) => ({
          id: s.id,
          start: new Date(s.start_time),
          end: new Date(s.end_time),
          available: s.is_available,
        })));
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: CalendarSlot) => {
    setSelectedSlot(slot);
    // Refresh slots after booking
    if (slot.available) {
      fetchAvailableSlots();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-piano-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <main>
      {/* Hero Header */}
      <PianoHeader />

      {/* Booking Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        {/* Section heading */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink-900 mb-3">
            Available Lesson Times
          </h2>
          <p className="text-ink-700 text-lg">
            Select a time slot below to book your piano lesson
          </p>
        </div>

        {/* Calendar */}
        <div className="bg-piano-white rounded-lg border border-muted shadow-md p-4 md:p-6">
          <BookingCalendar
            initialSlots={slots}
            onSlotSelect={handleSlotSelect}
          />
        </div>
      </div>

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingForm
          slot={selectedSlot}
          userTimezone="Australia/Sydney"
          onClose={() => setSelectedSlot(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-piano-black text-piano-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <p className="text-sm text-piano-white/75">
            &copy; 2025 Hannah&apos;s Piano Class. All rights reserved.
          </p>
          <p className="text-xs text-piano-white/50 mt-2">
            @Hannah&apos;s Piano Class
          </p>
        </div>
      </footer>
    </main>
  );
}
