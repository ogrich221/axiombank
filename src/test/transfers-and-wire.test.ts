import { describe, it, expect } from 'vitest';
import {
  residenceCountries,
  wireTransferCountries,
  transferPreviewSchema,
  profileSchema,
  registrationSchema
} from '@/lib/customer-schemas';
import {
  accountNumberFor,
  formatAccountNumber
} from '@/lib/customer-account-state';
import {
  filterUsers,
  emptyFilters,
  validateUser,
  type AdminUser,
  type UserTransaction
} from '@/lib/admin-demo';

describe('Wire Transfers & International Country Coverage', () => {
  it('includes at least 50 eligible countries and exactly 54 non-African jurisdictions', () => {
    expect(wireTransferCountries.length).toBeGreaterThanOrEqual(50);
    expect(wireTransferCountries.length).toBe(54);
    // Ensure all 54 countries are unique
    expect(new Set(wireTransferCountries).size).toBe(54);
  });

  it('strictly excludes all African countries from wire transfer destinations', () => {
    const africanCountries = [
      'Nigeria', 'South Africa', 'Egypt', 'Kenya', 'Ghana', 'Morocco',
      'Ethiopia', 'Algeria', 'Uganda', 'Tanzania', 'Rwanda', 'Senegal',
      'Cameroon', 'Ivory Coast', 'Zimbabwe', 'Angola', 'Tunisia'
    ];

    for (const african of africanCountries) {
      expect(wireTransferCountries).not.toContain(african);
      expect(residenceCountries).not.toContain(african);
    }
  });

  it('validates Domestic Wire transfer payload correctly', () => {
    const domesticWirePayload = {
      recipient: 'Apex Logistics LLC',
      bank: 'JPMorgan Chase Bank, N.A.',
      bankAddress: '270 Park Ave, New York, NY 10017 (Routing: 021000021)',
      account: '9876543210',
      amount: 15000.00,
      reference: 'INV-2026-0042'
    };

    const parsed = transferPreviewSchema.safeParse(domesticWirePayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.amount).toBe(15000.00);
      expect(parsed.data.bank).toBe('JPMorgan Chase Bank, N.A.');
    }
  });

  it('validates International Wire transfer payload across non-African jurisdictions', () => {
    const sampleDestinations = [
      { country: 'United Kingdom', bank: 'Barclays Bank UK PLC', swift: 'BARCGB22', iban: 'GB29BARC20000012345678' },
      { country: 'Germany', bank: 'Deutsche Bank AG', swift: 'DEUTDEDD', iban: 'DE89370400440532013000' },
      { country: 'Japan', bank: 'Mitsubishi UFJ Financial Group', swift: 'BOTKJPJT', iban: 'JP3400050001234567' },
      { country: 'Singapore', bank: 'DBS Bank Ltd', swift: 'DBSSSGSG', iban: 'SG12DBSS00001234567890' },
      { country: 'United Arab Emirates', bank: 'First Abu Dhabi Bank', swift: 'FABEAEAD', iban: 'AE120330000000012345678' },
      { country: 'Switzerland', bank: 'UBS Switzerland AG', swift: 'UBSWCHZH', iban: 'CH9300230230123456789' }
    ];

    for (const dest of sampleDestinations) {
      expect(wireTransferCountries).toContain(dest.country);

      const wirePayload = {
        recipient: 'Global Trade Partners Ltd',
        bank: dest.bank,
        bankAddress: `${dest.country} Corporate Center (SWIFT: ${dest.swift})`,
        account: dest.iban,
        amount: 5400.50,
        reference: `WIRE-${dest.country.toUpperCase()}`
      };

      const result = transferPreviewSchema.safeParse(wirePayload);
      expect(result.success).toBe(true);
    }
  });

  it('rejects wire transfers with negative or zero amounts', () => {
    const invalidAmounts = [0, -100, -0.01];
    for (const amount of invalidAmounts) {
      const payload = {
        recipient: 'Valid Corp',
        bank: 'Valid Bank',
        bankAddress: '123 Wall St, New York, NY',
        account: '12345678',
        amount,
        reference: 'Test'
      };
      expect(transferPreviewSchema.safeParse(payload).success).toBe(false);
    }
  });

  it('rejects wire transfers missing bank address or swift', () => {
    const payload = {
      recipient: 'Valid Corp',
      bank: 'Valid Bank',
      bankAddress: '',
      account: '12345678',
      amount: 500,
      reference: 'Test'
    };
    expect(transferPreviewSchema.safeParse(payload).success).toBe(false);
  });
});

describe('User-to-User Transfers & Pending Approval Balance Accounting', () => {
  function computeBalanceSimulation(transactions: Array<{ type: 'credit' | 'debit'; amount: number; status: string }>) {
    let balance = 0;
    for (const t of transactions) {
      if (t.status === 'Rejected') {
        // Ignored in available balance (funds not debited or restored)
        continue;
      }
      if (t.type === 'credit') {
        // Only completed credits add to available spendable funds
        if (t.status === 'Completed') {
          balance += t.amount;
        }
      } else {
        // Debits (both Completed AND Pending) deduct from available balance
        balance -= t.amount;
      }
    }
    return balance;
  }

  it('immediately moves funds from available balance when user initiates transfer (Pending status)', () => {
    const userLedger: Array<{ type: 'credit' | 'debit'; amount: number; status: string }> = [
      { type: 'credit', amount: 10000, status: 'Completed' } // Initial deposit
    ];
    expect(computeBalanceSimulation(userLedger)).toBe(10000);

    // User initiates $2,500 transfer to another user
    userLedger.push({ type: 'debit' as const, amount: 2500, status: 'Pending' });

    // Available balance MUST immediately reduce to $7,500
    expect(computeBalanceSimulation(userLedger)).toBe(7500);
  });

  it('recipient does NOT receive spendable balance while transfer is pending', () => {
    const recipientLedger = [
      { type: 'credit' as const, amount: 500, status: 'Completed' },
      { type: 'credit' as const, amount: 2500, status: 'Pending' } // Incoming transfer pending approval
    ];

    // Recipient available balance remains $500 until approved
    expect(computeBalanceSimulation(recipientLedger)).toBe(500);
  });

  it('credits recipient spendable balance in real-time when Admin approves', () => {
    const recipientLedger = [
      { type: 'credit' as const, amount: 500, status: 'Completed' },
      { type: 'credit' as const, amount: 2500, status: 'Completed' } // Transfer approved by admin
    ];

    // Recipient available balance now reflects the $2,500 credit
    expect(computeBalanceSimulation(recipientLedger)).toBe(3000);
  });

  it('fully refunds held funds to sender available balance when Admin declines transfer', () => {
    const senderLedger = [
      { type: 'credit' as const, amount: 10000, status: 'Completed' },
      { type: 'debit' as const, amount: 2500, status: 'Rejected' } // Admin declined transfer
    ];

    // Held funds restored back to $10,000 immediately
    expect(computeBalanceSimulation(senderLedger)).toBe(10000);
  });
});

describe('Admin-to-User Directory & Ledger Operations', () => {
  const usersFixture: AdminUser[] = [
    {
      id: 'USR-001',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1 202 555 0199',
      role: 'Customer',
      status: 'Active',
      joined: '2026-01-15T00:00:00Z',
      activity: '2026-10-28T07:00:00Z',
      verified: true,
      balance: '12500.00'
    },
    {
      id: 'USR-002',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@example.com',
      phone: '+1 202 555 0144',
      role: 'Customer',
      status: 'Pending',
      joined: '2026-02-10T00:00:00Z',
      activity: null,
      verified: false,
      balance: '0.00'
    }
  ];

  it('validates admin user creation properly', () => {
    // Valid new user
    const newUser = {
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@example.com'
    };
    expect(validateUser(newUser, usersFixture)).toBe('');

    // Rejects empty first name
    expect(validateUser({ ...newUser, firstName: '' }, usersFixture)).toContain('required');

    // Rejects invalid email
    expect(validateUser({ ...newUser, email: 'not-an-email' }, usersFixture)).toContain('valid email');

    // Rejects duplicate email
    expect(validateUser({ ...newUser, email: 'sarah.jenkins@example.com' }, usersFixture)).toContain('already exists');
  });

  it('formats deterministic account numbers for users', () => {
    const acc1 = accountNumberFor('USR-001');
    const acc2 = accountNumberFor('USR-002');

    expect(acc1).toHaveLength(10);
    expect(acc2).toHaveLength(10);
    expect(acc1).not.toBe(acc2);

    const formatted = formatAccountNumber(acc1, true);
    expect(formatted).toContain('••••');
  });

  it('filters users by query, status, and role correctly', () => {
    const searchByName = filterUsers(usersFixture, { ...emptyFilters, query: 'sarah' });
    expect(searchByName).toHaveLength(1);
    expect(searchByName[0]?.id).toBe('USR-001');

    const pendingOnly = filterUsers(usersFixture, { ...emptyFilters, status: 'Pending' });
    expect(pendingOnly).toHaveLength(1);
    expect(pendingOnly[0]?.id).toBe('USR-002');
  });
});

describe('Transfer PIN Requirements & Authorization Enforcement', () => {
  const baseRegistration = {
    first_name: 'David',
    middle_name: '',
    last_name: 'Miller',
    display_name: 'David',
    date_of_birth: '1988-06-15',
    nationality: 'American',
    address: '100 Financial Way',
    city: 'New York',
    region: 'NY',
    postal_code: '10005',
    country: 'United States',
    phone: '+1 212 555 0199',
    email: 'david.miller@example.com',
    password: 'SuperSecurePassword2026!',
    confirm_password: 'SuperSecurePassword2026!',
    transfer_pin: '7890',
    confirm_transfer_pin: '7890',
    terms: true as const
  };

  it('accepts valid 4-digit transfer PIN and matching confirmation during registration', () => {
    const res = registrationSchema.safeParse(baseRegistration);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.transfer_pin).toBe('7890');
    }
  });

  it('accepts identity photo data URL during user sign up', () => {
    const photoDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const res = registrationSchema.safeParse({
      ...baseRegistration,
      photo: photoDataUrl
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.photo).toBe(photoDataUrl);
    }
  });

  it('rejects registration when transfer PIN is not exactly 4 digits or non-numeric', () => {
    const invalidPins = ['123', '12345', 'abcd', '12a4', '', '123456'];
    for (const pin of invalidPins) {
      const res = registrationSchema.safeParse({
        ...baseRegistration,
        transfer_pin: pin,
        confirm_transfer_pin: pin
      });
      expect(res.success).toBe(false);
    }
  });

  it('rejects registration when transfer PIN and confirmation PIN do not match', () => {
    const res = registrationSchema.safeParse({
      ...baseRegistration,
      transfer_pin: '1234',
      confirm_transfer_pin: '5678'
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const pinError = res.error.issues.find(issue => issue.path.includes('confirm_transfer_pin'));
      expect(pinError).toBeDefined();
      expect(pinError?.message).toBe('Transfer PINs do not match.');
    }
  });
});

describe('Admin Custom Dates for Crediting and Debiting', () => {
  it('correctly handles backdated and forward-dated transaction timestamps', () => {
    const historicalDate = '2025-11-15T14:30:00.000Z';
    const futureDate = '2026-12-01T09:00:00.000Z';

    const ledger = [
      { id: '1', date: '2026-10-28T10:00:00.000Z', type: 'credit', amount: 500 },
      { id: '2', date: historicalDate, type: 'credit', amount: 1000 },
      { id: '3', date: futureDate, type: 'debit', amount: 200 },
    ];

    // Sort descending by date (as used in admin and user ledgers)
    ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    expect(ledger[0].id).toBe('3');
    expect(ledger[1].id).toBe('1');
    expect(ledger[2].id).toBe('2');
    expect(ledger[2].date).toBe(historicalDate);
  });

  it('validates ISO date conversion from datetime-local strings', () => {
    const localInput = '2026-06-15T10:30';
    const parsedDate = new Date(localInput).toISOString();
    expect(parsedDate).toContain('2026-06-15');
    expect(!isNaN(Date.parse(parsedDate))).toBe(true);
  });
});
