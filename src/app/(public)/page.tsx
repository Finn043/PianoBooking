import React from "react";
import { PianoHeader } from "@/components/shared/PianoHeader";
import { BookingCalendar } from "@/components/calendar/BookingCalendar";
import { BookingForm } from "@/components/calendar/BookingForm";
import { CalendarSlot } from "@/types";

async function getAvailableSlots(): Promise<CalendarSlot[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/slots?available=true`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch slots:', await response.text());
      return [];
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return [];
    }

    // Transform API data to CalendarSlot format
    return result.data.map((slot: any) => ({
      id: slot.id,
      start: new Date(slot.start),
      end: new Date(slot.end),
      available: slot.available,
      title: slot.title,
      status: slot.status,
      studentName: slot.studentName,
      studentEmail: slot.studentEmail,
      packageName: slot.packageName,
      isRecurring: slot.isRecurring,
    }));
  } catch (error) {
    console.error('Error fetching slots:', error);
    return [];
  }
}

export default async function HomePage() {
  const slots = await getAvailableSlots();

  // Client component for interactivity
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
        <BookingPageContent initialSlots={slots} />
      </div>

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

// Client component for interactivity
function BookingPageContent({ initialSlots }: { initialSlots: CalendarSlot[] }) {
  const [selectedSlot, setSelectedSlot] = React.useState<CalendarSlot | null>(null);
  const [slots, setSlots] = React.useState(initialSlots);

  return (
    <>
      <div className="bg-piano-white rounded-lg border border-muted shadow-md p-4 md:p-6">
        <BookingCalendar
          initialSlots={slots}
          onSlotSelect={(slot) => {
            setSelectedSlot(slot);
            // Refresh slots after booking
            if (slot.available) {
              fetch('/api/slots?available=true')
                .then(res => res.json())
                .then(result => {
                  if (result.success && result.data) {
                    setSlots(result.data.map((s: any) => ({
                      id: s.id,
                      start: new Date(s.start),
                      end: new Date(s.end),
                      available: s.available,
                      title: s.title,
                      status: s.status,
                      studentName: s.studentName,
                      studentEmail: s.studentEmail,
                      packageName: s.packageName,
                      isRecurring: s.isRecurring,
                    })));
                  }
                });
            }
          }}
        />
      </div>

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingForm
          slot={selectedSlot}
          userTimezone="Australia/Sydney"
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </>
  );
}
