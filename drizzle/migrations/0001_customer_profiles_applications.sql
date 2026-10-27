CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 first_name text NOT NULL DEFAULT '' CHECK (char_length(first_name)<=80),
 middle_name text NOT NULL DEFAULT '' CHECK (char_length(middle_name)<=80),
 last_name text NOT NULL DEFAULT '' CHECK (char_length(last_name)<=80),
 display_name text NOT NULL DEFAULT '' CHECK (char_length(display_name)<=80),
 date_of_birth date,
 nationality text NOT NULL DEFAULT '' CHECK (char_length(nationality)<=80),
 country text NOT NULL DEFAULT '' CHECK (char_length(country)<=80),
 address text NOT NULL DEFAULT '' CHECK (char_length(address)<=250),
 city text NOT NULL DEFAULT '' CHECK (char_length(city)<=80),
 region text NOT NULL DEFAULT '' CHECK (char_length(region)<=80),
 postal_code text NOT NULL DEFAULT '' CHECK (char_length(postal_code)<=20),
 phone text NOT NULL DEFAULT '' CHECK (char_length(phone)<=30),
 avatar_path text,
 notification_preferences jsonb NOT NULL DEFAULT '{"profile":true,"security":true}',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid());
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (id=auth.uid());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid());
CREATE FUNCTION public.create_customer_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN INSERT INTO public.profiles(id,first_name,last_name,display_name) VALUES (NEW.id,left(coalesce(NEW.raw_user_meta_data->>'first_name',''),80),left(coalesce(NEW.raw_user_meta_data->>'last_name',''),80),left(coalesce(NEW.raw_user_meta_data->>'display_name',''),80)); RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.create_customer_profile() FROM PUBLIC;
CREATE TRIGGER create_customer_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_customer_profile();
CREATE TABLE public.customer_applications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'verification_required' CHECK(status IN ('verification_required','under_review','approved','additional_information_required','rejected')),
 terms_accepted_at timestamptz NOT NULL DEFAULT now(),
 submitted_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id)
);
GRANT SELECT, INSERT ON public.customer_applications TO authenticated;
GRANT ALL ON public.customer_applications TO service_role;
ALTER TABLE public.customer_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY applications_read_own ON public.customer_applications FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY applications_submit_own ON public.customer_applications FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND status='verification_required');