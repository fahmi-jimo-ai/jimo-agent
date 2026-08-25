import * as React from 'react';
import { ModalOverlay, useModalClose } from '@/components/ui/ModalOverlay/ModalOverlay';
import { CloseIcon } from '@/components/ui/Icon/Icon';
import { cn } from '@/lib/utils';

/**
 * Dialog card for Moji's ModalOverlay.
 *
 * The stopPropagation is REQUIRED, not defensive: ModalOverlay puts its close
 * handler on the backdrop with no guard on the content wrapper, so without
 * this every click inside the dialog dismisses it.
 *
 * ## One card, many steps — never a second overlay
 *
 * A flow like "Configuration -> Connect Crisp -> back" is ONE dialog whose
 * contents change, not two dialogs stacked. Stacking means two backdrops
 * (double-darkened page), two Escape targets and a card that jumps to a new
 * size behind the one on top. Pass a `step` string instead: the card animates
 * its height between the two layouts and slides the new contents in, using the
 * same `panel-enter-*` keyframes the nested dropdown panels use. `direction`
 * picks which way they slide — 'back' for a return leg.
 *
 * The height animation is what makes the swap read as one object rather than a
 * cut, so the card is `overflow-hidden` while it runs. That is safe for menus
 * only because `Menu` portals its panel to <body> (see its header comment); an
 * absolutely-positioned panel inside a step WOULD be clipped here.
 *
 * ## Two shapes — and why this one IS a variant
 *
 * `PickerDialog`'s header argues that a different artboard rhythm should be a
 * sibling component rather than a `ModalCard` prop, and for the picker that is
 * right: it is opened on its own and never shares a flow with this card.
 *
 * The `confirm` shape (`112:4938`) is the opposite case. It is only ever
 * reached from INSIDE a flow this card is already running — "you are about to
 * turn this off, are you sure" — so the same card morphing into it is the whole
 * point. A sibling component would need its own `ModalOverlay`, which is the
 * one thing this file exists to prevent. Hence `variant`, and hence `width`
 * being eased rather than fixed.
 */
/**
 * `card` is the form dialog (`43:6997` family). `confirm` is `112:4938`: the
 * one-question shape — headerless, no close button, title and body centred, and
 * two equal buttons filling the row.
 */
export type ModalCardVariant = 'card' | 'confirm';

/** Artboard widths. `card` from 35:5642, `confirm` from 112:4938. */
const VARIANT_WIDTH: Record<ModalCardVariant, number> = { card: 560, confirm: 440 };

export function ModalCard({
  title,
  onClose,
  children,
  footer,
  variant = 'card',
  width,
  step,
  direction = 'forward',
}: {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * Which shape to draw. A step may change it — the card eases between the two
   * widths as well as the two heights, so one dialog can ask a question mid-flow
   * without a second overlay appearing over it.
   */
  variant?: ModalCardVariant;
  /** Overrides the variant's artboard width. */
  width?: number;
  /**
   * Identifies which step is showing. Changing it cross-slides the card's
   * whole interior — header, body and footer — and eases the height between
   * the two layouts. Leave undefined for a single-view dialog.
   */
  step?: string;
  direction?: 'forward' | 'back';
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <Body
        title={title}
        footer={footer}
        variant={variant}
        width={width ?? VARIANT_WIDTH[variant]}
        step={step}
        direction={direction}
      >
        {children}
      </Body>
    </ModalOverlay>
  );
}

function Body({
  title,
  children,
  footer,
  variant,
  width,
  step,
  direction,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant: ModalCardVariant;
  width: number;
  step?: string;
  direction: 'forward' | 'back';
}) {
  const close = useModalClose();

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      style={{ width }}
      className={cn(
        'flex max-w-[calc(100vw-var(--space-8))] flex-col overflow-hidden',
        // Eased so a step that also changes the variant morphs rather than
        // jumping. Height is eased by AutoHeight, on the wrapper inside.
        '[transition:width_var(--transition-base)]',
        // 112:4938 draws the confirm at 24px, and the radius ramp ends at 20
        // (--radius-xxl). Staying on the token beats forking tokens.css for one
        // dialog — a 4px deviation, deliberate, agreed with design.
        variant === 'confirm' ? 'rounded-[var(--radius-xxl)]' : 'rounded-[var(--radius-lg)]',
        'bg-[var(--color-neutral-white)] shadow-[var(--shadow-elevation-04)]'
      )}
    >
      <AutoHeight>
        {/* Keyed on the step so React remounts the interior and the enter
            animation restarts. Without the key the class would already be
            applied and the swap would be a hard cut. */}
        <div
          key={step ?? 'single'}
          className={
            step === undefined
              ? undefined
              : direction === 'back'
                ? '[animation:panel-enter-back_var(--transition-base)_both]'
                : '[animation:panel-enter-forward_var(--transition-base)_both]'
          }
        >
          {variant === 'confirm' ? (
            <div className="flex flex-col items-center gap-[var(--space-6)] p-[var(--space-5)]">
              {/* Heading 4 (24px), a step down from the artboard's Heading 3
                  (32px) — 32 is loud for a one-line question in a 440 card. */}
              <h2 className="m-0 w-full text-center [font:var(--text-heading-4)] tracking-[var(--text-heading-tracking)] text-[var(--color-text-primary)]">
                {title}
              </h2>
              <div className="w-full text-center [font:var(--text-body-2)] text-[var(--color-text-secondary)]">
                {children}
              </div>
              {footer && (
                // The equal widths belong to the shape, not the caller — so
                // callers pass the same plain <Button>s the card variant takes.
                <div className="flex w-full justify-center gap-[var(--space-3)] [&>*]:flex-1">
                  {footer}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-[var(--space-4)] border-b border-[var(--color-border-default)] px-[var(--space-6)] py-[var(--space-5)]">
                <h2 className="m-0 [font:var(--text-subtitle-2)] text-[var(--color-text-primary)]">{title}</h2>
                <button
                  type="button"
                  onClick={() => close?.()}
                  aria-label="Close"
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-full)] border-0 bg-transparent text-[var(--color-text-primary)] [transition:background-color_var(--transition-fast)] hover:bg-[var(--color-bg-muted)]"
                >
                  <CloseIcon size={22} color="currentColor" />
                </button>
              </div>

              <div className="flex flex-col gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-5)]">
                {children}
              </div>

              {footer && (
                <div className="flex items-center justify-end gap-[var(--space-3)] border-t border-[var(--color-border-default)] px-[var(--space-6)] py-[var(--space-4)]">
                  {footer}
                </div>
              )}
            </>
          )}
        </div>
      </AutoHeight>
    </div>
  );
}

/** Matches --transition-base, the height easing set on the wrapper below. */
const HEIGHT_MS = 200;

/**
 * Eases the wrapper's height whenever its content changes size.
 *
 * ## It holds a pixel height only while the ease runs
 *
 * The resting state is `height: auto`. A fixed height is written for exactly
 * the length of one transition and then removed, so nothing can be left
 * clipped by a stale measurement — the failure mode of the obvious
 * "measure into state and keep it there" version.
 *
 * ## No ResizeObserver, and no `children` in a dep array
 *
 * `children` is a fresh element every render, so an effect keyed on it would
 * re-measure, re-render and loop (the trap CLAUDE.md flags for positioning
 * effects). A ResizeObserver avoids that but pays for it: its callbacks are
 * driven by the rendering lifecycle, so in a tab that is not being painted it
 * never fires at all and the card sticks at whatever height it last saw.
 *
 * Instead this is a plain layout effect with NO dep array: it runs after every
 * commit, compares the content box to what it measured last time, and eases
 * only when the two differ. Measuring is a read of `offsetHeight`, not state,
 * so a render that does not move anything costs one comparison and stops.
 */
function AutoHeight({ children }: { children: React.ReactNode }) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const inner = React.useRef<HTMLDivElement>(null);
  /** Content height at the previous commit. 0 until the first paint. */
  const previous = React.useRef(0);
  const settle = React.useRef<number | undefined>(undefined);

  React.useLayoutEffect(() => {
    const box = wrap.current;
    const content = inner.current;
    if (!box || !content) return;

    const to = content.offsetHeight;
    const from = previous.current;
    previous.current = to;

    // Unchanged: leave the element alone. Either it is resting at `auto`, or an
    // ease is already running towards this exact height — clearing the inline
    // height here would cut that ease short.
    if (from === to) return;

    window.clearTimeout(settle.current);
    // First paint: adopt the height the card already has, without animating in.
    if (from === 0) {
      box.style.height = '';
      return;
    }

    // Pin the old height, flush it, then release to the new one — the forced
    // reflow between the two writes is what gives the transition a start value
    // to run from instead of collapsing to a single frame.
    box.style.transition = 'none';
    box.style.height = `${from}px`;
    void box.offsetHeight;
    box.style.transition = '';
    box.style.height = `${to}px`;

    settle.current = window.setTimeout(() => {
      box.style.height = '';
    }, HEIGHT_MS);
  });

  React.useEffect(() => () => window.clearTimeout(settle.current), []);

  return (
    <div ref={wrap} className="overflow-hidden [transition:height_var(--transition-base)]">
      <div ref={inner}>{children}</div>
    </div>
  );
}
