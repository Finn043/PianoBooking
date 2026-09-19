"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BookingCalendar } from "@/components/calendar/BookingCalendar";
import { BookingForm } from "@/components/calendar/BookingForm";
import type { CalendarSlot } from "@/types";
import { mapSlotToCalendarSlot, type Slot as ApiSlot } from "@/types/api";

const Arrow = () => <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none"><path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export default function HomePage() {
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchAvailableSlots = async () => {
    try {
      setError(false);
      const response = await fetch("/api/slots?available=true");
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error();
      setSlots((result.data || []).map((slot: ApiSlot) => mapSlotToCalendarSlot(slot)));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAvailableSlots(); }, []);
  const scrollToBooking = () => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main id="main-content" className="overflow-hidden bg-white text-[#172523]">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="absolute inset-x-0 top-0 z-20">
        <nav aria-label="Main navigation" className="mx-auto flex max-w-[90rem] items-center justify-between px-5 py-6 md:px-10 lg:px-16">
          <a href="#top" className="flex items-center gap-3 text-white" aria-label="Hannah Piano Studio home"><span className="flex h-10 w-10 items-center justify-center border border-white/50 text-xl">♩</span><span className="font-heading text-base font-semibold tracking-[-0.01em] md:text-lg">Hannah Piano Studio</span></a>
          <div className="hidden items-center gap-8 text-base font-medium text-white/90 md:flex"><a href="#approach" className="hover:text-white">Lessons</a><a href="#rates" className="hover:text-white">Rates</a><a href="#booking" className="hover:text-white">Book a lesson</a><a href="/admin/login" className="border-b border-white/50 pb-1 hover:border-white">Teacher login</a></div>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="grid h-11 w-11 place-items-center border border-white/40 text-white md:hidden" aria-expanded={menuOpen} aria-label="Toggle navigation"><span className="text-xl">{menuOpen ? "×" : "≡"}</span></button>
        </nav>
        {menuOpen && <div className="mx-5 flex flex-col bg-[#173c38] p-6 text-white md:hidden">{[['Lessons', '#approach'], ['Rates', '#rates'], ['Book a lesson', '#booking'], ['Teacher login', '/admin/login']].map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)} className="border-b border-white/15 py-4 text-lg">{label}</a>)}</div>}
      </header>

      <section id="top" className="relative min-h-[46rem] bg-[#102d2a] md:min-h-[50rem]">
        <Image src="/images/piano1.jpeg" alt="Hands playing an upright piano in a sunlit room" fill priority className="object-cover object-[58%_center] opacity-90" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,30,28,.94)_0%,rgba(8,30,28,.7)_42%,rgba(8,30,28,.08)_78%)]" />
        <div className="relative mx-auto flex min-h-[46rem] max-w-[90rem] items-end px-5 pb-16 pt-36 md:min-h-[50rem] md:px-10 md:pb-24 lg:px-16">
          <div className="max-w-[46rem] text-white animate-rise"><p className="mb-5 text-base font-semibold tracking-[0.12em] text-[#d4e5a8]">PIANO LESSONS IN SYDNEY</p><h1 className="font-display text-[clamp(3.25rem,7vw,6rem)] font-semibold leading-[0.94] tracking-[-0.035em]">Make music feel like home.</h1><p className="mt-7 max-w-[38rem] text-xl leading-8 text-white/85 md:text-2xl md:leading-9">Thoughtful, one-to-one piano lessons for curious beginners and growing musicians — taught with patience, warmth and a clear path forward.</p><div className="mt-9 flex flex-wrap items-center gap-5 text-lg"><button onClick={scrollToBooking} className="inline-flex items-center gap-3 bg-[#d8e6a9] px-6 py-4 font-semibold text-[#102d2a] transition hover:bg-white active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Find a lesson time <Arrow /></button><a href="#approach" className="border-b border-white/60 pb-1 font-medium text-white hover:border-white">Meet the studio</a></div></div>
        </div>
      </section>

      <section id="approach" className="mx-auto grid max-w-[90rem] gap-12 px-5 py-24 md:px-10 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-24 lg:px-16 lg:py-36">
        <div className="relative"><Image src="/images/piano2.jpeg" alt="A piano teacher smiling while guiding a young student at the keyboard" width={1024} height={905} className="aspect-[4/5] w-full object-cover" /><div className="absolute -bottom-6 right-0 max-w-[17rem] bg-[#d8e6a9] p-5 text-base leading-7 text-[#173c38] md:right-[-2rem]">A calm place to learn, practise and enjoy every small breakthrough.</div></div>
        <div className="pt-8 lg:pt-0"><p className="font-display text-2xl italic text-[#2d665f]">Lessons that listen first.</p><h2 className="mt-4 max-w-[13ch] font-display text-[clamp(2.7rem,5vw,4.7rem)] font-semibold leading-[1.02] tracking-[-0.035em]">Build confidence at your own tempo.</h2><p className="mt-7 max-w-[38rem] text-xl leading-9 text-[#455956]">Every lesson is shaped around the student in front of the piano. We balance strong foundations with music they genuinely want to play, so practice feels purposeful rather than pressured.</p><div className="mt-10 grid gap-7 border-t border-[#cfd8d5] pt-8 sm:grid-cols-2"><div><strong className="block text-lg">All levels welcome</strong><span className="mt-2 block text-base leading-7 text-[#5b6d6a]">From a very first note to focused repertoire work.</span></div><div><strong className="block text-lg">A steady weekly rhythm</strong><span className="mt-2 block text-base leading-7 text-[#5b6d6a]">45-minute sessions with time to focus and progress.</span></div></div></div>
      </section>

      <section id="rates" className="bg-[#173c38] text-white"><div className="mx-auto grid max-w-[90rem] lg:grid-cols-2"><div className="px-5 py-20 md:px-10 lg:px-16 lg:py-28"><p className="font-display text-2xl italic text-[#d8e6a9]">Simple, flexible pricing.</p><h2 className="mt-4 max-w-[12ch] font-display text-5xl font-semibold leading-[1.02] tracking-[-0.03em] md:text-6xl">Choose the rhythm that suits you.</h2><div className="mt-12 divide-y divide-white/15 border-y border-white/15">{[['Single lesson', '$30', 'A focused 45-minute session'], ['Five lessons', '$140', '$28 per lesson'], ['Ten lessons', '$260', '$26 per lesson']].map(([name, price, detail]) => <div key={name} className="grid grid-cols-[1fr_auto] gap-4 py-6"><div><h3 className="font-heading text-xl font-semibold">{name}</h3><p className="mt-1 text-base text-white/75">{detail}</p></div><p className="font-display text-3xl">{price}</p></div>)}</div></div><div className="relative min-h-[30rem] lg:min-h-full"><Image src="/images/piano3.jpeg" alt="Open sheet music resting above the keys of a wooden piano" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" /></div></div></section>

      <section id="booking" className="bg-[#f3f5f2] px-5 py-20 md:px-10 lg:px-16 lg:py-28"><div className="mx-auto max-w-[80rem]"><div className="mb-12 flex flex-col justify-between gap-5 border-b border-[#cbd4d1] pb-8 md:flex-row md:items-end"><div><p className="font-display text-2xl italic text-[#2d665f]">Ready when you are.</p><h2 className="mt-2 font-display text-5xl font-semibold tracking-[-0.03em] md:text-6xl">Book your lesson</h2></div><p className="max-w-md text-base leading-7 text-[#536663]">Choose an available time. No account is needed; confirmation and a calendar link arrive by email.</p></div>{loading ? <div className="space-y-7" aria-label="Loading lesson times"><div className="h-7 w-56 animate-pulse bg-[#dde3df]" /><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 animate-pulse bg-[#dde3df]" />)}</div></div> : error ? <div className="border border-[#a84c42] bg-white p-8"><h3 className="text-lg font-semibold">We couldn’t load the lesson times.</h3><p className="mt-2 text-[#536663]">Please check your connection and try again.</p><button onClick={fetchAvailableSlots} className="mt-5 bg-[#173c38] px-5 py-3 font-semibold text-white">Try again</button></div> : <BookingCalendar initialSlots={slots} onSlotSelect={setSelectedSlot} />}</div></section>

      <footer className="bg-[#0d2926] px-5 py-12 text-white md:px-10 lg:px-16"><div className="mx-auto flex max-w-[90rem] flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="font-display text-3xl">Hannah Piano Studio</p><p className="mt-3 max-w-sm text-base leading-7 text-white/70">Warm, thoughtful piano tuition in Sydney.</p></div><div className="flex flex-wrap gap-x-7 gap-y-3 text-base text-white/75"><a href="#booking">Book a lesson</a><a href="/admin/login">Teacher login</a><span>© {new Date().getFullYear()}</span></div></div></footer>
      {selectedSlot && <BookingForm slot={selectedSlot} userTimezone="Australia/Sydney" onClose={() => { setSelectedSlot(null); fetchAvailableSlots(); }} />}
    </main>
  );
}
