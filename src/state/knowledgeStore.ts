/**
 * Which user properties are shared with the agent as context.
 *
 * Same shape as escalationStore — a tiny external store persisted to
 * localStorage — so the two read side by side. There is no legacy key to
 * migrate here: this page did not exist before the `jimo-agent` rename.
 *
 * Only the ids are stored. The catalogue itself lives in `@/data/userProperties`
 * and is fixed, so persisting a copy of each row would just let the two drift.
 */

const KEY = 'jimo.agent.knowledge.v1';

export type KnowledgeState = {
  /** Catalogue ids, in the order they were added. */
  addedIds: string[];
};

export const INITIAL_KNOWLEDGE: KnowledgeState = { addedIds: [] };

let state: KnowledgeState = hydrate();
const listeners = new Set<() => void>();

function hydrate(): KnowledgeState {
  if (typeof window === 'undefined') return INITIAL_KNOWLEDGE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return INITIAL_KNOWLEDGE;
    const stored = { ...INITIAL_KNOWLEDGE, ...(JSON.parse(raw) as Partial<KnowledgeState>) };
    // A stored id that no longer exists in the catalogue would render an empty
    // row rather than fail loudly, so drop it on the way in.
    return { addedIds: (stored.addedIds ?? []).filter((id) => typeof id === 'string') };
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

/** Union, keeping the existing order and appending what is new. */
export function addProperties(ids: string[]) {
  const fresh = ids.filter((id) => !state.addedIds.includes(id));
  if (!fresh.length) return;
  setKnowledge({ addedIds: [...state.addedIds, ...fresh] });
}

export function removeProperty(id: string) {
  setKnowledge({ addedIds: state.addedIds.filter((x) => x !== id) });
}

export function resetKnowledge() {
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
