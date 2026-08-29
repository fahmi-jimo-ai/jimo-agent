import * as React from 'react';
import { buildSkillUses, SKILL_Y_MAX, type SkillUses } from '@/data/skills';

/**
 * The `Skill uses` sparkline — Figma `12987:11526`, left stat card.
 *
 * ## Why this is a sibling of `UsageChart`, not a shared primitive
 *
 * The same call `UsageChart` already makes about `HandoffsChart`, one level
 * down: three charts now share an IDIOM — hand-rolled SVG because Moji ships no
 * chart component and this repo has no charting dependency, geometry constants
 * at the top of the file, gridlines with `vectorEffect="non-scaling-stroke"`,
 * a `useLayoutEffect` width measurement, `role="img"` with a real label, token
 * fills — and share nothing else. This one is a line plus a filled area over 30
 * unlabelled points; `UsageChart` is a stacked bar per day with a hover
 * read-out; `SkillOutcomesChart` is six weekly columns. Factoring them together
 * would produce a primitive whose options list is longer than any of the three
 * bodies, and would drag two Figma-verified outputs into every change to a
 * third.
 *
 * ## The two things a line chart needs that a bar chart does not
 *
 *  - A measured width BEFORE the first path can be built. A bar chart can fall
 *    back on percentage geometry; a polyline cannot, so the first paint draws
 *    the axis and the grid and no line, and the effect fills it in on commit.
 *  - A gradient, which needs an id that is unique per instance (two cards on a
 *    screen would otherwise share one `<defs>` entry and the second would win).
 *    `useId()` supplies it; its colons are stripped because the id is spent in
 *    a `url(#…)` reference.
 *
 * No hover read-out: the artboard draws none, and the card's own headline
 * already prints the only number this series has a name for.
 */

/** The axis both list-page cards draw — 0 / 25 / 75, per `SKILL_Y_MAX`. */
const Y_TICKS = [75, 25, 0];
const PLOT_H = 160;

export function SkillUsesChart({ uses = buildSkillUses() }: { uses?: SkillUses } = {}) {
  const plotRef = React.useRef<HTMLDivElement>(null);
  const [plotW, setPlotW] = React.useState(0);

  React.useLayoutEffect(() => {
    const measure = () => setPlotW(plotRef.current?.clientWidth ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Stripped of `useId`'s colons — the value is spent inside `url(#…)`.
  const gradientId = `skill-uses-area-${React.useId().replace(/:/g, '')}`;

  const points = uses.points;
  const step = points.length > 1 ? plotW / (points.length - 1) : 0;
  const xy = points.map((p, i) => ({
    x: i * step,
    y: PLOT_H - (p.value / SKILL_Y_MAX) * PLOT_H,
  }));

  const line = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  // The area is the line, dropped to the baseline at both ends and closed.
  const area =
    xy.length > 0
      ? `${line} L${xy[xy.length - 1].x} ${PLOT_H} L${xy[0].x} ${PLOT_H} Z`
      : '';

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

        <div ref={plotRef} className="min-w-0 flex-1" style={{ height: PLOT_H }}>
          <svg
            width="100%"
            height={PLOT_H}
            role="img"
            aria-label={`Skill uses, ${uses.total.toLocaleString('en-US')} over ${uses.startLabel} to ${uses.endLabel}`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-blue-200)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--color-blue-200)" stopOpacity={0} />
              </linearGradient>
            </defs>

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

            {/* Nothing until the width is known — see the header comment. */}
            {plotW > 0 && (
              <>
                <path d={area} fill={`url(#${gradientId})`} stroke="none" />
                <path
                  d={line}
                  fill="none"
                  stroke="var(--color-blue-400)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* The plot's own two end labels, offset past the axis column. */}
      <div
        className="flex justify-between pl-[var(--space-6)] [font:var(--text-body-4)] text-[var(--color-text-tertiary)]"
        aria-hidden="true"
      >
        <span>{uses.startLabel}</span>
        <span>{uses.endLabel}</span>
      </div>
    </div>
  );
}
