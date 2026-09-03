import { describe, it, expect } from 'vitest';
import {
  buildUsageDays,
  filterConversations,
  companiesForUsers,
  companyCompletion,
  companyReach,
  COMPANIES,
  CONVERSATIONS,
  USERS_REACHED,
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

/* ── Companies — PRD-587 ──────────────────────────────────────────────────── */

describe('companyReach', () => {
  it('is a share of seats, not a count', () => {
    // The distinction the ticket turns on: 41/48 is an onboarded account and
    // 44/310 is three people who tried it once.
    expect(companyReach({ id: 'a', name: 'A', seats: 48, usersReached: 41, completed: 0 })).toBe(85);
    expect(companyReach({ id: 'b', name: 'B', seats: 310, usersReached: 44, completed: 0 })).toBe(14);
  });

  it('does not divide by zero seats', () => {
    expect(companyReach({ id: 'c', name: 'C', seats: 0, usersReached: 0, completed: 0 })).toBe(0);
  });
});

describe('companyCompletion', () => {
  it('is a share of the users actually reached', () => {
    expect(
      companyCompletion({ id: 'a', name: 'A', seats: 48, usersReached: 40, completed: 30 })
    ).toBe(75);
  });

  it('is null — not 0 — when nobody has been reached', () => {
    // An account nobody has started is not an account that is failing.
    expect(
      companyCompletion({ id: 'a', name: 'A', seats: 10, usersReached: 0, completed: 0 })
    ).toBeNull();
  });
});

describe('companiesForUsers', () => {
  it('returns only the companies the given users belong to', () => {
    const found = companiesForUsers(USERS_REACHED.filter((u) => u.companyId === 'co-meridian'));
    expect(found.map((c) => c.id)).toEqual(['co-meridian']);
  });

  it('keeps COMPANIES order rather than first-seen order', () => {
    const found = companiesForUsers(USERS_REACHED);
    const order = COMPANIES.filter((c) => found.some((f) => f.id === c.id)).map((c) => c.id);
    expect(found.map((c) => c.id)).toEqual(order);
  });

  it('is empty when the filter matched no users — the segment filter still applies', () => {
    expect(companiesForUsers([])).toEqual([]);
  });

  it('every reached user resolves to a real company', () => {
    // The same guard skills.test.ts puts on cited skill ids: a row that cannot
    // resolve would silently vanish from the grouped table.
    for (const u of USERS_REACHED) {
      expect(COMPANIES.some((c) => c.id === u.companyId)).toBe(true);
    }
  });
});
