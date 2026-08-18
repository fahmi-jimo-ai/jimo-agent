import * as React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';

export type ChipTone = 'green' | 'purple' | 'red';

const CHIP_ON: Record<ChipTone, string> = {
  green: 'bg-[var(--color-green-400)]',
  purple: 'bg-[var(--color-purple-500)]',
  red: 'bg-[var(--color-red-400)]',
};

/**
 * One escalation-trigger card. Figma 29:7085 (on) and 29:17917 (off).
 *
 * Off state, read off the artboard rather than assumed: the card loses its blue
 * border and picks up a subtle grey fill, and the icon chip goes neutral — but
 * the title and description keep their normal colour.
 */
export function TriggerCard({
  icon,
  tone,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode;
  tone: ChipTone;
  /** ReactNode so the inline token pill can live inside the title. */
  title: React.ReactNode;
  description: React.ReactNode;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div
      data-slot="trigger-card"
      data-on={checked}
      className={cn(
        'flex flex-1 flex-col gap-[var(--space-3)] rounded-[var(--radius-xl)] border p-[var(--space-4)]',
        '[transition:background-color_var(--transition-base),border-color_var(--transition-base)]',
        checked
          ? 'border-[var(--color-blue-200)] bg-[var(--color-neutral-white)]'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-subtle)]'
      )}
    >
      <div className="flex items-start justify-between">
        <span
          aria-hidden="true"
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-inverse)]',
            '[transition:background-color_var(--transition-base)]',
            checked ? CHIP_ON[tone] : 'bg-[var(--color-neutral-400)]'
          )}
        >
          {icon}
        </span>
        <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
      </div>

      <div className="flex flex-wrap items-center gap-x-[var(--space-2)] gap-y-[var(--space-1)] [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
        {title}
      </div>

      <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}
