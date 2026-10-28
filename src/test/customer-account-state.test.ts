import { describe, expect, it } from 'vitest';
import { zeroBalances, canConfirmApplication, confirmApplicationSchema } from '@/lib/customer-account-state';
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
});