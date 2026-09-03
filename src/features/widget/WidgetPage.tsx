import * as React from 'react';
import { AgentWidget, type WState } from './AgentWidget';
import { VendorPanel } from './VendorPanel';
import { useEscalation } from '@/state/useEscalation';
import type { Decision } from './escalationEngine';

/* ── PROPOSAL — the state picker ───────────────────────────────────────────
   `AgentWidget` has always taken a `state` override, and until now only
   Storybook passed it. That is fine for diffing a frame and useless for
   review: the states a ticket is ABOUT — the failed run, the long wait —
   could not be reached on the deployed build at all, only in a Storybook
   nobody opens to answer a design question.

   So the widget tab exposes the override it already had. `null` is the live
   engine, unchanged and still the default, so nothing about the normal path
   moves. Everything else freezes the engine and shows one frame.

   `thinking` is in the list on purpose: PRD-595's counter and its "still
   working" line only appear once the wait is long enough to be read as a dead
   chat, and the live engine answers in 1.8s. Hold it here and it crosses. */
const PREVIEW: Array<{ label: string; state: WState | null; note?: string }> = [
  { label: 'Live', state: null, note: 'The escalation engine, as configured' },
  { label: 'Thinking', state: 'thinking', note: 'PRD-595 — the wait counts itself, and speaks up at 5s' },
  { label: 'Asking', state: 'asking' },
  { label: 'Guide · waiting', state: 'guide-waiting' },
  { label: 'Guide · checking', state: 'guide-checking' },
  { label: 'Execute · action', state: 'execute-action' },
  { label: 'Execute · thinking', state: 'execute-thinking' },
  { label: 'Execute · failed', state: 'execute-failed', note: 'PRD-599 — click the pill for the cause' },
];

/**
 * The standalone widget tab. It reads the same localStorage config the
 * dashboard writes, and re-renders on `storage`, so changing a trigger on the
 * dashboard takes effect here without a reload.
 */
export function WidgetPage() {
  const { enabled, vendor } = useEscalation();
  const [handoff, setHandoff] = React.useState<{ decision: Decision; brief: string } | null>(null);
  const [preview, setPreview] = React.useState<WState | null>(null);
  const active = PREVIEW.find((p) => p.state === preview) ?? PREVIEW[0];

  return (
    <div className="wp">
      <div className="wp-host">
        <h1>Acme — Settings</h1>
        <p>
          A stand-in for the customer’s own app. What matters is the widget below: it is running the
          escalation rules configured on the Escalation page, live.
        </p>
        <div className="wp-rows">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="wp-row" />)}
        </div>

        <p className="wp-hint">
          {enabled && vendor ? (
            <>
              Try <code>How do I set up SSO?</code> for a normal answer,{' '}
              <code>I want to talk to a human</code> to escalate immediately, or say an answer{' '}
              <code>didn’t work</code> enough times to hit your threshold.
            </>
          ) : (
            <>Escalation is off. Enable it on the Escalation page and this tab will pick it up.</>
          )}
        </p>
      </div>

      {/* PROPOSAL — simulator chrome, not part of the widget. It is styled to
          read as a tool sitting on top of the mock app rather than as anything
          the end user would see. */}
      <aside className="wp-preview">
        <p className="wp-preview-title">Preview state</p>
        <div className="wp-preview-list">
          {PREVIEW.map((p) => (
            <button
              key={p.label}
              type="button"
              className={`wp-preview-btn${p.state === preview ? ' is-on' : ''}`}
              aria-pressed={p.state === preview}
              onClick={() => setPreview(p.state)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {active.note && <p className="wp-preview-note">{active.note}</p>}
      </aside>

      <div className="wp-agent">
        <AgentWidget
          state={preview ?? undefined}
          onHandoff={(decision, brief) => setHandoff({ decision, brief })}
        />
      </div>

      {handoff && vendor && (
        <VendorPanel
          vendor={vendor}
          decision={handoff.decision}
          brief={handoff.brief}
          onClose={() => setHandoff(null)}
        />
      )}
    </div>
  );
}
