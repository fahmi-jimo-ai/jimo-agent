import * as React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/ui/Icon/Icon';
import { cn } from '@/lib/utils';

/**
 * Right-edge drawer — Figma Copilot-Widget 932:18232 ("Content Detail").
 *
 * NEW local component: Moji ships no drawer, and neither dialog shape covers
 * this one. `ModalCard` draws two fixed shapes (`card` 560, `confirm` 440) and
 * exists to keep a multi-beat FLOW inside one card; a detail panel is not a
 * beat of any flow — it is opened on its own and dismissed on its own. That
 * makes it a sibling of `PickerDialog`, which owns its overlay for the same
 * reason, rather than a third `ModalCard` variant.
 *
 * It is also a floating layer, so it meets all four requirements from
 * Storybook's **Foundations/Floating Layers**:
 *
 *  1. `createPortal(…, document.body)`. An in-tree panel would be clipped by
 *     `Table`'s wrapper and captured by any ancestor ending on a transform —
 *     and this one is opened FROM a table row, so both are in its ancestry.
 *  2. `position: fixed`, anchored by `right`/`top`/`bottom` so it pins without
 *     its own width being measured first.
 *  3. Backdrop at `--z-overlay`, panel at `--z-modal`. A `Menu` opened inside
 *     the panel sits at `--z-modal + 1` and still paints over it, which is the
 *     ordering that layer already assumes.
 *  4. Dismissal tests the panel, not a trigger: the backdrop is a real element
 *     under the panel, so a click on it is unambiguously outside. Escape closes
 *     too, and the panel stops propagation — `ModalOverlay` puts its handler on
 *     the backdrop with no guard on its content, and this file must not repeat
 *     that.
 *
 * The enter transition names **`translate`**, not `transform`: Tailwind v4
 * compiles `translate-x-*` to the standalone `translate:` property, the same
 * trap CLAUDE.md records for `scale`. Naming `transform` here would drop the
 * transition whole and the panel would snap.
 */
export function Drawer({
  title,
  onClose,
  children,
  width = 492,
  className,
}: {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  /** 932:18232 measures 492 — the column, not the card inside it. */
  width?: number;
  className?: string;
}) {
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    // Two frames, not one: a single rAF still lands in the same paint as the
    // mount often enough that the panel appears already open.
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        data-slot="drawer-backdrop"
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-[var(--z-overlay)] bg-[rgba(7,19,49,0.32)]',
          '[transition:opacity_var(--transition-base)]',
          entered ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        data-slot="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{ width }}
        className={cn(
          'fixed top-0 right-0 bottom-0 z-[var(--z-modal)] flex flex-col',
          // --color-blue-50 is what Subpage paints, so the drawer reads as the
          // page continuing rather than as text floating over it — and the
          // cards inside keep the white-on-blue contrast they have everywhere
          // else. Without a ground of its own the header row sits on the
          // backdrop and whatever is behind it shows through.
          'bg-[var(--color-blue-50)] [box-shadow:var(--shadow-elevation-04)]',
          'overflow-y-auto p-[var(--space-4)]',
          // `translate`, not `transform` — see the header comment.
          '[transition:translate_var(--transition-base),opacity_var(--transition-fast)]',
          entered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
          className,
        )}
      >
        <div className="flex flex-1 flex-col gap-[var(--space-4)]">
          <div className="flex items-center justify-between px-[var(--space-5)] py-[var(--space-5)]">
            <p className="m-0 [font:var(--text-subtitle-2)] text-[var(--color-text-primary)]">
              {title}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex size-6 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] [transition:color_var(--transition-fast)] hover:text-[var(--color-text-primary)]"
            >
              <CloseIcon size={24} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
