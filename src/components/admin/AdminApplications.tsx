import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { confirmCustomerApplication } from '@/lib/admin.functions';
import { applicationReviewLabel, canConfirmApplication, type AdminApplication } from '@/lib/customer-account-state';
import { useAdmin } from './AdminProvider';

export function AdminApplications() {
  const { applications, refresh, setNotice } = useAdmin();
  const confirm = useServerFn(confirmCustomerApplication);
  const [selected, setSelected] = useState<AdminApplication | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function approve() {
    if (!selected || busy) return;
    setBusy(true); setError('');
    try { await confirm({ data: { id: selected.id } }); await refresh(); setSelected(null); setNotice('Customer application confirmed.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not confirm this application.'); }
    finally { setBusy(false); }
  }
  return <section className="mb-8 border-y border-border py-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Open Account applications</h2><p className="mt-1 text-sm text-muted-foreground">{applications.filter(a => canConfirmApplication(a.reviewStatus)).length} awaiting admin confirmation</p></div><Button variant="outline" size="icon" aria-label="Refresh applications" title="Refresh applications" onClick={() => void refresh()}><RefreshCw/></Button></div>
    {!applications.length && <p className="py-5 text-sm text-muted-foreground">No applications received yet.</p>}
    <div className="divide-y divide-border">{applications.map(a => <article key={a.id} className="flex flex-wrap items-start justify-between gap-4 py-5"><div className="min-w-0"><h3 className="font-semibold">{a.firstName} {a.lastName}</h3><p className="mt-1 break-all text-sm">{a.email}</p><p className="mt-2 text-xs text-muted-foreground">{a.country} · Submitted {new Date(a.submittedAt).toLocaleDateString()}</p><p className="mt-2 text-xs text-primary">{applicationReviewLabel(a.reviewStatus)}</p></div><Button variant="outline" onClick={() => {setSelected(a);setError('');}}>Review application</Button></article>)}</div>
    <Dialog open={Boolean(selected)} onOpenChange={open => {if (!open && !busy) setSelected(null);}}><DialogContent className="admin-theme max-h-[85vh] overflow-auto rounded-lg"><DialogTitle>Review customer application</DialogTitle><DialogDescription>Confirm the customer application after reviewing these details. This does not verify identity, confirm their email, or open a live bank account.</DialogDescription>{selected && <><dl className="grid gap-4 sm:grid-cols-2">{[['Name',`${selected.firstName} ${selected.lastName}`],['Email',selected.email],['Email verification',selected.emailVerified?'Confirmed':'Awaiting email confirmation'],['Phone',selected.phone||'Not provided'],['Country',selected.country],['Address',selected.address],['Application status',applicationReviewLabel(selected.reviewStatus)],['Reviewed',selected.reviewedAt?new Date(selected.reviewedAt).toLocaleString():'Not yet']].map(([label,value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm">{value}</dd></div>)}</dl>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex flex-wrap justify-end gap-2"><Button variant="outline" disabled={busy} onClick={() => setSelected(null)}>Close</Button>{canConfirmApplication(selected.reviewStatus) && <Button disabled={busy} onClick={approve}><CheckCircle2/>{busy?'Confirming…':'Confirm new user'}</Button>}</div></>}</DialogContent></Dialog>
  </section>;
}