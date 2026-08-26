import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * The bordered "title + trailing glyph, then a description" card.
 *
 * ONE component for two artboards, because they are one drawing:
 *   - the Sources empty state's entry cards (899:15518 / 899:15528 / 899:15533),
 *     which are unselectable and just open a flow;
 *   - Add URL Content's Domain / Individual URLs selector (932:20135 / 932:20140),
 *     which is the same card plus a selected treatment — --color-blue-100 fill,
 *     --color-blue-400 border, blue title.
 *
 * Nothing in Moji covers it: `ContainedIcon` is a tile, `Section` is a page
 * card, and `DropdownMenuList` is a menu row. So this is a NEW local component,
 * and it is deliberately the only one, rather than a near-copy on each side.
 */
export function ChoiceCard({
  title,
  description,
  icon,
  selected = false,
  className,
  ...rest
}: Omit<React.ComponentProps<'button'>, 'title'> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      data-slot="choice-card"
      aria-pressed={selected}
      className={cn(
        'flex flex-1 min-w-0 flex-col items-start gap-[var(--space-2)] overflow-hidden',
        'rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-left',
        '[transition:background-color_var(--transition-fast),border-color_var(--transition-fast)]',
        selected
          ? 'border-[var(--color-blue-400)] bg-[var(--color-blue-100)]'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-default)] hover:bg-[var(--color-bg-muted)]',
        className,
      )}
      {...rest}
    >
      <span className="flex w-full items-center justify-between gap-[var(--space-2)]">
        <span
          className={cn(
            'min-w-0 truncate [font:var(--text-subtitle-3)]',
            selected ? 'text-[var(--color-blue-400)]' : 'text-[var(--color-text-primary)]',
          )}
        >
          {title}
        </span>
        {icon != null && (
          <span
            className={cn(
              'shrink-0',
              selected ? 'text-[var(--color-blue-400)]' : 'text-[var(--color-text-primary)]',
            )}
          >
            {icon}
          </span>
        )}
      </span>
      {description != null && (
        <span className="[font:var(--text-body-3)] text-[var(--color-neutral-700)]">
          {description}
        </span>
      )}
    </button>
  );
}
