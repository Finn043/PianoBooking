-- Fix RLS policies for service role operations
-- These policies allow full access when using service role key

-- DROP existing policies that are blocking operations
DROP POLICY IF EXISTS "No public access to students" ON students;
DROP POLICY IF EXISTS "No public access to bookings" ON bookings;
DROP POLICY IF EXISTS "Service role full access students" ON students;
DROP POLICY IF EXISTS "Service role full access bookings" ON bookings;

-- CREATE new policies that properly allow service role
CREATE POLICY "Service role full access students"
  ON students FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Allow authenticated users (with anon key) to read available slots
DROP POLICY IF EXISTS "Public read available slots" ON slots;
CREATE POLICY "Public read available slots"
  ON slots FOR SELECT
  TO authenticated, anon
  USING (true); -- Allow reading all slots for public API

-- Allow service role to manage slots
DROP POLICY IF EXISTS "Service role full access slots" ON slots;
CREATE POLICY "Service role full access slots"
  ON slots FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');