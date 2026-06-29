-- Add Google Calendar OAuth columns to existing students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS google_calendar_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_calendar_id VARCHAR(255);

-- Create index for calendar-enabled students
CREATE INDEX IF NOT EXISTS idx_students_google_calendar_enabled
ON students(google_calendar_enabled)
WHERE google_calendar_enabled = true;
