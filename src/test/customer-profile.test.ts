import { describe, expect, it } from 'vitest';
import { editableProfile } from '@/lib/customer-profile';

describe('Editable customer profile', () => {
  it('preserves saved details when reopening the edit form', () => {
    const values = editableProfile({ first_name: 'Jordan', display_name: 'Jay', country: 'United States', phone: '+1 202 555 0100' });
    expect(values.first_name).toBe('Jordan');
    expect(values.display_name).toBe('Jay');
    expect(values.country).toBe('United States');
    expect(values.phone).toBe('+1 202 555 0100');
  });
  it('supports completing a missing profile without uncontrolled values', () => {
    const values = editableProfile(null);
    expect(Object.keys(values)).toHaveLength(12);
    expect(Object.values(values).every(value => value === '')).toBe(true);
  });
  it('excludes private and noneditable account fields', () => {
    const saved = { first_name: 'Jordan', id: 'private-id', avatar_path: 'private/photo.png', admin_review_status: 'confirmed' };
    expect(editableProfile(saved)).not.toHaveProperty('id');
    expect(editableProfile(saved)).not.toHaveProperty('avatar_path');
    expect(editableProfile(saved)).not.toHaveProperty('admin_review_status');
  });
});