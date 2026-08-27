import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ConversationsPage } from '../../src/features/conversations/ConversationsPage';
import { ToastProvider } from '../../src/components/app/toast';
import { seedAnalytics, ANALYTICS_SEEDS } from '../../src/state/seed';

const FIGMA = 'https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=';

/**
 * Conversations, as its own route rather than the second tab of "Analyze".
 * One story per artboard, each seeding the store then rendering the real page.
 */
const meta = {
  title: 'Pages/ConversationsPage',
  component: ConversationsPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

const page = (seedFn, node) => ({
  render: () => {
    seedFn();
    return (
      <ToastProvider>
        <MemoryRouter initialEntries={['/conversations']}>
          <div style={{ height: '810px' }}>
            <ConversationsPage />
          </div>
        </MemoryRouter>
      </ToastProvider>
    );
  },
  parameters: node
    ? { layout: 'fullscreen', design: { type: 'figma', url: FIGMA + node } }
    : { layout: 'fullscreen' },
});

/** Figma 934:28534 — the populated inbox, first conversation selected. */
export const Default = page(ANALYTICS_SEEDS.conversations, '934-28534');

/**
 * Figma 934:29319. Same page; the artboard has the row kebab open, which a
 * story cannot seed (the menu is component state), so this lands on the frame's
 * other distinguishing feature — a conversation further down the list.
 */
export const SecondSelected = page(
  () => seedAnalytics({ convoSelectedId: 'c4' }),
  '934-29319'
);

/** Figma 934:30359 — nothing has happened yet. Note there is NO toolbar. */
export const Empty = page(ANALYTICS_SEEDS.conversationsEmpty, '934-30359');

/** Figma 934:30109 — "Jim" matches nothing. The toolbar stays; Clear Filters returns. */
export const NoResults = page(ANALYTICS_SEEDS.conversationsNoResults, '934-30109');

/** A response filter narrowing the list — no artboard, so no design parameter. */
export const OnlyNotHelpful = page(() => seedAnalytics({ convoResponse: 'not-helpful' }));

export const Playground = {
  ...page(ANALYTICS_SEEDS.conversations, '934-28534'),
  parameters: { layout: 'fullscreen', chromatic: { disableSnapshot: true } },
};
