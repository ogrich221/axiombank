CREATE OR REPLACE FUNCTION public.create_customer_profile()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ BEGIN
INSERT INTO public.profiles(id,first_name,middle_name,last_name,display_name,date_of_birth,nationality,country,address,city,region,postal_code,phone) VALUES (NEW.id,left(coalesce(NEW.raw_user_meta_data->>'first_name',''),80),left(coalesce(NEW.raw_user_meta_data->>'middle_name',''),80),left(coalesce(NEW.raw_user_meta_data->>'last_name',''),80),left(coalesce(NEW.raw_user_meta_data->>'display_name',''),80),nullif(NEW.raw_user_meta_data->>'date_of_birth','')::date,left(coalesce(NEW.raw_user_meta_data->>'nationality',''),80),left(coalesce(NEW.raw_user_meta_data->>'country',''),80),left(coalesce(NEW.raw_user_meta_data->>'address',''),250),left(coalesce(NEW.raw_user_meta_data->>'city',''),80),left(coalesce(NEW.raw_user_meta_data->>'region',''),80),left(coalesce(NEW.raw_user_meta_data->>'postal_code',''),20),left(coalesce(NEW.raw_user_meta_data->>'phone',''),30));
IF NEW.raw_user_meta_data->>'terms_accepted'='true' THEN
  INSERT INTO public.customer_applications(user_id) VALUES(NEW.id);
  INSERT INTO public.admin_users(id,first_name,last_name,email,phone,role,status,verified)
  VALUES (NEW.id::text,left(coalesce(NEW.raw_user_meta_data->>'first_name',''),80),left(coalesce(NEW.raw_user_meta_data->>'last_name',''),80),lower(NEW.email),left(coalesce(NEW.raw_user_meta_data->>'phone',''),30),'Customer','Pending',false)
  ON CONFLICT DO NOTHING;
END IF;
RETURN NEW; END; $function$;

INSERT INTO public.admin_users(id,first_name,last_name,email,phone,role,status,verified,joined)
SELECT u.id::text, coalesce(p.first_name,''), coalesce(p.last_name,''), lower(u.email), coalesce(p.phone,''), 'Customer',
  CASE WHEN a.admin_review_status='confirmed' THEN 'Active' ELSE 'Pending' END, a.admin_review_status='confirmed', a.submitted_at
FROM auth.users u JOIN public.customer_applications a ON a.user_id=u.id LEFT JOIN public.profiles p ON p.id=u.id
WHERE u.email IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.confirm_customer_application(application_id uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE applicant uuid;
BEGIN
  UPDATE public.customer_applications SET admin_review_status = 'confirmed', admin_reviewed_at = now() WHERE id = application_id AND admin_review_status = 'pending' RETURNING user_id INTO applicant;
  IF applicant IS NULL THEN RAISE EXCEPTION 'Application is not pending'; END IF;
  UPDATE public.admin_users SET status = 'Active', verified = true WHERE id = applicant::text AND status = 'Pending';
  INSERT INTO public.admin_events(actor, action, target) SELECT 'Administrator', 'Customer application confirmed', concat(first_name, ' ', last_name) FROM public.profiles WHERE id = applicant;
END;
$$;
REVOKE ALL ON FUNCTION public.confirm_customer_application(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_customer_application(uuid) TO service_role;

DROP POLICY IF EXISTS account_transactions_owner_insert ON public.account_transactions;
DROP POLICY IF EXISTS account_transactions_owner_update ON public.account_transactions;
DROP POLICY IF EXISTS account_transactions_owner_delete ON public.account_transactions;
REVOKE INSERT, UPDATE, DELETE ON public.account_transactions FROM authenticated, anon;