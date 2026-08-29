/**
 * The Skills page's persisted state.
 *
 * A direct sibling of `knowledgeStore` — a tiny external store persisted to
 * localStorage — so the two read side by side, and for the same reason: the
 * reading of a payload is a pure function, because the vitest suite runs in node
 * with no DOM and `parseSkills` plus the list helpers carry every decision this
 * file makes.
 *
 * ## Why this one seeds POPULATED and `knowledgeStore` does not
 *
 * `sources` starts empty because a knowledge source is something the user types;
 * an empty Sources tab is a true statement about a new workspace. A skill list
 * is not: the artboards only ever draw the populated page, no empty state is
 * designed for it, and the demo the deployed build exists to give would open on
 * a blank table. So `INITIAL_SKILLS` is `DEMO_SKILLS()`.
 *
 * That is also why `demo.ts` is not extended to cover this key. The Demo data
 * switch fills stores that are empty by default; this one never is.
 *
 * `SkillsEmptyState` is still built and still reachable — deleting every row
 * gets you there — it just is not where a first visit lands.
 */
import { isSkillMode, DEMO_SKILLS, type Skill, type SkillMode } from '@/data/skills';

const KEY = 'jimo.agent.skills.v1';

export type SkillsState = {
  /** Newest last — the table sorts on read, not here. */
  skills: Skill[];
};

export const INITIAL_SKILLS: SkillsState = { skills: DEMO_SKILLS() };

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/**
 * A stored skill with an unknown mode would render an empty chip rather than
 * fail loudly, so it is coerced on the way in — the same call `parseSource`
 * already makes for kind and status.
 */
export function parseSkill(value: unknown): Skill | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;

  const usage = Math.max(0, num(raw.usage));
  return {
    id: raw.id,
    name: raw.name,
    description: str(raw.description),
    instructions: str(raw.instructions),
    mode: isSkillMode(raw.mode) ? raw.mode : 'explain',
    pageId: typeof raw.pageId === 'string' ? raw.pageId : null,
    // Absent reads as active: a row whose flag was lost should still answer,
    // and the switch shows the truth either way.
    active: raw.active !== false,
    updatedAt: num(raw.updatedAt, Date.now()),
    usage,
    // Clamped, not trusted: `completed > usage` would print a completion rate
    // above 100% in a chip whose whole job is to be scannable.
    completed: Math.min(usage, Math.max(0, num(raw.completed))),
  };
}

/** The whole read path, as a pure function of the stored string. */
export function parseSkills(raw: string | null): SkillsState {
  if (!raw) return INITIAL_SKILLS;
  let stored: Partial<SkillsState>;
  try {
    stored = { ...INITIAL_SKILLS, ...(JSON.parse(raw) as Partial<SkillsState>) };
  } catch {
    return INITIAL_SKILLS;
  }
  return {
    skills: (Array.isArray(stored.skills) ? stored.skills : [])
      .map(parseSkill)
      .filter((s): s is Skill => s !== null),
  };
}

/* ── pure list helpers, so the tests never need a DOM ─────────────────────── */

export function withSkillAdded(skills: Skill[], skill: Skill): Skill[] {
  return [...skills, skill];
}

export function withSkillRemoved(skills: Skill[], id: string): Skill[] {
  return skills.filter((s) => s.id !== id);
}

export function withSkillPatched(skills: Skill[], id: string, patch: Partial<Skill>): Skill[] {
  return skills.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

/* ── filtering ────────────────────────────────────────────────────────────── */

export type SkillModeFilter = 'all' | SkillMode;
export type SkillSort = 'default' | 'name' | 'usage' | 'completion';

export type SkillFilters = {
  search: string;
  mode: SkillModeFilter;
  sort: SkillSort;
};

/**
 * `Default` is "most recently updated first" — the artboard names the option but
 * never says what it orders by, and recency is the only ordering that makes a
 * just-created skill appear where the user is looking. Invented, and labelled.
 *
 * A skill with no runs sorts LAST under `completion` rather than as 0%: it has
 * not failed, it has not been tried, and burying it under genuine failures is
 * the one ordering that would mislead.
 */
export function filterSkills(skills: Skill[], { search, mode, sort }: SkillFilters): Skill[] {
  const q = search.trim().toLowerCase();
  const rows = skills.filter((s) => {
    const byQuery =
      !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    const byMode = mode === 'all' || s.mode === mode;
    return byQuery && byMode;
  });

  const rate = (s: Skill) => (s.usage > 0 ? s.completed / s.usage : -1);

  return [...rows].sort((a, b) => {
    switch (sort) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'usage':
        return b.usage - a.usage;
      case 'completion':
        return rate(b) - rate(a);
      default:
        return b.updatedAt - a.updatedAt;
    }
  });
}

/** How many skills a scanned page hosts — the page card's "• N Skills". */
export function skillsForPage(skills: Skill[], pageId: string): Skill[] {
  return skills.filter((s) => s.pageId === pageId);
}

/* ── the store ────────────────────────────────────────────────────────────── */

let state: SkillsState = hydrate();
const listeners = new Set<() => void>();

function hydrate(): SkillsState {
  if (typeof window === 'undefined') return INITIAL_SKILLS;
  try {
    return parseSkills(window.localStorage.getItem(KEY));
  } catch {
    return INITIAL_SKILLS;
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

export function getSkills(): SkillsState {
  return state;
}

export function subscribeSkills(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setState(next: SkillsState) {
  state = next;
  persist();
  emit();
}

function patch(next: Partial<SkillsState>) {
  setState({ ...state, ...next });
}

export function addSkill(skill: Skill) {
  patch({ skills: withSkillAdded(state.skills, skill) });
}

export function removeSkill(id: string) {
  patch({ skills: withSkillRemoved(state.skills, id) });
}

/** Every edit touches `updatedAt`, so no caller can forget to. */
export function updateSkill(id: string, next: Partial<Skill>) {
  patch({ skills: withSkillPatched(state.skills, id, { ...next, updatedAt: Date.now() }) });
}

export function toggleSkill(id: string, active: boolean) {
  updateSkill(id, { active });
}

/**
 * The kebab's Duplicate. The copy starts at zero runs and inactive: it has never
 * answered anybody, and shipping a half-edited duplicate live to users is the
 * one outcome nobody wants from a button that copies something.
 */
export function duplicateSkill(id: string): Skill | null {
  const source = state.skills.find((s) => s.id === id);
  if (!source) return null;
  const copy: Skill = {
    ...source,
    id: `${source.id}-copy-${Math.random().toString(36).slice(2, 8)}`,
    name: `${source.name} (copy)`,
    active: false,
    usage: 0,
    completed: 0,
    updatedAt: Date.now(),
  };
  patch({ skills: withSkillAdded(state.skills, copy) });
  return copy;
}

/** Wholesale replacement — stories, and nothing else. */
export function setSkills(skills: Skill[]) {
  patch({ skills });
}

export function resetSkills() {
  setState({ skills: DEMO_SKILLS() });
}

// Cross-tab, matching the other two stores: `storage` only fires in OTHER tabs,
// and the writing tab has already been notified synchronously by emit().
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    state = hydrate();
    emit();
  });
}
