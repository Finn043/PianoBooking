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
