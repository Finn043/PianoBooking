async function getDashboardStats() {
  // Mock data for now - replace with real API calls later
  return {
    todayBookings: 3,
    activeStudents: 12,
    lowSessionAlerts: 4,
    lowSessionStudents: [
      { id: '1', name: 'John Doe', email: 'john@example.com', remaining_sessions: 1, package_name: 'Bundle 5 Sessions' },
      { id: '2', name: 'Sarah Lee', email: 'sarah@example.com', remaining_sessions: 0, package_name: 'Bundle 10 Sessions' },
      { id: '3', name: 'Mike Johnson', email: 'mike@example.com', remaining_sessions: 2, package_name: '4-Week Package (2 sessions/week)' },
      { id: '4', name: 'Emily Chen', email: 'emily@example.com', remaining_sessions: 1, package_name: '1 Session' },
    ],
    upcomingBookings: [
      {
        id: '1',
        slots: { start_time: '2025-06-23T15:00:00Z', end_time: '2025-06-23T15:45:00Z' },
        students: { name: 'John Doe', email: 'john@example.com' },
        status: 'confirmed',
      },
      {
        id: '2',
        slots: { start_time: '2025-06-23T15:45:00Z', end_time: '2025-06-23T16:30:00Z' },
        students: { name: 'Jane Smith', email: 'jane@example.com' },
        status: 'pending',
      },
      {
        id: '3',
        slots: { start_time: '2025-06-24T15:00:00Z', end_time: '2025-06-24T15:45:00Z' },
        students: { name: 'Bob Wilson', email: 'bob@example.com' },
        status: 'confirmed',
      },
    ],
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-display font-semibold text-ink-900 mb-2">
          Dashboard
        </h2>
        <p className="text-ink-700">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-piano-white rounded-lg shadow p-6 border border-muted">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500 mb-1">Today&apos;s Bookings</p>
              <p className="text-4xl font-bold text-ink-900">{stats.todayBookings}</p>
            </div>
            <div className="text-5xl">📅</div>
          </div>
        </div>

        <div className="bg-piano-white rounded-lg shadow p-6 border border-muted">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500 mb-1">Active Students</p>
              <p className="text-4xl font-bold text-ink-900">{stats.activeStudents}</p>
            </div>
            <div className="text-5xl">👥</div>
          </div>
        </div>

        <div className="bg-piano-white rounded-lg shadow p-6 border border-muted">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500 mb-1">Low Session Alerts</p>
              <p className="text-4xl font-bold text-warning">{stats.lowSessionAlerts}</p>
            </div>
            <div className="text-5xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Low Session Alerts */}
      {stats.lowSessionStudents.length > 0 && (
        <div className="bg-piano-white rounded-lg shadow border border-muted p-6 mb-8">
          <h3 className="text-xl font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <span>⚠️</span> Low Session Alerts
          </h3>
          <div className="space-y-3">
            {stats.lowSessionStudents.map((student: any) => (
              <div
                key={student.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20"
              >
                <div className="flex-1">
                  <p className="font-medium text-ink-900">{student.name}</p>
                  <p className="text-sm text-ink-700">{student.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-warning">
                    {student.remaining_sessions} session(s) left
                  </p>
                  <p className="text-sm text-ink-600">{student.package_name}</p>
                </div>
                <button className="mt-2 sm:mt-0 px-4 py-2 bg-warning text-piano-white rounded-lg text-sm hover:bg-warning/90 transition-colors whitespace-nowrap">
                  Send Reminder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Bookings */}
      <div className="bg-piano-white rounded-lg shadow border border-muted p-6">
        <h3 className="text-xl font-display font-semibold text-ink-900 mb-4">
          Upcoming Bookings
        </h3>
        {stats.upcomingBookings.length === 0 ? (
          <p className="text-ink-500 text-center py-8">No upcoming bookings</p>
        ) : (
          <div className="space-y-3">
            {stats.upcomingBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-surface-100 rounded-lg border border-muted"
              >
                <div className="flex-1">
                  <p className="font-medium text-ink-900">
                    {new Date(booking.slots.start_time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-ink-700">
                    {new Date(booking.slots.start_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    -
                    {new Date(booking.slots.end_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm font-medium mt-1 text-ink-900">
                    Student: {booking.students.name}
                  </p>
                  <p className="text-sm text-ink-600">{booking.students.email}</p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-success/20 text-success border border-success/30'
                        : booking.status === 'pending'
                        ? 'bg-warning/20 text-warning border border-warning/30'
                        : 'bg-muted/20 text-ink-600 border border-muted'
                    }`}
                  >
                    {booking.status === 'confirmed' && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    )}
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
