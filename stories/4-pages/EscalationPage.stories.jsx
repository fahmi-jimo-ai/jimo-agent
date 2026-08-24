import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { EscalationPage } from '../../src/features/escalation/EscalationPage';
import { ToastProvider } from '../../src/components/app/toast';
import { SEEDS } from '../../src/state/seed';

const FIGMA = 'https://www.figma.com/design/5LL3WooWBeEfjNpUls93Zg/Escalation?node-id=';

/**
 * One story per Figma artboard. Each seeds the store, then renders the real
 * page — so a story can be diffed straight against the board it came from.
 */
const meta = {
  title: 'Pages/EscalationPage',
  component: EscalationPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

const page = (seedFn, node) => ({
  render: () => {
    seedFn();
    return (
      <ToastProvider>
        {/* AppShell calls useNavigate, so a page needs a router ancestor. */}
        <MemoryRouter initialEntries={['/escalation']}>
          <div style={{ height: '810px' }}>
            <EscalationPage />
          </div>
        </MemoryRouter>
      </ToastProvider>
    );
  },
  parameters: { design: { type: 'figma', url: FIGMA + node } },
});

export const NotEnabled = page(SEEDS.notEnabled, '43-6580');
export const EnabledEmpty = page(SEEDS.enabledEmpty, '10-4841');
export const WithData = page(SEEDS.withData, '29-7085');
export const DirtyTriggers = page(SEEDS.dirtyTriggers, '29-17917');
export const TopicsAdded = page(SEEDS.topicsAdded, '34-3082');

export const Playground = {
  ...page(SEEDS.enabledEmpty, '29-7085'),
  parameters: { layout: 'fullscreen', chromatic: { disableSnapshot: true } },
};
