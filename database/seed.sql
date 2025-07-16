-- Sample data for development and testing

-- Insert Lucia as the main user
INSERT INTO users (email, password_hash, name, role, timezone) VALUES 
('lucia@lucidda.tattoo', '$2a$10$example_hash_here', 'Lucia', 'artist', 'America/Argentina/Jujuy');

-- Insert Lucia's working hours (Monday to Friday, 9-13 and 15-20)
INSERT INTO working_hours (user_id, day_of_week, start_time, end_time) VALUES 
(1, 1, '09:00', '13:00'), -- Monday morning
(1, 1, '15:00', '20:00'), -- Monday afternoon
(1, 2, '09:00', '13:00'), -- Tuesday morning
(1, 2, '15:00', '20:00'), -- Tuesday afternoon
(1, 3, '09:00', '13:00'), -- Wednesday morning
(1, 3, '15:00', '20:00'), -- Wednesday afternoon
(1, 4, '09:00', '13:00'), -- Thursday morning
(1, 4, '15:00', '20:00'), -- Thursday afternoon
(1, 5, '09:00', '13:00'), -- Friday morning
(1, 5, '15:00', '20:00'); -- Friday afternoon

-- Sample availability override (vacation)
INSERT INTO availability_overrides (user_id, date, type, description) VALUES 
(1, CURRENT_DATE + INTERVAL '10 days', 'vacation', 'Family vacation');

-- Sample booking link (for testing)
INSERT INTO booking_links (user_id, token, tattoo_description, duration_minutes, expires_at) VALUES 
(1, 'test-link-123', 'Small rose tattoo on wrist', 120, CURRENT_TIMESTAMP + INTERVAL '24 hours');
