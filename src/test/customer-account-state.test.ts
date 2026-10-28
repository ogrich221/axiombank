import { describe, expect, it } from 'vitest';
import { zeroBalances, canConfirmApplication, confirmApplicationSchema, customerApplicationLabel, applicationReviewLabel, accountNumberFor, formatAccountNumber } from '@/lib/customer-account-state';
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
  it('derives a stable maskable account number ending in 1042 for each customer', () => {
    const number = accountNumberFor('b54bf004-ecb0-49ea-9e93-ac91a90cddf3');
    expect(number).toMatch(/^\d{10}$/);
    expect(number.endsWith('1042')).toBe(true);
    expect(accountNumberFor('b54bf004-ecb0-49ea-9e93-ac91a90cddf3')).toBe(number);
    expect(accountNumberFor('other-user')).not.toBe(number);
    expect(formatAccountNumber(number, true)).toBe('•••• 1042');
    expect(formatAccountNumber(number, false)).not.toContain('•');
  });
});
