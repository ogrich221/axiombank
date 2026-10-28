import { z } from 'zod';

// Display-only amounts until an authorized banking service supplies a ledger.
export const zeroBalances = { available: '0.00', total: '0.00' } as const;
export function applicationReviewLabel(status?: string | null) {
  return status === 'confirmed' ? 'Confirmed by admin' : status === 'rejected' ? 'Application declined' : status === 'pending' ? 'Awaiting admin confirmation' : 'Not submitted';
}
export const confirmApplicationSchema = z.object({ id: z.string().uuid() });
export function canConfirmApplication(status: string) { return status === 'pending'; }
// Administrator approval opens the customer profile, not a live bank account.
export function customerAccountStatus(status?: string | null) {
  return status === 'confirmed' ? 'Opened' : status === 'pending' ? 'Awaiting approval' : status === 'rejected' ? 'Declined' : 'Not opened';
}
export type AdminApplication = {
  id: string; userId: string; firstName: string; lastName: string; email: string;
  phone: string; country: string; address: string; submittedAt: string;
  reviewStatus: string; reviewedAt: string | null; emailVerified: boolean;
};