/**
 * Demo state — a workspace that has been running for a while.
 *
 * Exists so the populated pages — the escalation chart and topic list, and the
 * Knowledge page's Sources table — can be reached in one click instead of by
 * hand-adding a dozen rows. The Configuration row that drives it ships in the
 * production bundle too: the deployed build is what gets demoed.
 *
 * Turning it ON snapshots the real config first; turning it OFF restores that
 * snapshot. Escalation and Knowledge are separate stores under separate keys,
 * so there are two snapshots — but one switch.
 *
 * It deliberately does NOT go through `seed()` — `seed()` calls `resetState()`,
 * which would wipe the user's vendor and topics for good.
 */
import { getState, setState } from './escalationStore';
import { getKnowledge, setSources } from './knowledgeStore';
import { makeTopic } from '@/data/fixtures';
import { DEMO_SOURCES, type KnowledgeSource } from '@/data/knowledgeSources';
import { DEFAULT_TRIGGERS, type EscalationState } from './types';

const SNAPSHOT_KEY = 'jimo.agent.escalation.demo-snapshot.v1';
/* Sources live in their own store under their own key, so they snapshot
   separately — but through the SAME switch. A second demo toggle on a page the
   artboards do not draw would be invention; one prototype, one demo control. */
const SOURCES_SNAPSHOT_KEY = 'jimo.agent.knowledge.demo-snapshot.v1';
/* Pre-rename name — migrated on read so a demo left ON across the rename can
   still be turned OFF back onto the user's real config. See escalationStore. */
const LEGACY_SNAPSHOT_KEY = 'jimo.escalation.demo-snapshot.v1';

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
    crisp: null,
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

/** The sources half of the same round trip. Split out so it is unit-testable. */
export function readSourcesSnapshot(raw: string | null): KnowledgeSource[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as KnowledgeSource[]) : null;
  } catch {
    return null;
  }
}

function snapshotSources() {
  try {
    window.localStorage.setItem(SOURCES_SNAPSHOT_KEY, JSON.stringify(getKnowledge().sources));
  } catch {
    /* quota / private mode — as above */
  }
}

function restoreSources() {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(SOURCES_SNAPSHOT_KEY);
    window.localStorage.removeItem(SOURCES_SNAPSHOT_KEY);
  } catch {
    /* unreadable — fall through to the empty list below */
  }
  // No snapshot means there is nothing to go back TO, and Sources starts empty,
  // so the empty state is the honest landing place. Same call the escalation
  // branch below makes.
  setSources(readSourcesSnapshot(raw) ?? [], false);
}

export function setDemo(on: boolean) {
  if (on) {
    try {
      window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot()));
    } catch {
      /* quota / private mode — the demo still works, it just can't be undone */
    }
    snapshotSources();
    setState({ ...demoPatch(), demo: true });
    setSources(DEMO_SOURCES(), true);
    return;
  }

  restoreSources();

  let restored: Partial<EscalationState> | null = null;
  try {
    const raw =
      window.localStorage.getItem(SNAPSHOT_KEY) ??
      window.localStorage.getItem(LEGACY_SNAPSHOT_KEY);
    if (raw) restored = JSON.parse(raw) as Partial<EscalationState>;
    window.localStorage.removeItem(SNAPSHOT_KEY);
    window.localStorage.removeItem(LEGACY_SNAPSHOT_KEY);
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
      crisp: null,
      triggers: DEFAULT_TRIGGERS,
      draftTriggers: DEFAULT_TRIGGERS,
      topics: [],
      suggestions: { status: 'idle' as const, items: [], selectedIds: [], collapsed: false },
      range: 'this-month' as const,
    }),
    demo: false,
  });
}
