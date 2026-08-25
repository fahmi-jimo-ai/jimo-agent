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
 */
export function ModalCard({
  title,
  onClose,
  children,
  footer,
  width = 560,
  step,
  direction = 'forward',
}: {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
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
      <Body title={title} footer={footer} width={width} step={step} direction={direction}>
        {children}
      </Body>
    </ModalOverlay>
  );
}

function Body({
  title,
  children,
  footer,
  width,
  step,
  direction,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
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
        'flex max-w-[calc(100vw-var(--space-8))] flex-col overflow-hidden rounded-[var(--radius-lg)]',
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

          <div className="flex flex-col gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-5)]">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-[var(--space-3)] border-t border-[var(--color-border-default)] px-[var(--space-6)] py-[var(--space-4)]">
              {footer}
            </div>
          )}
        </div>
      </AutoHeight>
    </div>
  );
}

/**
 * Eases the wrapper's height to whatever its content currently measures.
 *
 * A ResizeObserver rather than a `children` dep: `children` is a fresh element
 * every render, so an effect keyed on it would re-measure, re-render and loop
 * (the same trap CLAUDE.md flags for positioning effects). The observer fires
 * only when the box actually changes, and the setter bails on an equal value,
 * so a step swap costs exactly one extra render.
 */
function AutoHeight({ children }: { children: React.ReactNode }) {
  const inner = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => setHeight((h) => (h === el.offsetHeight ? h : el.offsetHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      // null on the first paint: the card sizes to content, so the initial
      // measurement writes back the height it already has and nothing moves.
      style={height === null ? undefined : { height }}
      className="overflow-hidden [transition:height_var(--transition-base)]"
    >
      <div ref={inner}>{children}</div>
    </div>
  );
}
