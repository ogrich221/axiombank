import { z } from 'zod';

// Display-only amounts until an authorized banking service supplies a ledger.
export const zeroBalances = { available: '0.00', total: '0.00' } as const;
export function applicationReviewLabel(status?: string | null) {
  return status === 'confirmed' ? 'Confirmed by admin' : status === 'rejected' ? 'Application declined' : status === 'pending' ? 'Awaiting admin confirmation' : 'Not submitted';
}
// Customer-facing wording: never mentions the admin review.
export function customerApplicationLabel(status?: string | null) {
  return status === 'confirmed' ? 'Account opened' : status === 'rejected' ? 'Application declined' : status === 'pending' ? 'Awaiting confirmation' : 'Not submitted';
}
export const confirmApplicationSchema = z.object({ id: z.string().uuid() });
export function canConfirmApplication(status: string) { return status === 'pending'; }
// Stable per-customer account number for display, ending in the shared last four (1042).
export function accountNumberFor(userId?: string | null): string {
  const seed = userId || '00000000-0000-0000-0000-000000000000';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 131 + seed.charCodeAt(i)) >>> 0;
  const prefix = String(hash % 1000000).padStart(6, '0');
  return `${prefix}1042`;
}
export function formatAccountNumber(value: string, masked: boolean): string {
  return masked ? `•••• ${value.slice(-4)}` : value.replace(/(\d{4})(?=\d)/g, '$1 ');
}
export type AdminApplication = {
  id: string; userId: string; firstName: string; lastName: string; email: string;
  phone: string; country: string; address: string; submittedAt: string;
  reviewStatus: string; reviewedAt: string | null; emailVerified: boolean;
};