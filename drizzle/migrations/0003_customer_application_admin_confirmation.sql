ALTER TABLE public.customer_applications ADD COLUMN admin_review_status text NOT NULL DEFAULT 'pending' CHECK (admin_review_status IN ('pending', 'confirmed', 'rejected'));
ALTER TABLE public.customer_applications ADD COLUMN admin_reviewed_at timestamptz;
DROP POLICY applications_submit_own ON public.customer_applications;
CREATE POLICY applications_submit_own ON public.customer_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'verification_required' AND admin_review_status = 'pending' AND admin_reviewed_at IS NULL);
COMMENT ON COLUMN public.customer_applications.admin_review_status IS 'Administrator application review only; does not verify identity or open a live bank account.';