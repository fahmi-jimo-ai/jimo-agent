import { setState, resetState } from './escalationStore';
import { setAnalytics, resetAnalytics } from './analyticsStore';
import { buildSuggestions, makeTopic } from '@/data/fixtures';
import { DEFAULT_TRIGGERS, type AnalyticsState, type EscalationState } from './types';

/**
 * Put the store into a named state. Used by the page stories so each Figma
 * artboard has a story that renders exactly it.
 */
export function seed(patch: Partial<EscalationState> = {}) {
  resetState();
  setState(patch);
}

export const SEEDS = {
  notEnabled: () => seed(),

  /** Figma 10:4841 — enabled, nothing has happened yet, so no chart. */
  enabledEmpty: () =>
    seed({ enabled: true, vendor: 'intercom', triggers: DEFAULT_TRIGGERS, draftTriggers: DEFAULT_TRIGGERS }),

  /** Figma 29:7085 — the populated page. */
  withData: () =>
    seed({ enabled: true, vendor: 'intercom', hasHandoffs: true }),

  /** Explicit request unchecked in the draft -> the Confirm button appears. */
  dirtyTriggers: () =>
    seed({
      enabled: true,
      vendor: 'intercom',
      hasHandoffs: true,
      triggers: DEFAULT_TRIGGERS,
      draftTriggers: { ...DEFAULT_TRIGGERS, explicit: { on: false } },
    }),

  generating: () =>
    seed({
      enabled: true,
      vendor: 'intercom',
      suggestions: { status: 'generating', items: [], selectedIds: [], collapsed: false },
    }),

  suggestions: () =>
    seed({
      enabled: true,
      vendor: 'intercom',
      suggestions: { status: 'ready', items: buildSuggestions(), selectedIds: [], collapsed: false },
    }),

  suggestionsStaged: () => {
    const items = buildSuggestions();
    seed({
      enabled: true,
      vendor: 'intercom',
      suggestions: {
        status: 'ready',
        items,
        selectedIds: [items[0].id, items[4].id],
        collapsed: false,
      },
    });
  },

  topicsAdded: () =>
    seed({
      enabled: true,
      vendor: 'intercom',
      topics: [
        makeTopic('Support tickets'),
        makeTopic('How do I create a hint?'),
        makeTopic('I want to reduce support tickets'),
      ],
      suggestions: { status: 'ready', items: buildSuggestions(), selectedIds: [], collapsed: true },
    }),
};

/* ── Analytics ──────────────────────────────────────────────────────────────
   The analytics pages persist their view state, so a story has to put the
   store into a known shape before rendering or it inherits whatever the last
   run left behind. Same contract as `seed()` above, for the other store. */
export function seedAnalytics(patch: Partial<AnalyticsState> = {}) {
  resetAnalytics();
  setAnalytics(patch);
}

export const ANALYTICS_SEEDS = {
  /** Figma 934:27943 — the populated Statistics page. */
  statistics: () => seedAnalytics(),

  /** Decision 8: no data means zeroed tiles and a bare grid, not a new screen. */
  statisticsNoData: () => seedAnalytics({ hasData: false }),

  /** Figma 934:28534 — the populated inbox. */
  conversations: () => seedAnalytics(),

  /** Figma 934:30359 — nothing has happened yet, so no toolbar either. */
  conversationsEmpty: () => seedAnalytics({ hasConversations: false }),

  /** Figma 934:30109 — a search that matches nothing. */
  conversationsNoResults: () => seedAnalytics({ convoSearch: 'Jim' }),
};
