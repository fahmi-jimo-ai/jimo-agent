/**
 * Demo state — a workspace that has been running for a while.
 *
 * Exists so the populated page (chart + a full topic list) can be reached in
 * one click instead of by hand-adding a dozen topics. The Configuration row
 * that drives it ships in the production bundle too — the deployed build is
 * what gets demoed.
 *
 * Turning it ON snapshots the real config first; turning it OFF restores that
 * snapshot. It deliberately does NOT go through `seed()` — `seed()` calls
 * `resetState()`, which would wipe the user's vendor and topics for good.
 */
import { getState, setState } from './escalationStore';
import { makeTopic } from '@/data/fixtures';
import { DEFAULT_TRIGGERS, type EscalationState } from './types';

const SNAPSHOT_KEY = 'jimo.escalation.demo-snapshot.v1';

/* Labels only — categories come from classifyChip so the pills stay consistent
   with the spec instead of being hand-assigned here. The mix is intentional:
   keywords, intents and questions all present, as a real workspace would be. */
const DEMO_TOPIC_LABELS = [
  'billing issue',
  'refund request',
  'How do I cancel my subscription?',
  'I want to talk to a human',
  'SSO login broken',
  'Where should I create hints?',
  'enterprise pricing',
  'I need help migrating my workspace',
  'How to invite my team',
  'data export',
  'GDPR / DPA request',
  'My changelog is not publishing',
  'workspace roles & permissions',
  'Can I get a demo of the Hint builder?',
  'annual invoice',
];

/* Suggestions left over from the last "Suggest topics" run: still available,
   panel collapsed — the resting state after you have used the feature once. */
const DEMO_SUGGESTION_LABELS = [
  'API rate limits',
  'Is there a Slack integration?',
  'I want to reduce support tickets',
  'mobile SDK setup',
  'How do I add a teammate as admin?',
  'onboarding checklist',
];

function demoPatch(): Partial<EscalationState> {
  return {
    enabled: true,
    vendor: 'intercom',
    supportEmail: null,
    hasHandoffs: true,
    triggers: DEFAULT_TRIGGERS,
    draftTriggers: DEFAULT_TRIGGERS,
    topics: DEMO_TOPIC_LABELS.map(makeTopic),
    suggestions: {
      status: 'ready',
      items: DEMO_SUGGESTION_LABELS.map(makeTopic),
      selectedIds: [],
      collapsed: true,
    },
    range: 'this-month',
  };
}

/** Everything the demo overwrites, so toggling off is lossless. */
function snapshot(): Partial<EscalationState> {
  const { demo: _demo, ...rest } = getState();
  return rest;
}

export function setDemo(on: boolean) {
  if (on) {
    try {
      window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot()));
    } catch {
      /* quota / private mode — the demo still works, it just can't be undone */
    }
    setState({ ...demoPatch(), demo: true });
    return;
  }

  let restored: Partial<EscalationState> | null = null;
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (raw) restored = JSON.parse(raw) as Partial<EscalationState>;
    window.localStorage.removeItem(SNAPSHOT_KEY);
  } catch {
    /* unreadable snapshot — fall through to the empty state below */
  }

  // No snapshot (cleared storage, or the demo was on across a rebuild) means
  // there is nothing to go back TO, so land on the not-enabled hero.
  setState({
    ...(restored ?? {
      enabled: false,
      hasHandoffs: false,
      vendor: null,
      supportEmail: null,
      triggers: DEFAULT_TRIGGERS,
      draftTriggers: DEFAULT_TRIGGERS,
      topics: [],
      suggestions: { status: 'idle' as const, items: [], selectedIds: [], collapsed: false },
      range: 'this-month' as const,
    }),
    demo: false,
  });
}
