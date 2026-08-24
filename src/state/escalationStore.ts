/**
 * The single source of truth for escalation config.
 *
 * A tiny external store (useSyncExternalStore) rather than context, for one
 * reason: the widget runs in a SEPARATE BROWSER TAB from its own Vite entry,
 * so the two surfaces can only meet through localStorage. Persisting on every
 * write and listening for `storage` gives the widget live config with no
 * reload and no shared React tree.
 */
import { INITIAL_STATE, type EscalationState } from './types';

const KEY = 'jimo.agent.escalation.v1';
/* The pre-`jimo-agent` name. Read once, on the first hydrate that finds no new
   key, so an existing demo config survives the project rename instead of being
   silently wiped. Safe to delete once nobody is running a pre-rename build. */
const LEGACY_KEY = 'jimo.escalation.v1';

let state: EscalationState = hydrate();
const listeners = new Set<() => void>();

/** Move a pre-rename blob onto the current key. Returns the raw string, if any. */
function readWithMigration(): string | null {
  const raw = window.localStorage.getItem(KEY);
  if (raw !== null) return raw;
  const legacy = window.localStorage.getItem(LEGACY_KEY);
  if (legacy === null) return null;
  window.localStorage.setItem(KEY, legacy);
  window.localStorage.removeItem(LEGACY_KEY);
  return legacy;
}

function hydrate(): EscalationState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = readWithMigration();
    if (!raw) return INITIAL_STATE;
    // Merge over INITIAL_STATE so a stored blob written by an older build
    // never leaves a newly-added key undefined.
    const stored = { ...INITIAL_STATE, ...(JSON.parse(raw) as Partial<EscalationState>) };
    // A reload mid-generate would otherwise rehydrate `generating` with no
    // setTimeout left alive to resolve it — the skeleton would shimmer for
    // ever. Nothing is in flight at hydrate time, so drop back to idle.
    if (stored.suggestions?.status === 'generating') {
      stored.suggestions = { ...stored.suggestions, status: 'idle', items: [], selectedIds: [] };
    }
    return stored;
  } catch {
    return INITIAL_STATE;
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — the app still works, it just won't survive a reload */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function getState(): EscalationState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Apply a partial update, persist it, and notify this tab. */
export function setState(patch: Partial<EscalationState> | ((s: EscalationState) => Partial<EscalationState>)) {
  const next = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...next };
  persist();
  emit();
}

export function resetState() {
  state = INITIAL_STATE;
  persist();
  emit();
}

// Cross-tab: the dashboard writes, the widget tab re-renders. `storage` only
// fires in OTHER tabs, which is exactly the semantics we want — the writing tab
// has already been notified synchronously by emit().
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    state = hydrate();
    emit();
  });
}
