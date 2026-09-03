import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';

/**
 * The dirty-tracking save bar (Figma 13:14519 / 13:14527) and the hook behind it.
 *
 * THE INTERACTION RULE, which the artboards imply but never state: **text fields
 * go through the bar, switches commit instantly.** The bar is only ever drawn on
 * the two text-form screens (General, My Account); Notifications' two switches,
 * Team's Auto-Join and Installation's Force Identify all write straight to the
 * store. A toggle that silently does nothing until you find a Save button
 * somewhere is the worse behaviour, and nothing in the design asks for it.
 *
 * `useDraft` holds the draft in local state seeded from the committed value, so
 * typing never touches the store and no other subscriber re-renders per
 * keystroke. Same draft/commit shape `TriggersSection` already uses with
 * `draftTriggers` vs `triggers`, including its dirty check.
 */
export function useDraft<T extends object>(committed: T, commit: (next: T) => void) {
  const [draft, setDraft] = React.useState<T>(committed);

  // Re-seed when the committed value changes from OUTSIDE this form — another
  // tab writing through `storage`, or a reset. Comparing by value rather than
  // identity matters: the store hands back a fresh object on every write.
  const committedKey = JSON.stringify(committed);
  React.useEffect(() => {
    setDraft(committed);
    // `committedKey` is the value-identity of `committed`; depending on the
    // object itself would re-seed on every store write and discard the draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committedKey]);

  const set = React.useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const dirty = JSON.stringify(draft) !== committedKey;

  return {
    draft,
    set,
    dirty,
    save: () => commit(draft),
    reset: () => setDraft(committed),
  };
}

/**
 * Sticky rather than portalled. It belongs to the page's content column, not to
 * the whole app, so it rides the column's own scroll and needs no measurement
 * effect — which also means it cannot be captured by an ancestor `transform`
 * the way an absolutely-positioned panel would be. See Foundations/Floating
 * Layers for when the portal IS required.
 */
export function SaveBar({
  visible,
  onSave,
  onReset,
  saving,
}: {
  visible: boolean;
  onSave: () => void;
  onReset: () => void;
  saving?: boolean;
}) {
  if (!visible) return null;

  return (
    <div
      data-slot="save-bar"
      className="pointer-events-none sticky bottom-[var(--space-6)] z-[var(--z-sticky)] flex justify-center"
    >
      <div className="pointer-events-auto flex items-center gap-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-default)] py-[var(--space-4)] pl-[var(--space-6)] pr-[var(--space-4)] shadow-[var(--shadow-elevation-04)]">
        <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
          <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
            You have unsaved changes
          </span>
          <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            Save your changes to update your data
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-[var(--space-3)]">
          <Button variant="outline" onClick={onReset} disabled={saving}>
            Reset
          </Button>
          <Button onClick={onSave} disabled={saving}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
