import { describe, it, expect } from 'vitest';
import { formatRelative, formatAbsolute } from './formatRelative';

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
