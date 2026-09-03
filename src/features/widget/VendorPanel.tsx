import * as React from 'react';
import { VendorMark } from '@/features/escalation/VendorMark';
import { useEscalation } from '@/state/useEscalation';
import { VENDOR_LABEL, type Vendor } from '@/state/types';
import { SAMPLE_NOTE } from '@/data/fixtures';
import type { Decision } from './escalationEngine';
import { REASON_COPY } from './escalationEngine';

/** The client's own support chat, mocked. Brand colour per vendor.
 *  The two non-brands — Support Email and Webhook (PRD-591) — share the
 *  neutral, because inventing a colour for either would be inventing a logo. */
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
  const { webhook } = useEscalation();
  const [showNote, setShowNote] = React.useState(false);
  const accent = ACCENT[vendor];
  const isEmail = vendor === 'email';
  /* PRD-591. A webhook hand-off is not a conversation and nobody is going to
     reply in it, so this panel must not pretend otherwise: the second bubble
     is a delivery receipt rather than a support agent's answer. Everything
     above it is unchanged, because the brief IS still what was sent. */
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
        <p className="vp-sys">Conversation started from Jimo AI</p>

        <div className="vp-msg vp-msg--user">
          <p>{brief}</p>
          <span className="vp-meta">You · just now</span>
        </div>

        {isWebhook ? (
          <div className="vp-msg vp-msg--agent">
            <p>
              <strong>202 Accepted</strong>
              <br />
              {webhook?.url ?? 'your endpoint'}
              <br />
              Your system creates the ticket from here — Jimo’s part is done.
            </p>
            <span className="vp-meta">Delivery receipt · just now</span>
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
