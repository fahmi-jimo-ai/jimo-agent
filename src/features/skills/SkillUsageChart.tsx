import * as React from 'react';
import { buildSkillUsageDays, SKILL_USAGE_SERIES, SKILL_Y_MAX } from '@/data/skills';

/**
 * The skill drawer's Usage chart — Figma `12987:15826`.
 *
 * A deliberate sibling of `src/features/statistics/UsageChart.tsx`, not a
 * refactor of it, for the reason that file already states about `HandoffsChart`:
 * extracting a shared chart primitive would drag two Figma-verified outputs into
 * one change for no benefit, and these three charts draw different axes,
 * different series and different interactions. What IS shared — and is followed
 * here line for line — is the idiom: hand-rolled SVG (no charting dependency is
 * installed and Moji ships no chart), geometry constants at the top, gridlines
 * with `vectorEffect="non-scaling-stroke"`, a `useLayoutEffect` + `resize` width
 * measurement, `role="img"` with a real label, and token fills.
 *
 * ## Two stacked series, `completed` on the floor
 *
 * The artboard stacks `Dropped` ABOVE `Completed` in every column, so a reader
 * comparing two columns compares the green baseline against a common floor
 * rather than against a moving one. Column height is therefore
 * `completed + dropped`, which `SKILL_Y_MAX` (75) comfortably clears for every
 * bucket the generator produces.
 *
 * ## The y ramp is uneven, and that is the artboard's
 *
 * `12987:15826` prints 75 / 25 / 0 — not 75 / 50 / 25 / 0. The labels are
 * therefore positioned from each tick's own y rather than spread with
 * `justify-between` the way `UsageChart`'s even ramp can be. Inline `style` is
 * the dynamic-geometry exception CLAUDE.md allows, not a hardcoded value.
 *
 * ## The end label is the data's, not the artboard's
 *
 * The artboard prints `Jan 21` → `Feb 27`. `buildSkillUsageDays` walks 14
 * buckets three days apart from Jan 21, which lands its last bucket two days
 * later than the frame. The labels below are read off the data rather than
 * typed, so the axis can never disagree with the bars above it; if the range is
 * ever meant to be exact, the fix belongs in the generator.
 */

/** Artboard geometry. The ramp is the frame's own 75 / 25 / 0. */
const Y_TICKS = [75, 25, 0];
const PLOT_H = 200;
/** Share of each column's slot left empty, so the bars read as separate. */
const COL_GAP_RATIO = 0.42;
const BAR_RADIUS = 2;

export function SkillUsageChart({ skillId }: { skillId: string }) {
  const days = React.useMemo(() => buildSkillUsageDays(skillId), [skillId]);

  const plotRef = React.useRef<HTMLDivElement>(null);
  const [plotW, setPlotW] = React.useState(0);

  React.useLayoutEffect(() => {
    const measure = () => setPlotW(plotRef.current?.clientWidth ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const step = plotW / (days.length || 1);
  const barW = step * (1 - COL_GAP_RATIO);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex gap-[var(--space-3)]">
        {/* y axis — positioned per tick, because the ramp is not evenly spaced. */}
        <div
          className="relative w-[20px] shrink-0 [font:var(--text-body-4)] text-[var(--color-text-tertiary)]"
          style={{ height: PLOT_H }}
          aria-hidden="true"
        >
          {Y_TICKS.map((t) => (
            <span
              key={t}
              className="absolute right-0 tabular-nums leading-none"
              style={{ top: PLOT_H - (t / SKILL_Y_MAX) * PLOT_H, translate: '0 -50%' }}
            >
              {t}
            </span>
          ))}
        </div>

        <div ref={plotRef} className="relative min-w-0 flex-1" style={{ height: PLOT_H }}>
          <svg
            width="100%"
            height={PLOT_H}
            role="img"
            aria-label={`Completed and dropped runs per day, ${days.length} days from ${days[0]?.label ?? ''} to ${days[days.length - 1]?.label ?? ''}`}
          >
            {Y_TICKS.map((t) => {
              const y = PLOT_H - (t / SKILL_Y_MAX) * PLOT_H;
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
              const completedH = (d.completed / SKILL_Y_MAX) * PLOT_H;
              const droppedH = (d.dropped / SKILL_Y_MAX) * PLOT_H;
              return (
                <g key={d.index}>
                  <title>{`${d.label}: ${d.completed} completed, ${d.dropped} dropped`}</title>
                  {/* Dropped sits on top of completed, so completed keeps the
                      baseline and two columns stay comparable. */}
                  <rect
                    x={x}
                    y={PLOT_H - completedH - droppedH}
                    width={barW}
                    height={droppedH}
                    rx={BAR_RADIUS}
                    fill={SKILL_USAGE_SERIES[1].color}
                  />
                  <rect
                    x={x}
                    y={PLOT_H - completedH}
                    width={barW}
                    height={completedH}
                    fill={SKILL_USAGE_SERIES[0].color}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* legend — centred, one dot + label per series */}
      <div className="flex flex-wrap items-center justify-center gap-x-[var(--space-6)] gap-y-[var(--space-2)]">
        {SKILL_USAGE_SERIES.map((s) => (
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
        <span>{days[0]?.label ?? '—'}</span>
        <span>{days[days.length - 1]?.label ?? '—'}</span>
      </div>
    </div>
  );
}
