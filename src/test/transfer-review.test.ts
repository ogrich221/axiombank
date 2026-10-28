import { describe, it, expect } from 'vitest';
import { transferReviewInputSchema, normalizeReview, requiredReviewItems } from '@/lib/transfer-review';
describe('transfer review', () => {
  it('rejects very short details', () => { expect(transferReviewInputSchema.safeParse({ details: 'too short' }).success).toBe(false); });
  it('rejects details over 6000 characters', () => { expect(transferReviewInputSchema.safeParse({ details: 'x'.repeat(6001) }).success).toBe(false); });
  it('checklist requires the recipient bank address', () => { expect(requiredReviewItems).toContain('Recipient bank address'); });
  it('caps flagged items at 10', () => {
    const r = normalizeReview({ summary: '', sender: null, recipient: null, amount: null, destination: null, readiness: 'needs_information', concerns: [], missing: Array.from({ length: 15 }, (_, i) => ({ item: String(i), why: '' })) });
    expect(r.missing).toHaveLength(10);
  });
});
