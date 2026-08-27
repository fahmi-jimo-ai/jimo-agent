import * as React from 'react';
import { ArrowRight2 } from 'iconsax-react';
import { Badge } from '@/components/ui/Chip/badge';
import { buildUsageDays, USAGE_SERIES, Y_MAX, type UsageDay } from '@/data/analytics';
import type { AnalyticsRange, StatMetric } from '@/state/types';

/**
 * The usage chart — Figma 934:27943.
 *
 * A deliberate sibling of `HandoffsChart`, not a refactor of it. Extracting a
 * shared chart primitive would drag escalation's Figma-verified output into
 * this change for no benefit; the two draw different axes, different series and
 * different interactions. What IS shared is the idiom: hand-rolled SVG because
 * Moji ships no chart component and no charting dependency, geometry constants
 * at the top, gridlines with `vectorEffect="non-scaling-stroke"`.
 *
 * ## The tooltip and the floating-layer rule
 *
 * CLAUDE.md routes every dropdown, popover and menu through `Menu`, which
 * portals to <body>. This tooltip deliberately does not, and that is not an
 * oversight: it is an in-card hover readout anchored to a bar, never a layer
 * that has to escape its container. `Section` sets no `overflow` and no
 * `transform` (Section.tsx:10), so an absolutely-positioned element inside the
 * plot's own `relative` wrapper is neither clipped nor captured. Where a
 * portaled panel would win — overhanging the card edge — this clamps its x
 * inside the plot rect instead, which is the behaviour the artboard shows.
 */

// Chart geometry, matched to the artboard: a 0/25/50/75 axis, one column per day.
const Y_TICKS = [75, 50, 25, 0];
const PLOT_H = 220;
const COL_GAP_RATIO = 0.42;
const TOOLTIP_W = 228;

export function UsageChart({
  metric,
  range,
  hasData,
  onViewUsers,
}: {
  metric: StatMetric;
  range: AnalyticsRange;
  hasData: boolean;
  onViewUsers: () => void;
}) {
  // Both arguments are real. `HandoffsChart` memoises with `[]` deps and passes
  // no range, so its picker only relabels; that is not repeated here.
  const days = React.useMemo(
    () => (hasData ? buildUsageDays(metric, range) : []),
    [metric, range, hasData]
  );

  const [hovered, setHovered] = React.useState<number | null>(null);
  const plotRef = React.useRef<HTMLDivElement>(null);
  const [plotW, setPlotW] = React.useState(0);

  React.useLayoutEffect(() => {
    const measure = () => setPlotW(plotRef.current?.clientWidth ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // An empty grid when there is nothing to plot — decision 8, no empty screen.
  const count = days.length || 1;
  const step = plotW / count;
  const barW = step * (1 - COL_GAP_RATIO);

  const active: UsageDay | null = hovered != null ? days[hovered] ?? null : null;
  const total = active ? active.usage : 0;

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex gap-[var(--space-3)]">
        {/* y axis */}
        <div
          className="flex flex-col justify-between [font:var(--text-body-4)] text-[var(--color-text-tertiary)]"
          style={{ height: PLOT_H }}
          aria-hidden="true"
        >
          {Y_TICKS.map((t) => (
            <span key={t} className="tabular-nums leading-none">
              {t}
            </span>
          ))}
        </div>

        <div
          ref={plotRef}
          className="relative min-w-0 flex-1"
          style={{ height: PLOT_H }}
          // On the wrapper, not the <svg>: the tooltip is a sibling of the svg,
          // so an svg-level leave would fire the moment the pointer moved onto
          // the tooltip and take its "View users" link away mid-reach.
          onMouseLeave={() => setHovered(null)}
        >
          <svg
            width="100%"
            height={PLOT_H}
            role="img"
            aria-label={
              hasData
                ? `Usage per day, ${days.length} days`
                : 'Usage per day — no data for this period'
            }
          >
            {Y_TICKS.map((t) => {
              const y = PLOT_H - (t / Y_MAX) * PLOT_H;
              return (
                <line
                  key={t}
                  x1={0}
                  x2="100%"
                  y1={y}
                  y2={y}
                  stroke="var(--color-border-default)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {days.map((d, i) => {
              const x = i * step + (step - barW) / 2;
              const likeH = (d.like / Y_MAX) * PLOT_H;
              const dislikeH = (d.dislike / Y_MAX) * PLOT_H;
              const usageH = (d.usage / Y_MAX) * PLOT_H;
              const isOn = hovered === i;
              return (
                <g
                  key={d.index}
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.date}: ${d.usage} messages, ${d.like} like, ${d.dislike} dislike`}
                  className="cursor-pointer outline-none"
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                >
                  <title>{`${d.date}: ${d.usage} messages`}</title>
                  {/* Full-height hit area, so the pointer does not have to find
                      an 8px-tall footer segment. */}
                  <rect x={i * step} y={0} width={step} height={PLOT_H} fill="transparent" />
                  <rect
                    x={x}
                    y={PLOT_H - usageH - likeH - dislikeH}
                    width={barW}
                    height={usageH}
                    rx={2}
                    fill={isOn ? 'var(--color-blue-400)' : USAGE_SERIES[0].color}
                  />
                  <rect
                    x={x}
                    y={PLOT_H - likeH - dislikeH}
                    width={barW}
                    height={likeH}
                    fill={USAGE_SERIES[1].color}
                  />
                  <rect
                    x={x}
                    y={PLOT_H - dislikeH}
                    width={barW}
                    height={dislikeH}
                    fill={USAGE_SERIES[2].color}
                  />
                </g>
              );
            })}
          </svg>

          {active && (
            <div
              role="tooltip"
              className="absolute top-[var(--space-4)] z-[1] flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-default)] p-[var(--space-3)] [box-shadow:var(--shadow-elevation-05)]"
              style={{
                width: TOOLTIP_W,
                // Clamped inside the plot rather than portaled — see the header.
                left: Math.min(
                  Math.max(0, (hovered! + 0.5) * step - TOOLTIP_W / 2),
                  Math.max(0, plotW - TOOLTIP_W)
                ),
              }}
            >
              <span className="[font:var(--text-body-4)] text-[var(--color-text-secondary)]">
                {active.date}
              </span>
              <span className="flex items-baseline gap-[var(--space-2)] tabular-nums">
                <strong className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
                  {active.usage}
                </strong>
                <strong className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                  {active.like}
                </strong>
                <span className="[font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
                  ({Math.round((active.like / total) * 100)}%)
                </span>
                <strong className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                  {active.dislike}
                </strong>
                <span className="[font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
                  ({Math.round((active.dislike / total) * 100)}%)
                </span>
              </span>
              <span className="flex items-center gap-[var(--space-1)]">
                <Badge size="xx-small">Messages</Badge>
                <Badge size="xx-small" type="positive">
                  Like
                </Badge>
                <Badge size="xx-small" type="negative">
                  Dislike
                </Badge>
              </span>
              <button
                type="button"
                onClick={onViewUsers}
                className="flex cursor-pointer items-center gap-[var(--space-1)] border-0 bg-transparent p-0 text-left [font:var(--text-subtitle-4)] text-[var(--color-brand-default)] hover:text-[var(--color-brand-hover)]"
              >
                View users
                <ArrowRight2 size={16} variant="Linear" color="currentColor" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-[var(--space-6)] gap-y-[var(--space-2)]">
        {USAGE_SERIES.map((s) => (
          <span
            key={s.key}
            className="flex items-center gap-[var(--space-2)] [font:var(--text-body-4)] text-[var(--color-text-secondary)]"
          >
            <span
              aria-hidden="true"
              className="size-[10px] shrink-0 rounded-[var(--radius-full)]"
              style={{ background: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>

      <div
        className="flex justify-between [font:var(--text-body-4)] text-[var(--color-text-tertiary)]"
        aria-hidden="true"
      >
        <span>{days[0]?.date ?? '—'}</span>
        <span>{days[days.length - 1]?.date ?? '—'}</span>
      </div>
    </div>
  );
}
