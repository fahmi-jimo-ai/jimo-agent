import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * A quota bar — Figma Copilot-Widget 932:18226 (Token Usage).
 *
 * NEW local component: Moji ships no progress bar. Grepping `src/components/ui`
 * for one turns up only `Input status="loading"`'s spinner, which is a
 * different thing — a spinner says "working", a meter says "how much".
 *
 * Every value is a token: a 17px `--radius-full` track on `--color-neutral-100`
 * with a `--color-blue-300` fill, all measured off the artboard.
 *
 * `value` is clamped, because the artboard's own numbers are over quota
 * (320,000 of 100,000) — see TokenUsageCard for why the caption is allowed to
 * say so while the bar is not.
 */
export function Meter({
  value,
  max,
  className,
  ...rest
}: Omit<React.ComponentProps<'div'>, 'role'> & { value: number; max: number }) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;

  return (
    <div
      data-slot="meter"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        'h-[17px] w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-neutral-100)]',
        className,
      )}
      {...rest}
    >
      <div
        className="h-full rounded-[var(--radius-full)] bg-[var(--color-blue-300)] [transition:width_var(--transition-base)]"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
