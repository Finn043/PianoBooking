"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    checkCalendarStatus();
    checkUrlParams();
  }, []);

  const checkCalendarStatus = async () => {
    try {
      const response = await fetch('/api/sync/calendar');
      const data = await response.json();
      setGoogleConnected(data.connected);
    } catch (error) {
      console.error('Failed to check calendar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const calendarSuccess = params.get('calendar_success');
    const calendarError = params.get('calendar_error');

    if (calendarSuccess === 'connected') {
      setSyncStatus('connected');
      setGoogleConnected(true);
      // Clean URL
      window.history.replaceState({}, '', '/admin/settings');
    } else if (calendarError) {
      setSyncStatus(`error: ${calendarError}`);
      // Clean URL
      window.history.replaceState({}, '', '/admin/settings');
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Failed to get OAuth URL:', error);
      setSyncStatus('error: failed_to_get_url');
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      const confirmed = confirm('Are you sure you want to disconnect Google Calendar?');
      if (confirmed) {
        const response = await fetch('/api/sync/calendar', {
          method: 'DELETE',
        });

        if (response.ok) {
          setGoogleConnected(false);
          setSyncStatus('disconnected');
        } else {
          setSyncStatus('error: disconnect_failed');
        }
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      setSyncStatus('error: disconnect_failed');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-display font-semibold text-ink-900 mb-2">
          Settings
        </h2>
        <p className="text-ink-700">Configure your booking system preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Booking Preferences */}
        <div className="bg-piano-white rounded-lg shadow border border-muted p-6">
          <h3 className="text-lg font-display font-semibold text-ink-900 mb-4">
            Booking Preferences
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink-900 font-medium mb-1">Auto-confirm bookings</p>
              <p className="text-sm text-ink-600">
                When ON: Bookings are automatically confirmed
              </p>
              <p className="text-sm text-ink-600">
                When OFF: You must manually approve each booking
              </p>
            </div>
            <button
              onClick={() => setAutoConfirm(!autoConfirm)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoConfirm ? 'bg-piano-accent' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block w-5 h-5 transform rounded-full bg-white transition-transform ${
                  autoConfirm ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Google Calendar Sync */}
        <div className="bg-piano-white rounded-lg shadow border border-muted p-6">
          <h3 className="text-lg font-display font-semibold text-ink-900 mb-4">
            Google Calendar Sync
          </h3>
          <div className="space-y-4">
            {syncStatus === 'connected' && (
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                <p className="text-success text-sm font-medium">
                  ✓ Google Calendar connected successfully!
                </p>
              </div>
            )}
            {syncStatus?.startsWith('error:') && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                <p className="text-error text-sm font-medium">
                  ✗ Connection failed: {syncStatus.replace('error:', '')}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink-900 font-medium">Status</p>
                <p className="text-sm text-ink-600">
                  {loading ? 'Checking...' : googleConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
              <button
                onClick={googleConnected ? handleGoogleDisconnect : handleGoogleConnect}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  googleConnected
                    ? 'bg-error/20 text-error border border-error/30 hover:bg-error/30'
                    : 'bg-success/20 text-success border border-success/30 hover:bg-success/30'
                }`}
              >
                {loading ? 'Loading...' : googleConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
            {googleConnected && (
              <div className="text-sm text-ink-600">
                ✓ Your calendar will receive all booking events
                <br />
                <span className="text-xs">Students can also connect their calendars to receive invites</span>
              </div>
            )}
          </div>
        </div>

        {/* App Information */}
        <div className="bg-piano-white rounded-lg shadow border border-muted p-6">
          <h3 className="text-lg font-display font-semibold text-ink-900 mb-4">
            App Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-600">Version</span>
              <span className="text-ink-900">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-600">Timezone</span>
              <span className="text-ink-900">Australia/Sydney</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-600">Slot Duration</span>
              <span className="text-ink-900">60 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
