import { describe, it, expect } from 'vitest';
import { cardDisplay } from '@/lib/card-display';
describe('Card privacy', () => {
  it('masks the entire cardholder name', () => { expect(cardDisplay.cardholder.replaceAll(' ', '')).toMatch(/^•+$/); });
  it('masks all sixteen card digits', () => { expect(cardDisplay.number.replaceAll(' ', '')).toBe('••••••••••••••••'); });
});
