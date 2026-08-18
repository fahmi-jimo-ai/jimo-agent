import { setState, resetState } from './escalationStore';
import { buildSuggestions, makeTopic } from '@/data/fixtures';
import { DEFAULT_TRIGGERS, type EscalationState } from './types';

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
