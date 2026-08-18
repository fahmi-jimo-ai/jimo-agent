import React from 'react';
import { WidgetPage } from '../../src/features/widget/WidgetPage';
import { SEEDS } from '../../src/state/seed';
import '../../src/styles/widget.css';
import '../../src/styles/widget-host.css';

const meta = {
  title: 'Organisms/AgentWidget',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The end-user widget, running the escalation rules from the dashboard. Type ' +
          '"I want to talk to a human" to escalate immediately, or say an answer "did not work" ' +
          'until the configured threshold is hit to get the hand-off card.',
      },
    },
  },
};
export default meta;

const widget = (seedFn) => ({
  render: () => {
    seedFn();
    return <WidgetPage />;
  },
});

export const Live = widget(() => SEEDS.withData());
export const EscalationOff = widget(() => SEEDS.notEnabled());

export const Playground = { ...Live, parameters: { layout: 'fullscreen', chromatic: { disableSnapshot: true } } };
