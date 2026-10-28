CREATE TABLE public.account_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('credit','debit')),
  amount numeric NOT NULL CHECK (amount >= 0),
  narration text,
  reference text,
  balance_after numeric,
  status text NOT NULL DEFAULT 'Completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_transactions TO authenticated;
GRANT ALL ON public.account_transactions TO service_role;

ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_transactions_owner_select ON public.account_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY account_transactions_owner_insert ON public.account_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY account_transactions_owner_update ON public.account_transactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY account_transactions_owner_delete ON public.account_transactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
