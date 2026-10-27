import type { CustomerProfileInput } from './customer-schemas';

// Only editable fields enter the form; IDs, approval state and avatar paths never do.
export function editableProfile(profile: { [Key in keyof CustomerProfileInput]?: string | null } | null | undefined): CustomerProfileInput {
  return {
    first_name: profile?.first_name ?? '', middle_name: profile?.middle_name ?? '',
    last_name: profile?.last_name ?? '', display_name: profile?.display_name ?? '',
    date_of_birth: profile?.date_of_birth ?? '', nationality: profile?.nationality ?? '',
    country: profile?.country ?? '', address: profile?.address ?? '',
    city: profile?.city ?? '', region: profile?.region ?? '',
    postal_code: profile?.postal_code ?? '', phone: profile?.phone ?? '',
  };
}