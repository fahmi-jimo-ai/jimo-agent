import * as React from 'react';
import { VendorMark } from '@/features/escalation/VendorMark';
import { VENDOR_LABEL, type Vendor } from '@/state/types';
import { SAMPLE_NOTE } from '@/data/fixtures';
import type { Decision } from './escalationEngine';
import { REASON_COPY } from './escalationEngine';

/** The client's own support chat, mocked. Brand colour per vendor — and for the
 *  two rows that are not a brand (Support Email, Custom webhook), Neutral/700,
 *  because inventing a colour for "your own desk" would imply a product. */
const ACCENT: Record<Vendor, string> = {
  intercom: '#1F2937',
  zendesk: '#03363D',
  crisp: '#1972F5',
  email: '#4D637B',
  webhook: '#4D637B',
};

/**
 * The vendor widget the hand-off opens. It carries the brief already posted as
 * the USER'S OWN first message — the load-bearing detail of the whole feature,
 * so it is rendered as a user bubble, not an agent one.
 *
 * The private note is shown behind a toggle labelled as operator-only, because
 * the single most important property of the note is that the end user cannot
 * see it. Here it is a teaching device, clearly marked.
 *
 * ## Custom webhook has no conversation to open — PRD-591
 *
 * Every other vendor here is a chat: the hand-off lands somewhere the end user
 * can watch a reply arrive. A webhook lands on a server, and whatever ticket it
 * creates lives in a tool this widget cannot see. Rendering a fake chat for it
 * would be the one misleading frame in the simulator, so this shows the
 * DELIVERY instead — the request, its status, and what the endpoint received.
 * That is also the honest answer to "what does my end user see": nothing here,
 * which is why the receipt says where the reply will come from.
 */
export function VendorPanel({
  vendor,
  decision,
  brief,
  onClose,
}: {
  vendor: Vendor;
  decision: Decision;
  brief: string;
  onClose: () => void;
}) {
  const [showNote, setShowNote] = React.useState(false);
  const accent = ACCENT[vendor];
  const isEmail = vendor === 'email';
  const isWebhook = vendor === 'webhook';

  return (
    <aside className="vp" aria-label={`${VENDOR_LABEL[vendor]} conversation`}>
      <header className="vp-head" style={{ background: accent }}>
        <VendorMark vendor={vendor} size={26} />
        <div className="vp-head-text">
          <strong>{VENDOR_LABEL[vendor]}</strong>
          <span>
            {isWebhook
              ? 'Posted to your endpoint'
              : isEmail
                ? 'Message sent to your support inbox'
                : 'Usually replies in a few minutes'}
          </span>
        </div>
        <button className="vp-close" onClick={onClose} aria-label="Close">×</button>
      </header>

      <div className="vp-body">
        <p className="vp-sys">
          {isWebhook ? 'Escalation delivered' : 'Conversation started from Jimo AI'}
        </p>

        <div className="vp-msg vp-msg--user">
          <p>{brief}</p>
          <span className="vp-meta">
            {isWebhook ? 'Sent in the payload · just now' : 'You · just now'}
          </span>
        </div>

        {isWebhook ? (
          // The delivery, not a reply. `202` rather than `200` because a queue
          // that accepts and processes later is the normal shape of a desk
          // integration, and a prototype that always claims a synchronous
          // success teaches the wrong expectation.
          <div className="vp-receipt">
            <div className="vp-receipt-row">
              <span className="vp-receipt-status">202</span>
              <code>POST hooks.acme.com/jimo/escalations</code>
            </div>
            <p>
              Your endpoint accepted the escalation with the full transcript, the unanswered
              question and the user’s identity. Whatever ticket it opens lives in your tool — the
              reply reaches this user from there, not from Jimo.
            </p>
          </div>
        ) : (
          <div className="vp-msg vp-msg--agent">
            <p>
              Thanks — I can see the whole history from your chat with the assistant, so you don’t need
              to repeat any of it. Give me two minutes to look at your SSO config.
            </p>
            <span className="vp-meta">Support · just now</span>
          </div>
        )}
      </div>

      <div className="vp-note">
        <button className="vp-note-toggle" onClick={() => setShowNote((v) => !v)}>
          <span className="vp-note-dot" />
          {showNote ? 'Hide' : 'Show'} what only the support agent sees
        </button>
        {showNote && (
          <div className="vp-note-body">
            <p className="vp-note-warn">
              Private note — invisible to the end user. Shown here only to make the hand-off legible.
            </p>
            <dl>
              <div><dt>Reason</dt><dd>{REASON_COPY[decision.reason]} ({decision.reason})</dd></div>
              {decision.topic && <div><dt>Topic</dt><dd>{decision.topic.label}</dd></div>}
              <div><dt>User</dt><dd>{SAMPLE_NOTE.user}</dd></div>
              <div><dt>Page</dt><dd>{SAMPLE_NOTE.page}</dd></div>
              <div><dt>Transcript</dt><dd>{SAMPLE_NOTE.transcript}</dd></div>
            </dl>
          </div>
        )}
      </div>
    </aside>
  );
}
