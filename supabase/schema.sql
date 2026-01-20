-- ============================================
-- TRAINER APP DATABASE SCHEMA
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORGANIZATION & AUTH
-- ============================================

-- Organizations (gyms/teams)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('trainer', 'student', 'admin')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STUDENTS (extended profile data)
-- ============================================

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  constraints_injuries TEXT,
  goals TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- LOCATIONS
-- ============================================

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  location_type TEXT NOT NULL CHECK (location_type IN ('indoor', 'outdoor')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  meeting_point TEXT,
  equipment_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROGRAMME TEMPLATES
-- ============================================

CREATE TABLE programme_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_duration_minutes INTEGER DEFAULT 60,
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE programme_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_template_id UUID NOT NULL REFERENCES programme_templates(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  name TEXT NOT NULL,
  exercise_type TEXT CHECK (exercise_type IN ('warmup', 'strength', 'cardio', 'flexibility', 'cooldown', 'rest', 'other')),
  duration_seconds INTEGER,
  sets INTEGER,
  reps TEXT,
  rest_seconds INTEGER,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RECURRENCE & SESSIONS
-- ============================================

-- Recurrence rules for repeating sessions
CREATE TABLE recurrence_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  programme_template_id UUID REFERENCES programme_templates(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Students assigned to a recurring rule
CREATE TABLE recurrence_rule_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurrence_rule_id UUID NOT NULL REFERENCES recurrence_rules(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  individual_focus TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(recurrence_rule_id, student_id)
);

-- Concrete session instances
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  recurrence_rule_id UUID REFERENCES recurrence_rules(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Students assigned to a session
CREATE TABLE session_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  individual_focus TEXT,
  attendance TEXT CHECK (attendance IN ('pending', 'attended', 'no_show', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- Programme assigned to a session (snapshot of template + customizations)
CREATE TABLE session_programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  programme_template_id UUID REFERENCES programme_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_students_org ON students(organization_id);
CREATE INDEX idx_students_profile ON students(profile_id);
CREATE INDEX idx_locations_org ON locations(organization_id);
CREATE INDEX idx_sessions_org ON sessions(organization_id);
CREATE INDEX idx_sessions_trainer ON sessions(trainer_id);
CREATE INDEX idx_sessions_starts_at ON sessions(starts_at);
CREATE INDEX idx_sessions_recurrence ON sessions(recurrence_rule_id);
CREATE INDEX idx_session_students_session ON session_students(session_id);
CREATE INDEX idx_session_students_student ON session_students(student_id);
CREATE INDEX idx_programme_blocks_template ON programme_blocks(programme_template_id);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_programme_templates_updated_at BEFORE UPDATE ON programme_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_programme_blocks_updated_at BEFORE UPDATE ON programme_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_recurrence_rules_updated_at BEFORE UPDATE ON recurrence_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_session_programmes_updated_at BEFORE UPDATE ON session_programmes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTION: Enforce max 2 students per session
-- ============================================

CREATE OR REPLACE FUNCTION check_max_students_per_session()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM session_students WHERE session_id = NEW.session_id) >= 2 THEN
    RAISE EXCEPTION 'Maximum 2 students per session';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_students
  BEFORE INSERT ON session_students
  FOR EACH ROW EXECUTE FUNCTION check_max_students_per_session();

-- ============================================
-- FUNCTION: Prevent overlapping sessions for same trainer
-- ============================================

CREATE OR REPLACE FUNCTION check_no_trainer_overlap()
RETURNS TRIGGER AS $$
DECLARE
  session_end TIMESTAMPTZ;
  overlap_count INTEGER;
BEGIN
  -- Only check for scheduled sessions
  IF NEW.status != 'scheduled' THEN
    RETURN NEW;
  END IF;

  -- Calculate session end time (sessions are 60 minutes)
  session_end := NEW.starts_at + interval '60 minutes';

  -- Check for overlapping sessions
  SELECT COUNT(*) INTO overlap_count
  FROM sessions
  WHERE trainer_id = NEW.trainer_id
    AND status = 'scheduled'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND starts_at < session_end
    AND starts_at + interval '60 minutes' > NEW.starts_at;

  IF overlap_count > 0 THEN
    RAISE EXCEPTION 'no_trainer_overlap: Trainer already has a session at this time';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_no_trainer_overlap
  BEFORE INSERT OR UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION check_no_trainer_overlap();

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_trainer_or_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('trainer', 'admin') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_student_id()
RETURNS UUID AS $$
  SELECT id FROM students WHERE profile_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper to check if session belongs to user's org (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION session_belongs_to_user_org(session_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = session_uuid
    AND s.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper to check if user is student in session (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION user_is_student_in_session(session_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM session_students ss
    JOIN students st ON st.id = ss.student_id
    WHERE ss.session_id = session_uuid
    AND st.profile_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurrence_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurrence_rule_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_programmes ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id = get_user_organization_id());

CREATE POLICY "Admins can update own organization"
  ON organizations FOR UPDATE
  USING (id = get_user_organization_id() AND is_trainer_or_admin());

-- Profile policies
CREATE POLICY "Users can view profiles in own organization"
  ON profiles FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Student policies
CREATE POLICY "Trainers can view all students in org"
  ON students FOR SELECT
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Students can view own record"
  ON students FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Trainers can insert students"
  ON students FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can update students"
  ON students FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can delete students"
  ON students FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

-- Location policies
CREATE POLICY "Users can view locations in org"
  ON locations FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Trainers can insert locations"
  ON locations FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can update locations"
  ON locations FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can delete locations"
  ON locations FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

-- Programme template policies
CREATE POLICY "Users can view programmes in org"
  ON programme_templates FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Trainers can insert programmes"
  ON programme_templates FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can update programmes"
  ON programme_templates FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can delete programmes"
  ON programme_templates FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

-- Programme block policies
CREATE POLICY "Users can view blocks for visible programmes"
  ON programme_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programme_templates pt
      WHERE pt.id = programme_template_id
      AND pt.organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Trainers can insert programme blocks"
  ON programme_blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programme_templates pt
      WHERE pt.id = programme_template_id
      AND pt.organization_id = get_user_organization_id()
      AND is_trainer_or_admin()
    )
  );

CREATE POLICY "Trainers can update programme blocks"
  ON programme_blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM programme_templates pt
      WHERE pt.id = programme_template_id
      AND pt.organization_id = get_user_organization_id()
      AND is_trainer_or_admin()
    )
  );

CREATE POLICY "Trainers can delete programme blocks"
  ON programme_blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM programme_templates pt
      WHERE pt.id = programme_template_id
      AND pt.organization_id = get_user_organization_id()
      AND is_trainer_or_admin()
    )
  );

-- Session policies
CREATE POLICY "Trainers can view all sessions in org"
  ON sessions FOR SELECT
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Students can view own sessions"
  ON sessions FOR SELECT
  USING (user_is_student_in_session(id));

CREATE POLICY "Trainers can insert sessions"
  ON sessions FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can update sessions"
  ON sessions FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can delete sessions"
  ON sessions FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

-- Session students policies
CREATE POLICY "Trainers can view all session_students in org"
  ON session_students FOR SELECT
  USING (session_belongs_to_user_org(session_id) AND is_trainer_or_admin());

CREATE POLICY "Students can view own session assignments"
  ON session_students FOR SELECT
  USING (student_id = get_user_student_id());

CREATE POLICY "Trainers can insert session_students"
  ON session_students FOR INSERT
  WITH CHECK (session_belongs_to_user_org(session_id) AND is_trainer_or_admin());

CREATE POLICY "Trainers can update session_students"
  ON session_students FOR UPDATE
  USING (session_belongs_to_user_org(session_id) AND is_trainer_or_admin());

CREATE POLICY "Trainers can delete session_students"
  ON session_students FOR DELETE
  USING (session_belongs_to_user_org(session_id) AND is_trainer_or_admin());

-- Session programmes policies
CREATE POLICY "Trainers can view all session_programmes in org"
  ON session_programmes FOR SELECT
  USING (session_belongs_to_user_org(session_id) AND is_trainer_or_admin());

CREATE POLICY "Students can view programmes for their sessions"
  ON session_programmes FOR SELECT
  USING (user_is_student_in_session(session_id));

CREATE POLICY "Trainers can insert session_programmes"
  ON session_programmes FOR INSERT
  WITH CHECK (session_belongs_to_user_org(session_id) AND is_trainer_or_admin());

CREATE POLICY "Trainers can update session_programmes"
  ON session_programmes FOR UPDATE
  USING (session_belongs_to_user_org(session_id) AND is_trainer_or_admin());

CREATE POLICY "Trainers can delete session_programmes"
  ON session_programmes FOR DELETE
  USING (session_belongs_to_user_org(session_id) AND is_trainer_or_admin());

-- Recurrence rule policies
CREATE POLICY "Trainers can view recurrence rules in org"
  ON recurrence_rules FOR SELECT
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can insert recurrence rules"
  ON recurrence_rules FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can update recurrence rules"
  ON recurrence_rules FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

CREATE POLICY "Trainers can delete recurrence rules"
  ON recurrence_rules FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_trainer_or_admin());

-- Recurrence rule students policies
CREATE POLICY "Trainers can view recurrence_rule_students"
  ON recurrence_rule_students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recurrence_rules rr
      WHERE rr.id = recurrence_rule_id
      AND rr.organization_id = get_user_organization_id()
      AND is_trainer_or_admin()
    )
  );

CREATE POLICY "Trainers can insert recurrence_rule_students"
  ON recurrence_rule_students FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recurrence_rules rr
      WHERE rr.id = recurrence_rule_id
      AND rr.organization_id = get_user_organization_id()
      AND is_trainer_or_admin()
    )
  );

CREATE POLICY "Trainers can update recurrence_rule_students"
  ON recurrence_rule_students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recurrence_rules rr
      WHERE rr.id = recurrence_rule_id
      AND rr.organization_id = get_user_organization_id()
      AND is_trainer_or_admin()
    )
  );

CREATE POLICY "Trainers can delete recurrence_rule_students"
  ON recurrence_rule_students FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recurrence_rules rr
      WHERE rr.id = recurrence_rule_id
      AND rr.organization_id = get_user_organization_id()
      AND is_trainer_or_admin()
    )
  );

-- ============================================
-- TRIGGER: Create profile on user signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'trainer'),
    (NEW.raw_user_meta_data->>'organization_id')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
