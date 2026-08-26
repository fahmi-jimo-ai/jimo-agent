/**
 * The Knowledge page's persisted state — user-property ids and knowledge sources.
 *
 * Same shape as escalationStore — a tiny external store persisted to
 * localStorage — so the two read side by side. There is no legacy key to
 * migrate here: this page did not exist before the `jimo-agent` rename.
 *
 * Two very different kinds of record live under one key:
 *   - `addedIds` are ids into the FIXED `@/data/userProperties` catalogue. Only
 *     the ids are stored, so the two cannot drift.
 *   - `sources` are created by the user and exist nowhere else, so the whole
 *     record is stored.
 *
 * The key does NOT change when `sources` and `retrain` are added: `parseKnowledge`
 * merges over `INITIAL_KNOWLEDGE`, so a payload written before they existed is
 * read forward with the defaults and no migration step.
 *
 * The reading of a payload is a pure function on purpose — `parseKnowledge` and
 * the list helpers below carry every decision this file makes, and the vitest
 * suite runs in node with no DOM, so they are what the tests can reach.
 */
import {
  isSourceKind,
  isSourceStatus,
  type KnowledgeSource,
  type SourceChunk,
} from '@/data/knowledgeSources';
import { armTraining, disarmTraining } from './trainingTimers';

const KEY = 'jimo.agent.knowledge.v1';

export type RetrainFrequency = 'never' | 'daily' | 'weekly';

export type KnowledgeState = {
  /** Catalogue ids, in the order they were added. */
  addedIds: string[];
  /** Knowledge sources, newest last — the table sorts on read, not here. */
  sources: KnowledgeSource[];
  /** Auto retraining frequency. 899:14869 opens on "Never". */
  retrain: RetrainFrequency;
  /** Mirrors escalation's `demo` flag so the switch can read its own state. */
  demoSources: boolean;
};

export const INITIAL_KNOWLEDGE: KnowledgeState = {
  addedIds: [],
  sources: [],
  retrain: 'never',
  demoSources: false,
};

const RETRAIN_VALUES: RetrainFrequency[] = ['never', 'daily', 'weekly'];

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function parseChunks(value: unknown): SourceChunk[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .filter((c) => typeof c.id === 'string' && typeof c.text === 'string')
    .map((c) => ({ id: c.id as string, text: c.text as string }));
}

/**
 * A stored source with an unknown kind or status would render an empty pill
 * rather than fail loudly, so it is coerced on the way in — the same call the
 * `addedIds` filter already made.
 */
export function parseSource(value: unknown): KnowledgeSource | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string' || typeof raw.label !== 'string') return null;
  const now = Date.now();
  return {
    id: raw.id,
    label: raw.label,
    kind: isSourceKind(raw.kind) ? raw.kind : 'text',
    href: typeof raw.href === 'string' ? raw.href : undefined,
    status: isSourceStatus(raw.status) ? raw.status : 'trained',
    addedAt: num(raw.addedAt, now),
    updatedAt: num(raw.updatedAt, now),
    addedBy: typeof raw.addedBy === 'string' ? raw.addedBy : '',
    tokens: num(raw.tokens),
    usedInResponses: num(raw.usedInResponses),
    chunks: parseChunks(raw.chunks),
  };
}

/** The whole read path, as a pure function of the stored string. */
export function parseKnowledge(raw: string | null): KnowledgeState {
  if (!raw) return INITIAL_KNOWLEDGE;
  let stored: Partial<KnowledgeState>;
  try {
    stored = { ...INITIAL_KNOWLEDGE, ...(JSON.parse(raw) as Partial<KnowledgeState>) };
  } catch {
    return INITIAL_KNOWLEDGE;
  }
  return {
    // A stored id that no longer exists in the catalogue would render an empty
    // row rather than fail loudly, so drop it on the way in.
    addedIds: (stored.addedIds ?? []).filter((id) => typeof id === 'string'),
    sources: (Array.isArray(stored.sources) ? stored.sources : [])
      .map(parseSource)
      .filter((s): s is KnowledgeSource => s !== null),
    retrain: RETRAIN_VALUES.includes(stored.retrain as RetrainFrequency)
      ? (stored.retrain as RetrainFrequency)
      : 'never',
    demoSources: stored.demoSources === true,
  };
}

/* ── pure list helpers, so the tests never need a DOM ─────────────────────── */

export function withSourceAdded(
  sources: KnowledgeSource[],
  source: KnowledgeSource,
): KnowledgeSource[] {
  return [...sources, source];
}

export function withSourceRemoved(sources: KnowledgeSource[], id: string): KnowledgeSource[] {
  return sources.filter((s) => s.id !== id);
}

export function withSourcePatched(
  sources: KnowledgeSource[],
  id: string,
  patch: Partial<KnowledgeSource>,
): KnowledgeSource[] {
  return sources.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

/* ── the store ────────────────────────────────────────────────────────────── */

let state: KnowledgeState = hydrate();
const listeners = new Set<() => void>();

function hydrate(): KnowledgeState {
  if (typeof window === 'undefined') return INITIAL_KNOWLEDGE;
  try {
    return parseKnowledge(window.localStorage.getItem(KEY));
  } catch {
    return INITIAL_KNOWLEDGE;
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — the page still works, it just won't survive a reload */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function getKnowledge(): KnowledgeState {
  return state;
}

export function subscribeKnowledge(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setKnowledge(next: KnowledgeState) {
  state = next;
  persist();
  emit();
}

function patch(next: Partial<KnowledgeState>) {
  setKnowledge({ ...state, ...next });
}

/** Union, keeping the existing order and appending what is new. */
export function addProperties(ids: string[]) {
  const fresh = ids.filter((id) => !state.addedIds.includes(id));
  if (!fresh.length) return;
  patch({ addedIds: [...state.addedIds, ...fresh] });
}

export function removeProperty(id: string) {
  patch({ addedIds: state.addedIds.filter((x) => x !== id) });
}

/* ── sources ──────────────────────────────────────────────────────────────── */

/**
 * Adding a source arms its training timer here rather than at the call site, so
 * a caller cannot add a `training` row and forget to make it settle.
 */
export function addSource(source: KnowledgeSource) {
  patch({ sources: withSourceAdded(state.sources, source) });
  if (source.status === 'training') armTraining(source.id, finishTraining);
}

export function removeSource(id: string) {
  disarmTraining(id);
  patch({ sources: withSourceRemoved(state.sources, id) });
}

export function updateSource(id: string, next: Partial<KnowledgeSource>) {
  patch({ sources: withSourcePatched(state.sources, id, next) });
}

/** Put a failed row back through training. */
export function retrySource(id: string) {
  updateSource(id, { status: 'training', updatedAt: Date.now() });
  armTraining(id, finishTraining);
}

/**
 * Re-arm a timer for every row that is still `training`.
 *
 * `training` IS persisted — a row that says Training… should still say it after
 * a reload rather than lie about being trained — but the timer is not, so
 * without this a reload would strand the pill forever. `SourcesTab` calls it on
 * mount; it is idempotent, because `armTraining` replaces rather than stacks.
 */
export function resumeTraining() {
  state.sources.filter((s) => s.status === 'training').forEach((s) => armTraining(s.id, finishTraining));
}

function finishTraining(id: string) {
  const source = state.sources.find((s) => s.id === id);
  if (!source || source.status !== 'training') return;
  updateSource(id, { status: 'trained', updatedAt: Date.now() });
}

/** Wholesale replacement — the Demo data switch, and nothing else. */
export function setSources(sources: KnowledgeSource[], demoSources = state.demoSources) {
  state.sources.forEach((s) => disarmTraining(s.id));
  patch({ sources, demoSources });
  resumeTraining();
}

export function setRetrain(retrain: RetrainFrequency) {
  patch({ retrain });
}

export function resetKnowledge() {
  state.sources.forEach((s) => disarmTraining(s.id));
  setKnowledge(INITIAL_KNOWLEDGE);
}

// Cross-tab, matching escalationStore: `storage` only fires in OTHER tabs, and
// the writing tab has already been notified synchronously by emit().
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    state = hydrate();
    emit();
  });
}
