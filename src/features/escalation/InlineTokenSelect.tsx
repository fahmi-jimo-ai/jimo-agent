import * as React from 'react';
import { cn } from '@/lib/utils';
import { Menu } from '@/components/app/Menu';
import { SeverityIcon } from './SeverityIcon';

export interface TokenOption<T extends string | number> {
  value: T;
  label: string;
  /** Position on the menu's severity ramp (1 = mildest). */
  severity: 1 | 2 | 3;
}

/**
 * The blue inline pill that sits inside a trigger-card title
 * ("User says it didn't work [twice]"). Figma 29:8108.
 */
export function InlineTokenSelect<T extends string | number>({
  value,
  options,
  label,
  onChange,
  disabled,
  align = 'left',
}: {
  value: T;
  options: TokenOption<T>[];
  /** Text shown on the pill — deliberately not the menu row's wording. */
  label: string;
  onChange: (v: T) => void;
  disabled?: boolean;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = React.useState(false);

  // An off trigger's option is frozen: turning the card back on is the only
  // way in, so the menu must never be reachable — and must fold away if the
  // checkbox is unticked while it happens to be open.
  React.useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <Menu
      open={open && !disabled}
      onClose={() => setOpen(false)}
      align={align}
      trigger={
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open && !disabled}
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setOpen((o) => !o);
          }}
          className={cn(
            'rounded-[var(--radius-md)] border px-[var(--space-2)] py-px',
            '[font:var(--text-subtitle-3)] [transition:border-color_var(--transition-fast),background-color_var(--transition-fast)]',
            disabled
              ? 'cursor-default border-[var(--color-border-default)] bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]'
              : 'cursor-pointer border-[var(--color-blue-200)] bg-[var(--color-blue-100)] text-[var(--color-blue-400)] hover:border-[var(--color-blue-400)]'
          )}
        >
          {label}
        </button>
      }
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="option"
          aria-selected={o.value === value}
          onClick={() => {
            onChange(o.value);
            setOpen(false);
          }}
          className={cn(
            'flex w-full min-w-[225px] cursor-pointer items-center gap-[var(--space-3)] border-0 bg-[var(--color-neutral-white)] p-[var(--space-3)] text-left',
            '[font:var(--text-body-3)] text-[var(--color-text-primary)]',
            '[transition:background-color_var(--transition-fast),color_var(--transition-fast)]',
            'hover:bg-[var(--color-blue-100)] hover:text-[var(--color-blue-400)]',
            o.value === value && 'text-[var(--color-blue-400)]'
          )}
        >
          <span aria-hidden="true" className="flex shrink-0 items-center">
            <SeverityIcon level={o.severity} />
          </span>
          <span className="flex-1">{o.label}</span>
        </button>
      ))}
    </Menu>
  );
}
