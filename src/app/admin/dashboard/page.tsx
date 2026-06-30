import { supabaseAdmin } from '@/lib/supabase/admin';

async function getDashboardStats() {
  const now = new Date().toISOString();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Fetch all in parallel
  const [todayBookingsRes, activeStudentsRes, lowSessionRes, upcomingRes] = await Promise.all([
    // Today's bookings count
    supabaseAdmin
      .from('bookings')
      .select('id, slots!inner(start_time)', { count: 'exact', head: true })
      .neq('status', 'cancelled')
      .gte('slots.start_time', todayStart.toISOString())
      .lte('slots.start_time', todayEnd.toISOString()),

    // Active students (exclude admin row which has google_calendar_enabled)
    supabaseAdmin
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('google_calendar_enabled', false),

    // Low session students (remaining_sessions <= 2 and purchased at least once)
    supabaseAdmin
      .from('students')
      .select('id, name, email, remaining_sessions, packages(name)')
      .lte('remaining_sessions', 2)
      .gt('total_purchased', 0)
      .order('remaining_sessions', { ascending: true }),

    // Upcoming bookings (from now onward)
    supabaseAdmin
      .from('bookings')
      .select('id, status, slots!inner(start_time, end_time), students(name, email)')
      .neq('status', 'cancelled')
      .gte('slots.start_time', now)
      .order('slots(start_time)', { ascending: true })
      .limit(10),
  ]);

  const lowSessionStudents = (lowSessionRes.data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    remaining_sessions: s.remaining_sessions,
    package_name: s.packages?.name || 'No package',
  }));

  return {
    todayBookings: todayBookingsRes.count || 0,
    activeStudents: activeStudentsRes.count || 0,
    lowSessionAlerts: lowSessionStudents.length,
    lowSessionStudents,
    upcomingBookings: upcomingRes.data || [],
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
