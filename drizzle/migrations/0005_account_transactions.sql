CREATE TABLE IF NOT EXISTS public.account_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(12, 2) NOT NULL,
  narration TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  balance_after NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.account_transactions TO service_role;
GRANT SELECT ON public.account_transactions TO authenticated;
ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_transactions_read_own ON public.account_transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);
