import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { DropdownMenuGroup } from '@/components/ui/DropdownMenuGroup/DropdownMenuGroup';

/**
 * The floating-layer wrapper every menu in this app uses.
 *
 * ## The panel is portaled to <body>, and that is not optional
 *
 * A menu must never be clipped by an ancestor. An absolutely-positioned panel is
 * at the mercy of every `overflow` and every `transform` between it and the
 * viewport, and this app has both: `Table`'s scroll wrapper clips the row action
 * menu, and `ModalOverlay`'s content animation ends on a transform, which makes
 * it a containing block that even `position: fixed` cannot escape. Portaling to
 * `document.body` and positioning from the trigger's own rect is the only fix
 * that holds for *every* call site instead of one ancestor at a time, so it
 * lives here, once, rather than as an `overflow-visible` patch per parent.
 *
 * Consequences to keep in mind when changing this file:
 *  - Outside-click detection has to test the panel as well as the trigger; the
 *    panel is no longer a DOM descendant of the wrapper.
 *  - z-index has to clear `--z-modal`, since the panel is now a sibling of the
 *    modal overlay rather than a child of it.
 *  - The position goes stale the moment anything scrolls, so it is recomputed on
 *    scroll (capture, to catch inner scrollers) and on resize while open.
 *
 * Motion follows the Moji convention that CLAUDE.md marks mandatory:
 * scale .85 -> 1 + opacity 0 -> 1 over 150ms, transform-origin at the trigger
 * corner, and the panel stays mounted through the exit. Note the transition
 * names `scale`, NOT `transform` — Tailwind v4 compiles `scale-*` to the
 * standalone `scale:` property, so naming `transform` here would make it snap.
 */

/** Gap between trigger and panel, and the breathing room kept at the viewport edge. */
const OFFSET = 4;
const VIEWPORT_MARGIN = 8;

type Placement = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  /** Which corner the scale animation grows from. */
  origin: string;
};

export function Menu({
  open,
  onClose,
  trigger,
  children,
  align = 'left',
  className,
  menuClassName,
}: {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = React.useState<Placement | null>(null);

  const position = React.useCallback(() => {
    const trig = wrapRef.current?.getBoundingClientRect();
    if (!trig) return;

    const panelH = panelRef.current?.offsetHeight ?? 0;
    // Flip above the trigger only when below genuinely does not fit AND above
    // fits better — a menu taller than the viewport stays anchored downwards.
    const roomBelow = window.innerHeight - trig.bottom - OFFSET - VIEWPORT_MARGIN;
    const roomAbove = trig.top - OFFSET - VIEWPORT_MARGIN;
    const flip = panelH > roomBelow && roomAbove > roomBelow;

    const next: Placement = {
      ...(flip
        ? { bottom: window.innerHeight - trig.top + OFFSET }
        : { top: trig.bottom + OFFSET }),
      // Anchoring by `right` rather than `left` keeps a right-aligned panel
      // pinned without having to measure its width first.
      ...(align === 'right'
        ? { right: Math.max(VIEWPORT_MARGIN, window.innerWidth - trig.right) }
        : { left: Math.max(VIEWPORT_MARGIN, trig.left) }),
      origin: `${flip ? 'bottom' : 'top'} ${align}`,
    };

    // Bail on an unchanged result. This runs from a layout effect, so returning
    // a fresh object every time would re-render, re-measure and re-render again
    // — a loop that pins the tab and, because the panel never settles, leaves
    // the open menu frozen at its entry scale.
    setPlacement((cur) =>
      cur &&
      cur.top === next.top &&
      cur.bottom === next.bottom &&
      cur.left === next.left &&
      cur.right === next.right &&
      cur.origin === next.origin
        ? cur
        : next
    );
  }, [align]);

  React.useLayoutEffect(() => {
    if (!open) return;
    position();
  }, [open, position]);

  React.useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const reposition = () => position();

    // mousedown, not click: a click listener would fire on the same event that
    // opened a second menu and close it again immediately.
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    // capture, so a scroll inside any nested scroller reaches us too.
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, onClose, position]);

  const panel = (
    <div
      ref={panelRef}
      data-slot="menu-panel"
      style={{
        top: placement?.top,
        bottom: placement?.bottom,
        left: placement?.left,
        right: placement?.right,
        transformOrigin: placement?.origin,
      }}
      className={cn(
        'fixed z-[calc(var(--z-modal)+1)]',
        '[transition:opacity_150ms_ease,scale_150ms_cubic-bezier(.16,1,.3,1)]',
        open && placement ? 'scale-100 opacity-100' : 'pointer-events-none scale-[.85] opacity-0',
        menuClassName
      )}
    >
      <DropdownMenuGroup>{children}</DropdownMenuGroup>
    </div>
  );

  return (
    <div ref={wrapRef} className={cn('relative inline-flex', className)}>
      {trigger}
      {typeof document === 'undefined' ? panel : createPortal(panel, document.body)}
    </div>
  );
}

/** One menu row. Kept local rather than using Moji's DropdownMenuList because
 *  these rows need a trailing check, a "Default" tag and a leading glyph in
 *  combinations that component does not expose. */
export function MenuItem({
  icon,
  label,
  selected,
  onClick,
  className,
}: {
  icon?: React.ReactNode;
  label: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={!!selected}
      onClick={onClick}
      className={cn(
        'flex w-full min-w-[225px] cursor-pointer items-center gap-[var(--space-2)] border-0 bg-[var(--color-neutral-white)] p-[var(--space-3)] text-left',
        '[font:var(--text-body-3)] text-[var(--color-text-primary)]',
        '[transition:background-color_var(--transition-fast),color_var(--transition-fast)]',
        'hover:bg-[var(--color-blue-100)] hover:text-[var(--color-blue-400)]',
        selected && 'text-[var(--color-blue-400)]',
        className
      )}
    >
      {icon && (
        <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {selected && (
        <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-[var(--color-blue-400)]" aria-hidden="true">
          <path
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
