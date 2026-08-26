import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { StatisticsPage } from '../../src/features/statistics/StatisticsPage';
import { ToastProvider } from '../../src/components/app/toast';
import { seedAnalytics, ANALYTICS_SEEDS } from '../../src/state/seed';

const FIGMA = 'https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=';

/**
 * The artboard draws Statistics as the first tab of a page called "Analyze".
 * It ships as its own route, so these stories render /statistics with no tab
 * bar — see StatisticsPage's header comment.
 *
 * The page persists its view state, so every story seeds the store first or it
 * inherits whatever the previous story left behind.
 */
const meta = {
  title: 'Pages/StatisticsPage',
  component: StatisticsPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

const page = (seedFn, node) => ({
  render: () => {
    seedFn();
    return (
      <ToastProvider>
        {/* AppShell calls useNavigate, so a page needs a router ancestor. */}
        <MemoryRouter initialEntries={['/statistics']}>
          <div style={{ height: '810px' }}>
            <StatisticsPage />
          </div>
        </MemoryRouter>
      </ToastProvider>
    );
  },
  parameters: node
    ? { layout: 'fullscreen', design: { type: 'figma', url: FIGMA + node } }
    : { layout: 'fullscreen' },
});

/** Figma 934:27943 — the populated page, Success Rate selected. */
export const Default = page(ANALYTICS_SEEDS.statistics, '934-27943');

/* Tile selection drives the chart, so each metric gets a story. The artboard
   only draws the Success Rate tile selected, so these three carry no `design`
   parameter — there is nothing to diff them against. */
export const CopilotOpened = page(() => seedAnalytics({ metric: 'opened' }));
export const TotalMessages = page(() => seedAnalytics({ metric: 'messages' }));
export const UniqueUsers = page(() => seedAnalytics({ metric: 'users' }));

/** A narrower window, to show the range picker genuinely re-plotting. */
export const LastSevenDays = page(() => seedAnalytics({ range: 'last-7-days' }));

/**
 * Zeroed tiles and a bare grid. Invented, and labelled as such: Figma drew no
 * empty state for Statistics, so there is no node to diff this against.
 */
export const NoData = page(ANALYTICS_SEEDS.statisticsNoData);

export const Playground = {
  ...page(ANALYTICS_SEEDS.statistics, '934-27943'),
  parameters: { layout: 'fullscreen', chromatic: { disableSnapshot: true } },
};
