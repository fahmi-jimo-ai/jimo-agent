import * as React from 'react';
import { Calendar, Chart21, DocumentDownload, Danger } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Section } from '@/components/ui/Section/Section';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { PrimaryHorizontalMenuGroup } from '@/components/ui/PrimaryHorizontalMenuGroup/PrimaryHorizontalMenuGroup';
import { Menu, MenuItem } from '@/components/app/Menu';
import {
  buildCtaRows,
  buildGoalCurves,
  buildHintRows,
  buildMetricDays,
  buildStepDropoff,
  METRICS,
  metricsFor,
  type Experience,
  type MetricKey,
} from '@/data/experiences';
import { MetricTiles } from './MetricTiles';
import { MetricAreaChart } from './MetricAreaChart';
import { TaskCompletionTable } from './TaskCompletionTable';
import { HintBreakdownTable } from './HintBreakdownTable';
import { CtaTable } from './CtaTable';
import { StepDropoffChart } from './StepDropoffChart';
import { IssuesTab } from './IssuesTab';

/**
 * The Insights block — Agent Designer Sandbox `10:2271`.
 *
 * A heading with `Export Statistics` on the right, a Statistics | Issues tab
 * bar, then the "Poke statistics" card: a date-range selector, the KPI tile
 * row, and the drill-down for whichever tile is selected. The three artboards
 * are that last part with a different tile chosen, which is why the selection
 * is state here and reachable from a story through `initialMetric`.
 *
 * "Poke" is Jimo's own word for an experience — it is in the product's own deep
 * links (`?jimo_poke=`) — so the artboard's card title is kept verbatim rather
 * than "translated" into "Experience statistics".
 *
 * ## Which tile you are on is NOT persisted
 *
 * That is where a reader is inside a page, not configuration — the line
 * `ThinkingTrace` draws for its open state and `SourcesTab` for its tab. The
 * FILTERS on the index page are persisted, because the docs say they are saved
 * per view; this is not one of those.
 *
 * ## Every drill kind is built
 *
 * A tile that reveals nothing is a control with nothing behind it, so all six
 * `DrillKind`s render: the area chart for a day series, three tables, and the
 * step histogram. Only the date range is inert — see below.
 */

/**
 * The range options. `All time` is the artboard's own label; the other three
 * are the set the docs name for every statistics view ("All time, Last week,
 * Last month, or a Custom range"). Selecting one RELABELS and does not refilter,
 * the same call `HandoffsChart` already makes and labels: the seeded series is
 * one fixed window, and pretending a shorter range re-derives it would be a lie
 * the chart cannot back up.
 */
const RANGES = ['All time', 'Last week', 'Last month', 'Custom'] as const;
type Range = (typeof RANGES)[number];

export function InsightsSection({
  experience,
  initialMetric,
  onViewUsers,
  onExport,
}: {
  experience: Experience;
  initialMetric?: MetricKey;
  onViewUsers: () => void;
  onExport: () => void;
}) {
  const keys = metricsFor(experience);
  const [tab, setTab] = React.useState<'statistics' | 'issues'>('statistics');
  const [metric, setMetric] = React.useState<MetricKey>(initialMetric ?? keys[0]);
  const [range, setRange] = React.useState<Range>('All time');
  const [rangeOpen, setRangeOpen] = React.useState(false);

  // A metric that this experience does not have (a story seed, or a record
  // edited underneath the page) falls back to the first tile rather than
  // rendering a drill-down for a tile that is not on screen.
  const active = keys.includes(metric) ? metric : keys[0];

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex items-center justify-between gap-[var(--space-4)]">
        <h2 className="m-0 [font:var(--text-subtitle-2)] text-[var(--color-text-primary)]">
          Insights
        </h2>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<DocumentDownload size={16} variant="Linear" color="currentColor" />}
          onClick={onExport}
        >
          Export Statistics
        </Button>
      </div>

      <PrimaryHorizontalMenuGroup
        tabs={[
          {
            id: 'statistics',
            label: 'Statistics',
            icon: <Chart21 size={20} variant="Linear" color="currentColor" />,
          },
          {
            id: 'issues',
            label: 'Issues',
            icon: <Danger size={20} variant="Linear" color="currentColor" />,
          },
        ]}
        activeItem={tab}
        onTabClick={(id) => setTab(id as 'statistics' | 'issues')}
        showIcon
      />

      {tab === 'issues' ? (
        <Section>
          <IssuesTab experience={experience} />
        </Section>
      ) : (
        <Section
          title="Poke statistics"
          controls={
            <Menu
              open={rangeOpen}
              onClose={() => setRangeOpen(false)}
              align="right"
              trigger={
                <DropdownSelector
                  size="small"
                  text={range}
                  isOpen={rangeOpen}
                  withIcon
                  icon={<Calendar size={20} variant="Linear" color="currentColor" />}
                  onClick={() => setRangeOpen((o) => !o)}
                />
              }
            >
              {RANGES.map((value) => (
                <MenuItem
                  key={value}
                  label={value}
                  selected={value === range}
                  onClick={() => {
                    setRange(value);
                    setRangeOpen(false);
                  }}
                />
              ))}
            </Menu>
          }
        >
          <div className="flex flex-col gap-[var(--space-5)]">
            <MetricTiles
              experience={experience}
              keys={keys}
              selected={active}
              onSelect={setMetric}
            />
            <Drill experience={experience} metric={active} onViewUsers={onViewUsers} />
          </div>
        </Section>
      )}
    </div>
  );
}

/** One branch per `DrillKind`. Every kind renders — none is a dead tile. */
function Drill({
  experience,
  metric,
  onViewUsers,
}: {
  experience: Experience;
  metric: MetricKey;
  onViewUsers: () => void;
}) {
  const def = METRICS[metric];

  switch (def.drill) {
    case 'task-table':
      return <TaskCompletionTable tasks={experience.tasks} />;
    case 'hint-table':
      return <HintBreakdownTable hints={buildHintRows(experience)} />;
    case 'cta-table':
      return <CtaTable rows={buildCtaRows(experience)} />;
    case 'step-histogram':
      return <StepDropoffChart steps={buildStepDropoff(experience)} />;
    case 'dual-curve': {
      const curves = buildGoalCurves(experience);
      return (
        <MetricAreaChart
          series={[
            {
              key: 'all',
              label: 'Total goal events',
              stroke: 'var(--color-neutral-500)',
            },
            {
              key: 'during',
              label: 'During the experience',
              stroke: 'var(--color-blue-400)',
              fill: true,
            },
          ]}
          data={[curves.all, curves.during]}
          unitLabel="users"
          onViewUsers={onViewUsers}
        />
      );
    }
    default:
      return (
        <MetricAreaChart
          series={[
            { key: metric, label: def.label, stroke: 'var(--color-blue-400)', fill: true },
          ]}
          data={[buildMetricDays(experience, metric)]}
          unitLabel={UNIT_NOUN[def.unit]}
          onViewUsers={onViewUsers}
        />
      );
  }
}

/** The tooltip's noun, per unit. */
const UNIT_NOUN: Record<string, string> = {
  users: 'users',
  percent: '%',
  'percent-users': '% of users',
  'percent-completion': '% completion',
  clicks: 'clicks',
  views: 'views',
  messages: 'messages',
};
