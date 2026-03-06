/**
 * @mfe/platform-utils — EncryptionUtils
 *
 * Lightweight encoding / hashing helpers that work in the browser.
 * These are NOT for server-side cryptographic security — use the BFF for that.
 */

// ── Base64 ───────────────────────────────────────────────────────────────────

/** Encode a string to Base64. */
export function base64Encode(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

/** Decode a Base64 string. */
export function base64Decode(input: string): string {
  return decodeURIComponent(escape(atob(input)));
}

// ── SHA-256 (Web Crypto) ─────────────────────────────────────────────────────

/** Compute SHA-256 hex digest of a string. Async because Web Crypto is async. */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── UUID ─────────────────────────────────────────────────────────────────────

/** Generate a UUID v4 using the browser's crypto API. */
export function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Simple obfuscation (NOT encryption) ──────────────────────────────────────

/** XOR-based obfuscation with a key. For hiding non-sensitive data in transit. */
export function xorObfuscate(text: string, key: string): string {
  return Array.from(text)
    .map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)),
    )
    .join("");
}

/** De-obfuscate (XOR is symmetric). */
export const xorDeobfuscate = xorObfuscate;

// ── Constant-time comparison ─────────────────────────────────────────────────

/** Compare two strings in constant time (timing-attack safe). */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
