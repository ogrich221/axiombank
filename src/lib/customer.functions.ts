import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { profileSchema, registrationSchema } from './customer-schemas';
import { zeroBalances, accountNumberFor, formatAccountNumber } from './customer-account-state';

function decodeAvatarPng(image: string) {
  if (!image.startsWith('data:image/png;base64,')) throw new Error('Choose a valid profile photo.');
  const bytes = Uint8Array.from(atob(image.slice(22)), character => character.charCodeAt(0));
  if (bytes.length > 2 * 1024 * 1024 || bytes.length < 24 || ![137,80,78,71,13,10,26,10].every((value, index) => bytes[index] === value)) throw new Error('Choose a photo smaller than 2 MB.');
  const dimensions = new DataView(bytes.buffer);
  if (dimensions.getUint32(16) > 1024 || dimensions.getUint32(20) > 1024) throw new Error('Photo is too large.');
  return bytes;
}

export const registerCustomer = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => ({ ...registrationSchema.parse(input), photo: (input as { photo?: string })?.photo }))
  .handler(async ({ data }) => {
    const photoBytes = data.photo ? decodeAvatarPng(data.photo) : null;
    const input = registrationSchema.parse(data);
    const { createClient } = await import('@supabase/supabase-js');
    const { getRequest, setResponseHeader } = await import('@tanstack/react-start/server');
    setResponseHeader('Cache-Control', 'no-store');
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    const url = process.env['SUPABASE_URL'];
    if (!key || !url) throw new Error('Registration is unavailable. Try again later.');
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (request, init) => { const headers = new Headers(init?.headers); if (headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey', key); return fetch(request, { ...init, headers }); } } });
    const origin = new URL(getRequest().url).origin;
    const { email, password, confirm_password: _confirm, confirm_transfer_pin: _cpin, terms: _terms, photo, ...profile } = input;
    const { data: signUpData, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth`,
        data: { ...profile, transfer_pin: input.transfer_pin, terms_accepted: 'true' }
      }
    });
    if (error) {
      console.error('Customer registration failed', error.code, error.status);
      throw new Error('Registration could not be completed. Please try again or contact support.');
    }
    if (signUpData?.user?.id) {
      try {
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const updates: Record<string, unknown> = {
          notification_preferences: { transfer_pin: input.transfer_pin }
        };
        if (photoBytes) {
          const path = `${signUpData.user.id}/${crypto.randomUUID()}.png`;
          const { error: uploadError } = await supabaseAdmin.storage.from('customer-avatars').upload(path, photoBytes, { contentType: 'image/png' });
          if (!uploadError) updates.avatar_path = path;
        }
        await supabaseAdmin.from('profiles').update(updates).eq('id', signUpData.user.id);
      } catch {}
    }
    return { confirmationRequired: true };
  });

export const getCustomerWorkspace = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { setResponseHeader } = await import('@tanstack/react-start/server');
  setResponseHeader('Cache-Control', 'no-store');
  const { data: profile, error } = await context.supabase.from('profiles').select('*').eq('id', context.userId).maybeSingle();
  if (error) throw new Error('Your profile could not be loaded.');
  const { data: application, error: applicationError } = await context.supabase.from('customer_applications').select('status,submitted_at,id,admin_review_status,admin_reviewed_at').eq('user_id', context.userId).maybeSingle();
  if (applicationError) throw new Error('Your application could not be loaded.');
  {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: dir } = await supabaseAdmin.from('admin_users').select('status').eq('id', context.userId).maybeSingle();
    if (dir?.status === 'Suspended') throw new Error('This account has been suspended. Please contact AXIOM BANK support.');
  }
  const { data: authData } = await context.supabase.auth.getUser();
  const userEmail = (authData.user?.email ?? '').toLowerCase();

  let avatarUrl: string | null = null;
  if (profile?.avatar_path?.startsWith(`${context.userId}/`)) { const { data } = await context.supabase.storage.from('customer-avatars').createSignedUrl(profile.avatar_path, 3600); avatarUrl = data?.signedUrl ?? null; }

  // Fetch transactions from account_transactions and admin_events using supabaseAdmin for guaranteed access
  const transactions: Array<{
    id: string;
    userId: string;
    type: 'credit' | 'debit';
    amount: number;
    narration: string;
    date: string;
    createdAt: string;
    reference: string;
    status: string;
    balanceAfter?: number;
  }> = [];

  try {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const txRes = await supabaseAdmin.from('account_transactions').select('*').eq('user_id', context.userId).order('created_at', { ascending: false });
    if (txRes.data && Array.isArray(txRes.data)) {
      for (const t of txRes.data) {
        transactions.push({
          id: t.id,
          userId: t.user_id,
          type: t.type as 'credit' | 'debit',
          amount: Number(t.amount),
          narration: t.narration ?? '',
          date: t.created_at,
          createdAt: t.created_at,
          reference: t.reference ?? '',
          status: t.status || 'Completed',
          balanceAfter: Number(t.balance_after || 0)
        });
      }
    }

    const evRes = await supabaseAdmin.from('admin_events').select('*').in('action', ['Account Credited', 'Account Debited', 'Transfer Initiated', 'Transfer Approved', 'Transfer Rejected']).order('time', { ascending: false });
    for (const ev of evRes.data || []) {
      try {
        const payload = JSON.parse(ev.target);
        if (payload && (payload.userId === context.userId || payload.senderUserId === context.userId || (userEmail && payload.email && payload.email.toLowerCase() === userEmail.toLowerCase()))) {
          if (!transactions.some(t => t.reference === payload.reference || t.id === ev.id)) {
            transactions.push({
              id: ev.id,
              userId: context.userId,
              type: payload.type || (ev.action === 'Account Credited' ? 'credit' : 'debit'),
              amount: Number(payload.amount),
              narration: payload.narration || '',
              date: payload.date || ev.time,
              createdAt: payload.date || ev.time,
              reference: payload.reference || `TX-${ev.id.slice(0, 8).toUpperCase()}`,
              status: payload.status || 'Completed',
              balanceAfter: payload.balanceAfter
            });
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn('[Workspace] Ledger fetch warning:', err);
  }

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentBalance = 0;
  for (const t of [...transactions].reverse()) {
    if (t.status === 'Rejected') {
      t.balanceAfter = currentBalance;
      continue;
    }
    if (t.type === 'credit') {
      if (t.status === 'Completed') {
        currentBalance += t.amount;
      }
    } else {
      // debit: both Pending and Completed reduce available balance
      currentBalance -= t.amount;
    }
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
    const bytes = decodeAvatarPng(data.image);
    path = `${context.userId}/${crypto.randomUUID()}.png`;
    const { error } = await context.supabase.storage.from('customer-avatars').upload(path, bytes, { contentType: 'image/png' });
    if (error) throw new Error('Your photo could not be uploaded.');
  }
  const { error } = await context.supabase.from('profiles').upsert({ id: context.userId, avatar_path: path });
  if (error) { if (path) await context.supabase.storage.from('customer-avatars').remove([path]); throw new Error('Your photo could not be saved.'); }
  if (profile?.avatar_path?.startsWith(`${context.userId}/`)) await context.supabase.storage.from('customer-avatars').remove([profile.avatar_path]);
  return { saved: true };
});

async function computeUserBalance(supabaseAdminClient: any, userId: string, userEmail: string): Promise<number> {
  const transactions: Array<{ id: string; type: 'credit' | 'debit'; amount: number; reference: string; date: string; status: string }> = [];

  try {
    const txRes = await supabaseAdminClient.from('account_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (txRes.data && Array.isArray(txRes.data)) {
      for (const t of txRes.data) {
        transactions.push({
          id: t.id,
          type: t.type as 'credit' | 'debit',
          amount: Number(t.amount),
          reference: t.reference,
          date: t.created_at,
          status: t.status || 'Completed',
        });
      }
    }
  } catch {}

  try {
    const evRes = await supabaseAdminClient.from('admin_events').select('*').in('action', ['Account Credited', 'Account Debited', 'Transfer Initiated', 'Transfer Approved', 'Transfer Rejected']).order('time', { ascending: false });
    for (const ev of evRes.data || []) {
      try {
        const payload = JSON.parse(ev.target);
        if (payload && (payload.userId === userId || payload.senderUserId === userId || (userEmail && payload.email && payload.email.toLowerCase() === userEmail.toLowerCase()))) {
          if (!transactions.some(t => t.reference === payload.reference || t.id === ev.id)) {
            transactions.push({
              id: ev.id,
              type: payload.type || (ev.action === 'Account Credited' ? 'credit' : 'debit'),
              amount: Number(payload.amount),
              reference: payload.reference || `TX-${ev.id.slice(0, 8).toUpperCase()}`,
              date: payload.date || ev.time,
              status: payload.status || 'Completed',
            });
          }
        }
      } catch {}
    }
  } catch {}

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentBalance = 0;
  for (const t of [...transactions].reverse()) {
    if (t.status === 'Rejected') continue;
    if (t.type === 'credit') {
      if (t.status === 'Completed') {
        currentBalance += t.amount;
      }
    } else {
      // debit: both Pending and Completed reduce available balance
      currentBalance -= t.amount;
    }
  }
  return currentBalance;
}

export const getAxiomTransferRecipients = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { setResponseHeader } = await import('@tanstack/react-start/server');
    setResponseHeader('Cache-Control', 'no-store');

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const [adminRes, profRes] = await Promise.all([
      supabaseAdmin.from('admin_users').select('id, first_name, last_name, email, role, status').neq('id', context.userId),
      supabaseAdmin.from('profiles').select('id, first_name, last_name').neq('id', context.userId),
    ]);

    const profMap = new Map((profRes.data || []).map((p: any) => [p.id, p]));
    const list: Array<{ id: string; name: string; email: string; accountNumber: string; displayAccount: string }> = [];

    for (const u of (adminRes.data || [])) {
      const p = profMap.get(u.id);
      const name = [p?.first_name || u.first_name, p?.last_name || u.last_name].filter(Boolean).join(' ') || u.email;
      const acc = accountNumberFor(u.id);
      list.push({
        id: u.id,
        name,
        email: u.email || '',
        accountNumber: acc,
        displayAccount: formatAccountNumber(acc, true),
      });
    }

    return list;
  });

export const executeCustomerTransfer = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      recipient: z.string().trim().min(2, 'Enter recipient name.').max(100),
      bank: z.string().trim().min(2, 'Enter destination bank.').max(100),
      account: z.string().trim().min(2, 'Enter valid account number.').max(50),
      bankAddress: z.string().optional(),
      amount: z.coerce.number().positive('Enter amount greater than $0.00.').finite().max(1000000),
      pin: z.string().trim().min(4, 'Enter your 4-digit transfer PIN.').max(4, 'PIN must be 4 digits.'),
      reference: z.string().trim().max(140).default(''),
      destinationCountry: z.string().optional(),
      recipientUserId: z.string().optional(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { setResponseHeader } = await import('@tanstack/react-start/server');
    setResponseHeader('Cache-Control', 'no-store');

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: authData } = await context.supabase.auth.getUser();
    const userEmail = (authData.user?.email ?? '').toLowerCase();

    // Verify 4-digit transfer PIN
    if (!data.pin || !/^\d{4}$/.test(data.pin)) {
      throw new Error('Please enter your 4-digit transfer authorization PIN.');
    }

    let configuredPin = authData.user?.user_metadata?.['transfer_pin'] as string | undefined;

    if (!configuredPin) {
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('notification_preferences')
        .eq('id', context.userId)
        .maybeSingle();

      const prefs = prof?.notification_preferences as any;
      if (prefs && typeof prefs === 'object' && prefs.transfer_pin) {
        configuredPin = String(prefs.transfer_pin);
      }
    }

    if (configuredPin && configuredPin !== data.pin) {
      throw new Error('Incorrect transfer PIN. Please verify your 4-digit PIN and try again.');
    }

    if (!configuredPin) {
      // First-time PIN setup for existing user
      try {
        await supabaseAdmin.auth.admin.updateUserById(context.userId, {
          user_metadata: { ...authData.user?.user_metadata, transfer_pin: data.pin }
        });
        await supabaseAdmin.from('profiles').update({
          notification_preferences: { transfer_pin: data.pin }
        }).eq('id', context.userId);
      } catch {}
    }

    // 1. Compute sender's current balance
    const senderCurrentBalance = await computeUserBalance(supabaseAdmin, context.userId, userEmail);

    if (data.amount > senderCurrentBalance) {
      throw new Error(`Insufficient available funds. Your current available balance is $${senderCurrentBalance.toFixed(2)} USD.`);
    }

    // 2. Fetch sender info for narration
    const [senderProfileRes, senderUserRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('first_name, last_name').eq('id', context.userId).maybeSingle(),
      supabaseAdmin.from('admin_users').select('first_name, last_name').eq('id', context.userId).maybeSingle(),
    ]);

    const senderName = [senderProfileRes.data?.first_name || senderUserRes.data?.first_name, senderProfileRes.data?.last_name || senderUserRes.data?.last_name].filter(Boolean).join(' ')
      || userEmail
      || 'AXIOM Customer';

    // 3. Search for recipient user in admin_users and profiles
    let targetUser: { id: string; name: string; email: string } | null = null;

    if (data.recipientUserId && data.recipientUserId !== context.userId) {
      const { data: targetAdmin } = await supabaseAdmin
        .from('admin_users')
        .select('id, first_name, last_name, email')
        .eq('id', data.recipientUserId)
        .maybeSingle();
      if (targetAdmin) {
        targetUser = {
          id: targetAdmin.id,
          name: `${targetAdmin.first_name || ''} ${targetAdmin.last_name || ''}`.trim() || targetAdmin.email,
          email: targetAdmin.email || '',
        };
      }
    }

    if (!targetUser) {
      const cleanRecip = (data.recipient || '').trim().toLowerCase();
      const cleanAcc = (data.account || '').replace(/[\s-]/g, '').toLowerCase();

      const { data: allUsers } = await supabaseAdmin
        .from('admin_users')
        .select('id, first_name, last_name, email');

      for (const u of (allUsers || [])) {
        if (u.id === context.userId) continue;
        const uEmail = (u.email || '').toLowerCase();
        const uName = `${u.first_name || ''} ${u.last_name || ''}`.trim().toLowerCase();
        const uAccount = accountNumberFor(u.id).toLowerCase();

        const matchEmail = uEmail && (cleanRecip === uEmail || cleanAcc === uEmail);
        const matchAccount = cleanAcc === uAccount || cleanRecip === uAccount || (cleanAcc.length >= 6 && uAccount.includes(cleanAcc));
        const matchId = u.id.toLowerCase() === cleanAcc || u.id.toLowerCase() === cleanRecip;
        const matchName = uName && (cleanRecip === uName || cleanAcc === uName);

        if (matchEmail || matchAccount || matchId || matchName) {
          targetUser = {
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
            email: u.email || '',
          };
          break;
        }
      }
    }

    const reference = `TR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const date = new Date().toISOString();

    const senderNewBalance = senderCurrentBalance - data.amount;

    const isInternationalWire = Boolean(data.destinationCountry && data.destinationCountry !== 'Domestic');

    const defaultPrefix = targetUser
      ? `Transfer to ${targetUser.name} (AXIOM Customer)`
      : isInternationalWire
      ? `International Wire to ${data.recipient} (${data.bank}, ${data.destinationCountry})`
      : `Domestic Wire to ${data.recipient} (${data.bank})`;

    const senderNarration = data.reference.trim()
      ? `${defaultPrefix} - ${data.reference.trim()}`
      : defaultPrefix;

    // 4. Record Sender Debit in account_transactions with status: 'Pending'
    // This immediately deducts the funds from the sender's available balance awaiting admin review.
    try {
      await supabaseAdmin.from('account_transactions').insert({
        user_id: context.userId,
        type: 'debit',
        amount: data.amount,
        narration: senderNarration,
        reference,
        balance_after: senderNewBalance,
        status: 'Pending',
        created_at: date,
      });
    } catch (err) {
      console.warn('account_transactions sender debit notice:', err);
    }

    // 5. Dual-write Transfer Initiated to admin_events with complete metadata
    try {
      await supabaseAdmin.from('admin_events').insert({
        actor: userEmail || 'Customer',
        action: 'Transfer Initiated',
        target: JSON.stringify({
          userId: context.userId,
          senderUserId: context.userId,
          senderEmail: userEmail,
          senderName,
          userName: targetUser ? targetUser.name : data.recipient,
          recipientName: targetUser ? targetUser.name : data.recipient,
          recipientBank: targetUser ? 'AXIOM BANK (Internal)' : data.bank,
          recipientAccount: data.account,
          recipientBankAddress: data.bankAddress,
          destinationCountry: data.destinationCountry || (targetUser ? 'Internal' : 'Domestic'),
          transferType: targetUser ? 'Internal' : isInternationalWire ? 'International Wire' : 'Domestic Wire',
          targetUserId: targetUser ? targetUser.id : undefined,
          targetUserEmail: targetUser ? targetUser.email : undefined,
          type: 'debit',
          amount: data.amount,
          narration: senderNarration,
          reference,
          date,
          status: 'Pending',
          balanceAfter: senderNewBalance,
          isInternal: Boolean(targetUser),
        }),
        time: date,
      });
    } catch (err) {
      console.warn('admin_events transfer initiated notice:', err);
    }

    return {
      success: true,
      reference,
      amount: data.amount,
      balanceAfter: senderNewBalance.toFixed(2),
      isInternal: Boolean(targetUser),
      isWire: !targetUser,
      destinationCountry: data.destinationCountry || (targetUser ? 'Internal' : 'Domestic'),
      recipientName: targetUser ? targetUser.name : data.recipient,
      status: 'Pending',
      date,
    };
  });

export const updateCustomerTransferPin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      currentPin: z.string().optional(),
      newPin: z.string().trim().regex(/^\d{4}$/, 'New PIN must be 4 digits.'),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: authData } = await context.supabase.auth.getUser();

    let configuredPin = authData.user?.user_metadata?.['transfer_pin'] as string | undefined;
    if (!configuredPin) {
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('notification_preferences')
        .eq('id', context.userId)
        .maybeSingle();
      const prefs = prof?.notification_preferences as any;
      if (prefs && typeof prefs === 'object' && prefs.transfer_pin) {
        configuredPin = String(prefs.transfer_pin);
      }
    }

    if (configuredPin && data.currentPin && configuredPin !== data.currentPin) {
      throw new Error('Current transfer PIN does not match.');
    }

    await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      user_metadata: { ...authData.user?.user_metadata, transfer_pin: data.newPin }
    });
    await supabaseAdmin.from('profiles').update({
      notification_preferences: { transfer_pin: data.newPin }
    }).eq('id', context.userId);

    return { success: true };
  });
