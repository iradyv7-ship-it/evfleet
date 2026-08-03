-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','instructor');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
      THEN 'instructor'::public.app_role ELSE 'admin'::public.app_role END
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- COHORTS
CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  capacity integer NOT NULL DEFAULT 30,
  location text,
  start_date date,
  end_date date,
  applications_open boolean NOT NULL DEFAULT true,
  instructor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_bank text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cohorts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cohorts TO authenticated;
GRANT ALL ON public.cohorts TO service_role;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cohorts_public_read" ON public.cohorts FOR SELECT TO anon USING (true);
CREATE POLICY "cohorts_staff_read" ON public.cohorts FOR SELECT TO authenticated USING (true);
CREATE POLICY "cohorts_admin_write" ON public.cohorts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- CANDIDATES
CREATE TYPE public.candidate_status AS ENUM ('enrolled','waitlisted','rejected','withdrawn','graduated');
CREATE TYPE public.training_status AS ENUM ('not_started','in_progress','completed','failed');

CREATE SEQUENCE public.candidate_code_seq START 1;

CREATE TABLE public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_code text NOT NULL UNIQUE,
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  status public.candidate_status NOT NULL DEFAULT 'waitlisted',
  waitlist_position integer,

  -- identity
  full_name text NOT NULL,
  national_id text NOT NULL,
  date_of_birth date,
  gender text,
  phone text NOT NULL,
  email text,
  district text,
  sector text,
  cell text,
  education_level text,
  preferred_language text DEFAULT 'Kinyarwanda',
  has_smartphone boolean DEFAULT false,

  -- driving
  driving_license_number text,
  license_categories text,
  license_issue_date date,
  years_driving_experience integer,
  taxi_association text,
  current_vehicle_plate text,
  currently_driving_for text,

  -- financial
  monthly_income_rwf numeric,
  average_daily_earnings_rwf numeric,
  has_bank_account boolean DEFAULT false,
  bank_name text,
  bank_account_number text,
  has_existing_loan boolean DEFAULT false,
  existing_loan_details text,
  deposit_available_rwf numeric,
  needs_uza_access_support boolean DEFAULT false,
  preferred_term_years integer,
  preferred_financing text,

  -- guarantor / kin
  next_of_kin_name text,
  next_of_kin_phone text,
  next_of_kin_relationship text,
  guarantor_name text,
  guarantor_phone text,
  guarantor_occupation text,

  -- documents checklist
  doc_national_id boolean NOT NULL DEFAULT false,
  doc_driving_license boolean NOT NULL DEFAULT false,
  doc_passport_photo boolean NOT NULL DEFAULT false,
  doc_criminal_record boolean NOT NULL DEFAULT false,
  doc_proof_of_residence boolean NOT NULL DEFAULT false,
  doc_bank_statement boolean NOT NULL DEFAULT false,
  doc_medical_certificate boolean NOT NULL DEFAULT false,

  -- training
  training_status public.training_status NOT NULL DEFAULT 'not_started',
  attendance_percentage numeric,
  exam_score numeric,
  instructor_notes text,
  disqualification_reason text,

  applied_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, national_id)
);
GRANT INSERT ON public.candidates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidates TO authenticated;
GRANT ALL ON public.candidates TO service_role;
GRANT USAGE ON SEQUENCE public.candidate_code_seq TO anon, authenticated, service_role;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidates_public_apply" ON public.candidates FOR INSERT TO anon WITH CHECK (
  EXISTS (SELECT 1 FROM public.cohorts c WHERE c.id = cohort_id AND c.applications_open)
);
CREATE POLICY "candidates_staff_read" ON public.candidates FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "candidates_staff_write" ON public.candidates FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "candidates_staff_insert" ON public.candidates FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "candidates_admin_delete" ON public.candidates FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- seat allocation on apply
CREATE OR REPLACE FUNCTION public.assign_candidate_seat()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cap integer;
  taken integer;
  nextpos integer;
BEGIN
  IF NEW.candidate_code IS NULL OR NEW.candidate_code = '' THEN
    NEW.candidate_code := 'UZA-' || to_char(now(),'YYYY') || '-' ||
      lpad(nextval('public.candidate_code_seq')::text, 5, '0');
  END IF;

  SELECT capacity INTO cap FROM public.cohorts WHERE id = NEW.cohort_id;
  SELECT count(*) INTO taken FROM public.candidates
    WHERE cohort_id = NEW.cohort_id AND status IN ('enrolled','graduated');

  IF taken < cap THEN
    NEW.status := 'enrolled';
    NEW.waitlist_position := NULL;
  ELSE
    NEW.status := 'waitlisted';
    SELECT COALESCE(max(waitlist_position),0) + 1 INTO nextpos
      FROM public.candidates WHERE cohort_id = NEW.cohort_id AND status = 'waitlisted';
    NEW.waitlist_position := nextpos;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER candidates_assign_seat
BEFORE INSERT ON public.candidates
FOR EACH ROW EXECUTE FUNCTION public.assign_candidate_seat();

-- promote from waiting list when a seat frees up
CREATE OR REPLACE FUNCTION public.promote_waitlist()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cap integer;
  taken integer;
  nextid uuid;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  IF OLD.status NOT IN ('enrolled','graduated') THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('rejected','withdrawn') THEN RETURN NEW; END IF;

  SELECT capacity INTO cap FROM public.cohorts WHERE id = NEW.cohort_id;
  SELECT count(*) INTO taken FROM public.candidates
    WHERE cohort_id = NEW.cohort_id AND status IN ('enrolled','graduated');

  WHILE taken < cap LOOP
    SELECT id INTO nextid FROM public.candidates
      WHERE cohort_id = NEW.cohort_id AND status = 'waitlisted'
      ORDER BY waitlist_position NULLS LAST, applied_at LIMIT 1;
    EXIT WHEN nextid IS NULL;
    UPDATE public.candidates SET status = 'enrolled', waitlist_position = NULL, updated_at = now()
      WHERE id = nextid;
    taken := taken + 1;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER candidates_promote_waitlist
AFTER UPDATE OF status ON public.candidates
FOR EACH ROW EXECUTE FUNCTION public.promote_waitlist();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER candidates_touch BEFORE UPDATE ON public.candidates
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER cohorts_touch BEFORE UPDATE ON public.cohorts
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- seed cohorts
INSERT INTO public.cohorts (name, code, capacity, location, start_date, end_date, applications_open, partner_bank, notes) VALUES
('Tunga Taxi Cohort 1 — Kigali', 'TT-KGL-01', 30, 'Kigali, Nyarugenge', '2026-08-10', '2026-09-04', true, 'Unguka Bank', 'Pre-qualified cohort for Unguka Bank financing.'),
('Tunga Taxi Cohort 2 — Kigali', 'TT-KGL-02', 30, 'Kigali, Kicukiro', '2026-09-14', '2026-10-09', true, 'Unguka Bank', 'Second intake, applications open.'),
('Tunga Taxi Cohort 3 — Musanze', 'TT-MSZ-01', 25, 'Musanze', '2026-10-19', '2026-11-13', false, NULL, 'Upcountry pilot intake, opens later.');