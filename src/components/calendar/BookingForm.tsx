"use client";

import { useState } from "react";
import { CalendarSlot } from "@/types";
import { format } from "date-fns";

interface BookingFormProps {
  slot: CalendarSlot;
  userTimezone: string;
  onClose: () => void;
}

export function BookingForm({ slot, userTimezone, onClose }: BookingFormProps) {
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    packageId: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [addToCalendarUrl, setAddToCalendarUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          studentName: formData.studentName,
          studentEmail: formData.studentEmail,
          packageId: formData.packageId || null,
          notes: formData.notes || null,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Booking failed');
      }

      // Show success state with calendar link
      setSuccess(true);
      if (result.data?.addToCalendarUrl) {
        setAddToCalendarUrl(result.data.addToCalendarUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = format(slot.start, "EEEE, MMMM d, yyyy");
  const formattedTime = `${format(slot.start, "h:mm a")} - ${format(slot.end, "h:mm a")}`;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-piano-white rounded-lg p-8 max-w-md w-full animate-scale-in text-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
          </div>
          <h3 className="text-2xl font-display font-semibold text-ink-900 mb-2">
            Booking Confirmed!
          </h3>
          <p className="text-ink-700 mb-4">
            A confirmation email has been sent to your inbox.
          </p>

          {addToCalendarUrl && (
            <a
              href={addToCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-piano-accent text-piano-white rounded-lg hover:bg-piano-highlight transition-colors font-medium mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
              </svg>
              Add to Google Calendar
            </a>
          )}

          <button
            onClick={onClose}
            className="block w-full text-sm text-ink-500 hover:text-ink-700 transition-colors mt-2"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-piano-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-semibold text-ink-900">
            Book Your Lesson
          </h3>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Slot details */}
        <div className="bg-surface-100 rounded-lg p-4 mb-6">
          <div className="font-display font-semibold text-ink-900 mb-1">
            {formattedDate}
          </div>
          <div className="text-ink-700">{formattedTime}</div>
          <div className="text-sm text-ink-500 mt-2">
            Your timezone: {userTimezone}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink-900 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent focus:border-transparent transition-all"
              placeholder="Your name"
              disabled={isSubmitting}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-900 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.studentEmail}
              onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
              className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent focus:border-transparent transition-all"
              placeholder="your.email@example.com"
              disabled={isSubmitting}
            />
          </div>

          {/* Package */}
          <div>
            <label htmlFor="package" className="block text-sm font-medium text-ink-900 mb-2">
              Package (Optional)
            </label>
            <select
              id="package"
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent focus:border-transparent transition-all"
              disabled={isSubmitting}
            >
              <option value="">Select a package</option>
              <option value="single">1 Session - $30</option>
              <option value="bundle5">Bundle 5 Sessions - $140</option>
              <option value="bundle10">Bundle 10 Sessions - $260</option>
              <option value="4week2x">4-Week (2x/week) - $190</option>
              <option value="4week3x">4-Week (3x/week) - $270</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-ink-900 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Any additional notes..."
              disabled={isSubmitting}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-muted text-ink-700 rounded-lg hover:bg-surface-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-piano-accent text-piano-white rounded-lg hover:bg-piano-highlight transition-colors disabled:opacity-50 font-medium"
            >
              {isSubmitting ? "Submitting..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
