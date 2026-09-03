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

/**
 * The long form — "5 days ago", not "5d ago".
 *
 * The Experiences artboards print "Created 5 days ago" on a card and "Edited 3
 * days ago" in a detail subline, where the Knowledge table prints "5d ago" in a
 * column it needs to keep narrow. Same ladder, spelled out: a card has the room
 * and the abbreviation reads as a table cell that escaped.
 *
 * Bands past a week are invented for the same reason the short ladder's are —
 * the artboards only ever print the days band. `weeks` stops at four and hands
 * over to months, so nothing ever reads "9 weeks ago".
 */
export function formatRelativeLong(at: number, now: number = Date.now()): string {
  const delta = now - at;
  if (delta < MINUTE) return 'just now';

  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'} ago`;

  if (delta < HOUR) return plural(Math.floor(delta / MINUTE), 'minute');
  if (delta < DAY) return plural(Math.floor(delta / HOUR), 'hour');
  if (delta < 7 * DAY) {
    const d = Math.floor(delta / DAY);
    return d === 1 ? 'yesterday' : plural(d, 'day');
  }
  if (delta < 28 * DAY) return plural(Math.floor(delta / (7 * DAY)), 'week');
  return plural(Math.max(1, Math.floor(delta / (30 * DAY))), 'month');
}
