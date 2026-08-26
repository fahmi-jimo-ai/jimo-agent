import * as React from 'react';
import { Messages, Profile2User, Chart2, DirectboxNotif } from 'iconsax-react';
import { cn } from '@/lib/utils';
import { STAT_TILES, formatStat } from '@/data/analytics';
import type { StatMetric } from '@/state/types';

/**
 * The four stat tiles — Figma 934:27943.
 *
 * Selecting a tile is what chooses the chart's series, so these are real
 * <button>s, not read-only boxes. The artboard draws Success Rate selected;
 * that is the store's default, not a hardcode here.
 *
 * Hand-rolled rather than a Moji component: the tile is a bordered box with a
 * leading glyph, a heading number and a caption, and nothing in
 * `src/components/ui/` draws that shape — Section is a card with a header row,
 * Chip is a pill. Every value below binds to a token.
 */
const ICON: Record<StatMetric, React.ReactNode> = {
  opened: <DirectboxNotif size={20} variant="Linear" color="currentColor" />,
  messages: <Messages size={20} variant="Linear" color="currentColor" />,
  users: <Profile2User size={20} variant="Linear" color="currentColor" />,
  success: <Chart2 size={20} variant="Linear" color="currentColor" />,
};

export function StatTiles({
  metric,
  hasData,
  onSelect,
}: {
  metric: StatMetric;
  hasData: boolean;
  onSelect: (metric: StatMetric) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Metrics"
      className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4"
    >
      {STAT_TILES.map((tile) => {
        const selected = tile.key === metric;
        return (
          <button
            key={tile.key}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(tile.key)}
            className={cn(
              'flex cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border bg-[var(--color-bg-default)] p-[var(--space-4)] text-left',
              '[transition:border-color_var(--transition-fast),background-color_var(--transition-fast),color_var(--transition-fast)]',
              selected
                ? 'border-[var(--color-border-focus)] bg-[var(--color-brand-subtle)]'
                : 'border-[var(--color-border-default)] hover:bg-[var(--color-bg-muted)]'
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
                selected
                  ? 'bg-[var(--color-blue-100)] text-[var(--color-brand-default)]'
                  : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]'
              )}
            >
              {ICON[tile.key]}
            </span>
            <span className="flex min-w-0 flex-col gap-[var(--space-1)]">
              <span
                className={cn(
                  '[font:var(--text-subtitle-2)] tabular-nums',
                  selected ? 'text-[var(--color-brand-default)]' : 'text-[var(--color-text-primary)]'
                )}
              >
                {/* Decision 8: no data means a zeroed tile, not an empty screen. */}
                {hasData ? formatStat(tile) : tile.format === 'percent' ? '0%' : '0'}
                {tile.suffix && (
                  <span className="[font:var(--text-body-3)]"> {tile.suffix}</span>
                )}
              </span>
              <span
                className={cn(
                  '[font:var(--text-body-4)]',
                  selected ? 'text-[var(--color-brand-default)]' : 'text-[var(--color-text-secondary)]'
                )}
              >
                {tile.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
