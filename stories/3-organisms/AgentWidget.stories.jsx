import React from 'react';
import { WidgetPage } from '../../src/features/widget/WidgetPage';
import { AgentWidget } from '../../src/features/widget/AgentWidget';
import { SEEDS } from '../../src/state/seed';
import { setSources } from '../../src/state/useKnowledge';
import { DEMO_SOURCES } from '../../src/data/knowledgeSources';
import '../../src/styles/widget.css';
import '../../src/styles/widget-proposals.css';
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

/* ── The five states this repo has no host app to reach ────────────────────
   `escalationEngine` produces idle / expanded / thinking / response and those
   are the four stories above. The rest are the prototype's CRM-agent flows —
   asking a clarifying question, guiding a user through a form, executing steps
   for them — and they render here as LAYOUT, through `AgentWidget`'s `state`
   override, so widget.css's `.ag-pill`, `.ag-runlog`, `.ag-botbar` and
   `.ag-opt-*` rules have their nodes and each frame can be shot and diffed.
   See the component's header comment for why they are not wired.

   The reference is trigger-demo's `builder/src/prototype/prototype.html`, not a
   Figma artboard, so none of these carries a `design` parameter. */
const frame = (state) => ({
  render: () => {
    SEEDS.withData();
    return (
      <div className="wp">
        <div className="wp-agent">
          <AgentWidget state={state} onHandoff={() => {}} />
        </div>
      </div>
    );
  },
  parameters: { layout: 'fullscreen' },
});

/** One window, one body: the question, the option rows and the answer footer
 *  are all children of `.ag-win-body`. There is no second panel. */
export const Asking = frame('asking');

/** The status pill, collapsed. Click it to open the run log above it. */
export const GuideWaiting = frame('guide-waiting');

/** Same pill on its spinner face — `is-spin`, not `is-icon`. */
export const GuideChecking = frame('guide-checking');

/** Execute: the bottom bar has replaced the input bar entirely. */
export const ExecuteAction = frame('execute-action');

export const ExecuteThinking = frame('execute-thinking');

/* ── The proposal frames ───────────────────────────────────────────────────
   Three tickets, three slots that the ported prototype has no equivalent for.
   Their styles live in `widget-proposals.css`, imported above — see that file's
   header for why they are not in widget.css. */

/**
 * PRD-590 — an article hosted in Jimo, read inside the product. Needs sources
 * in the store, which `SEEDS` does not touch: it seeds escalation, and the
 * knowledge store starts empty by design.
 */
export const ReadingArticle = {
  render: () => {
    SEEDS.withData();
    setSources(DEMO_SOURCES());
    return (
      <div className="wp">
        <div className="wp-agent">
          <AgentWidget state="reading" onHandoff={() => {}} />
        </div>
      </div>
    );
  },
  parameters: { layout: 'fullscreen' },
};

/**
 * PRD-590 — the same articles as a list, under the starter chips. This is the
 * entry point the reader above is reached from, and the reason the knowledge
 * base is a READING surface rather than only a training one.
 */
export const KnowledgeBaseList = {
  render: () => {
    SEEDS.withData();
    setSources(DEMO_SOURCES());
    return (
      <div className="wp">
        <div className="wp-agent">
          <AgentWidget state="expanded" onHandoff={() => {}} />
        </div>
      </div>
    );
  },
  parameters: { layout: 'fullscreen' },
};

/**
 * PRD-595 — the thinking panel mid-accumulation. Not reachable as a static
 * frame through the `state` override alone: the step index advances on a timer,
 * so this shows the first step and the story is here for the layout, with the
 * full sequence visible by asking a question in `Live`.
 */
export const Thinking = frame('thinking');
