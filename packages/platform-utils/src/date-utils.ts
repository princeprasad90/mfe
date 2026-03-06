/**
 * @mfe/platform-utils — DateUtils
 *
 * Lightweight date helpers (no external deps).
 * All MFEs use these for consistent formatting across the platform.
 */

/** Format a Date or ISO string to "MMM DD, YYYY" (e.g. "Mar 06, 2026") */
export function formatDate(input: Date | string | number): string {
  const d = toDate(input);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/** Format to full date-time "MMM DD, YYYY HH:mm" */
export function formatDateTime(input: Date | string | number): string {
  const d = toDate(input);
  return `${formatDate(d)} ${padTime(d.getHours())}:${padTime(d.getMinutes())}`;
}

/** Format to ISO date "YYYY-MM-DD" */
export function toISODate(input: Date | string | number): string {
  const d = toDate(input);
  return d.toISOString().slice(0, 10);
}

/** Relative time: "2 hours ago", "in 3 days", "just now" */
export function timeAgo(input: Date | string | number): string {
  const d = toDate(input);
  const diff = Date.now() - d.getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;

  const seconds = Math.floor(abs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let text: string;
  if (seconds < 60) text = "just now";
  else if (minutes < 60) text = `${minutes} minute${minutes === 1 ? "" : "s"}`;
  else if (hours < 24) text = `${hours} hour${hours === 1 ? "" : "s"}`;
  else if (days < 30) text = `${days} day${days === 1 ? "" : "s"}`;
  else text = formatDate(d);

  if (text === "just now") return text;
  return future ? `in ${text}` : `${text} ago`;
}

/** Is the given value a valid date? */
export function isValidDate(input: unknown): boolean {
  if (input === null || input === undefined) return false;
  const d = new Date(input as any);
  return !isNaN(d.getTime());
}

/** Difference between two dates in days */
export function diffInDays(a: Date | string, b: Date | string): number {
  const msPerDay = 86_400_000;
  return Math.round((toDate(a).getTime() - toDate(b).getTime()) / msPerDay);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function toDate(input: Date | string | number): Date {
  if (input instanceof Date) return input;
  return new Date(input);
}

function padTime(n: number): string {
  return n.toString().padStart(2, "0");
}
