"use client";

import { useEffect, useState } from "react";
import { generateSlotsFromRange } from "@/lib/utils/slots";
import { APP_CONFIG } from "@/lib/constants";
import type { Slot } from "@/types/api";

type GeneratedSlot = Pick<Slot, "start_time" | "end_time">;
type TimeRange = { start: string; end: string };
type WeeklyDay = { day: number; label: string; enabled: boolean; ranges: TimeRange[] };

const DAYS: WeeklyDay[] = [
  [1, "Monday"], [2, "Tuesday"], [3, "Wednesday"], [4, "Thursday"],
  [5, "Friday"], [6, "Saturday"], [0, "Sunday"],
].map(([day, label]) => ({ day: Number(day), label: String(label), enabled: false, ranges: [{ start: "10:00", end: "15:00" }] }));

const inputClass = "w-full rounded-lg border border-muted bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#173c38] focus:ring-2 focus:ring-[#173c38]/15";

export default function AdminCalendarPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [inputMode, setInputMode] = useState<"single" | "range">("single");
  const [singleSlot, setSingleSlot] = useState({ date: "", startTime: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [weeklyHours, setWeeklyHours] = useState<WeeklyDay[]>(DAYS);
  const [previewSlots, setPreviewSlots] = useState<GeneratedSlot[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/slots");
      const result = await response.json();
      if (result.success) setSlots(result.data || []);
    } catch (error) {
      console.error("Failed to fetch slots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const resetModal = () => {
    setShowAddSlot(false);
    setInputMode("single");
    setSingleSlot({ date: "", startTime: "" });
    setDateRange({ start: "", end: "" });
    setWeeklyHours(DAYS);
    setPreviewSlots([]);
    setFormError(null);
  };

  const updateDay = (day: number, update: Partial<WeeklyDay>) => {
    setWeeklyHours(current => current.map(item => item.day === day ? { ...item, ...update } : item));
    setPreviewSlots([]);
  };

  const updateRange = (day: number, index: number, update: Partial<TimeRange>) => {
    setWeeklyHours(current => current.map(item => item.day === day
      ? { ...item, ranges: item.ranges.map((range, rangeIndex) => rangeIndex === index ? { ...range, ...update } : range) }
      : item));
    setPreviewSlots([]);
  };

  const generatePreview = () => {
    setFormError(null);
    if (!dateRange.start || !dateRange.end) return setFormError("Choose both a start date and an end date.");

    const startDate = new Date(`${dateRange.start}T00:00:00`);
    const endDate = new Date(`${dateRange.end}T00:00:00`);
    if (startDate > endDate) return setFormError("End date must be on or after start date.");

    const enabledDays = weeklyHours.filter(day => day.enabled);
    if (!enabledDays.length) return setFormError("Turn on at least one day of the week.");
    if (enabledDays.some(day => day.ranges.some(range => !range.start || !range.end || range.start >= range.end))) {
      return setFormError("Each enabled time range needs a valid start and end time.");
    }

    const generated: GeneratedSlot[] = [];
    for (const date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const schedule = enabledDays.find(day => day.day === date.getDay());
      if (!schedule) continue;

      for (const range of schedule.ranges) {
        const [startHour, startMinute] = range.start.split(":").map(Number);
        const [endHour, endMinute] = range.end.split(":").map(Number);
        const rangeStart = new Date(date);
        const rangeEnd = new Date(date);
        rangeStart.setHours(startHour, startMinute, 0, 0);
        rangeEnd.setHours(endHour, endMinute, 0, 0);
        generated.push(...generateSlotsFromRange(rangeStart.toISOString(), rangeEnd.toISOString()));
      }
    }

    const uniqueSlots = [...new Map(generated.map(slot => [slot.start_time, slot])).values()]
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    if (!uniqueSlots.length) return setFormError("This schedule does not contain any complete 60-minute slots.");
    setPreviewSlots(uniqueSlots);
  };

  const saveSlots = async (slotsToCreate: GeneratedSlot[]) => {
    setSaving(true);
    setFormError(null);
    try {
      const response = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: slotsToCreate }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Failed to create slots.");
      resetModal();
      await fetchSlots();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to create slots.");
    } finally {
      setSaving(false);
    }
  };

  const submitSingleSlot = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputMode === "range") return generatePreview();
    const start = new Date(`${singleSlot.date}T${singleSlot.startTime}:00`);
    const end = new Date(start.getTime() + APP_CONFIG.slotDuration * 60_000);
    saveSlots([{ start_time: start.toISOString(), end_time: end.toISOString() }]);
  };

  const groupedSlots = slots.reduce((groups, slot) => {
    const key = new Date(slot.start_time).toISOString().split("T")[0];
    (groups[key] ||= []).push(slot);
    return groups;
  }, {} as Record<string, Slot[]>);

  if (loading) return <div className="space-y-4 py-12" aria-label="Loading calendar"><div className="h-8 w-56 animate-pulse bg-surface-200" /><div className="h-28 animate-pulse bg-surface-200" /></div>;

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="text-3xl font-display font-semibold text-ink-900">Calendar Management</h2><p className="mt-2 text-ink-700">Manage your teaching slots and availability</p></div>
        <button onClick={() => setShowAddSlot(true)} className="rounded-lg bg-[#173c38] px-6 py-3 font-medium text-white transition hover:bg-[#24554f] active:translate-y-px">+ Add Teaching Time</button>
      </div>

      <div className="space-y-8">
        {Object.keys(groupedSlots).sort().map(dateKey => (
          <section key={dateKey}>
            <h3 className="mb-4 text-lg font-semibold text-ink-900">{new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3>
            <div className="flex flex-wrap gap-3">{groupedSlots[dateKey].map(slot => (
              <div key={slot.id} className={`min-w-40 rounded-lg border p-4 ${slot.is_available ? "border-success/40 bg-success/10" : "border-error/40 bg-error/10"}`}>
                <div className="font-semibold tabular-nums text-ink-900">{new Date(slot.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – {new Date(slot.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
                <div className={`mt-2 text-sm font-medium ${slot.is_available ? "text-success" : "text-error"}`}>{slot.is_available ? "Available" : "Booked"}</div>
              </div>
            ))}</div>
          </section>
        ))}
      </div>

      {showAddSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071f1c]/70 p-4" role="dialog" aria-modal="true" aria-labelledby="add-time-title">
          <div className={`max-h-[92vh] w-full overflow-y-auto rounded-xl bg-[#f7f8f5] p-5 shadow-lg md:p-7 ${inputMode === "range" ? "max-w-5xl" : "max-w-lg"}`}>
            <div className="flex items-start justify-between gap-4">
              <div><h3 id="add-time-title" className="text-2xl font-semibold text-ink-900">Add Teaching Time</h3><p className="mt-1 text-base text-ink-600">Create one slot or build a repeating weekly schedule.</p></div>
              <button type="button" onClick={resetModal} className="grid h-10 w-10 place-items-center rounded-lg border border-muted text-xl hover:bg-white" aria-label="Close">×</button>
            </div>

            <form onSubmit={submitSingleSlot} className="mt-6">
              <div className="mb-6 flex rounded-lg bg-surface-200 p-1" role="tablist">
                {(["single", "range"] as const).map(mode => <button key={mode} type="button" role="tab" aria-selected={inputMode === mode} onClick={() => { setInputMode(mode); setPreviewSlots([]); setFormError(null); }} className={`flex-1 rounded-md px-4 py-2.5 font-medium transition ${inputMode === mode ? "bg-white text-[#173c38] shadow-sm" : "text-ink-600 hover:text-ink-900"}`}>{mode === "single" ? "Single Slot" : "Time Range"}</button>)}
              </div>

              {inputMode === "single" ? (
                <div className="space-y-5">
                  <p className="rounded-lg bg-surface-200 px-4 py-3 text-base text-ink-700">Create a single 1-hour slot (60 mins).</p>
                  <div className="grid gap-4 sm:grid-cols-2"><label className="font-medium text-ink-900">Date<input type="date" required value={singleSlot.date} onChange={event => setSingleSlot({ ...singleSlot, date: event.target.value })} className={`mt-2 ${inputClass}`} /></label><label className="font-medium text-ink-900">Start Time<input type="time" required value={singleSlot.startTime} onChange={event => setSingleSlot({ ...singleSlot, startTime: event.target.value })} className={`mt-2 ${inputClass}`} /></label></div>
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
                  <div>
                    <h4 className="text-lg font-semibold text-ink-900">Date Range</h4>
                    <p className="mt-1 text-sm leading-6 text-ink-600">The weekly hours below repeat across this period.</p>
                    <div className="mt-4 space-y-4"><label className="block font-medium text-ink-900">Start Date<input type="date" required value={dateRange.start} onChange={event => { setDateRange({ ...dateRange, start: event.target.value }); setPreviewSlots([]); }} className={`mt-2 ${inputClass}`} /></label><label className="block font-medium text-ink-900">End Date<input type="date" required min={dateRange.start} value={dateRange.end} onChange={event => { setDateRange({ ...dateRange, end: event.target.value }); setPreviewSlots([]); }} className={`mt-2 ${inputClass}`} /></label></div>
                    <p className="mt-5 rounded-lg bg-[#e8eee9] px-4 py-3 text-sm font-medium leading-6 text-[#294a45]">System will auto-generate 1-hour slots (60 mins)</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-ink-900">Weekly Hours</h4>
                    <p className="mt-1 text-sm leading-6 text-ink-600">Turn on teaching days and add one or more available time ranges.</p>
                    <div className="mt-4 divide-y divide-muted rounded-lg border border-muted bg-white">
                      {weeklyHours.map(day => (
                        <div key={day.day} className="grid gap-3 p-4 sm:grid-cols-[7rem_1fr]">
                          <label className="flex items-center gap-3 self-start pt-2 font-medium"><input type="checkbox" checked={day.enabled} onChange={event => updateDay(day.day, { enabled: event.target.checked })} className="h-5 w-5 accent-[#173c38]" /><span>{day.label}</span></label>
                          {day.enabled ? <div className="space-y-3">{day.ranges.map((range, index) => <div key={`${day.day}-${index}`} className="flex flex-wrap items-center gap-2"><input aria-label={`${day.label} start time`} type="time" required value={range.start} onChange={event => updateRange(day.day, index, { start: event.target.value })} className={`${inputClass} w-[8.5rem]`} /><span className="text-ink-500">–</span><input aria-label={`${day.label} end time`} type="time" required value={range.end} onChange={event => updateRange(day.day, index, { end: event.target.value })} className={`${inputClass} w-[8.5rem]`} />{day.ranges.length > 1 && <button type="button" onClick={() => updateDay(day.day, { ranges: day.ranges.filter((_, rangeIndex) => rangeIndex !== index) })} className="grid h-10 w-10 place-items-center rounded-lg text-xl text-ink-500 hover:bg-surface-100 hover:text-error" aria-label={`Remove ${day.label} time range`}>×</button>}</div>)}<button type="button" onClick={() => updateDay(day.day, { ranges: [...day.ranges, { start: "10:00", end: "15:00" }] })} className="text-sm font-semibold text-[#2d665f] hover:text-[#173c38]">+ Add another time range</button></div> : <p className="pt-2 text-sm text-ink-500">Unavailable</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {formError && <p role="alert" className="mt-5 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">{formError}</p>}

              {inputMode === "range" && previewSlots.length > 0 && (
                <section className="mt-7 border-t border-muted pt-6" aria-labelledby="preview-title">
                  <div className="flex flex-wrap items-end justify-between gap-3"><div><h4 id="preview-title" className="text-lg font-semibold text-ink-900">Preview</h4><p className="mt-1 text-sm text-ink-600">{previewSlots.length} slots will be created. Review them before saving.</p></div><button type="button" onClick={() => saveSlots(previewSlots)} disabled={saving} className="rounded-lg bg-[#173c38] px-5 py-3 font-semibold text-white hover:bg-[#24554f] disabled:opacity-50">{saving ? "Saving…" : `Save ${previewSlots.length} slots`}</button></div>
                  <div className="mt-4 max-h-64 divide-y divide-muted overflow-y-auto rounded-lg border border-muted bg-white">{previewSlots.map(slot => <div key={slot.start_time} className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><span className="font-medium text-ink-900">{new Date(slot.start_time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span><span className="tabular-nums text-ink-700">{new Date(slot.start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} – {new Date(slot.end_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span></div>)}</div>
                </section>
              )}

              <div className="mt-7 flex justify-end gap-3 border-t border-muted pt-5"><button type="button" onClick={resetModal} className="rounded-lg px-5 py-3 font-medium text-ink-700 hover:bg-white">Cancel</button>{inputMode === "single" ? <button type="submit" disabled={saving} className="rounded-lg bg-[#173c38] px-5 py-3 font-semibold text-white hover:bg-[#24554f] disabled:opacity-50">{saving ? "Saving…" : "Add Slot"}</button> : <button type="submit" className="rounded-lg bg-[#173c38] px-5 py-3 font-semibold text-white hover:bg-[#24554f]">Generate Slots</button>}</div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
