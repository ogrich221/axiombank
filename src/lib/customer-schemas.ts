import { z } from 'zod';

export const residenceCountries = ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Ireland', 'France', 'Germany', 'Spain', 'Portugal', 'Italy', 'Netherlands', 'Belgium', 'Luxembourg', 'Switzerland', 'Austria', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Iceland', 'Poland', 'Czechia', 'Slovakia', 'Hungary', 'Slovenia', 'Croatia', 'Estonia', 'Latvia', 'Lithuania', 'Greece', 'Cyprus', 'Malta', 'Romania', 'Bulgaria', 'Japan', 'South Korea', 'Singapore', 'Hong Kong', 'Taiwan', 'Australia', 'New Zealand', 'United Arab Emirates', 'Qatar', 'Saudi Arabia', 'Israel', 'India', 'Malaysia', 'Brazil', 'Chile', 'Argentina', 'Colombia', 'Peru', 'Uruguay', 'Costa Rica'];
export const wireTransferCountries = residenceCountries;
const short = z.string().trim().max(80);
export const profileSchema = z.object({
  first_name: short.min(1, 'Enter your first name.'), middle_name: short.default(''),
  last_name: short.min(1, 'Enter your last name.'), display_name: short.default(''),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.').refine(value => { const date = new Date(value); return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value && date < new Date(); }, 'Enter a valid date in the past.'),
  nationality: short.min(1, 'Enter your nationality.'),
  country: short.refine(value => residenceCountries.includes(value), 'Choose an eligible country.'),
  address: z.string().trim().min(1, 'Enter your address.').max(250), city: short.min(1, 'Enter your city.'),
  region: short.default(''), postal_code: z.string().trim().max(20).default(''),
  phone: z.string().trim().min(6, 'Enter a valid phone number.').max(30).regex(/^\+?[\d\s()\-]+$/, 'Enter a valid phone number.'),
});
export const registrationSchema = profileSchema.extend({
  email: z.string().trim().email().max(255),
  password: z.string().min(12, 'Use at least 12 characters.').max(128),
  confirm_password: z.string(),
  transfer_pin: z.string().regex(/^\d{4}$/, 'Enter a 4-digit numeric transfer PIN (e.g. 1234).').default('1234'),
  confirm_transfer_pin: z.string().default('1234'),
  terms: z.literal(true, { errorMap: () => ({ message: 'Accept the terms and privacy policy.' }) }),
}).refine(value => value.password === value.confirm_password, {
  path: ['confirm_password'],
  message: 'Passwords do not match.'
}).refine(value => !value.confirm_transfer_pin || value.transfer_pin === value.confirm_transfer_pin, {
  path: ['confirm_transfer_pin'],
  message: 'Transfer PINs do not match.'
});
export const transferPreviewSchema = z.object({ recipient: z.string().trim().min(2).max(100), bank: z.string().trim().min(2).max(100), bankAddress: z.string().trim().min(5, 'Enter the recipient bank address').max(200), account: z.string().trim().min(4).max(34).regex(/^[a-zA-Z0-9 -]+$/), amount: z.coerce.number().positive().finite().max(1000000), reference: z.string().trim().max(140).default('') });
export type CustomerProfileInput = z.infer<typeof profileSchema>;
export function customerHead(title: string, description: string) { return { meta: [{ title: `${title} — AXIOM BANK` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — AXIOM BANK` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }; }