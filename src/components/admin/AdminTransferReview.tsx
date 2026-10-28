import { useState, type FormEvent } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { AlertTriangle, CheckCircle2, ClipboardList, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reviewPendingTransfer } from '@/lib/transfer-review.functions';
import { readinessLabel, requiredReviewItems, transferReviewInputSchema, type TransferReviewResult } from '@/lib/transfer-review';

export function TransferReviewPage() {
  const review = useServerFn(reviewPendingTransfer);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TransferReviewResult | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = transferReviewInputSchema.safeParse({ details });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check the details.'); return; }
    setBusy(true); setError(''); setResult(null);
    try {
      const response = await review({ data: parsed.data });
      if (response.error) setError(response.error); else setResult(response.review);
    } catch (e) {
      setError(e instanceof Error && e.message.includes('passcode') ? 'Your admin session expired. Unlock the dashboard again.' : 'The AI review could not be completed.');
    } finally { setBusy(false); }
  }

  const fields: [string, string | null][] = result ? [['Sender', result.sender], ['Recipient', result.recipient], ['Amount', result.amount], ['Destination', result.destination]] : [];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold"><Sparkles className="size-6 text-primary"/>Transfer review assistant</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Paste the details of a pending transfer. AI summarizes the request and flags review information that's missing. It never approves, rejects or moves money — you decide.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium">Pending transfer details
            <textarea value={details} onChange={e => setDetails(e.target.value)} disabled={busy} rows={12} maxLength={6000}
              placeholder={'Sender: …\nRecipient: …\nBank: …\nAmount: …\nPurpose: …'} className="admin-field mt-2 min-h-64 resize-y py-3 font-mono text-sm"/>
          </label>
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{details.length}/6000</span><span>Don't paste passwords or PINs.</span></div>
          {error && <p role="alert" className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={busy}><Sparkles/>{busy ? 'Reviewing…' : 'Summarize & check'}</Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => { setDetails(''); setResult(null); setError(''); }}>Clear</Button>
          </div>
          <div className="rounded-lg border bg-secondary/40 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><ClipboardList className="size-4 text-primary"/>Review checklist</p>
            <ul className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">{requiredReviewItems.map(i => <li key={i}>• {i}</li>)}</ul>
          </div>
        </form>
        <section aria-live="polite" className="rounded-lg border bg-background p-6">
          {busy && <div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent"/>Reviewing the request…</div>}
          {!busy && !result && <p className="text-sm text-muted-foreground">The summary and flagged items appear here.</p>}
          {result && (
            <div className="space-y-6">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${result.readiness === 'ready' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                {result.readiness === 'ready' ? <CheckCircle2 className="size-4"/> : <AlertTriangle className="size-4"/>}{readinessLabel[result.readiness]}
              </span>
              <div><h2 className="text-sm font-semibold">Summary</h2><p className="mt-2 text-sm leading-6">{result.summary}</p></div>
              <dl className="grid grid-cols-2 gap-4">{fields.map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className={`mt-1 break-words text-sm font-medium ${value ? '' : 'text-destructive'}`}>{value || 'Not provided'}</dd></div>)}</dl>
              <div><h2 className="text-sm font-semibold">Missing review information ({result.missing.length})</h2>
                {result.missing.length ? <ul className="mt-2 space-y-2">{result.missing.map(m => <li key={m.item} className="rounded-md border border-destructive/30 p-3 text-sm"><span className="font-medium">{m.item}</span><span className="block text-xs text-muted-foreground">{m.why}</span></li>)}</ul> : <p className="mt-2 text-sm text-primary">Nothing missing from the checklist.</p>}
              </div>
              {result.concerns.length > 0 && <div><h2 className="text-sm font-semibold">Worth a closer look</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{result.concerns.map(c => <li key={c}>{c}</li>)}</ul></div>}
              <p className="border-t pt-4 text-xs text-muted-foreground">AI-generated — verify against the original request before deciding.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
