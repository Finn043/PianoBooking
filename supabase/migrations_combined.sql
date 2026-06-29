-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PACKAGES table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  session_count INTEGER NOT NULL,
  price_aud INTEGER NOT NULL,
  duration_weeks INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDENTS table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  remaining_sessions INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SLOTS table
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN DEFAULT true,
  google_calendar_event_id VARCHAR(255),
  created_from_pattern BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB,
  session_number INTEGER DEFAULT 1,
  notes TEXT,
  google_calendar_event_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_slot_booking UNIQUE (slot_id)
);

-- AVAILABILITY_PATTERNS table
CREATE TABLE availability_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_slots_start_time ON slots(start_time);
CREATE INDEX idx_slots_is_available ON slots(is_available);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_package ON students(package_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for students table
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bookings table
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Enable Row Level Security
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_patterns ENABLE ROW LEVEL SECURITY;

-- PACKAGES: Public can read active packages
CREATE POLICY "Public read active packages"
  ON packages FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- STUDENTS: No public access
CREATE POLICY "No public access to students"
  ON students FOR ALL
  TO authenticated, anon
  USING (false);

-- SLOTS: Public read available slots
CREATE POLICY "Public read available slots"
  ON slots FOR SELECT
  TO authenticated, anon
  USING (is_available = true);

-- BOOKINGS: No public access
CREATE POLICY "No public access to bookings"
  ON bookings FOR ALL
  TO authenticated, anon
  USING (false);

-- AVAILABILITY_PATTERNS: Public read active patterns
CREATE POLICY "Public read availability patterns"
  ON availability_patterns FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Service role policies (for Edge Functions)
-- These allow full access when using service role key
CREATE POLICY "Service role full access packages"
  ON packages FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access students"
  ON students FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access slots"
  ON slots FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access patterns"
  ON availability_patterns FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role');
-- Insert default packages
INSERT INTO packages (name, description, session_count, price_aud, duration_weeks, is_active) VALUES
  ('1 Session', 'Single piano lesson session', 1, 30, NULL, true),
  ('Bundle 5 Sessions', '5 session package - $28 per session', 5, 140, NULL, true),
  ('Bundle 10 Sessions', '10 session package - $26 per session', 10, 260, NULL, true),
  ('4-Week Package (2 sessions/week)', '8 sessions over 4 weeks', 8, 190, 4, true),
  ('4-Week Package (3 sessions/week)', '12 sessions over 4 weeks', 12, 270, 4, true);
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
