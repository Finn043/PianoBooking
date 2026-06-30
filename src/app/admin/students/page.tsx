import { supabaseAdmin } from '@/lib/supabase/admin';

interface Student {
  id: string;
  name: string;
  email: string;
  package_name?: string;
  remaining_sessions: number;
  total_purchased: number;
  notes?: string;
}

async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('id, name, email, remaining_sessions, total_purchased, notes, packages(name)')
    .eq('google_calendar_enabled', false)
    .order('name', { ascending: true });

  if (error || !data) return [];

  return data.map((s: any) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    remaining_sessions: s.remaining_sessions,
    total_purchased: s.total_purchased,
    notes: s.notes,
    package_name: s.packages?.name,
  }));
}

export default async function StudentsPage() {
  const students = await fetchStudents();

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-display font-semibold text-ink-900 mb-2">
            Students
          </h2>
          <p className="text-ink-700">Manage your students and their lesson packages</p>
        </div>
        <button className="px-6 py-3 bg-piano-accent text-piano-white rounded-lg hover:bg-piano-highlight transition-colors font-medium">
          + Add Student
        </button>
      </div>

      {/* Students List */}
      <div className="bg-piano-white rounded-lg shadow border border-muted overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-500">No students yet</p>
            <p className="text-sm text-ink-400 mt-2">
              Add your first student to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-100 border-b border-muted">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-ink-900">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-ink-900">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-ink-900">
                    Package
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-ink-900">
                    Sessions
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-ink-900">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-ink-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-muted hover:bg-surface-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink-900">{student.name}</div>
                      {student.notes && (
                        <div className="text-sm text-ink-500 mt-1">{student.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-700">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-700">
                      {student.package_name || 'No package'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className={student.remaining_sessions <= 2 ? 'text-warning font-semibold' : ''}>
                          {student.remaining_sessions} remaining
                        </span>
                        <span className="text-ink-500"> / {student.total_purchased} total</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.remaining_sessions === 0 ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-error/20 text-error border border-error/30">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                          </svg>
                          Completed
                        </span>
                      ) : student.remaining_sessions <= 2 ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning border border-warning/30">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-3.493-1.646-2.743-2.98l5.58-9.92zM11.5 15H8.5l-.5-1h4l-.5 1z"/>
                          </svg>
                          Low Sessions
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293 9.293a1 1 0 101.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                          </svg>
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-sm text-ink-700 hover:text-piano-accent transition-colors">
                          Edit
                        </button>
                        <button className="text-sm text-ink-700 hover:text-piano-accent transition-colors">
                          Add Sessions
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
