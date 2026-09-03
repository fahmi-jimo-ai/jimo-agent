import * as React from 'react';
import type { StepBar } from '@/data/experiences';

/**
 * The `step-histogram` drill-down. No frame draws it; the docs describe it
 * exactly — "a visual breakdown of user progression across each step. The first
 * step always starts at 100% … with subsequent steps displaying decreasing
 * percentages as users drop off. The last step's percentage aligns directly with
 * the KPI."
 *
 * Both of those invariants are enforced in `buildStepDropoff` and asserted in
 * `experiences.test.ts`, so this file only has to draw them.
 *
 * The same idiom as the other three charts and no shared primitive, for the
 * reason each of their headers gives. Nearest sibling is `SkillOutcomesChart`'s
 * column geometry; this one has a single series and a label under each column,
 * so the columns are laid out with flexbox and only the bar itself is a `div`
 * with a percentage height — there is no axis to project against and no line to
 * need a measured width, which is what would have made it an SVG.
 */
const PLOT_H = 200;

export function StepDropoffChart({ steps }: { steps: StepBar[] }) {
  if (steps.length === 0) return null;

  return (
    <div
      role="img"
      aria-label={steps.map((s) => `${s.label} ${s.pct}%`).join(', ')}
      className="flex items-end gap-[var(--space-4)]"
      style={{ height: PLOT_H + 64 }}
    >
      {steps.map((step, i) => (
        <div key={step.id} className="flex min-w-0 flex-1 flex-col items-center gap-[var(--space-2)]">
          <span className="[font:var(--text-subtitle-4)] tabular-nums text-[var(--color-text-primary)]">
            {step.pct}%
          </span>
          <div
            className="flex w-full items-end rounded-[var(--radius-md)] bg-[var(--color-bg-muted)]"
            style={{ height: PLOT_H }}
          >
            <div
              // Per-column data, so the height is an inline style: Tailwind
              // cannot see `h-[${n}%]`.
              className="w-full rounded-[var(--radius-md)] bg-[var(--color-blue-300)]"
              style={{ height: `${Math.max(2, step.pct)}%` }}
            />
          </div>
          <span className="w-full truncate text-center [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
            {i + 1}. {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
