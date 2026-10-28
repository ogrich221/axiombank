import { z } from 'zod';

export const transferReviewInputSchema = z.object({
  details: z.string().trim().min(20, 'Add at least a few lines of transfer details.').max(6000, 'Keep details under 6,000 characters.'),
});
export type TransferReviewInput = z.infer<typeof transferReviewInputSchema>;

export const transferReviewResultSchema = z.object({
  summary: z.string(),
  sender: z.string().nullable(),
  recipient: z.string().nullable(),
  amount: z.string().nullable(),
  destination: z.string().nullable(),
  missing: z.array(z.object({ item: z.string(), why: z.string() })),
  concerns: z.array(z.string()),
  readiness: z.enum(['ready', 'needs_information', 'escalate']),
});
export type TransferReviewResult = z.infer<typeof transferReviewResultSchema>;

/** Review fields every pending transfer must carry before an admin can decide on it. */
export const requiredReviewItems = [
  'Sender full name and account',
  'Recipient full name',
  'Recipient bank name',
  'Recipient bank address',
  'Recipient account or IBAN number',
  'Amount and currency',
  'Purpose / payment reference',
] as const;

export const readinessLabel: Record<TransferReviewResult['readiness'], string> = {
  ready: 'Ready for admin decision',
  needs_information: 'Needs more information',
  escalate: 'Escalate for compliance review',
};

/** Clamp model output so the UI never renders unbounded lists. */
export function normalizeReview(result: TransferReviewResult): TransferReviewResult {
  return { ...result, missing: result.missing.slice(0, 10), concerns: result.concerns.slice(0, 6) };
}
