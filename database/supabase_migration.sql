-- Supabase Migration: Enable Row Level Security and Policies
-- Run this in your Supabase SQL Editor after importing your schema

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_links ENABLE ROW LEVEL SECURITY;

-- Create policies for API access (service role bypass)
-- These policies allow your Next.js API routes to access all data
CREATE POLICY "Service role access" ON users FOR ALL USING (true);
CREATE POLICY "Service role access" ON appointments FOR ALL USING (true);
CREATE POLICY "Service role access" ON working_hours FOR ALL USING (true);
CREATE POLICY "Service role access" ON availability_overrides FOR ALL USING (true);
CREATE POLICY "Service role access" ON booking_links FOR ALL USING (true);

-- Optional: Add real-time functionality for appointments
-- This enables real-time subscriptions for the admin dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE booking_links;

-- Create a function to notify on new appointments (for real-time updates)
CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_appointment', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new appointments
CREATE TRIGGER appointment_created
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_appointment();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_links_expires ON booking_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_booking_links_token ON booking_links(token);

-- Add helpful comments
COMMENT ON TABLE users IS 'Admin users for the tattoo scheduling system';
COMMENT ON TABLE appointments IS 'Scheduled tattoo appointments';
COMMENT ON TABLE working_hours IS 'Weekly working schedule';
COMMENT ON TABLE availability_overrides IS 'Specific day availability overrides';
COMMENT ON TABLE booking_links IS 'One-time booking links for clients';
