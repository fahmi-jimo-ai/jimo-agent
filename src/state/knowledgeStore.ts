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
 *   - `pages` are the output of a page scan. Like `sources` the whole record is
 *     stored; unlike `sources` the list starts POPULATED — see INITIAL_KNOWLEDGE.
 *
 * The key does NOT change when `sources`, `retrain` or `pages` are added:
 * `parseKnowledge` merges over `INITIAL_KNOWLEDGE`, so a payload written before
 * they existed is read forward with the defaults and no migration step.
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
import {
  isElementGroup,
  isScanStatus,
  DEMO_PAGES,
  type InterfacePage,
  type PageElement,
} from '@/data/interfacePages';
import {
  armTraining,
  disarmTraining,
  MAX_AUTO_RETRIES,
  RETRY_MS,
  SCAN_MS,
} from './trainingTimers';

const KEY = 'jimo.agent.knowledge.v1';

export type RetrainFrequency = 'never' | 'daily' | 'weekly';

export type KnowledgeState = {
  /** Catalogue ids, in the order they were added. */
  addedIds: string[];
  /** Knowledge sources, newest last — the table sorts on read, not here. */
  sources: KnowledgeSource[];
  /**
   * Scanned pages — the Interface tab's grid, and the catalogue the skill
   * page-picker reads. Unlike `sources` this is seeded POPULATED; see
   * INITIAL_KNOWLEDGE below.
   */
  pages: InterfacePage[];
  /** Auto retraining frequency. 899:14869 opens on "Never". */
  retrain: RetrainFrequency;
  /** Mirrors escalation's `demo` flag so the switch can read its own state. */
  demoSources: boolean;
};

/**
 * `pages` is the one field here that does not start empty.
 *
 * A source is something the user types, so an empty Sources tab is a true
 * statement about a new workspace. A page catalogue is the OUTPUT of a scanner,
 * and this prototype has no scanner — seeding it empty would leave the Interface
 * tab, the skill page-picker and the skill drawer's `Interface:` field all blank
 * with no way to fill them. `Scan a page` is the honest out-of-scope toast that
 * pairs with this.
 */
export const INITIAL_KNOWLEDGE: KnowledgeState = {
  addedIds: [],
  sources: [],
  pages: DEMO_PAGES(),
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
    // All four read forward as absent, which is the correct reading of a row
    // written before any of this existed: nothing is known about its sync
    // health, and nothing is claimed. `failedAttempts` in particular HAS to
    // survive the round trip — `resumeTraining` counts against it to decide
    // whether the retry loop still has attempts left, so dropping it here would
    // restart an exhausted loop on every reload.
    lastTrainedAt: typeof raw.lastTrainedAt === 'number' ? raw.lastTrainedAt : undefined,
    failedAttempts: typeof raw.failedAttempts === 'number' ? raw.failedAttempts : undefined,
    lastError: typeof raw.lastError === 'string' ? raw.lastError : undefined,
    unreachable: raw.unreachable === true ? true : undefined,
    addedBy: typeof raw.addedBy === 'string' ? raw.addedBy : '',
    tokens: num(raw.tokens),
    usedInResponses: num(raw.usedInResponses),
    chunks: parseChunks(raw.chunks),
  };
}

function parseElements(value: unknown): PageElement[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
    .filter((e) => typeof e.id === 'string' && typeof e.label === 'string')
    .map((e) => ({
      id: e.id as string,
      label: e.label as string,
      // Coerced rather than dropped, for the same reason `parseSource` coerces
      // kind: an unknown group would render an untinted row, not an error.
      group: isElementGroup(e.group) ? e.group : 'contents',
      tag: typeof e.tag === 'string' ? e.tag : 'Div',
    }));
}

export function parsePage(value: unknown): InterfacePage | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
  return {
    id: raw.id,
    name: raw.name,
    urlRule: typeof raw.urlRule === 'string' ? raw.urlRule : '',
    scannedAt: num(raw.scannedAt, Date.now()),
    // Coerced to `ready`, not dropped: a payload written before `status` existed
    // holds pages that ARE readable, and defaulting them to `scanning` would
    // strand every one of them behind a spinner on the first reload.
    status: isScanStatus(raw.status) ? raw.status : 'ready',
    elements: parseElements(raw.elements),
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
    // A payload written before `pages` existed spreads INITIAL_KNOWLEDGE's
    // seeded catalogue in above, so it reads forward with the demo pages rather
    // than an empty grid. Same no-migration property `sources` relies on.
    pages: (Array.isArray(stored.pages) ? stored.pages : [])
      .map(parsePage)
      .filter((p): p is InterfacePage => p !== null),
    retrain: RETRAIN_VALUES.includes(stored.retrain as RetrainFrequency)
      ? (stored.retrain as RetrainFrequency)
      : 'never',
    demoSources: stored.demoSources === true,
  };
}

/* ── pure list helpers, so the tests never need a DOM ─────────────────────── */

export function withPageAdded(pages: InterfacePage[], page: InterfacePage): InterfacePage[] {
  return [...pages, page];
}

export function withPageRemoved(pages: InterfacePage[], id: string): InterfacePage[] {
  return pages.filter((p) => p.id !== id);
}

export function withPagePatched(
  pages: InterfacePage[],
  id: string,
  patch: Partial<InterfacePage>,
): InterfacePage[] {
  return pages.map((p) => (p.id === id ? { ...p, ...patch } : p));
}

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

/**
 * Put a failed row back through training, by hand — PRD-373.
 *
 * A manual retry clears `unreachable`, which is what separates it from the
 * automatic one: the person clicking it has, presumably, just fixed the access
 * that broke. An auto-retry cannot make that assumption, so it leaves the flag
 * alone and fails again until someone does something. That asymmetry is the
 * ticket's own account of the situation — a manual re-trigger restores the
 * source, which is exactly why the customer wants the system to stop needing
 * them to notice.
 */
export function retrySource(id: string) {
  updateSource(id, {
    status: 'training',
    updatedAt: Date.now(),
    unreachable: false,
    lastError: undefined,
  });
  armTraining(id, finishTraining);
}

/**
 * Re-arm a timer for every row that is still `training`, and resume the
 * auto-retry loop for every failed row that has attempts left.
 *
 * `training` IS persisted — a row that says Training… should still say it after
 * a reload rather than lie about being trained — but the timer is not, so
 * without this a reload would strand the pill forever. `SourcesTab` calls it on
 * mount; it is idempotent, because `armTraining` replaces rather than stacks.
 *
 * The failed half is the same pairing one level along: `failedAttempts` is
 * persisted, the schedule behind it is not, so a source left mid-loop when the
 * tab closed would sit there forever with attempts remaining and nothing coming.
 */
export function resumeTraining() {
  state.sources.forEach((s) => {
    if (s.status === 'training') armTraining(s.id, finishTraining);
    else if (s.status === 'failed' && (s.failedAttempts ?? 0) < MAX_AUTO_RETRIES) {
      armTraining(s.id, autoRetry, RETRY_MS);
    }
  });
}

/**
 * One scheduled attempt. It runs the same training as everything else and lets
 * `finishTraining` decide the outcome, rather than deciding it here — an
 * auto-retry that could succeed where a manual one could not would be a lie
 * about what the loop is doing.
 */
function autoRetry(id: string) {
  const source = state.sources.find((s) => s.id === id);
  if (!source || source.status !== 'failed') return;
  if ((source.failedAttempts ?? 0) >= MAX_AUTO_RETRIES) return;
  updateSource(id, { status: 'training', updatedAt: Date.now() });
  armTraining(id, finishTraining);
}

/**
 * The end of one training run, successful or not.
 *
 * The load-bearing line is the failure branch: it writes a status, a reason and
 * an attempt count, and it does NOT touch `chunks`, `tokens` or `lastTrainedAt`.
 * A sync that fetched nothing has nothing to commit, so the previous training
 * stays exactly where it was and the agent keeps answering from it. Committing
 * the empty result is the bug PRD-390 describes, and it cost the account that
 * filed it months of wrong answers nobody could see the cause of.
 */
function finishTraining(id: string) {
  const source = state.sources.find((s) => s.id === id);
  if (!source || source.status !== 'training') return;

  if (source.unreachable) {
    const failedAttempts = (source.failedAttempts ?? 0) + 1;
    updateSource(id, {
      status: 'failed',
      updatedAt: Date.now(),
      failedAttempts,
      lastError: source.lastError ?? 'The source could not be fetched',
    });
    if (failedAttempts < MAX_AUTO_RETRIES) armTraining(id, autoRetry, RETRY_MS);
    return;
  }

  const now = Date.now();
  updateSource(id, {
    status: 'trained',
    updatedAt: now,
    lastTrainedAt: now,
    failedAttempts: 0,
    lastError: undefined,
  });
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

/* ── pages ─────────────────────────────────────────────────────── */

export function addPage(page: InterfacePage) {
  patch({ pages: withPageAdded(state.pages, page) });
  if (page.status === 'scanning') armTraining(page.id, finishScan, SCAN_MS);
}

export function removePage(id: string) {
  disarmTraining(id);
  patch({ pages: withPageRemoved(state.pages, id) });
}

export function updatePage(id: string, next: Partial<InterfacePage>) {
  patch({ pages: withPagePatched(state.pages, id, next) });
}

/**
 * Put a page back into `scanning` and arm its timer — the drawer's "Rescan
 * interface" and the card's kebab row. `updatePage` deliberately does NOT arm
 * one (matching `updateSource`), so the two callers that need a timer say so.
 */
export function rescanPage(id: string) {
  updatePage(id, { status: 'scanning' });
  armTraining(id, finishScan, SCAN_MS);
}

function finishScan(id: string) {
  const page = state.pages.find((p) => p.id === id);
  if (!page || page.status !== 'scanning') return;
  updatePage(id, { status: 'ready', scannedAt: Date.now() });
}

/**
 * The scan half of `resumeTraining`, and it exists for exactly the same reason:
 * `status` is persisted but a timer id is not, so a card left mid-scan when the
 * tab closed would say "Scanning page…" forever without this. Idempotent —
 * `armTraining` replaces an id's timer rather than stacking one.
 */
export function resumeScanning() {
  state.pages
    .filter((p) => p.status === 'scanning')
    .forEach((p) => armTraining(p.id, finishScan, SCAN_MS));
}

/** Wholesale replacement — stories, and nothing else. */
export function setPages(pages: InterfacePage[]) {
  state.pages.forEach((p) => disarmTraining(p.id));
  patch({ pages });
  resumeScanning();
}

export function resetKnowledge() {
  state.sources.forEach((s) => disarmTraining(s.id));
  state.pages.forEach((p) => disarmTraining(p.id));
  // Re-run the factory rather than reusing INITIAL_KNOWLEDGE's: `scannedAt` is
  // rendered relative, so a module-load snapshot would reset to stale ages.
  setKnowledge({ ...INITIAL_KNOWLEDGE, pages: DEMO_PAGES() });
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
