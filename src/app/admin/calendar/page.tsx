"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { generateSlotsFromRange, formatSlotDate, formatSlotTime } from "@/lib/utils/slots";

interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function AdminCalendarPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [inputMode, setInputMode] = useState<'single' | 'range'>('single');
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/slots');
      const result = await response.json();
      if (result.success) {
        setSlots(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let slotsToCreate = [];

      if (inputMode === 'single') {
        // Single slot mode
        const [hours, minutes] = newSlot.startTime.split(':');
        const [endHours, endMinutes] = newSlot.endTime.split(':');

        const startDate = new Date(newSlot.date);
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const endDate = new Date(newSlot.date);
        endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

        slotsToCreate.push({
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
        });
      } else {
        // Time range mode - auto-generate 1-hour slots
        const startDate = new Date(newSlot.date + 'T' + newSlot.startTime + ':00');
        const endDate = new Date(newSlot.date + 'T' + newSlot.endTime + ':00');

        slotsToCreate = generateSlotsFromRange(
          startDate.toISOString(),
          endDate.toISOString()
        );

        // Show preview of how many slots will be created
        if (slotsToCreate.length > 0) {
          const confirmed = confirm(
            `This will create ${slotsToCreate.length} slot(s):\n\n${slotsToCreate.map(s =>
              `${new Date(s.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${new Date(s.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
            ).join('\n')}\n\nContinue?`
          );

          if (!confirmed) {
            return;
          }
        }
      }

      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slots: slotsToCreate,
        }),
      });

      if (response.ok) {
        setShowAddSlot(false);
        setNewSlot({ date: '', startTime: '', endTime: '' });
        setInputMode('single');
        fetchSlots();
      }
    } catch (error) {
      console.error('Failed to add slot:', error);
    }
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    const dateKey = new Date(slot.start_time).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  const sortedDates = Object.keys(groupedSlots).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-piano-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-display font-semibold text-ink-900 mb-2">
            Calendar Management
          </h2>
          <p className="text-ink-700">Manage your teaching slots and availability</p>
        </div>
        <button
          onClick={() => setShowAddSlot(true)}
          className="px-6 py-3 bg-piano-accent text-piano-white rounded-lg hover:bg-piano-highlight transition-colors font-medium"
        >
          + Add Slot
        </button>
      </div>

      {/* Slots List */}
      <div className="space-y-8">
        {sortedDates.map((dateKey) => (
          <div key={dateKey}>
            <h3 className="text-lg font-display font-semibold text-ink-900 mb-4">
              {new Date(dateKey).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {groupedSlots[dateKey].map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-lg border-2 ${
                    slot.is_available
                      ? 'border-success bg-success/10'
                      : 'border-error bg-error/10'
                  }`}
                >
                  <div className="font-display font-semibold text-ink-900 text-sm mb-1">
                    {new Date(slot.start_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-xs text-ink-700 mb-2">
                    {new Date(slot.end_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-sm font-medium">
                    {slot.is_available ? (
                      <span className="text-success">Available</span>
                    ) : (
                      <span className="text-error">Booked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Slot Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-piano-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-display font-semibold text-ink-900 mb-4">
              Add Teaching Time
            </h3>
            <form onSubmit={handleAddSlot} className="space-y-4">
              {/* Input Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setInputMode('single')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'single'
                      ? 'bg-piano-accent text-white'
                      : 'bg-surface-100 text-ink-700 hover:bg-surface-200'
                  }`}
                >
                  Single Slot
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('range')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'range'
                      ? 'bg-piano-accent text-white'
                      : 'bg-surface-100 text-ink-700 hover:bg-surface-200'
                  }`}
                >
                  Time Range
                </button>
              </div>

              <div className="text-sm text-ink-600 mb-4 bg-surface-50 p-3 rounded-lg">
                {inputMode === 'single'
                  ? 'Create a single 1-hour slot'
                  : 'Create multiple 1-hour slots from a time range (e.g., 1pm-5pm = 4 slots)'
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent"
                />
              </div>

              {inputMode === 'range' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent"
                    />
                  </div>
                  <p className="text-xs text-ink-500">
                    💡 System will auto-generate 1-hour slots
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-100 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-piano-accent"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSlot(false);
                    setInputMode('single');
                    setNewSlot({ date: '', startTime: '', endTime: '' });
                  }}
                  className="flex-1 px-4 py-3 border-2 border-muted text-ink-700 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-piano-accent text-piano-white rounded-lg hover:bg-piano-highlight transition-colors"
                >
                  {inputMode === 'range' ? 'Generate Slots' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
