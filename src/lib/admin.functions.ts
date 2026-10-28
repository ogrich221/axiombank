import { createServerFn } from '@tanstack/react-start';
import { useSession, setResponseHeader } from '@tanstack/react-start/server';
import type { AdminUser, AdminEvent, UserTransaction } from './admin-demo';
import { confirmApplicationSchema, type AdminApplication } from './customer-account-state';

type GateSession = { unlocked?: boolean };

function sessionConfig() {
  const password = process.env['SESSION_SECRET'];
  if (!password) throw new Error('SESSION_SECRET is not set');
  return { password, name: 'axiom-admin', maxAge: 60 * 60 * 8, cookie: { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' } };
}

async function digest(value: string) { return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))); }
async function passcodeMatches(input: string, expected: string) {
  const [a, b] = await Promise.all([digest(input), digest(expected)]);
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

async function requireUnlocked() {
  setResponseHeader('Cache-Control', 'no-store');
  const session = await useSession<GateSession>(sessionConfig());
  if (!session.data.unlocked) throw new Error('Admin passcode required');
}

async function db() { const { supabaseAdmin } = await import('@/integrations/supabase/client.server'); return supabaseAdmin; }

type Row = { id: string; first_name: string; last_name: string; email: string; phone: string; role: string; status: string; verified: boolean; joined: string; activity: string | null };
const toUser = (r: Row): AdminUser => ({ id: r.id, firstName: r.first_name, lastName: r.last_name, email: r.email, phone: r.phone, role: r.role as AdminUser['role'], status: r.status as AdminUser['status'], verified: r.verified, joined: r.joined, activity: r.activity });

export const getAdminStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  return { unlocked: !!session.data.unlocked };
});

export const unlockAdmin = createServerFn({ method: 'POST' })
  .inputValidator((data: { passcode: string }) => ({ passcode: String(data?.passcode ?? '').slice(0, 200) }))
  .handler(async ({ data }) => {
    const expected = process.env['ADMIN_PASSCODE'];
    if (!expected) throw new Error('ADMIN_PASSCODE is not set');
    if (!(await passcodeMatches(data.passcode, expected))) return { ok: false as const };
    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockAdmin = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const getAdminData = createServerFn({ method: 'GET' }).handler(async () => {
  await requireUnlocked();
  const client = await db();
  const [users, events, applications, profiles] = await Promise.all([
    client.from('admin_users').select('*').order('joined', { ascending: false }),
    client.from('admin_events').select('*').order('time', { ascending: false }).limit(500),
    client.from('customer_applications').select('id,user_id,submitted_at,admin_review_status,admin_reviewed_at').order('submitted_at', { ascending: false }),
    client.from('profiles').select('id,first_name,last_name,phone,country,address,city'),
  ]);
  if (users.error || events.error || applications.error || profiles.error) throw new Error('Could not load the user directory');

  // Collect transactions from account_transactions and admin_events
  const transactions: UserTransaction[] = [];
  try {
    const txRes = await client.from('account_transactions').select('*').order('created_at', { ascending: false });
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
          status: (t.status || 'Completed') as 'Completed',
          balanceAfter: Number(t.balance_after || 0)
        });
      }
    }
  } catch {}

  // Parse transactions recorded in admin_events
  for (const ev of (events.data as AdminEvent[]) || []) {
    if (ev.action === 'Account Credited' || ev.action === 'Account Debited') {
      try {
        const payload = JSON.parse(ev.target);
        if (payload && payload.userId && payload.amount) {
          if (!transactions.some(t => t.reference === payload.reference || t.id === ev.id)) {
            transactions.push({
              id: ev.id,
              userId: payload.userId,
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
  }

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Compute balances per user
  const balancesByUser = new Map<string, number>();
  for (const t of [...transactions].reverse()) {
    if ((t.status as string) === 'Rejected') {
      t.balanceAfter = balancesByUser.get(t.userId) || 0;
      continue;
    }
    const prev = balancesByUser.get(t.userId) || 0;
    const next = t.type === 'credit'
      ? ((t.status as string) === 'Pending' ? prev : prev + t.amount)
      : prev - t.amount;
    balancesByUser.set(t.userId, next);
    t.balanceAfter = next;
  }

  const enrichedUsers: AdminUser[] = (users.data as Row[]).map(r => {
    const u = toUser(r);
    const bal = balancesByUser.get(u.id) ?? 0;
    return { ...u, balance: bal.toFixed(2) };
  });

  const profileMap = new Map(profiles.data.map(p => [p.id, p]));
  const loaded = await Promise.all(applications.data.map(async a => {
    const p = profileMap.get(a.user_id);
    const { data, error } = await client.auth.admin.getUserById(a.user_id);
    if (error || !data?.user) return null; // account was removed
    return { id: a.id, userId: a.user_id, firstName: p?.first_name ?? '', lastName: p?.last_name ?? '', phone: p?.phone ?? '', country: p?.country ?? '', address: [p?.address, p?.city].filter(Boolean).join(', '), email: data.user.email ?? '', emailVerified: Boolean(data.user.email_confirmed_at), submittedAt: a.submitted_at, reviewStatus: a.admin_review_status, reviewedAt: a.admin_reviewed_at } as AdminApplication;
  }));
  const customerApplications: AdminApplication[] = loaded.filter((a): a is AdminApplication => a !== null);
  return { users: enrichedUsers, events: events.data as AdminEvent[], applications: customerApplications, transactions };
});

export const confirmCustomerApplication = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => confirmApplicationSchema.parse(input))
  .handler(async ({ data }) => {
    await requireUnlocked();
    const client = await db();
    const { error } = await client.rpc('confirm_customer_application', { application_id: data.id });
    if (error) throw new Error('This application could not be confirmed. Refresh and try again.');
    return { ok: true as const };
  });

export const saveAdminUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { user: AdminUser; isNew: boolean }) => data)
  .handler(async ({ data }) => {
    await requireUnlocked();
    const u = data.user; const client = await db();
    const row = { first_name: u.firstName.trim(), last_name: u.lastName.trim(), email: u.email.trim().toLowerCase(), phone: u.phone.trim(), role: u.role, status: u.status };
    if (!row.first_name || !row.last_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return { ok: false as const, error: 'Enter a first name, last name and valid email.' };
    
    if (data.isNew) {
      await client.auth.admin.createUser({
        email: row.email,
        user_metadata: { first_name: row.first_name, last_name: row.last_name, phone: row.phone },
        email_confirm: true
      }).catch(err => {
        console.warn('[Admin] Auth account provision notice:', err);
      });
    }

    const result = data.isNew
      ? await client.from('admin_users').insert({ ...row, id: `VR-${crypto.randomUUID().slice(0, 8).toUpperCase()}` }).select('*').single()
      : await client.from('admin_users').update(row).eq('id', u.id).select('*').single();
    if (result.error) { console.error(result.error); return { ok: false as const, error: result.error.code === '23505' ? 'A user with this email already exists.' : 'Could not save this user.' }; }
    const saved = toUser(result.data as Row);
    // Activating a registered account from the directory also confirms its pending application.
    if (!data.isNew && saved.status === 'Active' && /^[0-9a-f-]{36}$/i.test(saved.id)) {
      const { data: app } = await client.from('customer_applications').select('id').eq('user_id', saved.id).eq('admin_review_status', 'pending').maybeSingle();
      if (app) await client.rpc('confirm_customer_application', { application_id: app.id });
    }
    await client.from('admin_events').insert({ actor: 'Administrator', action: data.isNew ? 'User created' : 'Profile updated', target: `${saved.firstName} ${saved.lastName}` });
    return { ok: true as const, user: saved };
  });

export const deleteAdminUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => ({ id: String(data?.id ?? '') }))
  .handler(async ({ data }) => {
    await requireUnlocked();
    const client = await db();
    const { data: removed, error } = await client.from('admin_users').delete().eq('id', data.id).select('first_name,last_name').maybeSingle();
    if (error) { console.error(error); return { ok: false as const }; }

    // If an auth user or profile exists with this ID, remove from auth as well
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id)) {
      await client.from('customer_applications').delete().eq('user_id', data.id);
      await client.auth.admin.deleteUser(data.id).catch(() => {});
    }

    const name = removed ? `${removed.first_name} ${removed.last_name}` : 'User';
    await client.from('admin_events').insert({ actor: 'Administrator', action: 'User deleted', target: name });
    return { ok: true as const };
  });

export const adjustUserBalance = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; type: 'credit' | 'debit'; amount: number; narration: string; date?: string }) => ({
    userId: String(data.userId || '').trim(),
    type: data.type === 'debit' ? ('debit' as const) : ('credit' as const),
    amount: Math.abs(Number(data.amount)),
    narration: String(data.narration || '').trim().slice(0, 255),
    date: data.date ? String(data.date).trim() : undefined,
  }))
  .handler(async ({ data }) => {
    await requireUnlocked();
    if (!data.userId) return { ok: false as const, error: 'User identifier is required.' };
    if (!data.amount || isNaN(data.amount) || data.amount <= 0) return { ok: false as const, error: 'Enter a valid amount greater than $0.00.' };
    if (!data.narration) return { ok: false as const, error: 'Transaction narration is required.' };

    const client = await db();

    const [adminUserRes, profileRes] = await Promise.all([
      client.from('admin_users').select('id, first_name, last_name, email').eq('id', data.userId).maybeSingle(),
      client.from('profiles').select('id, first_name, last_name').eq('id', data.userId).maybeSingle(),
    ]);

    const targetName = adminUserRes.data 
      ? `${adminUserRes.data.first_name} ${adminUserRes.data.last_name}`
      : profileRes.data
      ? `${profileRes.data.first_name} ${profileRes.data.last_name}`
      : 'Account Holder';

    const reference = `TX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const txDate = data.date && !isNaN(Date.parse(data.date))
      ? new Date(data.date).toISOString()
      : new Date().toISOString();

    // Try inserting into account_transactions table
    try {
      await client.from('account_transactions').insert({
        user_id: data.userId,
        type: data.type,
        amount: data.amount,
        narration: data.narration,
        reference,
        balance_after: data.amount,
        status: 'Completed',
        created_at: txDate,
      });
    } catch (err) {
      console.warn('[Admin] Account transaction table insert notice:', err);
    }

    // Record audit event in admin_events
    const eventPayload = {
      userId: data.userId,
      userName: targetName,
      type: data.type,
      amount: data.amount,
      narration: data.narration,
      reference,
      date: txDate,
    };

    await client.from('admin_events').insert({
      actor: 'Administrator',
      action: data.type === 'credit' ? 'Account Credited' : 'Account Debited',
      target: JSON.stringify(eventPayload),
      outcome: 'Success',
      time: txDate,
    });

    return { 
      ok: true as const, 
      reference, 
      message: `Account successfully ${data.type === 'credit' ? 'credited' : 'debited'} with $${data.amount.toFixed(2)}. Narration: ${data.narration}` 
    };
  });
