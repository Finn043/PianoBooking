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
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ minHeight: '100vh' }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-pianist-playing-the-piano-41865-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-20 px-6 py-[20px] md:px-[120px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8 text-piano-accent"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" fill="#FDFDF7"/>
              <rect x="4" y="4" width="2" height="12" fill="#1a1a1a"/>
              <rect x="7" y="4" width="2" height="12" fill="#1a1a1a"/>
              <rect x="13" y="4" width="2" height="12" fill="#1a1a1a"/>
              <rect x="16" y="4" width="2" height="12" fill="#1a1a1a"/>
            </svg>
            <span className="font-heading font-bold text-white">PianoBooking</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['Lessons', 'How it Works', 'Rates', 'For Admins'].map((item) => (
              <a
                key={item}
                href="#"
                className="font-heading font-medium text-white text-white/80 hover:text-purple-300 transition-colors"
              >
                {item}
              </a>
            ))}
            <button className="bg-piano-accent text-white px-4 py-2 rounded-lg font-button font-semibold text-sm hover:opacity-90 transition-opacity">
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
        <div className="fixed inset-0 z-30 bg-black/95 flex items-center justify-center md:hidden">
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
              className="bg-piano-accent text-white px-6 py-3 rounded-lg font-button font-semibold"
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
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1 mb-8">
            <span className="bg-green-500 text-white rounded-full px-2 py-0.5 text-[11px] uppercase font-bold">
              No Account Needed
            </span>
            <span className="font-button font-medium text-white">⚡ Ready to play? Book your slot instantly</span>
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
              className="bg-piano-accent text-white px-8 py-4 rounded-xl font-button font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-purple-500/50"
            >
              View Available Slots 🎹
            </button>
            <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-button font-medium hover:bg-white/10 transition-colors">
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
      <div id="booking-section" className="relative z-10 bg-surface-100 py-16">
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
          <div className="bg-piano-white rounded-lg border border-muted shadow-md p-4 md:p-6">
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
      <footer className="relative z-10 bg-piano-black text-piano-white py-8">
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
