import * as React from 'react';
import { ModalOverlay, useModalClose } from '@/components/ui/ModalOverlay/ModalOverlay';
import { CloseIcon } from '@/components/ui/Icon/Icon';
import { cn } from '@/lib/utils';

/**
 * PickerDialog — the "search a catalogue, tick some rows, confirm" dialog.
 *
 * Transcribed 1:1 from Figma Copilot-Widget `921:17353`. It is deliberately
 * generic: nothing in this file knows about user properties. The shape it
 * encodes — sticky header + sticky search, one scrolling body of grouped
 * icon/title/description rows, sticky footer with a running count and a commit
 * button — is the shape of every "add things from a list" dialog, so the next
 * one (add teammates, add a knowledge source, add a segment) is a binding, not
 * a rebuild. `AddPropertyModal` is that binding and is 60 lines because of it.
 *
 * ## Why this is a sibling of ModalCard, not a variant of it
 *
 * `ModalCard` is the confirm/form dialog (`43:6997` family): subtitle-2 title,
 * --space-6 gutters, a right-aligned footer, and a body that sizes to content.
 * This one is a different artboard with a different rhythm — 16px gutters, a
 * subtitle-3 title, a justified footer, a fixed height and a body that scrolls.
 * Bending one component across both would mean a prop for every one of those,
 * and each prop would be a chance to render neither design correctly.
 *
 * ## Geometry, all from 921:17353
 *
 *   shell    600 wide, 600 tall, --radius-lg, --shadow-elevation-03
 *   header   p-4, title Subtitle 3, close 24; rule below (--color-border-default)
 *   search   px-5 pb-4, flush to the title row; shares the header's rule
 *   body     pt-4 px-3, groups 12 apart, rows 8 apart, NO bottom padding so the
 *            last row is cut flush by the footer rather than stopping short
 *   row      px-2 py-1, --radius-lg, gap-3; HOVER --color-brand-subtle
 *   footer   p-4, justify-between, rule above
 *
 * ## The row fill is hover, and only hover
 *
 * `--color-brand-subtle` on a row means "the pointer is here". It does NOT mean
 * "this row is picked" — that is the trailing control's whole job, and it says
 * so in a way that survives the pointer moving away. There is deliberately no
 * `selected` prop: a fill that meant both would leave a picked row and a hovered
 * row indistinguishable, and a list of picked rows reading as one solid block.
 *
 * Two deviations, both resolved in Moji's favour per CLAUDE.md's "use it 1:1"
 * rule, which outranks an artboard's ad-hoc instance of a shared component:
 *   - the artboard's checkbox is a 32px hit area around a 21px box with a 2px
 *     border; Moji's `Checkbox` is 24 around 16 with 1.5. Callers pass Moji's.
 *   - the artboard's search field is 37px tall; Moji's small `Input` is 42,
 *     because its icon slot is a 24-square and the artboard's is 20.
 */

/** Row title/description gap. 2px sits below the --space ramp (which starts at 4). */
const TEXT_GAP = '2px';

export function PickerDialog({
  title,
  onClose,
  search,
  footer,
  width = 600,
  height = 600,
  children,
}: {
  title: React.ReactNode;
  onClose: () => void;
  /** The search field. Omit it and the header is just the title row. */
  search?: React.ReactNode;
  /**
   * Footer content. The shell supplies `flex items-center justify-between`, so
   * pass exactly two nodes — a status label (Subtitle 3, per the artboard) and
   * the commit action. Omit for a dialog with nothing to confirm.
   */
  footer?: React.ReactNode;
  width?: number;
  /**
   * Fixed, not max: the dialog must not resize as the list filters down, or
   * every keystroke in the search field reflows the page behind it. Capped to
   * the viewport so a short window scrolls the list instead of the dialog.
   */
  height?: number;
  /** The scrolling body — `PickerGroup`s, or anything else. */
  children: React.ReactNode;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <Shell title={title} search={search} footer={footer} width={width} height={height}>
        {children}
      </Shell>
    </ModalOverlay>
  );
}

function Shell({
  title,
  search,
  footer,
  width,
  height,
  children,
}: {
  title: React.ReactNode;
  search?: React.ReactNode;
  footer?: React.ReactNode;
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  // ModalOverlay puts its close handler on the backdrop with no guard on the
  // content wrapper, so without the stopPropagation below every click inside
  // the dialog dismisses it. Same reason ModalCard does it.
  const close = useModalClose();

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      style={{
        width,
        height,
        maxWidth: 'calc(100vw - var(--space-8))',
        maxHeight: 'calc(100vh - var(--space-8))',
      }}
      className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-neutral-white)] shadow-[var(--shadow-elevation-03)]"
    >
      <div
        data-slot="picker-dialog-header"
        className="shrink-0 border-b border-[var(--color-border-default)]"
      >
        <div className="flex items-center justify-between gap-[var(--space-4)] p-[var(--space-4)]">
          <h2 className="m-0 min-w-0 truncate [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
            {title}
          </h2>
          {/* The artboard draws a bare 24px glyph. The negative margin buys back
              a 32px hit area without moving the glyph off its 16px inset. */}
          <button
            type="button"
            onClick={() => close?.()}
            aria-label="Close"
            className="-m-1 flex shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border-0 bg-transparent p-1 text-[var(--color-text-primary)] [transition:color_var(--transition-fast)] hover:text-[var(--color-brand-default)]"
          >
            <CloseIcon size={24} color="currentColor" />
          </button>
        </div>

        {search && <div className="px-[var(--space-5)] pb-[var(--space-4)]">{search}</div>}
      </div>

      {/* No bottom padding: the artboard cuts the last row flush against the
          footer rule, which is also what tells you the list keeps going. The
          scrollbar is hidden — inside a 600px card it drew a second right edge
          alongside the rows' own trailing controls. */}
      <div
        data-slot="picker-dialog-body"
        className="flex min-h-0 flex-1 flex-col gap-[var(--space-3)] overflow-y-auto px-[var(--space-3)] pt-[var(--space-4)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {footer && (
        <div
          data-slot="picker-dialog-footer"
          className="flex shrink-0 items-center justify-between gap-[var(--space-4)] border-t border-[var(--color-border-default)] p-[var(--space-4)]"
        >
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * A labelled run of rows. The label is inset --space-2 so it lines up with the
 * row *content* rather than the row's hover box, which is what makes the
 * highlight read as sitting behind the text (921:17515).
 */
export function PickerGroup({
  label,
  children,
}: {
  label?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {label != null && (
        <p className="m-0 px-[var(--space-2)] [font:var(--text-body-3)] text-[var(--color-neutral-600)]">
          {label}
        </p>
      )}
      <div className="flex flex-col gap-[var(--space-2)]">{children}</div>
    </div>
  );
}

type PickerRowProps = {
  /** Leading visual — a 40px tile on the artboard, but any node works. */
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Trailing control — a Checkbox on the artboard; a Radio or chevron elsewhere. */
  trailing?: React.ReactNode;
  disabled?: boolean;
  /**
   * `div` (default) for a row whose `trailing` node is the real control, and
   * `button` when the row itself is the action.
   *
   * NOT `label`, which is the obvious-looking answer and does not work: Moji's
   * `Checkbox` is Radix's, which renders a `<button role="checkbox">` and only
   * emits a hidden `<input>` inside a `<form>`. A `<label>` around it therefore
   * has no labelable control to forward a click to, so the row reads as
   * clickable and silently isn't. `onClick` below is what actually makes the
   * whole row a hit target.
   */
  as?: 'button' | 'div';
  /**
   * Fires for a click anywhere on the row EXCEPT the trailing control, which
   * gets its own isolated area below. Wire it to the same toggle the trailing
   * control uses and the two never double-fire.
   */
  onClick?: () => void;
  className?: string;
};

export function PickerRow({
  icon,
  title,
  description,
  trailing,
  disabled = false,
  as = 'div',
  onClick,
  className,
}: PickerRowProps) {
  const Tag = as as React.ElementType;
  const interactive = !disabled && !!onClick;

  return (
    <Tag
      data-slot="picker-row"
      {...(as === 'button'
        ? { type: 'button', onClick: interactive ? onClick : undefined, disabled }
        : { onClick: interactive ? onClick : undefined })}
      className={cn(
        'flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border-0 bg-transparent px-[var(--space-2)] py-[var(--space-1)] text-left',
        '[transition:background-color_var(--transition-fast)]',
        disabled ? 'cursor-default' : 'cursor-pointer hover:bg-[var(--color-brand-subtle)]',
        className
      )}
    >
      {icon}
      <span className="flex min-w-0 flex-1 flex-col" style={{ gap: TEXT_GAP }}>
        <span className="truncate [font:var(--text-body-2)] text-[var(--color-text-primary)]">
          {title}
        </span>
        {description != null && (
          <span className="truncate [font:var(--text-body-3)] text-[var(--color-text-tertiary)]">
            {description}
          </span>
        )}
      </span>
      {trailing != null && (
        // The trailing control keeps its own click to itself, so a checkbox that
        // already toggled on its own does not get toggled straight back by the
        // row handler the same click would otherwise bubble into.
        <span className="flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
          {trailing}
        </span>
      )}
    </Tag>
  );
}

/**
 * The footer's left-hand status line. Subtitle 3 on the artboard — the same
 * ramp step as the dialog title, not the body-3 the rows use.
 */
export function PickerCount({ children }: { children: React.ReactNode }) {
  return (
    <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
      {children}
    </span>
  );
}

/** Centred message for a search that matches nothing. */
export function PickerEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-[var(--space-6)] py-[var(--space-8)] text-center [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
      {children}
    </div>
  );
}
