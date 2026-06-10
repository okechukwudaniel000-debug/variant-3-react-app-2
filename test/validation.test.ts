import { describe, it, expect } from 'vitest';
import { escapeHtml, isEmail, isSafeSlug, validateStrings } from '@/lib/validation';

describe('validation', () => {
  it('escapes HTML to neutralise XSS', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(escapeHtml(`"&'`)).toBe('&quot;&amp;&#39;');
  });

  it('validates emails', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('nope')).toBe(false);
    expect(isEmail('a@b')).toBe(false);
    expect(isEmail(`${'a'.repeat(255)}@b.co`)).toBe(false);
  });

  it('accepts only safe slugs', () => {
    expect(isSafeSlug('i16pm')).toBe(true);
    expect(isSafeSlug('a-b-1')).toBe(true);
    expect(isSafeSlug('../etc')).toBe(false);
    expect(isSafeSlug('UPPER')).toBe(false);
    expect(isSafeSlug(123)).toBe(false);
  });

  it('validateStrings rejects missing/short/long/invalid and escapes output', () => {
    const bad = validateStrings([
      { field: 'name', value: 'x', min: 2, max: 80 },
      { field: 'email', value: 'bad', max: 254, email: true },
      { field: 'message', value: '', min: 2, max: 10 },
    ]);
    expect(bad.ok).toBe(false);
    expect(bad.errors.map((e) => e.field).sort()).toEqual(['email', 'message', 'name']);

    const good = validateStrings([
      { field: 'name', value: '  Ada <b> ', min: 2, max: 80 },
      { field: 'email', value: 'ada@example.com', max: 254, email: true },
    ]);
    expect(good.ok).toBe(true);
    expect(good.value!.name).toBe('Ada &lt;b&gt;');
    expect(good.value!.email).toBe('ada@example.com');
  });
});
