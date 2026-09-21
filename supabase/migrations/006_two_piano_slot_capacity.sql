ALTER TABLE bookings
  ADD COLUMN piano_number SMALLINT NOT NULL DEFAULT 1
  CHECK (piano_number IN (1, 2));

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS unique_slot_booking;

CREATE UNIQUE INDEX bookings_active_slot_piano
  ON bookings(slot_id, piano_number)
  WHERE status <> 'cancelled';

CREATE UNIQUE INDEX bookings_active_slot_student
  ON bookings(slot_id, student_id)
  WHERE status <> 'cancelled';

CREATE OR REPLACE FUNCTION reserve_piano_slot(
  p_slot_id UUID,
  p_student_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slot_open BOOLEAN;
  allocated_piano SMALLINT;
  booking_id UUID;
BEGIN
  SELECT is_available INTO slot_open
  FROM slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND OR NOT slot_open THEN
    RAISE EXCEPTION 'Slot not available';
  END IF;

  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE slot_id = p_slot_id
      AND student_id = p_student_id
      AND status <> 'cancelled'
  ) THEN
    RAISE EXCEPTION 'Student already booked this slot';
  END IF;

  SELECT CASE
    WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE slot_id = p_slot_id AND piano_number = 1 AND status <> 'cancelled') THEN 1
    WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE slot_id = p_slot_id AND piano_number = 2 AND status <> 'cancelled') THEN 2
  END INTO allocated_piano;

  IF allocated_piano IS NULL THEN
    UPDATE slots SET is_available = FALSE WHERE id = p_slot_id;
    RAISE EXCEPTION 'Slot not available';
  END IF;

  INSERT INTO bookings (slot_id, student_id, status, notes, piano_number)
  VALUES (p_slot_id, p_student_id, 'confirmed', p_notes, allocated_piano)
  RETURNING id INTO booking_id;

  UPDATE slots
  SET is_available = EXISTS (
    SELECT 1 FROM generate_series(1, 2) AS piano(number)
    WHERE NOT EXISTS (
      SELECT 1 FROM bookings
      WHERE slot_id = p_slot_id
        AND piano_number = piano.number
        AND status <> 'cancelled'
    )
  )
  WHERE id = p_slot_id;

  RETURN booking_id;
END;
$$;

REVOKE ALL ON FUNCTION reserve_piano_slot(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION reserve_piano_slot(UUID, UUID, TEXT) TO service_role;

UPDATE slots
SET is_available = (
  SELECT COUNT(*) < 2
  FROM bookings
  WHERE bookings.slot_id = slots.id
    AND bookings.status <> 'cancelled'
);
