/**
 * Invented, and labelled as such: the training simulation.
 *
 * Nothing upstream defines how long training takes — the artboards only draw
 * the three end states (899:15272 Trained, 899:15284 Training…, 899:15317
 * Failed). Two seconds is long enough to read the pill and short enough that
 * nobody waits, and it is the only number here. Keep it quarantined the way
 * `MATCHERS` in `@/data/fixtures` is.
 *
 * The timers live OUTSIDE persisted state deliberately. `training` is persisted
 * (a row that says Training… should still say so after a reload rather than
 * claim it finished while the tab was closed), but a timer id means nothing
 * across a reload, so `knowledgeStore.resumeTraining()` re-arms them on mount.
 * That pairing is what makes a stranded spinner impossible.
 */

export const TRAINING_MS = 2000;

/**
 * The same registry now serves a SECOND simulation: the Interface tab's page
 * scan. Nothing here is training-specific — it is an id -> timeout map, and
 * `armTraining` already takes its own `delay` — so scanning arms its ids here
 * rather than forking a parallel module that would need the same
 * replace-don't-stack and resume-on-mount properties reasoned about twice.
 *
 * The two id namespaces cannot collide: sources are `<kind>-<n>-<rand>` from
 * `makeSourceId`, pages are `page-<n>-<rand>` from `makePageId`.
 *
 * Four seconds rather than two, because a scan reads as heavier work than
 * training one row, and the card has three things to say while it waits.
 */
export const SCAN_MS = 4000;

type Timer = ReturnType<typeof setTimeout>;

const timers = new Map<string, Timer>();

/**
 * Schedule `done(id)`. Re-arming an id REPLACES its timer rather than stacking
 * a second one, which is what lets `resumeTraining` be called on every mount.
 */
export function armTraining(id: string, done: (id: string) => void, delay = TRAINING_MS) {
  disarmTraining(id);
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id);
      done(id);
    }, delay),
  );
}

export function disarmTraining(id: string) {
  const timer = timers.get(id);
  if (timer === undefined) return;
  clearTimeout(timer);
  timers.delete(id);
}

/** Test seam only — nothing in the app clears every timer at once. */
export function disarmAllTraining() {
  timers.forEach((timer) => clearTimeout(timer));
  timers.clear();
}

export function isTrainingArmed(id: string): boolean {
  return timers.has(id);
}
