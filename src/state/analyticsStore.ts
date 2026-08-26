/**
 * State for the /statistics and /conversations pages.
 *
 * Same shape as escalationStore and knowledgeStore — a tiny external store
 * persisted to localStorage — so the three read side by side. No legacy key to
 * migrate: neither page existed before.
 *
 * ## Free text IS persisted here, on purpose
 *
 * `UserContextSection` argues the opposite for its own search box, and the
 * reasoning there is sound: "persisting them would make a stray search term
 * survive a reload and sync across tabs". That is the intended behaviour on
 * these two pages. An analyst who filters a conversation inbox down to
 * something worth reading should find it still filtered after a refresh, and
 * a second tab is a second view of the same investigation, not a fresh one.
 *
 * So: this is a decision, not an inconsistency. If it ever reads as annoying
 * rather than helpful, the fix is to move `convoSearch` out of here into
 * component state — not to make UserContextSection match.
 */
import { INITIAL_ANALYTICS, type AnalyticsState } from './types';
import { CONVERSATIONS } from '@/data/analytics';

const KEY = 'jimo.agent.analytics.v1';

let state: AnalyticsState = hydrate();
const listeners = new Set<() => void>();

function hydrate(): AnalyticsState {
  if (typeof window === 'undefined') return INITIAL_ANALYTICS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return INITIAL_ANALYTICS;
    // Merge over INITIAL_ANALYTICS so a blob written by an older build never
    // leaves a newly-added key undefined.
    const stored = { ...INITIAL_ANALYTICS, ...(JSON.parse(raw) as Partial<AnalyticsState>) };
    // A persisted id whose conversation no longer exists would render the
    // detail pane blank rather than fail loudly, so drop it on the way in.
    // (Same guard as knowledgeStore's `addedIds` filter, same reason.)
    if (stored.convoSelectedId && !CONVERSATIONS.some((c) => c.id === stored.convoSelectedId)) {
      stored.convoSelectedId = null;
    }
    return stored;
  } catch {
    return INITIAL_ANALYTICS;
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

export function getAnalytics(): AnalyticsState {
  return state;
}

export function subscribeAnalytics(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Apply a partial update, persist it, and notify this tab. */
export function setAnalytics(
  patch: Partial<AnalyticsState> | ((s: AnalyticsState) => Partial<AnalyticsState>)
) {
  const next = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...next };
  persist();
  emit();
}

export function resetAnalytics() {
  state = INITIAL_ANALYTICS;
  persist();
  emit();
}

/** Back to "no filter applied" — what the no-results state's Clear Filters does. */
export function clearConversationFilters() {
  setAnalytics({
    convoSearch: '',
    convoRange: 'all-time',
    convoResponse: 'all',
    convoSegment: 'all',
  });
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
