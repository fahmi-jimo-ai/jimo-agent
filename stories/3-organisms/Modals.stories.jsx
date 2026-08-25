import React from 'react';
import { SupportEmailModal } from '../../src/features/escalation/SupportEmailModal';
import { CrispConnectModal } from '../../src/features/escalation/CrispConnectModal';
import { ConfigureModal } from '../../src/features/escalation/ConfigureModal';
import { ModalCard } from '../../src/components/app/ModalCard';
import { Button } from '../../src/components/ui/Button/Button';
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

/* ----
 * ModalCard's second shape. `variant="confirm"` is 112:4938 — headerless, no
 * close button, centred, 440 wide, two equal buttons. It is a variant rather
 * than a sibling component because it is only ever reached from inside a flow
 * ModalCard is already running, so the same card morphs into it; see the
 * component's header comment.
 * ---- */

/** 112:4938 — the shape itself, with the artboard's own placeholder copy. */
export const Confirm = {
  render: host(
    <ModalCard
      variant="confirm"
      title="Question Title?"
      onClose={noop}
      footer={
        <>
          <Button variant="outline" onClick={noop}>
            Secondary action
          </Button>
          <Button onClick={noop}>Primary action</Button>
        </>
      }
    >
      Lorem ipsum dolor sir 1 sentence thing
    </ModalCard>,
    SEEDS.notEnabled
  ),
  parameters: { design: { type: 'figma', url: FIGMA + '112-4938' } },
};

/**
 * The real instance, as the Configuration card morphs into it when the Enable
 * switch is turned off. The artboard's primary is navy, which stays the
 * variant's default — a destructive confirm opts into `danger` on the button.
 */
export const ConfirmDestructive = {
  render: host(
    <ModalCard
      variant="confirm"
      title="Disable escalation?"
      onClose={noop}
      footer={
        <>
          <Button variant="outline" onClick={noop}>
            Cancel
          </Button>
          <Button danger onClick={noop}>
            Disable escalation
          </Button>
        </>
      }
    >
      Your agent will stop routing requests to Intercom — your triggers, topics and connection stay
      saved.
    </ModalCard>,
    SEEDS.notEnabled
  ),
  parameters: { design: { type: 'figma', url: FIGMA + '112-4938' } },
};

export const Playground = {
  render: host(<ConfigureModal onClose={noop} />),
  parameters: { chromatic: { disableSnapshot: true } },
};
