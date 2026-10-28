import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { profileSchema, registrationSchema } from './customer-schemas';
import { zeroBalances } from './customer-account-state';

export const registerCustomer = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => registrationSchema.parse(input))
  .handler(async ({ data }) => {
    const input = registrationSchema.parse(data);
    const { createClient } = await import('@supabase/supabase-js');
    const { getRequest, setResponseHeader } = await import('@tanstack/react-start/server');
    setResponseHeader('Cache-Control', 'no-store');
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    const url = process.env['SUPABASE_URL'];
    if (!key || !url) throw new Error('Registration is unavailable. Try again later.');
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (request, init) => { const headers = new Headers(init?.headers); if (headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey', key); return fetch(request, { ...init, headers }); } } });
    const origin = new URL(getRequest().url).origin;
    const { email, password, confirm_password: _confirm, terms: _terms, ...profile } = input;
    const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth`, data: { ...profile, terms_accepted: 'true' } } });
    if (error) { console.error('Customer registration failed', error.code, error.status); throw new Error('Registration could not be completed. Please try again or contact support.'); }
    return { confirmationRequired: true };
  });

export const getCustomerWorkspace = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { setResponseHeader } = await import('@tanstack/react-start/server');
  setResponseHeader('Cache-Control', 'no-store');
  const { data: profile, error } = await context.supabase.from('profiles').select('*').eq('id', context.userId).maybeSingle();
  if (error) throw new Error('Your profile could not be loaded.');
  const { data: application, error: applicationError } = await context.supabase.from('customer_applications').select('status,submitted_at,id,admin_review_status,admin_reviewed_at').eq('user_id', context.userId).maybeSingle();
  if (applicationError) throw new Error('Your application could not be loaded.');
  const { data: authData } = await context.supabase.auth.getUser();
  const userEmail = (authData.user?.email ?? '').toLowerCase();

  let avatarUrl: string | null = null;
  if (profile?.avatar_path?.startsWith(`${context.userId}/`)) { const { data } = await context.supabase.storage.from('customer-avatars').createSignedUrl(profile.avatar_path, 3600); avatarUrl = data?.signedUrl ?? null; }

  // Fetch transactions from account_transactions and admin_events
  const transactions: Array<{
    id: string;
    userId: string;
    type: 'credit' | 'debit';
    amount: number;
    narration: string;
    date: string;
    reference: string;
    status: string;
    balanceAfter?: number;
  }> = [];

  try {
    const txRes = await context.supabase.from('account_transactions').select('*').eq('user_id', context.userId).order('created_at', { ascending: false });
    if (txRes.data && Array.isArray(txRes.data)) {
      for (const t of txRes.data) {
        transactions.push({
          id: t.id,
          userId: t.user_id,
          type: t.type as 'credit' | 'debit',
          amount: Number(t.amount),
          narration: t.narration ?? '',
          date: t.created_at,
          reference: t.reference ?? '',
          status: t.status || 'Completed',
          balanceAfter: Number(t.balance_after || 0)
        });
      }
    }
  } catch {}

  try {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const evRes = await supabaseAdmin.from('admin_events').select('*').in('action', ['Account Credited', 'Account Debited']).order('time', { ascending: false });
    for (const ev of evRes.data || []) {
      try {
        const payload = JSON.parse(ev.target);
        if (payload && (payload.userId === context.userId || (userEmail && payload.email === userEmail))) {
          if (!transactions.some(t => t.reference === payload.reference || t.id === ev.id)) {
            transactions.push({
              id: ev.id,
              userId: context.userId,
              type: payload.type || (ev.action === 'Account Credited' ? 'credit' : 'debit'),
              amount: Number(payload.amount),
              narration: payload.narration || '',
              date: payload.date || ev.time,
              reference: payload.reference || `TX-${ev.id.slice(0, 8).toUpperCase()}`,
              status: 'Completed',
              balanceAfter: payload.balanceAfter
            });
          }
        }
      } catch {}
    }
  } catch {}

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentBalance = 0;
  for (const t of [...transactions].reverse()) {
    currentBalance = t.type === 'credit' ? currentBalance + t.amount : currentBalance - t.amount;
    t.balanceAfter = currentBalance;
  }

  const balances = {
    available: currentBalance.toFixed(2),
    total: currentBalance.toFixed(2)
  };

  return { profile, application, balances, transactions, avatarUrl, email: authData.user?.email ?? '', emailVerified: Boolean(authData.user?.email_confirmed_at) };
});

export const updateCustomerProfile = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => profileSchema.parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('profiles').upsert({ ...data, id: context.userId });
  if (error) throw new Error('Your changes could not be saved.');
  return { saved: true };
});
export const submitCustomerApplication = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ terms: z.literal(true) }).parse(input)).handler(async ({ context }) => {
  const { data: profile } = await context.supabase.from('profiles').select('*').eq('id', context.userId).single();
  profileSchema.parse(profile);
  const { error } = await context.supabase.from('customer_applications').insert({ user_id: context.userId });
  if (error && error.code !== '23505') throw new Error('Your application could not be submitted.');
  return { submitted: true };
});

export const saveCustomerAvatar = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ image: z.string().max(2800000).nullable() }).parse(input)).handler(async ({ data, context }) => {
  const { data: profile } = await context.supabase.from('profiles').select('avatar_path').eq('id', context.userId).maybeSingle();
  let path: string | null = null;
  if (data.image) {
    if (!data.image.startsWith('data:image/png;base64,')) throw new Error('Choose a valid image.');
    const bytes = Uint8Array.from(atob(data.image.slice(22)), character => character.charCodeAt(0));
    if (bytes.length > 2 * 1024 * 1024 || bytes.length < 24 || ![137,80,78,71,13,10,26,10].every((value, index) => bytes[index] === value)) throw new Error('Choose a PNG smaller than 2 MB.');
    const dimensions = new DataView(bytes.buffer);
    if (dimensions.getUint32(16) > 1024 || dimensions.getUint32(20) > 1024) throw new Error('Image is too large.');
    path = `${context.userId}/${crypto.randomUUID()}.png`;
    const { error } = await context.supabase.storage.from('customer-avatars').upload(path, bytes, { contentType: 'image/png' });
    if (error) throw new Error('Your photo could not be uploaded.');
  }
  const { error } = await context.supabase.from('profiles').upsert({ id: context.userId, avatar_path: path });
  if (error) { if (path) await context.supabase.storage.from('customer-avatars').remove([path]); throw new Error('Your photo could not be saved.'); }
  if (profile?.avatar_path?.startsWith(`${context.userId}/`)) await context.supabase.storage.from('customer-avatars').remove([profile.avatar_path]);
  return { saved: true };
});