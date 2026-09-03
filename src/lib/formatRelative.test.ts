import { describe, it, expect } from 'vitest';
import { formatRelativeLong, formatRelative, formatAbsolute } from './formatRelative';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const NOW = Date.UTC(2025, 2, 26, 17, 12);

describe('formatRelative', () => {
  it('reads "Just Now" for the artboard band', () => {
    expect(formatRelative(NOW, NOW)).toBe('Just Now');
    expect(formatRelative(NOW - 59_000, NOW)).toBe('Just Now');
  });

  it('steps to minutes, hours and days on each boundary', () => {
    expect(formatRelative(NOW - MINUTE, NOW)).toBe('1m ago');
    expect(formatRelative(NOW - 59 * MINUTE, NOW)).toBe('59m ago');
    expect(formatRelative(NOW - HOUR, NOW)).toBe('1h ago');
    expect(formatRelative(NOW - 23 * HOUR, NOW)).toBe('23h ago');
    expect(formatRelative(NOW - DAY, NOW)).toBe('1d ago');
    expect(formatRelative(NOW - 6 * DAY, NOW)).toBe('6d ago');
  });

  it('falls back to a date past a week', () => {
    expect(formatRelative(NOW - 7 * DAY, NOW)).toMatch(/\d+ \w+/);
  });
});

describe('formatAbsolute', () => {
  it('spells the drawer row out, without the artboard\'s 24-hour "PM"', () => {
    const out = formatAbsolute(NOW);
    expect(out).toContain('March');
    expect(out).toContain('2025');
    expect(out).not.toContain('PM');
  });
});

describe('formatRelativeLong', () => {
  const now = Date.UTC(2026, 0, 20, 12, 0, 0);
  const ago = (ms: number) => formatRelativeLong(now - ms, now);

  it('prints what the Experiences artboards print', () => {
    // "Created 5 days ago" on a card, "Edited 3 days ago" in the detail subline.
    expect(ago(5 * 24 * 60_000 * 60)).toBe('5 days ago');
    expect(ago(3 * 24 * 60_000 * 60)).toBe('3 days ago');
  });

  it('spells one day as yesterday and never says "1 days"', () => {
    expect(ago(26 * 60 * 60_000)).toBe('yesterday');
    expect(ago(61 * 60_000)).toBe('1 hour ago');
  });

  it('hands weeks over to months at four, so nothing reads "9 weeks ago"', () => {
    expect(ago(21 * 24 * 60 * 60_000)).toBe('3 weeks ago');
    expect(ago(60 * 24 * 60 * 60_000)).toBe('2 months ago');
  });

  it('says just now under a minute, matching the short ladder’s first band', () => {
    expect(ago(3_000)).toBe('just now');
  });
});
