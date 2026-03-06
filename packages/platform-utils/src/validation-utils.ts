/**
 * @mfe/platform-utils — ValidationUtils
 *
 * Common validation helpers for forms and input fields.
 */

export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

/** Check that a value is not empty / whitespace-only. */
export function required(
  value: unknown,
  label = "This field",
): ValidationResult {
  if (value === null || value === undefined)
    return { valid: false, message: `${label} is required.` };
  if (typeof value === "string" && value.trim().length === 0)
    return { valid: false, message: `${label} is required.` };
  return { valid: true };
}

/** Validate email format. */
export function isEmail(value: string): ValidationResult {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value)
    ? { valid: true }
    : { valid: false, message: "Please enter a valid email address." };
}

/** Minimum length. */
export function minLength(
  value: string,
  min: number,
  label = "Value",
): ValidationResult {
  return value.length >= min
    ? { valid: true }
    : { valid: false, message: `${label} must be at least ${min} characters.` };
}

/** Maximum length. */
export function maxLength(
  value: string,
  max: number,
  label = "Value",
): ValidationResult {
  return value.length <= max
    ? { valid: true }
    : { valid: false, message: `${label} must be at most ${max} characters.` };
}

/** Value must match a regex. */
export function matchesPattern(
  value: string,
  pattern: RegExp,
  message: string,
): ValidationResult {
  return pattern.test(value) ? { valid: true } : { valid: false, message };
}

/** Numeric range (inclusive). */
export function inRange(
  value: number,
  min: number,
  max: number,
  label = "Value",
): ValidationResult {
  return value >= min && value <= max
    ? { valid: true }
    : { valid: false, message: `${label} must be between ${min} and ${max}.` };
}

/** Run multiple validators and return the first failing result. */
export function validate(
  value: unknown,
  ...validators: ((v: any) => ValidationResult)[]
): ValidationResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) return result;
  }
  return { valid: true };
}

/** Check if a string is a valid URL. */
export function isUrl(value: string): ValidationResult {
  try {
    new URL(value);
    return { valid: true };
  } catch {
    return { valid: false, message: "Please enter a valid URL." };
  }
}

/** Phone number (digits, spaces, dashes, parens, plus — 7-15 digits). */
export function isPhone(value: string): ValidationResult {
  const digits = value.replace(/[\s\-()+ ]/g, "");
  return /^\d{7,15}$/.test(digits)
    ? { valid: true }
    : { valid: false, message: "Please enter a valid phone number." };
}
