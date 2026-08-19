import * as React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';

export type ChipTone = 'green' | 'purple' | 'red';

/** Tinted chip: the tone's 100 as the fill, its 400 as the glyph. */
const CHIP_ON: Record<ChipTone, string> = {
  green: 'bg-[var(--color-green-100)] text-[var(--color-green-400)]',
  purple: 'bg-[var(--color-purple-100)] text-[var(--color-purple-400)]',
  red: 'bg-[var(--color-red-100)] text-[var(--color-red-400)]',
};
/** Off keeps the same recipe on the neutral ramp, one step darker on the glyph
 *  so a 400 icon does not vanish into a 100 fill. */
const CHIP_OFF = 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]';

/**
 * One escalation-trigger card. Figma 29:7085 (on) and 29:17917 (off).
 *
 * The card surface is fixed: white fill, neutral-300 border, in both states.
 * Only the icon chip and the checkbox carry the on/off difference — the title
 * and description keep their normal colour either way.
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
        'flex flex-1 flex-col gap-[var(--space-3)] rounded-[var(--radius-xl)] p-[var(--space-4)]',
        'border border-[var(--color-border-default)] bg-[var(--color-neutral-white)]'
      )}
    >
      <div className="flex items-start justify-between">
        <span
          aria-hidden="true"
          className={cn(
            'flex shrink-0 items-center justify-center rounded-[var(--radius-md)] p-[var(--space-2)]',
            '[transition:background-color_var(--transition-base),color_var(--transition-base)]',
            checked ? CHIP_ON[tone] : CHIP_OFF
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
