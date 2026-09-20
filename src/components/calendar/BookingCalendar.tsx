"use client";

import { format } from "date-fns";
import type { CalendarSlot } from "@/types";

interface BookingCalendarProps { initialSlots: CalendarSlot[]; onSlotSelect: (slot: CalendarSlot) => void; }

export function BookingCalendar({ initialSlots, onSlotSelect }: BookingCalendarProps) {
  const slotsByDate = initialSlots.reduce((groups, slot) => {
    const key = format(slot.start, "yyyy-MM-dd");
    (groups[key] ||= []).push(slot);
    return groups;
  }, {} as Record<string, CalendarSlot[]>);
  const dates = Object.keys(slotsByDate).sort();

  if (!dates.length) return <div className="bg-white px-6 py-14 text-center"><p className="font-display text-3xl text-[#173c38]">No open times just yet.</p><p className="mx-auto mt-3 max-w-md text-[#596a67]">New lesson times are added regularly. Please check back soon.</p></div>;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 text-base text-[#596a67]"><span>{initialSlots.length} available {initialSlots.length === 1 ? "time" : "times"}</span><span>Times shown in Australia/Sydney</span></div>
      <div className="space-y-10">{dates.map((dateKey) => <section key={dateKey} aria-labelledby={`date-${dateKey}`} className="grid gap-5 border-t border-[#cbd4d1] pt-6 md:grid-cols-[13rem_1fr]"><div><p className="text-base font-semibold text-[#2d665f]">{format(new Date(`${dateKey}T00:00:00`), "EEEE")}</p><h3 id={`date-${dateKey}`} className="mt-1 font-heading text-2xl font-semibold">{format(new Date(`${dateKey}T00:00:00`), "MMMM d")}</h3></div><div className="flex flex-wrap gap-3">{slotsByDate[dateKey].map((slot) => <button key={slot.id} onClick={() => onSlotSelect(slot)} className="group min-w-[10rem] border border-[#aab8b4] bg-white px-5 py-4 text-left transition duration-200 hover:border-[#173c38] hover:bg-[#173c38] hover:text-white active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173c38]"><span className="block font-heading text-lg font-semibold tabular-nums">{format(slot.start, "h:mm a")}</span><span className="mt-1 block text-sm text-[#657673] group-hover:text-white/70">60 minutes →</span></button>)}</div></section>)}</div>
    </div>
  );
}
