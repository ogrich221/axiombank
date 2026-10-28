import { describe, expect, it } from 'vitest';
import { zeroBalances, canConfirmApplication, confirmApplicationSchema, customerApplicationLabel, applicationReviewLabel } from '@/lib/customer-account-state';
describe('Customer balances and admin confirmation', () => {
  it('sets every customer balance to 0.00', () => {
    expect(zeroBalances.available).toBe('0.00');
    expect(zeroBalances.total).toBe('0.00');
  });
  it('requires new applications to be pending before confirmation', () => {
    expect(canConfirmApplication('pending')).toBe(true);
    expect(canConfirmApplication('confirmed')).toBe(false);
    expect(canConfirmApplication('rejected')).toBe(false);
  });
  it('requires a valid application identifier to confirm a user', () => {
    expect(confirmApplicationSchema.safeParse({id:'not-an-application'}).success).toBe(false);
  });
  it('shows approved profiles an account status of Account opened, with no admin wording', () => {
    expect(customerApplicationLabel('confirmed')).toBe('Account opened');
    expect(customerApplicationLabel('confirmed')).not.toContain('admin');
    expect(customerApplicationLabel('pending')).toBe('Awaiting confirmation');
    expect(customerApplicationLabel('pending')).not.toContain('admin');
    expect(customerApplicationLabel('rejected')).toBe('Application declined');
    expect(customerApplicationLabel(undefined)).toBe('Not submitted');
  });
  it('keeps the admin review wording for admin screens only', () => {
    expect(applicationReviewLabel('confirmed')).toBe('Confirmed by admin');
  });
});
