import React from 'react';
import { SupportEmailModal } from '../../src/features/escalation/SupportEmailModal';
import { CrispConnectModal } from '../../src/features/escalation/CrispConnectModal';
import { ConfigureModal } from '../../src/features/escalation/ConfigureModal';
import { ToastProvider } from '../../src/components/app/toast';
import { SEEDS, seed } from '../../src/state/seed';

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

/** 105:4515 — a chat vendor connected, so the tool card grows its Configure row. */
export const ConfigureChatVendor = {
  render: host(<ConfigureModal onClose={noop} />, () =>
    seed({ enabled: true, vendor: 'intercom', hasHandoffs: true })
  ),
  parameters: { design: { type: 'figma', url: FIGMA + '105-4515' } },
};

/** 105:4514 (left) — Support Email at rest: the address, read-only, plus Change. */
export const ConfigureSupportEmail = {
  render: host(<ConfigureModal onClose={noop} />, () =>
    seed({ enabled: true, vendor: 'email', supportEmail: 'support@acme.com', hasHandoffs: true })
  ),
  parameters: { design: { type: 'figma', url: FIGMA + '105-4514' } },
};

/**
 * 105:4514 (right) — the same section in edit. Reached by switching the tool to
 * Support Email with no address saved, which is the state the section opens in.
 */
export const ConfigureSupportEmailEditing = {
  render: host(<ConfigureModal onClose={noop} />, () =>
    seed({ enabled: true, vendor: 'email', supportEmail: null, hasHandoffs: true })
  ),
  parameters: { design: { type: 'figma', url: FIGMA + '105-4514' } },
};

/** The credentials form, as reached from the hero's enable menu. */
export const ConnectCrisp = {
  render: host(<CrispConnectModal onCancel={noop} onConnected={noop} />, SEEDS.notEnabled),
};

export const Playground = {
  render: host(<ConfigureModal onClose={noop} />),
  parameters: { chromatic: { disableSnapshot: true } },
};
