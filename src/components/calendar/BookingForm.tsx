"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { CalendarSlot } from "@/types";

interface BookingFormProps { slot: CalendarSlot; userTimezone: string; onClose: () => void; }

export function BookingForm({ slot, userTimezone, onClose }: BookingFormProps) {
  const [formData, setFormData] = useState({ studentName: "", studentEmail: "", packageId: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setIsSubmitting(true); setError(null);
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotId: slot.id, studentName: formData.studentName, studentEmail: formData.studentEmail, packageId: formData.packageId || null, notes: formData.notes || null }) });
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || "We couldn’t complete this booking.");
      setCalendarUrl(result.data?.addToCalendarUrl || null); setSuccess(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn’t complete this booking."); }
    finally { setIsSubmitting(false); }
  };

  const inputClass = "mt-2 w-full border border-[#aab8b4] bg-white px-4 py-3 text-base text-[#172523] outline-none transition placeholder:text-[#63736f] focus:border-[#173c38] focus:ring-2 focus:ring-[#173c38]/15 disabled:opacity-60";

  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#071f1c]/75 p-4" role="dialog" aria-modal="true" aria-labelledby="booking-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="my-4 w-full max-w-xl bg-[#f7f8f5] p-6 shadow-[0_8px_0_rgba(7,31,28,.2)] animate-rise md:p-9">
      {success ? <div className="py-5 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#d8e6a9] text-2xl text-[#173c38]">✓</div><h2 id="booking-title" className="mt-6 font-display text-4xl font-semibold text-[#173c38]">Your lesson is booked.</h2><p className="mx-auto mt-3 max-w-sm text-lg leading-8 text-[#536663]">We sent the details to {formData.studentEmail}. We look forward to seeing you at the piano.</p>{calendarUrl && <a href={calendarUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex bg-[#173c38] px-6 py-3 text-lg font-semibold text-white hover:bg-[#24554f]">Add to Google Calendar</a>}<button onClick={onClose} className="mt-5 block w-full py-2 text-base font-semibold text-[#405451]">Close</button></div> : <>
        <div className="flex items-start justify-between gap-5 border-b border-[#cbd4d1] pb-6"><div><p className="text-base font-semibold text-[#2d665f]">{format(slot.start, "EEEE, MMMM d")}</p><h2 id="booking-title" className="mt-1 font-display text-4xl font-semibold text-[#173c38]">{format(slot.start, "h:mm a")} lesson</h2><p className="mt-2 text-base text-[#596a67]">60 minutes · {userTimezone}</p></div><button onClick={onClose} className="grid h-10 w-10 place-items-center border border-[#aab8b4] text-xl hover:bg-white" aria-label="Close booking form">×</button></div>
        <form onSubmit={submit} className="mt-6 space-y-5 text-base"><div><label htmlFor="student-name" className="font-semibold">Your name</label><input id="student-name" required autoFocus value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} className={inputClass} placeholder="Name" disabled={isSubmitting} /></div><div><label htmlFor="student-email" className="font-semibold">Email address</label><input id="student-email" type="email" required value={formData.studentEmail} onChange={e => setFormData({ ...formData, studentEmail: e.target.value })} className={inputClass} placeholder="you@example.com" disabled={isSubmitting} /></div><div><label htmlFor="lesson-package" className="font-semibold">Lesson package <span className="font-normal text-[#63736f]">(optional)</span></label><select id="lesson-package" value={formData.packageId} onChange={e => setFormData({ ...formData, packageId: e.target.value })} className={inputClass} disabled={isSubmitting}><option value="">Choose later</option><option value="single">Single lesson · $30</option><option value="bundle5">Five lessons · $140</option><option value="bundle10">Ten lessons · $260</option><option value="4week2x">4 weeks, twice weekly · $190</option><option value="4week3x">4 weeks, three times weekly · $270</option></select></div><div><label htmlFor="notes" className="font-semibold">Anything Hannah should know? <span className="font-normal text-[#63736f]">(optional)</span></label><textarea id="notes" rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className={`${inputClass} resize-none`} placeholder="Experience level, music interests or accessibility needs" disabled={isSubmitting} /></div>{error && <p role="alert" className="border border-[#a84c42] bg-[#fff7f5] px-4 py-3 text-base text-[#8e372f]">{error}</p>}<div className="flex flex-col-reverse gap-3 pt-2 text-lg sm:flex-row"><button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-3 font-semibold text-[#405451] hover:bg-white disabled:opacity-50 sm:w-1/3">Cancel</button><button type="submit" disabled={isSubmitting} className="bg-[#173c38] px-6 py-3 font-semibold text-white transition hover:bg-[#24554f] active:translate-y-px disabled:cursor-wait disabled:opacity-60 sm:w-2/3">{isSubmitting ? "Booking…" : "Confirm lesson"}</button></div></form>
      </>}
    </div>
  </div>;
}
