/**
 * The Experiences pages' persisted state.
 *
 * A direct sibling of `skillsStore` — a tiny external store persisted to
 * localStorage, whose read path is a pure function so the vitest suite can run
 * in node with no DOM.
 *
 * ## Seeded POPULATED, for `skillsStore`'s reason
 *
 * The index artboard only ever draws the populated page, the empty state it
 * would otherwise land on is undrawn, and the deployed build is what gets
 * demoed. `ExperiencesEmptyState` is still built and still reachable — delete
 * every row of a type — it just is not where a first visit lands.
 *
 * ## Filters ARE persisted, and per type
 *
 * The Jimo docs say filters and display options "can be saved for the current
 * tab view", which makes them configuration rather than "where a reader is
 * inside a page" — the line `ThinkingTrace` and `SourcesTab` draw for their own
 * open state. So `views` holds one `ViewPrefs` per experience type. What is NOT
 * persisted: which KPI tile the detail page has selected, and which of its
 * Statistics / Issues tabs is open.
 *
 * Because `parseExperiences` merges over `INITIAL_EXPERIENCES`, a payload
 * written before `views` existed reads forward with the defaults and no
 * migration step — the same property `knowledgeStore` documents for `pages`.
 */
import {
  DEMO_EXPERIENCES,
  EXPERIENCE_TYPES,
  isExperienceStatus,
  isExperienceType,
  type Experience,
  type ExperienceStatus,
  type ExperienceStep,
  type ExperienceType,
  type MetricKey,
  type TaskRow,
} from '@/data/experiences';

const KEY = 'jimo.agent.experiences.v1';

/** The artboard's three tabs. `+ New View` is not one of these — see the page. */
export type ExperienceTab = 'all' | 'live' | 'draft';

export const EXPERIENCE_TABS: ExperienceTab[] = ['all', 'live', 'draft'];

export const EXPERIENCE_TAB_LABEL: Record<ExperienceTab, string> = {
  all: 'All',
  live: 'Live',
  draft: 'Draft',
};

/**
 * The three display modes the docs name: "a detailed list (by default), a
 * mosaic, or a simplified list". The artboard draws only the mosaic — and draws
 * it SELECTED — so `mosaic` is the default here where the product's is `list`.
 */
export type ExperienceDisplay = 'compact' | 'mosaic' | 'list';

export const EXPERIENCE_DISPLAYS: ExperienceDisplay[] = ['compact', 'mosaic', 'list'];

export const EXPERIENCE_DISPLAY_LABEL: Record<ExperienceDisplay, string> = {
  compact: 'Simplified list',
  mosaic: 'Mosaic',
  list: 'Detailed list',
};

export type ViewPrefs = {
  tab: ExperienceTab;
  /**
   * The `Contexts` pill — experience types. Seeded to the page's own type, so
   * a Tours page opens on Tours and can be widened to show other types beside
   * them. Never empty: the toolbar refuses to deselect the last one, because a
   * list filtered to no types is a blank page with no way back.
   */
  contexts: ExperienceType[];
  statuses: ExperienceStatus[];
  segments: string[];
  tags: string[];
  display: ExperienceDisplay;
};

export type ExperiencesState = {
  experiences: Experience[];
  views: Record<ExperienceType, ViewPrefs>;
};

function defaultView(type: ExperienceType): ViewPrefs {
  return {
    tab: 'all',
    contexts: [type],
    statuses: [],
    segments: [],
    tags: [],
    display: 'mosaic',
  };
}

function defaultViews(): Record<ExperienceType, ViewPrefs> {
  return EXPERIENCE_TYPES.reduce(
    (acc, type) => {
      acc[type] = defaultView(type);
      return acc;
    },
    {} as Record<ExperienceType, ViewPrefs>,
  );
}

export const INITIAL_EXPERIENCES: ExperiencesState = {
  experiences: DEMO_EXPERIENCES(),
  views: defaultViews(),
};

/* ── parsing ──────────────────────────────────────────────────────────────── */

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function parseStep(value: unknown): ExperienceStep | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string') return null;
  return { id: raw.id, label: str(raw.label), badge: str(raw.badge) };
}

function parseTask(value: unknown): TaskRow | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string') return null;
  const clicked = Math.max(0, num(raw.clicked));
  return {
    id: raw.id,
    label: str(raw.label),
    clicked,
    // Clamped, not trusted: `completed > clicked` prints a rate above 100% in a
    // bar whose whole job is to be scannable at a glance.
    completed: Math.min(clicked, Math.max(0, num(raw.completed))),
  };
}

function parseMetrics(value: unknown): Partial<Record<MetricKey, number>> {
  if (!value || typeof value !== 'object') return {};
  const out: Partial<Record<MetricKey, number>> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === 'number' && Number.isFinite(raw)) out[key as MetricKey] = raw;
  }
  return out;
}

/**
 * A stored experience with an unknown type cannot be coerced the way an unknown
 * mode can in `parseSkill` — the type decides which page it belongs to and which
 * KPIs it has, so a wrong guess would file it under the wrong dashboard. It is
 * dropped instead. An unknown STATUS is coerced to `draft`, which is the one
 * status that shows nothing to end users.
 */
export function parseExperience(value: unknown): Experience | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
  if (!isExperienceType(raw.type)) return null;

  return {
    id: raw.id,
    type: raw.type,
    name: raw.name,
    status: isExperienceStatus(raw.status) ? raw.status : 'draft',
    createdAt: num(raw.createdAt, Date.now()),
    editedAt: num(raw.editedAt, Date.now()),
    segmentLabel: str(raw.segmentLabel, 'All users'),
    reached: Math.max(0, num(raw.reached)),
    tags: strings(raw.tags),
    steps: (Array.isArray(raw.steps) ? raw.steps : [])
      .map(parseStep)
      .filter((s): s is ExperienceStep => s !== null),
    goal: typeof raw.goal === 'string' ? raw.goal : null,
    tasks: (Array.isArray(raw.tasks) ? raw.tasks : [])
      .map(parseTask)
      .filter((t): t is TaskRow => t !== null),
    ctas: Math.max(0, num(raw.ctas)),
    metrics: parseMetrics(raw.metrics),
  };
}

function parseView(value: unknown, type: ExperienceType): ViewPrefs {
  const base = defaultView(type);
  if (!value || typeof value !== 'object') return base;
  const raw = value as Record<string, unknown>;
  const contexts = Array.isArray(raw.contexts) ? raw.contexts.filter(isExperienceType) : [];
  return {
    tab: EXPERIENCE_TABS.includes(raw.tab as ExperienceTab) ? (raw.tab as ExperienceTab) : 'all',
    // Never empty — a stored payload that lost its last context would render a
    // page with no rows and no control that could bring them back.
    contexts: contexts.length > 0 ? contexts : base.contexts,
    statuses: Array.isArray(raw.statuses) ? raw.statuses.filter(isExperienceStatus) : [],
    segments: strings(raw.segments),
    tags: strings(raw.tags),
    display: EXPERIENCE_DISPLAYS.includes(raw.display as ExperienceDisplay)
      ? (raw.display as ExperienceDisplay)
      : base.display,
  };
}

/** The whole read path, as a pure function of the stored string. */
export function parseExperiences(raw: string | null): ExperiencesState {
  if (!raw) return INITIAL_EXPERIENCES;
  let stored: Partial<ExperiencesState>;
  try {
    stored = { ...INITIAL_EXPERIENCES, ...(JSON.parse(raw) as Partial<ExperiencesState>) };
  } catch {
    return INITIAL_EXPERIENCES;
  }

  const storedViews = (stored.views ?? {}) as Record<string, unknown>;
  const views = EXPERIENCE_TYPES.reduce(
    (acc, type) => {
      acc[type] = parseView(storedViews[type], type);
      return acc;
    },
    {} as Record<ExperienceType, ViewPrefs>,
  );

  return {
    experiences: (Array.isArray(stored.experiences) ? stored.experiences : [])
      .map(parseExperience)
      .filter((e): e is Experience => e !== null),
    views,
  };
}

/* ── pure list helpers, so the tests never need a DOM ─────────────────────── */

export function withExperienceAdded(list: Experience[], next: Experience): Experience[] {
  return [...list, next];
}

export function withExperienceRemoved(list: Experience[], id: string): Experience[] {
  return list.filter((e) => e.id !== id);
}

export function withExperiencePatched(
  list: Experience[],
  id: string,
  patch: Partial<Experience>,
): Experience[] {
  return list.map((e) => (e.id === id ? { ...e, ...patch } : e));
}

/* ── filtering ────────────────────────────────────────────────────────────── */

export type ExperienceFilters = {
  search: string;
} & ViewPrefs;

/**
 * The four pills, the three tabs and the search box, in one pass.
 *
 * The tab is a coarse status view and the Status pill is a fine one, so they
 * compose rather than override: `Live` + Status `Paused` is legitimately empty,
 * and pretending otherwise would make one of the two controls a lie.
 *
 * Ordering is newest-created first, which is what the docs say a space does
 * ("experiences in a space are sorted by creation date") and the only ordering
 * that puts a just-created experience where the user is looking.
 */
export function filterExperiences(
  list: Experience[],
  { search, tab, contexts, statuses, segments, tags }: ExperienceFilters,
): Experience[] {
  const q = search.trim().toLowerCase();

  const rows = list.filter((e) => {
    if (q && !e.name.toLowerCase().includes(q)) return false;
    if (tab === 'live' && e.status !== 'live') return false;
    if (tab === 'draft' && e.status !== 'draft') return false;
    if (contexts.length > 0 && !contexts.includes(e.type)) return false;
    if (statuses.length > 0 && !statuses.includes(e.status)) return false;
    if (segments.length > 0 && !segments.includes(e.segmentLabel)) return false;
    if (tags.length > 0 && !e.tags.some((t) => tags.includes(t))) return false;
    return true;
  });

  return [...rows].sort((a, b) => b.createdAt - a.createdAt);
}

/** Every experience of one type — what a page counts as "has any rows at all". */
export function experiencesOfType(list: Experience[], type: ExperienceType): Experience[] {
  return list.filter((e) => e.type === type);
}

/** The Segments and Tags pills list what the data actually contains. */
export function segmentOptions(list: Experience[]): string[] {
  return [...new Set(list.map((e) => e.segmentLabel))].sort((a, b) => a.localeCompare(b));
}

export function tagOptions(list: Experience[]): string[] {
  return [...new Set(list.flatMap((e) => e.tags))].sort((a, b) => a.localeCompare(b));
}

/* ── the store ────────────────────────────────────────────────────────────── */

let state: ExperiencesState = hydrate();
const listeners = new Set<() => void>();

function hydrate(): ExperiencesState {
  if (typeof window === 'undefined') return INITIAL_EXPERIENCES;
  try {
    return parseExperiences(window.localStorage.getItem(KEY));
  } catch {
    return INITIAL_EXPERIENCES;
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

export function getExperiences(): ExperiencesState {
  return state;
}

export function subscribeExperiences(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setState(next: ExperiencesState) {
  state = next;
  persist();
  emit();
}

function patch(next: Partial<ExperiencesState>) {
  setState({ ...state, ...next });
}

export function addExperience(experience: Experience) {
  patch({ experiences: withExperienceAdded(state.experiences, experience) });
}

export function removeExperience(id: string) {
  patch({ experiences: withExperienceRemoved(state.experiences, id) });
}

/** Every edit touches `editedAt`, so no caller can forget to. */
export function updateExperience(id: string, next: Partial<Experience>) {
  patch({
    experiences: withExperiencePatched(state.experiences, id, { ...next, editedAt: Date.now() }),
  });
}

/**
 * The list row's play/pause and the detail header's `⏵ Play`, which the docs
 * describe as available on any published experience.
 *
 * Deliberately NOT routed through `updateExperience`: pausing is not editing
 * the content, and bumping "Edited 3 days ago" because somebody paused a banner
 * would make that line untrue.
 */
export function setExperienceStatus(id: string, status: ExperienceStatus) {
  patch({ experiences: withExperiencePatched(state.experiences, id, { status }) });
}

/**
 * The kebab's Duplicate. The copy starts as a draft with its counters at zero:
 * it has reached nobody, and shipping a half-edited duplicate live to users is
 * the one outcome nobody wants from a button that copies something.
 */
export function duplicateExperience(id: string): Experience | null {
  const source = state.experiences.find((e) => e.id === id);
  if (!source) return null;
  const copy: Experience = {
    ...source,
    id: `${source.id}-copy-${Math.random().toString(36).slice(2, 8)}`,
    name: `${source.name} (copy)`,
    status: 'draft',
    createdAt: Date.now(),
    editedAt: Date.now(),
    reached: 0,
    metrics: {},
  };
  patch({ experiences: withExperienceAdded(state.experiences, copy) });
  return copy;
}

export function setView(type: ExperienceType, next: Partial<ViewPrefs>) {
  patch({ views: { ...state.views, [type]: { ...state.views[type], ...next } } });
}

/** Wholesale replacement — stories, and nothing else. */
export function setExperiences(experiences: Experience[]) {
  patch({ experiences });
}

export function resetExperiences() {
  setState({ experiences: DEMO_EXPERIENCES(), views: defaultViews() });
}

// Cross-tab, matching the other stores: `storage` only fires in OTHER tabs, and
// the writing tab has already been notified synchronously by emit().
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    state = hydrate();
    emit();
  });
}
