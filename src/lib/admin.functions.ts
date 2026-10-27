import { createServerFn } from '@tanstack/react-start';
import { useSession, setResponseHeader } from '@tanstack/react-start/server';
import type { AdminUser, AdminEvent } from './admin-demo';
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
  const profileMap = new Map(profiles.data.map(p => [p.id, p]));
  const customerApplications: AdminApplication[] = await Promise.all(applications.data.map(async a => {
    const p = profileMap.get(a.user_id);
    const { data, error } = await client.auth.admin.getUserById(a.user_id);
    if (error) throw new Error('Could not load an applicant');
    return { id: a.id, userId: a.user_id, firstName: p?.first_name ?? '', lastName: p?.last_name ?? '', phone: p?.phone ?? '', country: p?.country ?? '', address: [p?.address, p?.city].filter(Boolean).join(', '), email: data.user.email ?? '', emailVerified: Boolean(data.user.email_confirmed_at), submittedAt: a.submitted_at, reviewStatus: a.admin_review_status, reviewedAt: a.admin_reviewed_at };
  }));
  return { users: (users.data as Row[]).map(toUser), events: events.data as AdminEvent[], applications: customerApplications };
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
    const result = data.isNew
      ? await client.from('admin_users').insert({ ...row, id: `VR-${crypto.randomUUID().slice(0, 8).toUpperCase()}` }).select('*').single()
      : await client.from('admin_users').update(row).eq('id', u.id).select('*').single();
    if (result.error) { console.error(result.error); return { ok: false as const, error: result.error.code === '23505' ? 'A user with this email already exists.' : 'Could not save this user.' }; }
    const saved = toUser(result.data as Row);
    await client.from('admin_events').insert({ actor: 'Administrator', action: data.isNew ? 'User created' : 'Profile updated', target: `${saved.firstName} ${saved.lastName}` });
    return { ok: true as const, user: saved };
  });

export const deleteAdminUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => ({ id: String(data?.id ?? '') }))
  .handler(async ({ data }) => {
    await requireUnlocked();
    const client = await db();
    const { data: removed, error } = await client.from('admin_users').delete().eq('id', data.id).select('first_name,last_name').single();
    if (error) { console.error(error); return { ok: false as const }; }
    await client.from('admin_events').insert({ actor: 'Administrator', action: 'User deleted', target: `${removed.first_name} ${removed.last_name}` });
    return { ok: true as const };
  });
