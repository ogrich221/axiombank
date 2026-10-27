CREATE FUNCTION public.confirm_customer_application(application_id uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE applicant uuid;
BEGIN
  UPDATE public.customer_applications SET admin_review_status = 'confirmed', admin_reviewed_at = now() WHERE id = application_id AND admin_review_status = 'pending' RETURNING user_id INTO applicant;
  IF applicant IS NULL THEN RAISE EXCEPTION 'Application is not pending'; END IF;
  INSERT INTO public.admin_events(actor, action, target) SELECT 'Administrator', 'Customer application confirmed', concat(first_name, ' ', last_name) FROM public.profiles WHERE id = applicant;
END;
$$;
REVOKE ALL ON FUNCTION public.confirm_customer_application(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_customer_application(uuid) TO service_role;