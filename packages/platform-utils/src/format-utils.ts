/**
 * @mfe/platform-utils — FormatUtils
 *
 * Number, currency, string and data formatting helpers.
 */

// ── Numbers ──────────────────────────────────────────────────────────────────

/** Format a number with locale-aware grouping (e.g. 1,234,567.89) */
export function formatNumber(
  value: number,
  decimals = 2,
  locale = "en-US",
): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format as currency (e.g. "$1,234.56") */
export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US",
): string {
  return value.toLocaleString(locale, { style: "currency", currency });
}

/** Format as percentage (e.g. "85.5%") */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/** Compact number: 1.2K, 3.4M, etc. */
export function formatCompact(value: number, locale = "en-US"): string {
  return Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// ── Strings ──────────────────────────────────────────────────────────────────

/** Truncate a string to `max` characters, appending "…" if needed. */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

/** Convert to Title Case. */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Slugify (e.g. "Hello World!" → "hello-world") */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/** Mask a string, showing only last N characters (e.g. "****5678") */
export function mask(str: string, visibleChars = 4, char = "*"): string {
  if (str.length <= visibleChars) return str;
  return char.repeat(str.length - visibleChars) + str.slice(-visibleChars);
}

/** Pluralise a word based on count. */
export function pluralise(
  count: number,
  singular: string,
  plural?: string,
): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

// ── Data ─────────────────────────────────────────────────────────────────────

/** Format bytes to human-readable (e.g. 1.5 MB) */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${units[i]}`;
}
