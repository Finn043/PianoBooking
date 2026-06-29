-- Insert default packages
INSERT INTO packages (name, description, session_count, price_aud, duration_weeks, is_active) VALUES
  ('1 Session', 'Single piano lesson session', 1, 30, NULL, true),
  ('Bundle 5 Sessions', '5 session package - $28 per session', 5, 140, NULL, true),
  ('Bundle 10 Sessions', '10 session package - $26 per session', 10, 260, NULL, true),
  ('4-Week Package (2 sessions/week)', '8 sessions over 4 weeks', 8, 190, 4, true),
  ('4-Week Package (3 sessions/week)', '12 sessions over 4 weeks', 12, 270, 4, true);
