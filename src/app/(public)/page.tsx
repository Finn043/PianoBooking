"use client";

import React, { useState, useEffect } from "react";
import { BookingCalendar } from "@/components/calendar/BookingCalendar";
import { BookingForm } from "@/components/calendar/BookingForm";
import type { CalendarSlot } from "@/types";
import { mapSlotToCalendarSlot, type Slot as ApiSlot } from "@/types/api";

export default function HomePage() {
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch('/api/slots?available=true');
      const result = await response.json();

      if (result.success && result.data) {
        setSlots(result.data.map((slot: ApiSlot) => mapSlotToCalendarSlot(slot)));
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: CalendarSlot) => {
    setSelectedSlot(slot);
    if (slot.available) {
      fetchAvailableSlots();
    }
  };

  const scrollToCalendar = () => {
    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen">
      {/* Image Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-stone-950 via-stone-900 to-piano-black">
        <img
          src="/images/piano-hands.webp"
          alt=""
          className="w-full h-full object-cover opacity-40"
          style={{ minHeight: '100vh' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-900/50 to-piano-black/80"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-20 px-6 py-[20px] md:px-[120px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
            >
              {/* Piano frame */}
              <rect x="2" y="4" width="20" height="16" rx="2" fill="#5c4033"/>
              {/* White keys (ivory) */}
              <rect x="3" y="6" width="2.5" height="12" rx="0.5" fill="#FDFDF9"/>
              <rect x="5.5" y="6" width="2.5" height="12" rx="0.5" fill="#FDFDF9"/>
              <rect x="8" y="6" width="2.5" height="12" rx="0.5" fill="#FDFDF9"/>
              <rect x="10.5" y="6" width="2.5" height="12" rx="0.5" fill="#FDFDF9"/>
              <rect x="13" y="6" width="2.5" height="12" rx="0.5" fill="#FDFDF9"/>
              <rect x="15.5" y="6" width="2.5" height="12" rx="0.5" fill="#FDFDF9"/>
              <rect x="18" y="6" width="2.5" height="12" rx="0.5" fill="#FDFDF9"/>
              {/* Black keys (ebony) */}
              <rect x="4.5" y="6" width="1.5" height="7" rx="0.3" fill="#121212"/>
              <rect x="7.5" y="6" width="1.5" height="7" rx="0.3" fill="#121212"/>
              <rect x="12" y="6" width="1.5" height="7" rx="0.3" fill="#121212"/>
              <rect x="14.5" y="6" width="1.5" height="7" rx="0.3" fill="#121212"/>
              <rect x="17" y="6" width="1.5" height="7" rx="0.3" fill="#121212"/>
            </svg>
            <span className="font-heading font-bold text-white">PianoBooking</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['Lessons', 'How it Works', 'Rates', 'For Admins'].map((item) => (
              <a
                key={item}
                href="#"
                className="font-heading font-medium text-white/80 hover:text-piano-highlight transition-colors"
              >
                {item}
              </a>
            ))}
            <button className="group bg-piano-accent text-piano-white px-4 py-2 rounded-lg font-button font-semibold text-sm hover:bg-piano-highlight active:translate-y-0.5 transition-all shadow-md shadow-piano-accent/30">
              Book in 2 Mins
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-piano-black/95 backdrop-blur-sm flex items-center justify-center md:hidden">
          <div className="flex flex-col items-center gap-6">
            {['Lessons', 'How it Works', 'Rates', 'For Admins'].map((item) => (
              <a
                key={item}
                href="#"
                className="font-heading font-medium text-white text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToCalendar();
              }}
              className="bg-piano-accent text-piano-white px-6 py-3 rounded-lg font-button font-semibold hover:bg-piano-highlight active:translate-y-0.5 transition-all shadow-lg shadow-piano-accent/40"
            >
              Book in 2 Mins
            </button>
          </div>
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen mt-24 md:mt-32 px-6">
        <div className="text-center max-w-4xl">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 bg-stone-800/60 backdrop-blur-md border border-piano-accent/30 rounded-full px-4 py-1 mb-8">
            <span className="bg-piano-accent text-piano-white rounded-full px-2 py-0.5 text-[11px] uppercase font-bold">
              No Account Needed
            </span>
            <span className="font-button font-medium text-piano-white">⚡ Ready to play? Book your slot instantly</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-normal text-white text-4xl md:text-7xl leading-[1.1] mb-6">
            Your next piano lesson is{" "}
            <span className="italic">just a few taps</span>
            {" "}away.
          </h1>

          {/* Subtext */}
          <p className="font-body font-normal text-white text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-8">
            No registration fatigue. Pick your weekly slot, claim your bench, and start playing. Effortless scheduling for busy students.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={scrollToCalendar}
              className="group relative bg-piano-accent text-piano-white px-8 py-4 rounded-lg font-button font-bold text-lg shadow-lg shadow-piano-accent/40 transition-all duration-150 hover:bg-piano-highlight hover:shadow-xl hover:shadow-piano-highlight/50 active:translate-y-1 active:shadow-md"
            >
              <span className="relative z-10">View Available Slots 🎹</span>
              {/* Piano key press effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/10 rounded-lg opacity-0 group-active:opacity-100 transition-opacity"></div>
            </button>
            <button className="bg-stone-800/60 backdrop-blur border border-stone-600/40 text-piano-white px-8 py-4 rounded-lg font-button font-medium hover:bg-stone-700/60 hover:border-piano-accent/40 transition-all">
              Meet Teacher Hannah
            </button>
          </div>

          {/* Quick-Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 00016zm0-2a6 6 0 11-12 0 6 6 0 0112 0z"/>
                <path d="M10 14a1 1 0 102 0-2 1 1 0 012z"/>
              </svg>
              <span className="font-body">100% Mobile Friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8 8 0 008 8 0 0008 0zm0 2a6 6 0 11-12 0 6 6 0 0112 0z"/>
                <path d="M10 14a1 1 0 102 0-2 1 1 0 012z"/>
              </svg>
              <span className="font-body">Syncs to Google Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 00016zm0-2a6 6 0 11-12 0 6 6 0 0112 0z"/>
                <path d="M10 14a1 1 0 102 0-2 1 1 0 012z"/>
              </svg>
              <span className="font-body">Free Cancellation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div id="booking-section" className="relative z-10 bg-ivory-100 py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
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
          <div className="bg-ivory-100 rounded-lg border border-stone-300 shadow-md p-4 md:p-6">
            <BookingCalendar
              initialSlots={slots}
              onSlotSelect={handleSlotSelect}
            />
          </div>
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
      <footer className="relative z-10 bg-stone-950 text-piano-white py-8">
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
