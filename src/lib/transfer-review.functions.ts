import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { transferReviewInputSchema } from './transfer-review';
import { accountNumberFor, formatAccountNumber } from './customer-account-state';

export interface AdminTransferItem {
  id: string;
  reference: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderAccount: string;
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  destinationCountry: string;
  amount: number;
  narration: string;
  status: 'Pending' | 'Completed' | 'Rejected';
  createdAt: string;
  isInternal: boolean;
  targetUserId?: string;
  targetUserEmail?: string;
  decisionNotes?: string;
  decisionAt?: string;
}

export interface TransferQueueStats {
  pendingCount: number;
  pendingVolume: number;
  approvedCount: number;
  approvedVolume: number;
  rejectedCount: number;
  rejectedVolume: number;
}

export const reviewPendingTransfer = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => transferReviewInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminUnlocked } = await import('./admin-gate.server');
    await requireAdminUnlocked();
    const { reviewTransferDetails, TransferReviewError } = await import('./transfer-review.server');
    try {
      return { review: await reviewTransferDetails(data.details), error: null as string | null };
    } catch (error) {
      return { review: null, error: error instanceof TransferReviewError ? error.message : 'The AI review could not be completed.' };
    }
  });

export const getAdminTransferQueue = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { requireAdminUnlocked } = await import('./admin-gate.server');
    await requireAdminUnlocked();
    const { setResponseHeader } = await import('@tanstack/react-start/server');
    setResponseHeader('Cache-Control', 'no-store');

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    // 1. Fetch transactions, admin events, users, and profiles
    const [txRes, eventsRes, usersRes, profRes] = await Promise.all([
      supabaseAdmin.from('account_transactions').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('admin_events').select('*').in('action', ['Transfer Initiated', 'Account Debited', 'Transfer Approved', 'Transfer Rejected']).order('time', { ascending: false }),
      supabaseAdmin.from('admin_users').select('id, first_name, last_name, email'),
      supabaseAdmin.from('profiles').select('id, first_name, last_name'),
    ]);

    const userMap = new Map((usersRes.data || []).map((u: any) => [u.id, u]));
    const profMap = new Map((profRes.data || []).map((p: any) => [p.id, p]));

    const getUserName = (id: string, fallback = '') => {
      const p = profMap.get(id);
      const u = userMap.get(id);
      const name = [p?.first_name || u?.first_name, p?.last_name || u?.last_name].filter(Boolean).join(' ');
      return name || u?.email || fallback || 'AXIOM Customer';
    };

    const getUserEmail = (id: string, fallback = '') => {
      const u = userMap.get(id);
      return u?.email || fallback || '';
    };

    // Index events by reference for metadata enrichment
    const eventsByRef = new Map<string, any>();
    for (const ev of (eventsRes.data || [])) {
      try {
        const payload = JSON.parse(ev.target);
        if (payload?.reference) {
          const existing = eventsByRef.get(payload.reference);
          eventsByRef.set(payload.reference, { ...existing, ...payload, lastAction: ev.action, eventTime: ev.time });
        }
      } catch {}
    }

    const items: AdminTransferItem[] = [];
    const seenRefs = new Set<string>();

    // 2. Parse from account_transactions (debits or references starting with TR-)
    for (const t of (txRes.data || [])) {
      if (t.type === 'debit' && t.reference && t.reference.startsWith('TR-')) {
        const ref = t.reference;
        seenRefs.add(ref);
        const meta = eventsByRef.get(ref) || {};
        const senderId = t.user_id || meta.userId || meta.senderUserId || '';
        const senderAccount = senderId ? formatAccountNumber(accountNumberFor(senderId), true) : 'Checking (•••• 1042)';
        const rawStatus = (t.status || meta.status || 'Pending').toString();
        const status: 'Pending' | 'Completed' | 'Rejected' =
          rawStatus.toLowerCase() === 'rejected' ? 'Rejected' :
          rawStatus.toLowerCase() === 'completed' ? 'Completed' : 'Pending';

        items.push({
          id: t.id,
          reference: ref,
          senderId,
          senderName: meta.senderName || getUserName(senderId, meta.senderEmail),
          senderEmail: meta.senderEmail || getUserEmail(senderId),
          senderAccount,
          recipientName: meta.recipientName || meta.userName || 'Recipient',
          recipientBank: meta.recipientBank || 'AXIOM BANK',
          recipientAccount: meta.recipientAccount || 'Checking Account',
          destinationCountry: meta.destinationCountry || 'Domestic',
          amount: Number(t.amount),
          narration: t.narration || meta.narration || 'Transfer',
          status,
          createdAt: t.created_at || meta.date || new Date().toISOString(),
          isInternal: Boolean(meta.isInternal || meta.targetUserId),
          targetUserId: meta.targetUserId,
          targetUserEmail: meta.targetUserEmail,
          decisionNotes: meta.notes || meta.reason,
          decisionAt: meta.approvedAt || meta.rejectedAt,
        });
      }
    }

    // 3. Include any Transfer Initiated from admin_events that wasn't in account_transactions
    for (const ev of (eventsRes.data || [])) {
      if (ev.action === 'Transfer Initiated') {
        try {
          const payload = JSON.parse(ev.target);
          if (payload?.reference && !seenRefs.has(payload.reference)) {
            seenRefs.add(payload.reference);
            const senderId = payload.senderUserId || payload.userId || '';
            const senderAccount = senderId ? formatAccountNumber(accountNumberFor(senderId), true) : 'Checking (•••• 1042)';
            const rawStatus = (payload.status || 'Pending').toString();
            const status: 'Pending' | 'Completed' | 'Rejected' =
              rawStatus.toLowerCase() === 'rejected' ? 'Rejected' :
              rawStatus.toLowerCase() === 'completed' ? 'Completed' : 'Pending';

            items.push({
              id: ev.id,
              reference: payload.reference,
              senderId,
              senderName: payload.senderName || getUserName(senderId, payload.senderEmail),
              senderEmail: payload.senderEmail || getUserEmail(senderId),
              senderAccount,
              recipientName: payload.recipientName || payload.userName || 'Recipient',
              recipientBank: payload.recipientBank || 'AXIOM BANK',
              recipientAccount: payload.recipientAccount || 'Checking Account',
              destinationCountry: payload.destinationCountry || 'Domestic',
              amount: Number(payload.amount),
              narration: payload.narration || 'Transfer',
              status,
              createdAt: payload.date || ev.time,
              isInternal: Boolean(payload.isInternal || payload.targetUserId),
              targetUserId: payload.targetUserId,
              targetUserEmail: payload.targetUserEmail,
              decisionNotes: payload.notes || payload.reason,
              decisionAt: payload.approvedAt || payload.rejectedAt,
            });
          }
        } catch {}
      }
    }

    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const pending = items.filter(i => i.status === 'Pending');
    const history = items.filter(i => i.status !== 'Pending');

    const pendingCount = pending.length;
    const pendingVolume = pending.reduce((sum, i) => sum + i.amount, 0);

    const approved = history.filter(i => i.status === 'Completed');
    const approvedCount = approved.length;
    const approvedVolume = approved.reduce((sum, i) => sum + i.amount, 0);

    const rejected = history.filter(i => i.status === 'Rejected');
    const rejectedCount = rejected.length;
    const rejectedVolume = rejected.reduce((sum, i) => sum + i.amount, 0);

    return {
      pending,
      history,
      stats: {
        pendingCount,
        pendingVolume,
        approvedCount,
        approvedVolume,
        rejectedCount,
        rejectedVolume,
      }
    };
  });

export const approveAdminTransfer = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) =>
    z.object({
      reference: z.string().trim().min(2),
      notes: z.string().optional(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const { requireAdminUnlocked } = await import('./admin-gate.server');
    await requireAdminUnlocked();
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const approvedAt = new Date().toISOString();

    // 1. Update sender transaction status in account_transactions
    const { error: updateErr } = await supabaseAdmin
      .from('account_transactions')
      .update({ status: 'Completed' })
      .eq('reference', data.reference)
      .eq('type', 'debit');

    if (updateErr) {
      console.warn('account_transactions update notice:', updateErr);
    }

    // 2. Find metadata from admin_events to check if recipient is an internal AXIOM member
    const { data: events } = await supabaseAdmin
      .from('admin_events')
      .select('*')
      .in('action', ['Transfer Initiated', 'Account Debited'])
      .order('time', { ascending: false });

    let transferMeta: any = null;
    for (const ev of (events || [])) {
      try {
        const payload = JSON.parse(ev.target);
        if (payload?.reference === data.reference) {
          transferMeta = payload;
          break;
        }
      } catch {}
    }

    // 3. If internal transfer, credit the recipient's account!
    if (transferMeta && transferMeta.targetUserId) {
      const recipientUserId = transferMeta.targetUserId;
      const recipientEmail = transferMeta.targetUserEmail || '';
      const amount = Number(transferMeta.amount);
      const recipientRef = `${data.reference}-CR`;

      // Check if recipient credit was already recorded
      const { data: existingCredit } = await supabaseAdmin
        .from('account_transactions')
        .select('id')
        .eq('reference', recipientRef)
        .maybeSingle();

      if (!existingCredit) {
        // Fetch recipient current balance
        const [profRes, adminRes] = await Promise.all([
          supabaseAdmin.from('profiles').select('first_name, last_name').eq('id', recipientUserId).maybeSingle(),
          supabaseAdmin.from('admin_users').select('first_name, last_name, email').eq('id', recipientUserId).maybeSingle(),
        ]);

        const recipientName = [profRes.data?.first_name || adminRes.data?.first_name, profRes.data?.last_name || adminRes.data?.last_name].filter(Boolean).join(' ')
          || adminRes.data?.email || 'AXIOM Customer';

        const senderName = transferMeta.senderName || 'AXIOM Customer';
        const senderEmail = transferMeta.senderEmail || '';

        const recipientNarration = `Transfer from ${senderName}${senderEmail ? ` (${senderEmail})` : ''} - Approved by Admin`;

        // Record credit in account_transactions
        try {
          await supabaseAdmin.from('account_transactions').insert({
            user_id: recipientUserId,
            type: 'credit',
            amount,
            narration: recipientNarration,
            reference: recipientRef,
            balance_after: 0, // balance is computed dynamically
            status: 'Completed',
            created_at: approvedAt,
          });
        } catch (err) {
          console.warn('Recipient credit insert warning:', err);
        }

        // Dual-write Recipient Credit to admin_events
        try {
          await supabaseAdmin.from('admin_events').insert({
            actor: 'Administrator',
            action: 'Account Credited',
            target: JSON.stringify({
              userId: recipientUserId,
              email: recipientEmail,
              userName: recipientName,
              type: 'credit',
              amount,
              narration: recipientNarration,
              reference: recipientRef,
              date: approvedAt,
              senderUserId: transferMeta.senderUserId,
              senderEmail: transferMeta.senderEmail,
              status: 'Completed',
            }),
            time: approvedAt,
          });
        } catch (err) {
          console.warn('admin_events credit notice:', err);
        }
      }
    }

    // 4. Log Transfer Approved in admin_events
    try {
      await supabaseAdmin.from('admin_events').insert({
        actor: 'Administrator',
        action: 'Transfer Approved',
        target: JSON.stringify({
          reference: data.reference,
          approvedAt,
          notes: data.notes || 'Approved by Administrator',
          amount: transferMeta?.amount,
          senderUserId: transferMeta?.senderUserId,
          recipientName: transferMeta?.recipientName,
        }),
        time: approvedAt,
      });
    } catch (err) {
      console.warn('admin_events approval notice:', err);
    }

    return { success: true, reference: data.reference };
  });

export const rejectAdminTransfer = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) =>
    z.object({
      reference: z.string().trim().min(2),
      reason: z.string().optional(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const { requireAdminUnlocked } = await import('./admin-gate.server');
    await requireAdminUnlocked();
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const rejectedAt = new Date().toISOString();
    const reason = data.reason?.trim() || 'Declined by Administrator';

    // 1. Update status to 'Rejected' in account_transactions
    // This immediately releases the funds back into sender's available balance in computeUserBalance
    const { error: updateErr } = await supabaseAdmin
      .from('account_transactions')
      .update({
        status: 'Rejected',
        narration: `[Declined: ${reason}]`,
      })
      .eq('reference', data.reference)
      .eq('type', 'debit');

    if (updateErr) {
      console.warn('account_transactions reject notice:', updateErr);
    }

    // 2. Log Transfer Rejected in admin_events
    try {
      await supabaseAdmin.from('admin_events').insert({
        actor: 'Administrator',
        action: 'Transfer Rejected',
        target: JSON.stringify({
          reference: data.reference,
          rejectedAt,
          reason,
        }),
        time: rejectedAt,
      });
    } catch (err) {
      console.warn('admin_events reject notice:', err);
    }

    return { success: true, reference: data.reference };
  });
