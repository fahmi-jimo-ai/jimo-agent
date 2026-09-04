import { describe, it, expect } from 'vitest';
import {
  buildUsageDays,
  filterConversations,
  CONVERSATIONS,
  Y_MAX,
} from './analytics';

/**
 * Pure-module tests, matching the one convention this repo has
 * (`src/lib/classifyChip.test.ts`): the logic that encodes a spec gets a test,
 * components do not. There is no jsdom or testing-library here.
 */
describe('buildUsageDays', () => {
  it('is deterministic — the seeded LCG, not Math.random', () => {
    // This is the property screenshot diffs against the artboard depend on.
    expect(buildUsageDays('success', 'all-time')).toEqual(
      buildUsageDays('success', 'all-time')
    );
  });

  it('gives each metric its own series, so selecting a tile changes the chart', () => {
    const success = buildUsageDays('success', 'all-time').map((d) => d.usage);
    const users = buildUsageDays('users', 'all-time').map((d) => d.usage);
    expect(success).not.toEqual(users);
  });

  it('actually windows on range', () => {
    expect(buildUsageDays('messages', 'last-7-days')).toHaveLength(7);
    expect(buildUsageDays('messages', 'last-30-days')).toHaveLength(30);
    expect(buildUsageDays('messages', 'all-time')).toHaveLength(40);
  });

  it('never plots above the axis maximum', () => {
    for (const d of buildUsageDays('messages', 'all-time')) {
      expect(d.usage).toBeLessThanOrEqual(Y_MAX);
      expect(d.usage).toBeGreaterThan(0);
    }
  });

  it('labels every bucket, for the hover tooltip', () => {
    for (const d of buildUsageDays('opened', 'last-7-days')) {
      expect(d.date).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    }
  });
});

describe('filterConversations', () => {
  const ALL = { search: '', response: 'all', segment: 'all', range: 'all-time' } as const;

  it('returns everything when nothing is filtered', () => {
    expect(filterConversations(CONVERSATIONS, ALL)).toHaveLength(CONVERSATIONS.length);
  });

  it('matches on name, handle and title', () => {
    expect(filterConversations(CONVERSATIONS, { ...ALL, search: 'Thomas' })).toHaveLength(1);
    expect(filterConversations(CONVERSATIONS, { ...ALL, search: '#Techie123' })).toHaveLength(1);
    expect(
      filterConversations(CONVERSATIONS, { ...ALL, search: 'Understanding user needs' }).length
    ).toBeGreaterThan(1);
  });

  it('ignores case and surrounding whitespace', () => {
    expect(filterConversations(CONVERSATIONS, { ...ALL, search: '  thomas  ' })).toHaveLength(1);
  });

  it('drives the no-results state — Figma 934:30109 types "Jim"', () => {
    expect(filterConversations(CONVERSATIONS, { ...ALL, search: 'Jim' })).toHaveLength(0);
  });

  it('filters by response feedback', () => {
    const helpful = filterConversations(CONVERSATIONS, { ...ALL, response: 'helpful' });
    expect(helpful.length).toBeGreaterThan(0);
    for (const c of helpful) {
      expect(c.transcript.some((t) => t.feedback === 'helpful')).toBe(true);
    }

    const notHelpful = filterConversations(CONVERSATIONS, { ...ALL, response: 'not-helpful' });
    for (const c of notHelpful) {
      expect(c.transcript.some((t) => t.feedback === 'not-helpful')).toBe(true);
    }
  });

  it('filters on the agent’s own verdict, which is a different field', () => {
    // `unsure` reads `certainty`, not `feedback`. Filtering on it and getting
    // thumbs-down conversations back would be the bug worth catching: the whole
    // point of the option is finding answers nobody has judged yet.
    const unsure = filterConversations(CONVERSATIONS, { ...ALL, response: 'unsure' });
    expect(unsure.length).toBeGreaterThan(0);
    for (const c of unsure) {
      expect(c.transcript.some((t) => t.certainty === 'unsure')).toBe(true);
    }
  });

  it('filters by segment', () => {
    const power = filterConversations(CONVERSATIONS, { ...ALL, segment: 'power-users' });
    expect(power.length).toBeGreaterThan(0);
    for (const c of power) expect(c.segment).toBe('power-users');
  });

  it('narrows on range, rather than only relabelling the picker', () => {
    const week = filterConversations(CONVERSATIONS, { ...ALL, range: 'last-7-days' });
    const month = filterConversations(CONVERSATIONS, { ...ALL, range: 'last-30-days' });

    expect(week.length).toBeGreaterThan(0);
    expect(week.length).toBeLessThan(month.length);
    expect(month.length).toBeLessThan(CONVERSATIONS.length);

    for (const c of week) expect(c.daysAgo).toBeLessThanOrEqual(7);
    for (const c of month) expect(c.daysAgo).toBeLessThanOrEqual(30);
  });

  it('combines filters', () => {
    const combined = filterConversations(CONVERSATIONS, {
      ...ALL,
      search: 'UXWiz',
      segment: 'trialing',
    });
    for (const c of combined) {
      expect(c.name).toBe('UXWiz');
      expect(c.segment).toBe('trialing');
    }
  });
});
