import { describe, expect, it } from 'vitest';
import { zeroBalances, canConfirmApplication, confirmApplicationSchema, customerAccountStatus } from '@/lib/customer-account-state';
describe('Customer balances and admin confirmation', () => {
  it('opens the customer profile only after administrator confirmation', () => {
    expect(customerAccountStatus('confirmed')).toBe('Opened');
    expect(customerAccountStatus('pending')).toBe('Awaiting approval');
    expect(customerAccountStatus('rejected')).toBe('Declined');
    expect(customerAccountStatus(undefined)).toBe('Not opened');
  });
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
});