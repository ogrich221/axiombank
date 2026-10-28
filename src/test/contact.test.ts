import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
  SUPPORT_PHONE,
  SUPPORT_PHONE_TEL,
  OFFICE_ADDRESS,
} from '@/lib/contact';

const homepage = readFileSync('src/routes/index.tsx', 'utf8');

describe('bank contact details', () => {
  it('uses the bank webmail mailbox as the contact address', () => {
    expect(SUPPORT_EMAIL).toBe('axiombank@axiomfinancialinstitution.online');
    expect(SUPPORT_MAILTO).toBe('mailto:axiombank@axiomfinancialinstitution.online');
  });

  it('shows the contact mailbox on the home page', () => {
    expect(homepage).toContain('{SUPPORT_EMAIL}');
    expect(homepage).toContain('SUPPORT_MAILTO');
    expect(homepage).not.toContain('Open webmail');
  });

  it('keeps the placeholder address out of every public page', () => {
    expect(homepage).not.toContain('support@axiombank.com');
    expect(SUPPORT_EMAIL).not.toContain('axiombank.com');
  });

  it('keeps phone and office details separate from the mailbox', () => {
    expect(SUPPORT_PHONE).toBe('+1 213 304 6709');
    expect(OFFICE_ADDRESS).toContain('New York');
  });

  it('dials the supplied contact number without formatting spaces', () => {
    expect(SUPPORT_PHONE_TEL).toBe('tel:+12133046709');
  });

  it('uses the same support number on the debit card and drops the old one', () => {
    const card = readFileSync('src/components/customer/CustomerPages.tsx', 'utf8');
    expect(card).toContain('{SUPPORT_PHONE}');
    expect(card).not.toContain('555-0199');
  });
});
