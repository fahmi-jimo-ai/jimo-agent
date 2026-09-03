import * as React from 'react';
import { Calendar, DocumentDownload } from 'iconsax-react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Section } from '@/components/ui/Section/Section';
import { Button } from '@/components/ui/Button/Button';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { Menu, MenuItem } from '@/components/app/Menu';
import { AppShell } from '@/app/AppShell';
import { UpdatedMeta } from '@/app/UpdatedMeta';
import { useToast } from '@/components/app/toast';
import { StatTiles } from './StatTiles';
import { UsageChart } from './UsageChart';
import { UsersReachedSection } from './UsersReachedSection';
import { useAnalytics, setAnalytics } from '@/state/useAnalytics';
import { RANGE_LABEL, type AnalyticsRange } from '@/state/types';

/**
 * Statistics — Figma 934:27943.
 *
 * The artboard draws this as the first tab of a page called "Analyze", sharing
 * a `Statistics | Conversations` tab bar with the conversation inbox. It ships
 * as its own route instead: `AGENT_NAV_SECTIONS` has always listed the two as
 * peer sidebar items, and a tab bar under the title was a second switcher
 * competing for the same choice. So: own title, no tabs, sidebar switches.
 * Everything below the header follows the artboard as drawn.
 */
export function StatisticsPage() {
  const { hasData, range, metric, segment, grouping } = useAnalytics();
  const toast = useToast();
  const [rangeOpen, setRangeOpen] = React.useState(false);

  // Invented, and labelled as such: no Figma frame follows any of these, so the
  // prototype acknowledges the click and stops. Same contract as KnowledgePage's
  // "Test Knowledge".
  const outOfScope = (title: string, body: string) => () =>
    toast({ type: 'neutral', title, body });

  const exportCsv = outOfScope(
    'Export is out of scope',
    'Report exports are generated server-side, which this prototype does not model.'
  );

  return (
    <AppShell
      activeItem="Statistics"
      header={<PageHeader title="Statistics" showTabs={false} showButtonGroup={false} meta={<UpdatedMeta />} />}
    >
      <div>
        <Menu
          open={rangeOpen}
          onClose={() => setRangeOpen(false)}
          trigger={
            <DropdownSelector
              size="big"
              text={RANGE_LABEL[range]}
              isOpen={rangeOpen}
              withIcon
              icon={<Calendar size={20} variant="Linear" color="currentColor" />}
              onClick={() => setRangeOpen((o) => !o)}
            />
          }
        >
          {(Object.keys(RANGE_LABEL) as AnalyticsRange[]).map((r) => (
            <MenuItem
              key={r}
              label={RANGE_LABEL[r]}
              selected={r === range}
              onClick={() => {
                setAnalytics({ range: r });
                setRangeOpen(false);
              }}
            />
          ))}
        </Menu>
      </div>

      <Section
        title="Statistics"
        controls={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<DocumentDownload size={20} variant="Linear" color="currentColor" />}
            onClick={exportCsv}
          >
            Export as CSV
          </Button>
        }
      >
        <div className="flex flex-col gap-[var(--space-6)]">
          <StatTiles
            metric={metric}
            hasData={hasData}
            onSelect={(m) => setAnalytics({ metric: m })}
          />
          <UsageChart
            metric={metric}
            range={range}
            hasData={hasData}
            onViewUsers={outOfScope(
              'Per-day user drill-down is out of scope',
              'The artboard links out to a user list this prototype does not build.'
            )}
          />
        </div>
      </Section>

      <UsersReachedSection
        segment={segment}
        onSegment={(s) => setAnalytics({ segment: s })}
        grouping={grouping}
        onGrouping={(g) => setAnalytics({ grouping: g })}
        onExport={exportCsv}
        onSeeAll={outOfScope(
          grouping === 'company'
            ? 'The full company list is out of scope'
            : 'The full user list is out of scope',
          'This prototype ships the handful of rows the artboard draws.'
        )}
      />
    </AppShell>
  );
}
