import { classifyChip } from '@/lib/classifyChip';
import type { Topic } from '@/state/types';

let seq = 0;
export const makeTopic = (label: string): Topic => ({
  id: `t${Date.now().toString(36)}${(seq++).toString(36)}`,
  label,
  category: classifyChip(label),
});

/* ── Suggested topics ──────────────────────────────────────────────────────
   The Figma artboards repeat three placeholder strings; these keep those
   three and extend the set so all 10 pills are distinct and the three
   categories are genuinely mixed (the spec's own prompt requires the mix). */
export const SUGGESTED_TOPIC_LABELS = [
  'Support tickets',
  'I want to reduce support tickets',
  'How do I create a hint?',
  'Onboarding tour for new users',
  'billing issue',
  'Where should I create hints?',
  'I want to use the Hint builder',
  'team invites',
  'How to invite my team',
  'workspace roles & permissions',
];

export const buildSuggestions = (): Topic[] => SUGGESTED_TOPIC_LABELS.map(makeTopic);

/* ── Handoffs chart ────────────────────────────────────────────────────────
   30 daily buckets (Aug 1–30). The four series hold the legend's
   45 / 15 / 25 / 15 split and sum to the headline 6,248. Deterministic —
   a seeded LCG, not Math.random, so the chart is identical on every render
   and screenshot diffs against the Figma stay meaningful. */
export const HANDOFF_TOTAL = 6248;

export const REASON_SERIES = [
  { key: 'explicit',    label: 'Explicit request', share: 0.45, color: 'var(--color-green-300)' },
  { key: 'wrongAnswer', label: 'Wrong answer',     share: 0.15, color: 'var(--color-purple-300)' },
  { key: 'frustration', label: 'Frustration',      share: 0.25, color: 'var(--color-red-300)' },
  { key: 'topic',       label: 'Specific topic',   share: 0.15, color: 'var(--color-blue-200)' },
] as const;

export type ReasonKey = (typeof REASON_SERIES)[number]['key'];
export interface ChartDay { day: number; values: Record<ReasonKey, number> }

function lcg(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

export function buildChartDays(): ChartDay[] {
  const rand = lcg(20260801);
  const days: ChartDay[] = [];
  for (let day = 1; day <= 30; day++) {
    // A gentle upward drift across the month plus per-day jitter, so the
    // silhouette matches the Figma's rising-to-the-right shape.
    const drift = 0.85 + (day / 30) * 0.6;
    const total = Math.round((16 + rand() * 30) * drift);
    days.push({
      day,
      values: {
        explicit:    Math.max(1, Math.round(total * 0.45)),
        wrongAnswer: Math.max(1, Math.round(total * 0.15)),
        frustration: Math.max(1, Math.round(total * 0.25)),
        topic:       Math.max(1, Math.round(total * 0.15)),
      },
    });
  }
  return days;
}

/* ── The worked example used by the test modal and the widget ─────────────── */
export const SAMPLE_BRIEF =
  "I've connected Okta twice but my teammates still can't log in. The assistant walked me " +
  'through the SSO guide and domain verification — the error is still there.';

export const SAMPLE_NOTE = {
  user: 'Marie Dubois · ma***@acme.com · Acme Corp',
  page: '/settings/sso · Chrome 128 · macOS 15',
  reason: 'Asked for a human',
  topic: 'Support tickets',
  transcript: '6 turns, timestamped, with page links',
};

export const SAMPLE_TRANSCRIPT: Array<{ from: 'user' | 'agent'; at: string; text: string }> = [
  { from: 'user',  at: '14:02', text: 'SSO login is failing for my team' },
  { from: 'agent', at: '14:02', text: 'Let me check the SSO setup guide for you…' },
  { from: 'user',  at: '14:04', text: "I've already followed that, it didn't work" },
  { from: 'agent', at: '14:04', text: 'Have you verified your domain in Okta?' },
  { from: 'user',  at: '14:06', text: 'Verified twice. Still the same error.' },
  { from: 'agent', at: '14:06', text: 'Let me put you in touch with the team.' },
];

/* ── MATCHERS — SIMULATOR HEURISTICS, NOT PRODUCT LOGIC ────────────────────
   No upstream source defines these. The Figma documents only how a pill's own
   text is CLASSIFIED (classifyChip); it never defines how a live message
   MATCHES a pill. The old HTML prototype's per-rule `keywords[]` array was a
   different data model that this design drops, and the PRD's own
   `isNegativeFollowup` is recorded in the PRD as broken.

   So these lists exist to make the simulator demonstrable, and are deliberately
   quarantined here so they are never mistaken for shipped runtime behaviour. */
export const MATCHERS = {
  explicitAsk: [
    'talk to a human', 'speak to a human', 'real person', 'real human',
    'speak to someone', 'talk to someone', 'human please', 'agent please',
    'customer support', 'support team', 'let me talk to', 'i want a human',
  ],
  rejection: [
    "didn't work", 'did not work', "doesn't work", 'still broken', 'still failing',
    'not working', 'no it', 'wrong', 'nope', 'that is not', "that's not", 'already tried',
  ],
  /** Tiered: `subtle` fires on any tier, `slight` on 2+, `furious` on tier 3 only. */
  frustration: {
    subtle:  ['hmm', 'not quite', 'confusing', 'unclear', 'again?'],
    slight:  ['frustrating', 'annoying', 'waste of time', 'going in circles', 'seriously'],
    furious: ['useless', 'terrible', 'ridiculous', 'awful', 'fed up', 'unacceptable'],
  },
} as const;
