import * as React from 'react';
import { AgentWidget } from './AgentWidget';
import { VendorPanel } from './VendorPanel';
import { useEscalation } from '@/state/useEscalation';
import type { Decision } from './escalationEngine';

/**
 * The standalone widget tab. It reads the same localStorage config the
 * dashboard writes, and re-renders on `storage`, so changing a trigger on the
 * dashboard takes effect here without a reload.
 */
export function WidgetPage() {
  const { enabled, vendor } = useEscalation();
  const [handoff, setHandoff] = React.useState<{ decision: Decision; brief: string } | null>(null);

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

      <div className="wp-agent">
        <AgentWidget onHandoff={(decision, brief) => setHandoff({ decision, brief })} />
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
