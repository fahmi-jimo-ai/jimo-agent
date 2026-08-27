/**
 * The Updated / Added columns — Figma 899:15273, which reads "Just Now".
 *
 * Every row on the artboard is "Just Now", so the artboard defines exactly one
 * of these bands. The rest are the smallest conventional ladder that keeps a
 * column narrow and never shows a raw timestamp: minutes, hours, days, then a
 * date. Invented, and labelled as such.
 *
 * `now` is a parameter rather than a `Date.now()` call inside so the table can
 * pass one clock to every row (they must agree) and so this is testable in a
 * node environment with no fake timers.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just Now" holds for a minute — the artboard's own wording and casing. */
export function formatRelative(at: number, now: number = Date.now()): string {
  const delta = now - at;
  if (delta < MINUTE) return 'Just Now';
  if (delta < HOUR) {
    const m = Math.floor(delta / MINUTE);
    return `${m}m ago`;
  }
  if (delta < DAY) {
    const h = Math.floor(delta / HOUR);
    return `${h}h ago`;
  }
  if (delta < 7 * DAY) {
    const d = Math.floor(delta / DAY);
    return `${d}d ago`;
  }
  return new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * The drawer's "Added at" row — 932:18254 reads "26 March 2025, 17:12 PM".
 *
 * That string is the artboard's, including its "17:12 PM", which is a 24-hour
 * clock wearing a 12-hour suffix. Reproducing the mistake would be copying a
 * typo, so this drops the suffix and keeps the 24-hour time.
 */
export function formatAbsolute(at: number): string {
  const d = new Date(at);
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date}, ${time}`;
}
