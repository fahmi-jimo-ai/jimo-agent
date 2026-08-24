import * as React from 'react';
import { Calendar } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { Menu, MenuItem } from '@/components/app/Menu';
import { buildChartDays, REASON_SERIES, HANDOFF_TOTAL, type ReasonKey } from '@/data/fixtures';
import { useEscalation, setState } from '@/state/useEscalation';
import type { Range } from '@/state/types';

const RANGE_LABEL: Record<Range, string> = {
  'this-month': 'This month',
  'last-30-days': 'Last 30 days',
  'last-7-days': 'Last 7 days',
};

// Chart geometry, matched to the artboard: a 0/40/80 axis and one bar per day.
const Y_TICKS = [80, 40, 0];
const Y_MAX = 80;
const PLOT_H = 140;
const BAR_W = 18;
const BAR_GAP = 12;

/**
 * Handoffs chart — Figma 29:7085.
 *
 * Hand-rolled SVG on purpose: Moji ships no chart component and no charting
 * dependency, and pulling one in for a single static stacked bar would drag a
 * whole palette system past the tokens-only rule.
 *
 * Legend colours are the Figma variables verbatim: Green/300, Purple/300,
 * Red/300, Blue/200. (A sticky note at 43:9789 lists different labels AND
 * different colours; the artboard is what ships.)
 */
export function HandoffsChart() {
  const { range } = useEscalation();
  const [open, setOpen] = React.useState(false);
  const days = React.useMemo(() => buildChartDays(), []);

  const plotW = days.length * BAR_W + (days.length - 1) * BAR_GAP;

  return (
    <Section>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-[var(--space-1)]">
          <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">Handoffs</span>
          <span className="[font:var(--text-heading-3)] tabular-nums tracking-[var(--text-heading-tracking)] text-[var(--color-text-primary)]">
            {HANDOFF_TOTAL.toLocaleString('en-US')}
          </span>
        </div>

        <Menu
          open={open}
          onClose={() => setOpen(false)}
          align="right"
          trigger={
            <DropdownSelector
              size="big"
              text={RANGE_LABEL[range]}
              isOpen={open}
              withIcon
              icon={<Calendar size={20} variant="Linear" color="currentColor" />}
              onClick={() => setOpen((o) => !o)}
            />
          }
        >
          {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
            <MenuItem
              key={r}
              label={RANGE_LABEL[r]}
              selected={r === range}
              onClick={() => {
                setState({ range: r });
                setOpen(false);
              }}
            />
          ))}
        </Menu>
      </div>

      <div className="mt-[var(--space-5)] flex gap-[var(--space-3)]">
        {/* y axis */}
        <div
          className="flex flex-col justify-between [font:var(--text-body-4)] text-[var(--color-text-tertiary)]"
          style={{ height: PLOT_H }}
          aria-hidden="true"
        >
          {Y_TICKS.map((t) => (
            <span key={t} className="tabular-nums leading-none">{t}</span>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <svg
            viewBox={`0 0 ${plotW} ${PLOT_H}`}
            width="100%"
            height={PLOT_H}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Handoffs per day, ${RANGE_LABEL[range]}`}
          >
            {Y_TICKS.map((t) => {
              const y = PLOT_H - (t / Y_MAX) * PLOT_H;
              return <line key={t} x1={0} x2={plotW} y1={y} y2={y} stroke="var(--color-border-default)" strokeWidth={1} vectorEffect="non-scaling-stroke" />;
            })}

            {days.map((d, i) => {
              const x = i * (BAR_W + BAR_GAP);
              let cursor = PLOT_H;
              return (
                <g key={d.day}>
                  {REASON_SERIES.map((s) => {
                    const h = (d.values[s.key as ReasonKey] / Y_MAX) * PLOT_H;
                    cursor -= h;
                    return <rect key={s.key} x={x} y={cursor} width={BAR_W} height={h} fill={s.color} />;
                  })}
                </g>
              );
            })}
          </svg>

          <div className="mt-[var(--space-2)] flex justify-between [font:var(--text-body-4)] text-[var(--color-text-tertiary)]" aria-hidden="true">
            {['Aug 1', 'Aug 5', 'Aug 10', 'Aug 15', 'Aug 20', 'Aug 25', 'Aug 30'].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-[var(--space-4)] flex flex-wrap items-center justify-center gap-x-[var(--space-6)] gap-y-[var(--space-2)]">
        {REASON_SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-[var(--space-2)] [font:var(--text-body-4)] text-[var(--color-text-secondary)]">
            <span aria-hidden="true" className="size-[10px] shrink-0 rounded-[var(--radius-full)]" style={{ background: s.color }} />
            <strong className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">{Math.round(s.share * 100)}%</strong>
            {s.label}
          </span>
        ))}
      </div>
    </Section>
  );
}
