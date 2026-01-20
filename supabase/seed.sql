-- ============================================
-- SEED DATA FOR TRAINER APP
-- Run this AFTER creating a user via Supabase Auth
-- ============================================

-- First, create an organization
INSERT INTO organizations (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Omar PT');

-- Note: The profile for the trainer will be auto-created via the trigger
-- when a user signs up. You'll need to update the profile's organization_id
-- manually after signup, or set it during signup via metadata.

-- ============================================
-- SAMPLE LOCATIONS
-- ============================================

INSERT INTO locations (id, organization_id, name, address, location_type, latitude, longitude, meeting_point, equipment_notes) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Hyde Park', 'Hyde Park, London W2 2UH', 'outdoor', 51.5073, -0.1657, 'Near the Serpentine Café, by the benches', 'Bring resistance bands, cones, skipping rope'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Regents Park', 'Regent''s Park, London NW1 4NR', 'outdoor', 51.5313, -0.1570, 'Main entrance near the bandstand', 'Outdoor gym equipment available'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'PureGym Soho', '28 Poland St, London W1F 8QW', 'indoor', NULL, NULL, 'Reception desk', 'Full gym equipment, book squat rack in advance'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Third Space Canary Wharf', '16 Canada Square, London E14 5AA', 'indoor', NULL, NULL, 'Member guest list', 'Premium equipment, battle ropes, assault bikes');

-- ============================================
-- SAMPLE STUDENTS
-- ============================================

INSERT INTO students (id, organization_id, full_name, email, phone, notes, constraints_injuries, goals, emergency_contact_name, emergency_contact_phone) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Sarah Johnson', 'sarah.j@email.com', '+44 7700 900001', 'Prefers morning sessions. Works in finance, high stress job.', 'Previous ACL injury (2022), avoid deep squats', 'Lose 10kg, improve cardiovascular fitness, stress relief', 'James Johnson', '+44 7700 900002'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Michael Chen', 'mchen@email.com', '+44 7700 900003', 'Very motivated, enjoys challenging workouts. Training for triathlon.', NULL, 'Complete first Ironman 70.3, improve swim technique', 'Lisa Chen', '+44 7700 900004'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Emma Williams', 'emma.w@email.com', '+44 7700 900005', 'New to fitness training. Needs encouragement and progression.', 'Lower back issues, avoid heavy deadlifts', 'Build strength, improve posture from desk job', 'Tom Williams', '+44 7700 900006'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'David Brown', 'dbrown@email.com', '+44 7700 900007', 'Former rugby player, looking to get back in shape.', 'Shoulder impingement (right), rotator cuff exercises needed', 'Return to competitive fitness, functional strength', 'Rachel Brown', '+44 7700 900008'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Olivia Taylor', 'olivia.t@email.com', '+44 7700 900009', 'Trains with Emma Williams sometimes (friends). Competitive nature.', NULL, 'Run sub-25 min 5K, general fitness', NULL, NULL);

-- ============================================
-- SAMPLE PROGRAMME TEMPLATES
-- ============================================

INSERT INTO programme_templates (id, organization_id, name, description, target_duration_minutes) VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Full Body Strength', 'Compound movements for overall strength development', 60),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'HIIT Conditioning', 'High-intensity intervals for cardio and fat loss', 45),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Park Workout', 'No-equipment outdoor training session', 60),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Upper Body Focus', 'Push/pull movements for upper body development', 60);

-- ============================================
-- SAMPLE PROGRAMME BLOCKS
-- ============================================

-- Full Body Strength blocks
INSERT INTO programme_blocks (programme_template_id, order_index, name, exercise_type, duration_seconds, sets, reps, rest_seconds, instructions) VALUES
  ('30000000-0000-0000-0000-000000000001', 0, 'Dynamic Warm-up', 'warmup', 300, NULL, NULL, NULL, 'Jumping jacks, high knees, arm circles, leg swings'),
  ('30000000-0000-0000-0000-000000000001', 1, 'Goblet Squats', 'strength', NULL, 4, '12', 60, 'Keep chest up, knees tracking over toes'),
  ('30000000-0000-0000-0000-000000000001', 2, 'Romanian Deadlifts', 'strength', NULL, 4, '10', 60, 'Soft knees, hinge at hips, feel hamstring stretch'),
  ('30000000-0000-0000-0000-000000000001', 3, 'Dumbbell Bench Press', 'strength', NULL, 4, '10', 60, 'Full range of motion, controlled descent'),
  ('30000000-0000-0000-0000-000000000001', 4, 'Bent Over Rows', 'strength', NULL, 4, '12', 60, 'Squeeze shoulder blades at top'),
  ('30000000-0000-0000-0000-000000000001', 5, 'Plank Hold', 'strength', 60, 3, NULL, 30, 'Maintain neutral spine, engage core'),
  ('30000000-0000-0000-0000-000000000001', 6, 'Cool Down Stretch', 'cooldown', 300, NULL, NULL, NULL, 'Static stretches for all major muscle groups');

-- HIIT Conditioning blocks
INSERT INTO programme_blocks (programme_template_id, order_index, name, exercise_type, duration_seconds, sets, reps, rest_seconds, instructions) VALUES
  ('30000000-0000-0000-0000-000000000002', 0, 'Mobility Warm-up', 'warmup', 300, NULL, NULL, NULL, 'Joint rotations, dynamic stretching'),
  ('30000000-0000-0000-0000-000000000002', 1, 'Burpees', 'cardio', 30, 4, 'AMRAP', 30, '30 sec work, 30 sec rest'),
  ('30000000-0000-0000-0000-000000000002', 2, 'Mountain Climbers', 'cardio', 30, 4, 'AMRAP', 30, 'Fast pace, maintain plank position'),
  ('30000000-0000-0000-0000-000000000002', 3, 'Jump Squats', 'cardio', 30, 4, 'AMRAP', 30, 'Land softly, full depth each rep'),
  ('30000000-0000-0000-0000-000000000002', 4, 'Battle Ropes', 'cardio', 30, 4, 'AMRAP', 30, 'Alternating waves, keep tension'),
  ('30000000-0000-0000-0000-000000000002', 5, 'Active Recovery', 'rest', 180, NULL, NULL, NULL, 'Walk around, shake out muscles'),
  ('30000000-0000-0000-0000-000000000002', 6, 'Cool Down', 'cooldown', 300, NULL, NULL, NULL, 'Breathing exercises, static stretches');

-- Park Workout blocks
INSERT INTO programme_blocks (programme_template_id, order_index, name, exercise_type, duration_seconds, sets, reps, rest_seconds, instructions) VALUES
  ('30000000-0000-0000-0000-000000000003', 0, 'Jog & Dynamic Stretch', 'warmup', 480, NULL, NULL, NULL, '5 min light jog around park, then dynamic stretches'),
  ('30000000-0000-0000-0000-000000000003', 1, 'Push-up Variations', 'strength', NULL, 3, '15', 45, 'Standard, wide, diamond - 5 each'),
  ('30000000-0000-0000-0000-000000000003', 2, 'Walking Lunges', 'strength', NULL, 3, '20', 45, '10 each leg, maintain balance'),
  ('30000000-0000-0000-0000-000000000003', 3, 'Park Bench Dips', 'strength', NULL, 3, '12', 45, 'Keep body close to bench'),
  ('30000000-0000-0000-0000-000000000003', 4, 'Sprint Intervals', 'cardio', 600, NULL, NULL, NULL, '30 sec sprint, 30 sec walk, x10'),
  ('30000000-0000-0000-0000-000000000003', 5, 'Core Circuit', 'strength', 300, NULL, NULL, NULL, 'Plank, side plank, bicycle crunches'),
  ('30000000-0000-0000-0000-000000000003', 6, 'Stretching', 'cooldown', 300, NULL, NULL, NULL, 'Full body static stretches');

-- ============================================
-- NOTE: Sessions should be created via the app
-- after a trainer account is set up, as they
-- require a valid trainer_id from profiles table
-- ============================================
