import React from 'react';
import { SupportEmailModal } from '../../src/features/escalation/SupportEmailModal';
import { ConfigureModal } from '../../src/features/escalation/ConfigureModal';
import { TestEscalationModal } from '../../src/features/escalation/TestEscalationModal';
import { ToastProvider } from '../../src/features/escalation/toast';
import { SEEDS } from '../../src/state/seed';

const FIGMA = 'https://www.figma.com/design/5LL3WooWBeEfjNpUls93Zg/Escalation?node-id=';
const noop = () => {};

const meta = { title: 'Organisms/Modals', parameters: { layout: 'fullscreen' } };
export default meta;

const host = (node, seedFn = SEEDS.enabledEmpty) => () => {
  seedFn();
  return (
    <ToastProvider>
      <div style={{ height: '100vh', background: 'var(--color-blue-50)' }}>{node}</div>
    </ToastProvider>
  );
};

export const SupportEmail = {
  render: host(<SupportEmailModal onCancel={noop} onEnable={noop} />, SEEDS.notEnabled),
  parameters: { design: { type: 'figma', url: FIGMA + '35-4224' } },
};

export const Configure = {
  render: host(<ConfigureModal onClose={noop} />),
  parameters: { design: { type: 'figma', url: FIGMA + '35-5642' } },
};

/** No Figma artboard — the agreed stand-in for "Send a test escalation". */
export const TestEscalation = { render: host(<TestEscalationModal onClose={noop} />) };

export const Playground = {
  render: host(<ConfigureModal onClose={noop} />),
  parameters: { chromatic: { disableSnapshot: true } },
};
