import * as React from 'react';
import { ArrowRight2 } from 'iconsax-react';
import type { MetricDay } from '@/data/experiences';

/**
 * The `day-series` drill-down — Agent Designer Sandbox `10:2928` / `10:3238`.
 *
 * ## Why a fourth chart file and not a shared primitive
 *
 * The call `UsageChart` and `SkillUsesChart` both already make, made once more:
 * four charts now share an IDIOM — hand-rolled SVG because Moji ships none and
 * this repo has no charting dependency, geometry constants at the top, gridlines
 * with `vectorEffect="non-scaling-stroke"`, a `useLayoutEffect` width
 * measurement, `role="img"` with a real label, token fills — and share nothing
 * else. Factoring them together would produce a primitive whose options list is
 * longer than any of the four bodies.
 *
 * What it IS, precisely: `SkillUsesChart`'s geometry (a filled area under a
 * line, a gradient keyed to a per-instance `useId`, nothing drawn until the
 * width is measured) plus `UsageChart`'s interaction (a hovered index, one
 * full-height transparent hit rect per column, a tooltip clamped inside the plot
 * instead of portaled, `onMouseLeave` on the WRAPPER so the pointer can reach
 * the tooltip's link without it vanishing mid-reach).
 *
 * The tooltip's "View users ›" is a copy of `UsageChart`'s, not an invention —
 * the artboard draws the same affordance, and that file's header already
 * documents why this one tooltip is deliberately not portaled.
 *
 * ## `series` from the start
 *
 * The Reached-goal drill-down the docs describe is this chart with a second
 * curve ("Total Goal Events" against "Goal Events During Experience"), so it
 * takes an array rather than growing a second component later.
 */
const PLOT_H = 200;
const TOOLTIP_W = 176;

export interface ChartSeries {
  key: string;
  label: string;
  /** A token reference, never a hex. */
  stroke: string;
  /** Fills only the first series — two stacked gradients read as mud. */
  fill?: boolean;
}

export function MetricAreaChart({
  series,
  data,
  unitLabel,
  onViewUsers,
}: {
  series: ChartSeries[];
  /** One row per series, all the same length. */
  data: MetricDay[][];
  /** The tooltip's noun — "users", "messages", "clicks". */
  unitLabel: string;
  onViewUsers: () => void;
}) {
  const plotRef = React.useRef<HTMLDivElement>(null);
  const [plotW, setPlotW] = React.useState(0);
  const [hovered, setHovered] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const measure = () => setPlotW(plotRef.current?.clientWidth ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Stripped of `useId`'s colons — the value is spent inside `url(#…)`.
  const gradientId = `metric-area-${React.useId().replace(/:/g, '')}`;

  const primary = data[0] ?? [];
  const count = primary.length;
  const step = count > 1 ? plotW / (count - 1) : 0;

  // One axis for every series, so two curves stay comparable. A flat-zero
  // series still needs a ceiling, or every point would divide by zero.
  const max = Math.max(1, ...data.flat().map((d) => d.value));
  const ticks = [max, Math.round(max / 2), 0];

  const project = (row: MetricDay[]) =>
    row.map((d, i) => ({ x: i * step, y: PLOT_H - (d.value / max) * PLOT_H }));

  const active = hovered != null ? primary[hovered] ?? null : null;

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div className="flex gap-[var(--space-3)]">
        <div
          className="flex flex-col justify-between [font:var(--text-body-4)] text-[var(--color-text-tertiary)]"
          style={{ height: PLOT_H }}
          aria-hidden="true"
        >
          {ticks.map((t, i) => (
            <span key={i} className="tabular-nums leading-none">
              {t}
            </span>
          ))}
        </div>

        <div
          ref={plotRef}
          className="relative min-w-0 flex-1"
          style={{ height: PLOT_H }}
          // On the wrapper, not the <svg>: the tooltip is a sibling of the svg,
          // so leaving the svg for the tooltip would unmount it and take the
          // "View users" link away mid-reach.
          onMouseLeave={() => setHovered(null)}
        >
          <svg
            width="100%"
            height={PLOT_H}
            role="img"
            aria-label={`${series.map((s) => s.label).join(' and ')} over ${
              primary[0]?.label ?? ''
            } to ${primary[count - 1]?.label ?? ''}`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-blue-200)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--color-blue-200)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {ticks.map((t, i) => {
              const y = PLOT_H - (t / max) * PLOT_H;
              return (
                <line
                  key={i}
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

            {/* Nothing until the width is known — a polyline cannot fall back
                on percentage geometry the way a bar chart can. */}
            {plotW > 0 &&
              series.map((s, si) => {
                const xy = project(data[si] ?? []);
                if (xy.length === 0) return null;
                const line = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
                const area = `${line} L${xy[xy.length - 1].x} ${PLOT_H} L${xy[0].x} ${PLOT_H} Z`;
                return (
                  <g key={s.key}>
                    {s.fill && <path d={area} fill={`url(#${gradientId})`} stroke="none" />}
                    <path
                      d={line}
                      fill="none"
                      stroke={s.stroke}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              })}

            {/* The hovered point marker — the one thing a line chart needs that
                a bar chart does not, since there is no bar to recolour. */}
            {plotW > 0 && hovered != null && (
              <circle
                cx={hovered * step}
                cy={PLOT_H - ((primary[hovered]?.value ?? 0) / max) * PLOT_H}
                r={4}
                fill="var(--color-neutral-white)"
                stroke="var(--color-blue-400)"
                strokeWidth={2}
              />
            )}

            {/* One full-height hit column per point. */}
            {plotW > 0 &&
              primary.map((d, i) => (
                <rect
                  key={d.index}
                  x={Math.max(0, i * step - step / 2)}
                  y={0}
                  width={Math.max(1, step)}
                  height={PLOT_H}
                  fill="transparent"
                  onMouseEnter={() => setHovered(i)}
                />
              ))}
          </svg>

          {active && (
            <div
              role="tooltip"
              className="pointer-events-auto absolute top-[var(--space-4)] z-[1] flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-default)] p-[var(--space-3)] [box-shadow:var(--shadow-elevation-05)]"
              style={{
                width: TOOLTIP_W,
                // Clamped inside the plot rather than portaled — see the header.
                left: Math.min(
                  Math.max(0, hovered! * step - TOOLTIP_W / 2),
                  Math.max(0, plotW - TOOLTIP_W)
                ),
              }}
            >
              <span className="[font:var(--text-body-4)] text-[var(--color-text-secondary)]">
                {active.label}
              </span>
              {series.map((s, si) => (
                <span key={s.key} className="flex items-baseline gap-[var(--space-2)]">
                  <strong className="[font:var(--text-subtitle-3)] tabular-nums text-[var(--color-text-primary)]">
                    {(data[si]?.[hovered!]?.value ?? 0).toLocaleString('en-US')}
                  </strong>
                  <span className="[font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
                    {series.length > 1 ? s.label : unitLabel}
                  </span>
                </span>
              ))}
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

      <div
        className="flex justify-between pl-[var(--space-8)] [font:var(--text-body-4)] text-[var(--color-text-tertiary)]"
        aria-hidden="true"
      >
        <span>{primary[0]?.label}</span>
        <span>{primary[count - 1]?.label}</span>
      </div>

      {series.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-x-[var(--space-6)] gap-y-[var(--space-2)]">
          {series.map((s) => (
            <span
              key={s.key}
              className="flex items-center gap-[var(--space-2)] [font:var(--text-body-4)] text-[var(--color-text-secondary)]"
            >
              <span
                aria-hidden="true"
                className="size-[10px] rounded-[var(--radius-full)]"
                style={{ background: s.stroke }}
              />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
