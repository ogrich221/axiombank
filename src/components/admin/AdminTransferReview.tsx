import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useServerFn } from '@tanstack/react-start';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  Clock,
  ArrowRightLeft,
  Check,
  X,
  Search,
  RefreshCw,
  ShieldCheck,
  Building,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  reviewPendingTransfer,
  getAdminTransferQueue,
  approveAdminTransfer,
  rejectAdminTransfer,
  type AdminTransferItem,
  type TransferQueueStats
} from '@/lib/transfer-review.functions';
import { readinessLabel, requiredReviewItems, transferReviewInputSchema, type TransferReviewResult } from '@/lib/transfer-review';
import { useAdmin } from './AdminProvider';

export function TransferReviewPage() {
  const { setNotice, refresh: refreshAdmin } = useAdmin();

  // Server functions
  const fetchQueue = useServerFn(getAdminTransferQueue);
  const approveFn = useServerFn(approveAdminTransfer);
  const rejectFn = useServerFn(rejectAdminTransfer);
  const reviewFn = useServerFn(reviewPendingTransfer);

  // Queue state
  const [pending, setPending] = useState<AdminTransferItem[]>([]);
  const [history, setHistory] = useState<AdminTransferItem[]>([]);
  const [stats, setStats] = useState<TransferQueueStats>({
    pendingCount: 0,
    pendingVolume: 0,
    approvedCount: 0,
    approvedVolume: 0,
    rejectedCount: 0,
    rejectedVolume: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'ai'>('pending');

  // Action modals
  const [selectedForReject, setSelectedForReject] = useState<AdminTransferItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  // AI assistant state
  const [aiDetails, setAiDetails] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResult, setAiResult] = useState<TransferReviewResult | null>(null);

  // History search/filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'rejected'>('all');

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchQueue();
      setPending(res.pending);
      setHistory(res.history);
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to load transfer queue:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchQueue]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  async function handleApprove(transfer: AdminTransferItem) {
    if (actionBusy) return;
    setActionBusy(true);
    setActionError('');
    try {
      await approveFn({ data: { reference: transfer.reference } });
      setNotice(`Transfer ${transfer.reference} approved. Funds settled and recipient credited.`);
      await Promise.all([loadQueue(), refreshAdmin()]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not approve transfer.');
    } finally {
      setActionBusy(false);
    }
  }

  async function handleRejectConfirm() {
    if (!selectedForReject || actionBusy) return;
    setActionBusy(true);
    setActionError('');
    try {
      await rejectFn({
        data: {
          reference: selectedForReject.reference,
          reason: rejectReason.trim() || 'Declined by Administrator. Funds returned to balance.',
        }
      });
      setNotice(`Transfer ${selectedForReject.reference} declined. Funds returned to sender's available balance.`);
      setSelectedForReject(null);
      setRejectReason('');
      await Promise.all([loadQueue(), refreshAdmin()]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not decline transfer.');
    } finally {
      setActionBusy(false);
    }
  }

  function handleSendToAI(transfer: AdminTransferItem) {
    const details = [
      `Sender: ${transfer.senderName} (${transfer.senderEmail})`,
      `Sender Account: ${transfer.senderAccount}`,
      `Recipient: ${transfer.recipientName}`,
      `Recipient Bank: ${transfer.recipientBank}`,
      `Recipient Account: ${transfer.recipientAccount}`,
      `Destination: ${transfer.destinationCountry}`,
      `Amount: $${transfer.amount.toFixed(2)} USD`,
      `Purpose / Narration: ${transfer.narration || 'General transfer'}`,
      `Reference: ${transfer.reference}`,
      `Transfer Type: ${transfer.isInternal ? 'Internal AXIOM Transfer' : 'External Wire/ACH'}`,
    ].join('\n');

    setAiDetails(details);
    setActiveTab('ai');
    setAiResult(null);
    setAiError('');
  }

  async function submitAiReview(event: FormEvent) {
    event.preventDefault();
    const parsed = transferReviewInputSchema.safeParse({ details: aiDetails });
    if (!parsed.success) {
      setAiError(parsed.error.issues[0]?.message ?? 'Check the details.');
      return;
    }
    setAiBusy(true);
    setAiError('');
    setAiResult(null);
    try {
      const response = await reviewFn({ data: parsed.data });
      if (response.error) setAiError(response.error);
      else setAiResult(response.review);
    } catch (e) {
      setAiError(e instanceof Error && e.message.includes('passcode') ? 'Your admin session expired. Unlock the dashboard again.' : 'The AI review could not be completed.');
    } finally {
      setAiBusy(false);
    }
  }

  const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filteredHistory = history.filter(item => {
    if (historyFilter === 'completed' && item.status !== 'Completed') return false;
    if (historyFilter === 'rejected' && item.status !== 'Rejected') return false;
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      const matchSender = (item.senderName || '').toLowerCase().includes(q) || (item.senderEmail || '').toLowerCase().includes(q);
      const matchRecip = (item.recipientName || '').toLowerCase().includes(q) || (item.recipientBank || '').toLowerCase().includes(q);
      const matchRef = (item.reference || '').toLowerCase().includes(q);
      if (!matchSender && !matchRecip && !matchRef) return false;
    }
    return true;
  });

  const aiFields: [string, string | null][] = aiResult ? [
    ['Sender', aiResult.sender],
    ['Recipient', aiResult.recipient],
    ['Amount', aiResult.amount],
    ['Destination', aiResult.destination]
  ] : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <ArrowRightLeft className="size-4" /> Settlement & Risk Control
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Transfer Review & Approvals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer-initiated transfers have funds moved immediately from their balance awaiting administrative approval. Approve or decline below.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadQueue()} disabled={loading}>
          <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
        </Button>
      </div>

      {actionError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-amber-500 flex items-center gap-1.5">
              <Clock className="size-3.5" /> Pending Approvals
            </span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-xs font-bold text-amber-500">
              {stats.pendingCount}
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-foreground">
            {money(stats.pendingVolume)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Funds currently held pending admin action</p>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-primary flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> Total Approved
            </span>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-xs font-bold text-primary">
              {stats.approvedCount}
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-foreground">
            {money(stats.approvedVolume)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Settled and credited to recipients</p>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
              <XCircle className="size-3.5" /> Total Declined
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
              {stats.rejectedCount}
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-foreground">
            {money(stats.rejectedVolume)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Released back to sender balances</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="size-4" />
          Pending Approvals
          {stats.pendingCount > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-500">
              {stats.pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ClipboardList className="size-4" />
          Review History
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {history.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'ai'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="size-4" />
          AI Risk Assistant
        </button>
      </div>

      {/* Tab 1: Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="rounded-lg border border-border bg-background py-16 text-center">
              <CheckCircle2 className="mx-auto size-12 text-primary" />
              <h2 className="mt-4 text-lg font-bold">Transfer Queue Clear</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                There are no pending customer transfers awaiting administrative approval.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(item => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-background p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-primary">{item.reference}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-500 border border-amber-500/20">
                          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Awaiting Approval
                        </span>
                        {item.isInternal ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                            AXIOM Member Transfer
                          </span>
                        ) : item.destinationCountry === 'Domestic' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border">
                            Domestic Wire Transfer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                            International Wire ({item.destinationCountry})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Initiated {new Date(item.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-2xl font-bold text-foreground">
                        {money(item.amount)}
                      </p>
                      <p className="text-xs text-amber-500 font-medium">Funds held from sender</p>
                    </div>
                  </div>

                  {/* Transfer Details Grid */}
                  <div className="mt-4 grid gap-4 rounded-md border border-border bg-secondary/30 p-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                    <div>
                      <p className="text-muted-foreground font-semibold flex items-center gap-1.5 mb-1">
                        <User className="size-3.5 text-primary" /> SENDER (AXIOM ACCOUNT)
                      </p>
                      <p className="font-medium text-foreground text-sm">{item.senderName}</p>
                      <p className="text-muted-foreground break-all">{item.senderEmail}</p>
                      <p className="font-mono text-muted-foreground mt-0.5">{item.senderAccount}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground font-semibold flex items-center gap-1.5 mb-1">
                        <Building className="size-3.5 text-primary" /> RECIPIENT & DESTINATION
                      </p>
                      <p className="font-medium text-foreground text-sm">{item.recipientName}</p>
                      <p className="text-muted-foreground">{item.recipientBank}{item.destinationCountry && item.destinationCountry !== 'Domestic' && item.destinationCountry !== 'Internal' ? ` · ${item.destinationCountry}` : ''}</p>
                      {item.recipientBankAddress && (
                        <p className="text-muted-foreground text-[11px] mt-0.5">Wire Routing / SWIFT: {item.recipientBankAddress}</p>
                      )}
                      <p className="font-mono text-muted-foreground mt-0.5">Account / IBAN: {item.recipientAccount}</p>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <p className="text-muted-foreground font-semibold flex items-center gap-1.5 mb-1">
                        <FileText className="size-3.5 text-primary" /> PURPOSE & NARRATION
                      </p>
                      <p className="font-medium text-foreground text-sm break-words">{item.narration || 'No note provided'}</p>
                      <p className="text-muted-foreground mt-1">Status: Pending Settlement</p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendToAI(item)}
                      className="text-xs text-primary hover:text-primary"
                    >
                      <Sparkles className="mr-1.5 size-3.5" /> Run AI Risk Check
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionBusy}
                        onClick={() => {
                          setSelectedForReject(item);
                          setRejectReason('');
                          setActionError('');
                        }}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="mr-1.5 size-4" /> Decline & Refund
                      </Button>

                      <Button
                        size="sm"
                        disabled={actionBusy}
                        onClick={() => handleApprove(item)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Check className="mr-1.5 size-4" /> Approve Transfer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reviewed History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reference, sender, recipient..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="admin-field pl-9 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={historyFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHistoryFilter('all')}
              >
                All ({history.length})
              </Button>
              <Button
                variant={historyFilter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHistoryFilter('completed')}
              >
                Approved ({stats.approvedCount})
              </Button>
              <Button
                variant={historyFilter === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHistoryFilter('rejected')}
              >
                Declined ({stats.rejectedCount})
              </Button>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="rounded-lg border border-border bg-background py-14 text-center">
              <Search className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No historical transfers match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-secondary/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Sender</th>
                    <th className="px-4 py-3 font-medium">Recipient</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Review Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredHistory.map(item => (
                    <tr key={item.id} className="transition-colors hover:bg-muted/40 text-xs">
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-primary">
                        {item.reference}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{item.senderName}</p>
                        <p className="text-[11px] text-muted-foreground">{item.senderEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{item.recipientName}</p>
                        <p className="text-[11px] text-muted-foreground">{item.recipientBank}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-foreground">
                        {money(item.amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${
                            item.status === 'Completed'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-destructive/10 text-destructive border border-destructive/20'
                          }`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {item.status === 'Completed' ? 'APPROVED' : 'DECLINED'}
                        </span>
                      </td>
                      <td className="max-w-xs break-words px-4 py-3 text-muted-foreground">
                        {item.decisionNotes || (item.status === 'Completed' ? 'Approved by Administrator' : 'Declined')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: AI Risk Assistant */}
      {activeTab === 'ai' && (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <form onSubmit={submitAiReview} className="space-y-4">
            <label className="block text-sm font-medium">
              Transfer details for AI inspection
              <textarea
                value={aiDetails}
                onChange={e => setAiDetails(e.target.value)}
                disabled={aiBusy}
                rows={12}
                maxLength={6000}
                placeholder={'Sender: …\nRecipient: …\nBank: …\nAmount: …\nPurpose: …'}
                className="admin-field mt-2 min-h-64 resize-y py-3 font-mono text-sm"
              />
            </label>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{aiDetails.length}/6000 characters</span>
              <span>Don't paste passwords or PINs.</span>
            </div>
            {aiError && (
              <p role="alert" className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
                {aiError}
              </p>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={aiBusy}>
                <Sparkles className="mr-1.5 size-4" />
                {aiBusy ? 'Reviewing with AI…' : 'Summarize & check risk'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={aiBusy}
                onClick={() => {
                  setAiDetails('');
                  setAiResult(null);
                  setAiError('');
                }}
              >
                Clear
              </Button>
            </div>
            <div className="rounded-lg border bg-secondary/40 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="size-4 text-primary" /> Review checklist
              </p>
              <ul className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                {requiredReviewItems.map(i => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
            </div>
          </form>

          <section aria-live="polite" className="rounded-lg border bg-background p-6">
            {aiBusy && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                AI risk analysis in progress…
              </div>
            )}
            {!aiBusy && !aiResult && (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <Sparkles className="mx-auto size-8 text-primary/60" />
                <p className="text-sm font-medium text-foreground">AI Transfer Assessment</p>
                <p className="text-xs">Select "Run AI Risk Check" on any pending transfer or paste details to evaluate.</p>
              </div>
            )}
            {aiResult && (
              <div className="space-y-6">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    aiResult.readiness === 'ready'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {aiResult.readiness === 'ready' ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <AlertTriangle className="size-4" />
                  )}
                  {readinessLabel[aiResult.readiness]}
                </span>
                <div>
                  <h2 className="text-sm font-semibold">Summary</h2>
                  <p className="mt-2 text-sm leading-6">{aiResult.summary}</p>
                </div>
                <dl className="grid grid-cols-2 gap-4">
                  {aiFields.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd
                        className={`mt-1 break-words text-sm font-medium ${
                          value ? '' : 'text-destructive'
                        }`}
                      >
                        {value || 'Not provided'}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <h2 className="text-sm font-semibold">
                    Missing review information ({aiResult.missing.length})
                  </h2>
                  {aiResult.missing.length ? (
                    <ul className="mt-2 space-y-2">
                      {aiResult.missing.map(m => (
                        <li
                          key={m.item}
                          className="rounded-md border border-destructive/30 p-3 text-sm"
                        >
                          <span className="font-medium">{m.item}</span>
                          <span className="block text-xs text-muted-foreground">
                            {m.why}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-primary">
                      ✓ All required checklist items verified.
                    </p>
                  )}
                </div>
                {aiResult.concerns.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold">Worth a closer look</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {aiResult.concerns.map(c => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="border-t pt-4 text-xs text-muted-foreground">
                  AI-assisted guidance — review transfer details thoroughly before taking administrative action.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Decline Transfer Confirmation Modal */}
      <Dialog
        open={Boolean(selectedForReject)}
        onOpenChange={open => {
          if (!open && !actionBusy) setSelectedForReject(null);
        }}
      >
        <DialogContent className="admin-theme max-w-md rounded-lg">
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="size-5" /> Decline Transfer Request
          </DialogTitle>
          <DialogDescription>
            Declining will release the held funds of{' '}
            <strong className="text-foreground">{selectedForReject ? money(selectedForReject.amount) : ''}</strong>{' '}
            immediately back into the sender's available balance.
          </DialogDescription>

          <div className="space-y-4 py-2">
            <div className="rounded-md bg-secondary/50 p-3 text-xs space-y-1">
              <p>
                <strong>Reference:</strong> {selectedForReject?.reference}
              </p>
              <p>
                <strong>Sender:</strong> {selectedForReject?.senderName} ({selectedForReject?.senderEmail})
              </p>
              <p>
                <strong>Recipient:</strong> {selectedForReject?.recipientName} ({selectedForReject?.recipientBank})
              </p>
            </div>

            <label className="block text-sm font-medium">
              Reason for decline (visible to customer in statement)
              <input
                type="text"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Account number mismatch, security verification required..."
                className="admin-field mt-1.5 text-sm"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              disabled={actionBusy}
              onClick={() => setSelectedForReject(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={actionBusy}
              onClick={handleRejectConfirm}
            >
              {actionBusy ? 'Declining…' : 'Confirm Decline & Return Funds'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
