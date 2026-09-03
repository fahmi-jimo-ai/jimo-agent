import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  formatMetric,
  metricLabel,
  METRICS,
  type Experience,
  type MetricKey,
} from '@/data/experiences';
import { METRIC_ICON } from './metricGlyph';

/**
 * The KPI tile row — Agent Designer Sandbox `10:2271`, and the same row with a
 * different tile selected on `10:2928` / `10:3238`.
 *
 * Selecting a tile is what chooses the drill-down below it, so these are real
 * <button>s, and the selected treatment is `StatTiles`' exactly: `border-focus`
 * plus `brand-subtle`, with the number and caption in `brand-default`.
 *
 * ## Why this is a sibling of `StatTiles`, not a generalisation of it
 *
 * `StatTiles` is bound to `/statistics`' own four-member `StatMetric` union and
 * reads `STAT_TILES` from `analytics.ts` directly — it takes no data at all.
 * Widening it to accept an arbitrary metric list, a per-type label override and
 * a formatter would make the two call sites' shared surface larger than either
 * body. What IS shared is the treatment, and that is written down here so the
 * next reader can see it was copied on purpose.
 *
 * The tiles are `flex-1` rather than a fixed grid: the row is three wide on a
 * Checklist and four on a Tour, and a `grid-cols-4` would leave a Checklist with
 * a hole in it.
 */
export function MetricTiles({
  experience,
  keys,
  selected,
  onSelect,
}: {
  experience: Experience;
  keys: MetricKey[];
  selected: MetricKey;
  onSelect: (key: MetricKey) => void;
}) {
  return (
    <div role="group" aria-label="Statistics" className="flex flex-wrap gap-[var(--space-4)]">
      {keys.map((key) => {
        const isOn = key === selected;
        const value = experience.metrics[key] ?? 0;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isOn}
            onClick={() => onSelect(key)}
            className={cn(
              'flex min-w-[200px] flex-1 cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border bg-[var(--color-bg-default)] p-[var(--space-4)] text-left',
              '[transition:border-color_var(--transition-fast),background-color_var(--transition-fast),color_var(--transition-fast)]',
              isOn
                ? 'border-[var(--color-border-focus)] bg-[var(--color-brand-subtle)]'
                : 'border-[var(--color-border-default)] hover:bg-[var(--color-bg-muted)]',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
                isOn
                  ? 'bg-[var(--color-blue-100)] text-[var(--color-brand-default)]'
                  : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]',
              )}
            >
              {METRIC_ICON[key]}
            </span>
            <span className="flex min-w-0 flex-col gap-[var(--space-1)]">
              <span
                className={cn(
                  '[font:var(--text-subtitle-2)] tabular-nums',
                  isOn ? 'text-[var(--color-brand-default)]' : 'text-[var(--color-text-primary)]',
                )}
              >
                {formatMetric(value, METRICS[key].unit)}
              </span>
              <span
                className={cn(
                  '[font:var(--text-body-4)]',
                  isOn
                    ? 'text-[var(--color-brand-default)]'
                    : 'text-[var(--color-text-secondary)]',
                )}
              >
                {metricLabel(experience.type, key)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
