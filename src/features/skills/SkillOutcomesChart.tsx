import * as React from 'react';
import { buildSkillOutcomes, SKILL_Y_MAX, type OutcomeWeek } from '@/data/skills';

/**
 * `Resolved vs abandoned` — Figma `12987:11526`, right stat card.
 *
 * A sibling of `SkillUsesChart` and of `UsageChart` rather than a shared
 * primitive, for the reason `SkillUsesChart`'s header sets out at length: the
 * three charts share an idiom (hand-rolled SVG, geometry constants at the top,
 * `non-scaling-stroke` gridlines, a measured plot width, `role="img"`, token
 * fills) and share no geometry at all.
 *
 * The axis is deliberately the SAME 0 / 25 / 75 the left card draws — the two
 * cards sit side by side, and two different y-scales an inch apart is how a
 * reader mis-reads a pair of charts.
 *
 * ## One green column with a lighter cap
 *
 * The artboard's bars read as a single green column whose top segment is paler,
 * so `resolved` (Green/300) is the base and `abandoned` (Green/100) stacks on
 * top of it. That ordering is not arbitrary: the resolved count is the figure
 * the eye should be able to compare across weeks, and only the bottom segment
 * of a stack shares a baseline.
 *
 * Green/100 on white is a very quiet fill, so the abandoned cap carries a
 * Green/300 hairline. That outline is not on the artboard — it is the smallest
 * fix for a segment that would otherwise be invisible, and it is labelled here
 * rather than left to look transcribed.
 */

/** Same axis as the left card, per `SKILL_Y_MAX`. */
const Y_TICKS = [75, 25, 0];
const PLOT_H = 160;
const COL_GAP_RATIO = 0.5;
const BAR_R = 4;

export function SkillOutcomesChart({
  weeks = buildSkillOutcomes(),
}: { weeks?: OutcomeWeek[] } = {}) {
  const plotRef = React.useRef<HTMLDivElement>(null);
  const [plotW, setPlotW] = React.useState(0);

  React.useLayoutEffect(() => {
    const measure = () => setPlotW(plotRef.current?.clientWidth ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const count = weeks.length || 1;
  const step = plotW / count;
  const barW = step * (1 - COL_GAP_RATIO);

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
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

        <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-2)]">
          <div ref={plotRef} className="min-w-0" style={{ height: PLOT_H }}>
            <svg
              width="100%"
              height={PLOT_H}
              role="img"
              aria-label={`Resolved versus abandoned runs, ${weeks.length} weeks`}
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

              {plotW > 0 &&
                weeks.map((w, i) => {
                  const x = i * step + (step - barW) / 2;
                  const resolvedH = (w.resolved / SKILL_Y_MAX) * PLOT_H;
                  const abandonedH = (w.abandoned / SKILL_Y_MAX) * PLOT_H;
                  return (
                    <g key={w.label}>
                      <title>{`${w.label}: ${w.resolved} resolved, ${w.abandoned} abandoned`}</title>
                      {/* The cap, drawn first and rounded at BOTH ends — the
                          resolved rect below overlaps its lower corners, so the
                          column reads as one shape with one rounded top. */}
                      <rect
                        x={x}
                        y={PLOT_H - resolvedH - abandonedH}
                        width={barW}
                        height={abandonedH}
                        rx={BAR_R}
                        fill="var(--color-green-100)"
                        stroke="var(--color-green-300)"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                      />
                      <rect
                        x={x}
                        y={PLOT_H - resolvedH}
                        width={barW}
                        height={resolvedH}
                        rx={BAR_R}
                        fill="var(--color-green-300)"
                      />
                    </g>
                  );
                })}
            </svg>
          </div>

          {/* One label per column, on the column's own share of the width. */}
          <div
            className="flex [font:var(--text-body-4)] text-[var(--color-text-tertiary)]"
            aria-hidden="true"
          >
            {weeks.map((w) => (
              <span key={w.label} className="min-w-0 flex-1 truncate text-center">
                {w.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
