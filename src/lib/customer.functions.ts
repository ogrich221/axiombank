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
          narration: t.narration,
          date: t.created_at,
          reference: t.reference,
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


async function computeUserBalance(supabaseClient: any, userId: string, userEmail: string): Promise<number> {
  const transactions: Array<{ id: string; type: 'credit' | 'debit'; amount: number; reference: string; date: string }> = [];

  try {
    const txRes = await supabaseClient.from('account_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (txRes.data && Array.isArray(txRes.data)) {
      for (const t of txRes.data) {
        transactions.push({
          id: t.id,
          type: t.type as 'credit' | 'debit',
          amount: Number(t.amount),
          reference: t.reference,
          date: t.created_at,
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
        if (payload && (payload.userId === userId || (userEmail && payload.email === userEmail))) {
          if (!transactions.some(t => t.reference === payload.reference || t.id === ev.id)) {
            transactions.push({
              id: ev.id,
              type: payload.type || (ev.action === 'Account Credited' ? 'credit' : 'debit'),
              amount: Number(payload.amount),
              reference: payload.reference || `TX-${ev.id.slice(0, 8).toUpperCase()}`,
              date: payload.date || ev.time,
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
  }
  return currentBalance;
}

export const executeCustomerTransfer = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      recipient: z.string().trim().min(2, 'Enter recipient name.').max(100),
      bank: z.string().trim().min(2, 'Enter destination bank.').max(100),
      account: z.string().trim().min(4, 'Enter valid account number.').max(34),
      amount: z.coerce.number().positive('Enter amount greater than $0.00.').finite().max(1000000),
      reference: z.string().trim().max(140).default(''),
      destinationCountry: z.string().optional(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { setResponseHeader } = await import('@tanstack/react-start/server');
    setResponseHeader('Cache-Control', 'no-store');

    const { data: authData } = await context.supabase.auth.getUser();
    const userEmail = (authData.user?.email ?? '').toLowerCase();

    const currentBalance = await computeUserBalance(context.supabase, context.userId, userEmail);

    if (data.amount > currentBalance) {
      throw new Error(`Insufficient available funds. Your current available balance is $${currentBalance.toFixed(2)} USD.`);
    }

    const newBalance = currentBalance - data.amount;
    const reference = `TR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const date = new Date().toISOString();
    const narration = data.reference.trim()
      ? `Transfer to ${data.recipient} (${data.bank}) - ${data.reference.trim()}`
      : `Transfer to ${data.recipient} (${data.bank})`;

    // 1. Insert into account_transactions
    try {
      await context.supabase.from('account_transactions').insert({
        user_id: context.userId,
        type: 'debit',
        amount: data.amount,
        narration,
        reference,
        balance_after: newBalance,
        status: 'Completed',
        created_at: date,
      });
    } catch (err) {
      console.warn('account_transactions insert notice:', err);
    }

    // 2. Dual-write to admin_events
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      await supabaseAdmin.from('admin_events').insert({
        actor: userEmail || 'Customer',
        action: 'Account Debited',
        target: JSON.stringify({
          userId: context.userId,
          email: userEmail,
          userName: data.recipient,
          type: 'debit',
          amount: data.amount,
          narration,
          reference,
          date,
          balanceAfter: newBalance,
          recipientBank: data.bank,
          recipientAccount: data.account,
          destinationCountry: data.destinationCountry || 'Domestic',
        }),
        time: date,
      });
    } catch (err) {
      console.warn('admin_events transfer audit notice:', err);
    }

    return {
      success: true,
      reference,
      amount: data.amount,
      balanceAfter: newBalance.toFixed(2),
      date,
    };
  });
