CREATE TABLE public.admin_users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'Customer',
  status TEXT NOT NULL DEFAULT 'Active',
  verified BOOLEAN NOT NULL DEFAULT false,
  joined TIMESTAMPTZ NOT NULL DEFAULT now(),
  activity TIMESTAMPTZ
);
GRANT ALL ON public.admin_users TO service_role;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  outcome TEXT NOT NULL DEFAULT 'Success',
  time TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_events TO service_role;
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;