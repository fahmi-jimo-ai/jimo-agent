import * as React from 'react';
import { Smallcaps, MessageText, MessageQuestion, Add } from 'iconsax-react';
import { cn } from '@/lib/utils';
import { CloseIcon } from '@/components/ui/Icon/Icon';
import { CATEGORY_LABEL, type TopicCategory } from '@/lib/classifyChip';

/**
 * Topic pill — Figma "Pill States" (34:3630) and "Manual Pill Addition" (34:3775).
 *
 * Icons are the Figma instance names, not lookalikes:
 *   keyword  -> vuesax/linear/smallcaps
 *   topic    -> vuesax/linear/message-text      (labelled "Intent" in the UI)
 *   question -> vuesax/linear/message-question
 */
const CATEGORY_ICON: Record<TopicCategory, React.ElementType> = {
  keyword: Smallcaps,
  topic: MessageText,
  question: MessageQuestion,
};

export type PillAction = 'add' | 'remove';

export function TopicPill({
  label,
  category,
  action,
  selected = false,
  onAction,
  onEdit,
  className,
}: {
  label: string;
  category: TopicCategory;
  /** `add` renders the trailing +, `remove` renders the trailing ×. */
  action: PillAction;
  /** Suggestion staged for adding — navy fill, and the + becomes a ×. */
  selected?: boolean;
  onAction?: () => void;
  /** When set, the label area re-opens the pill for editing. */
  onEdit?: () => void;
  className?: string;
}) {
  const [hoverLabel, setHoverLabel] = React.useState(false);
  const Ico = CATEGORY_ICON[category];

  // A suggestion the user has staged flips its affordance to "unstage".
  const trailing: PillAction = selected ? 'remove' : action;
  // Suggestions read "Add Keyword"; an already-added pill just names its type.
  const tip = action === 'add' && !selected ? `Add ${CATEGORY_LABEL[category]}` : CATEGORY_LABEL[category];

  return (
    <span className={cn('relative inline-flex', className)}>
      {/* Tooltip — kept mounted and faded, so it can transition both ways. */}
      <span
        aria-hidden={!hoverLabel}
        className={cn(
          'pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-[var(--z-sticky)] -translate-x-1/2',
          '[transition:opacity_var(--transition-fast),scale_var(--transition-fast)]',
          hoverLabel ? 'scale-100 opacity-100' : 'scale-[.9] opacity-0'
        )}
      >
        <span className="flex items-center gap-[var(--space-2)] whitespace-nowrap rounded-[var(--radius-full)] bg-[var(--color-neutral-800)] px-[var(--space-3)] py-[var(--space-2)] [font:var(--text-subtitle-4)] text-[var(--color-text-inverse)]">
          <Ico size={16} variant="Linear" color="currentColor" />
          {tip}
        </span>
        {/* the little downward tail */}
        <span className="absolute left-1/2 top-full size-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-[var(--color-neutral-800)]" />
      </span>

      <span
        data-slot="topic-pill"
        data-category={category}
        data-selected={selected ? '' : undefined}
        className={cn(
          'inline-flex items-stretch overflow-hidden rounded-[var(--radius-full)] border',
          '[transition:background-color_var(--transition-fast),border-color_var(--transition-fast)]',
          selected
            ? 'border-[var(--color-neutral-800)] bg-[var(--color-neutral-800)]'
            : 'border-[var(--color-border-default)] bg-[var(--color-neutral-white)]'
        )}
      >
        <span
          role={onEdit ? 'button' : undefined}
          tabIndex={onEdit ? 0 : undefined}
          // Swallow the browser's focus-on-mousedown: this span is about to be
          // replaced by TopicInput, and a focus that lands here first bounces to
          // <body> on unmount — a blur the fresh input would read as "commit".
          onMouseDown={onEdit && ((e: React.MouseEvent) => e.preventDefault())}
          onClick={onEdit}
          onKeyDown={
            onEdit &&
            ((e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEdit();
              }
            })
          }
          onMouseEnter={() => setHoverLabel(true)}
          onMouseLeave={() => setHoverLabel(false)}
          className={cn(
            'flex items-center gap-[var(--space-2)] py-[var(--space-2)] pl-[var(--space-3)] pr-[var(--space-3)]',
            '[font:var(--text-body-3)] [transition:background-color_var(--transition-fast)]',
            onEdit && 'cursor-text outline-none',
            selected
              ? 'text-[var(--color-text-inverse)]'
              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex shrink-0 items-center',
              selected ? 'text-[var(--color-text-inverse)]' : 'text-[var(--color-text-secondary)]'
            )}
          >
            <Ico size={16} variant="Linear" color="currentColor" />
          </span>
          {/* Curly quotes are part of the design, not the data. */}
          <span className="whitespace-nowrap">{`“${label}”`}</span>
        </span>

        <span
          aria-hidden="true"
          className={cn('w-px shrink-0 self-stretch', selected ? 'bg-[var(--color-neutral-700)]' : 'bg-[var(--color-border-default)]')}
        />

        <button
          type="button"
          onClick={onAction}
          aria-label={`${trailing === 'add' ? 'Add' : 'Remove'} ${label}`}
          className={cn(
            'flex w-9 shrink-0 cursor-pointer items-center justify-center self-stretch border-0 bg-transparent',
            '[transition:background-color_var(--transition-fast),color_var(--transition-fast)]',
            selected
              ? 'text-[var(--color-text-inverse)] hover:bg-[var(--color-neutral-700)]'
              // Idle sits at N700; blue is reserved for the hover/active affordance.
              : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-blue-400)]'
          )}
        >
          {trailing === 'add' ? (
            <Add size={18} variant="Linear" color="currentColor" />
          ) : (
            <CloseIcon size={16} color="currentColor" />
          )}
        </button>
      </span>
    </span>
  );
}
