/* ============================================================
   Lightweight, dependency-free input validation + sanitization
   for API routes. Kept small and explicit (no schema library) so
   the security surface is easy to audit.
============================================================ */

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  errors: FieldError[];
}

// Conservative email shape check (full RFC 5322 is intentionally avoided).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Escape HTML-significant characters to neutralize stored/reflected XSS. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Coerce unknown JSON values to a trimmed string, or null if not a string. */
export function asString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() : null;
}

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value) && value.length <= 254;
}

interface StringRule {
  field: string;
  value: unknown;
  min?: number;
  max: number;
  email?: boolean;
}

/**
 * Validate a set of string fields, returning sanitized (HTML-escaped) values.
 * Rejects missing/oversized/malformed input without echoing the raw payload.
 */
export function validateStrings(rules: StringRule[]): ValidationResult<Record<string, string>> {
  const errors: FieldError[] = [];
  const value: Record<string, string> = {};

  for (const rule of rules) {
    const raw = asString(rule.value);
    if (raw === null || raw.length === 0) {
      errors.push({ field: rule.field, message: `${rule.field} is required` });
      continue;
    }
    if (rule.min && raw.length < rule.min) {
      errors.push({ field: rule.field, message: `${rule.field} is too short` });
      continue;
    }
    if (raw.length > rule.max) {
      errors.push({ field: rule.field, message: `${rule.field} is too long` });
      continue;
    }
    if (rule.email && !isEmail(raw)) {
      errors.push({ field: rule.field, message: `${rule.field} is invalid` });
      continue;
    }
    value[rule.field] = escapeHtml(raw);
  }

  return { ok: errors.length === 0, value, errors };
}

/** Allow only short, URL/identifier-safe slugs (product ids, category keys). */
export function isSafeSlug(value: unknown, maxLen = 40): value is string {
  return typeof value === 'string' && /^[a-z0-9-]{1,40}$/.test(value) && value.length <= maxLen;
}
