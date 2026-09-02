import * as React from 'react';
import { ArrowDown2 } from 'iconsax-react';
import { Input } from '@/components/ui/Input/Input';
import { Alert } from '@/components/ui/Infobox/alert';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import {
  WEBHOOK_EVENTS,
  WEBHOOK_EVENT_HINT,
  WEBHOOK_EVENT_LABEL,
  type WebhookConfig,
  type WebhookEvent,
} from '@/state/types';

/**
 * The Custom webhook endpoint form — PRD-591, with PRD-592's event catalogue.
 *
 * ## Why this is a vendor and not a new page
 *
 * Escalation V1 hands off to Crisp, Intercom or Zendesk. A customer running
 * Freshdesk, or their own desk, has no path at all — and will not buy a fourth
 * support tool to unlock one. So the fifth row of the tool selector is not a
 * fourth vendor integration, it is the escape hatch: we POST what we know, they
 * create the ticket in whatever they already run.
 *
 * That places it exactly where CLAUDE.md says a tool's needs belong — "the
 * support tool row owns whatever that tool needs". Crisp is the precedent: the
 * one vendor that is a credentials form rather than an OAuth redirect, so the
 * one vendor with state persisted locally. This is the second.
 *
 * ## The two tickets are one surface
 *
 * PRD-591 wants the hand-off; PRD-592 wants the raw conversation events. Both
 * are "push this to my endpoint", and splitting them would ask a customer to
 * configure the same URL twice, in two places, to get one integration. So the
 * event checklist lives in this form: `escalation` is PRD-591 and is checked by
 * default, the other three are PRD-592 and are opt-in.
 *
 * ## https only, and why that is stricter than the preview field
 *
 * `normalisePreviewUrl` accepts http, because it only opens a tab. This payload
 * carries a full transcript, the end user's identity, and — when a secret is
 * set — a signature derived from it. Sending that in clear text is not a
 * trade-off a prototype should model as acceptable, so http is rejected here
 * rather than warned about.
 */

/** What the receiving endpoint gets. Shown, not just described — the shape is
 *  the integration, and a customer sizing this up is asking "can I parse it". */
const PAYLOAD_PREVIEW = `{
  "event": "escalation",
  "conversation_id": "cnv_8f21ac",
  "reason": "explicit_request",
  "question": "The SSO login still doesn't work",
  "user": {
    "id": "u_4471",
    "email": "julie@gojob.com"
  },
  "transcript": [
    { "role": "user", "text": "..." },
    { "role": "agent", "text": "..." }
  ]
}`;

export const EMPTY_WEBHOOK: WebhookConfig = {
  url: '',
  secret: '',
  // PRD-591's event. A webhook with nothing checked would be a connected
  // integration that never fires, so the hand-off is on from the start.
  events: ['escalation'],
};

/**
 * The endpoint we would actually POST to.
 *
 * Deliberately narrower than `normalisePreviewUrl`: https only (see the header),
 * and the same credentials and bare-word rejections, because `new URL()` is
 * just as happy with `javascript:` here as it is there.
 */
export function normaliseWebhookUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // A bare host is what people paste out of their API docs. Give it a scheme
  // before parsing, or "hooks.acme.com" parses as a relative URL.
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  // The one rule this does not share with the preview field.
  if (url.protocol !== 'https:') return null;
  // A scheme without `//` slips past the regex above and parses as credentials
  // — "mailto:you@acme.com" becomes user `mailto`, password `you`.
  if (url.username || url.password) return null;
  // A single word would otherwise resolve against the dashboard's own host.
  if (!url.hostname.includes('.')) return null;
  return url.toString();
}

/** An endpoint and at least one event. A secret is optional — plenty of desks
 *  authenticate by URL alone, and requiring one would block those. */
export function webhookComplete(v: WebhookConfig) {
  return normaliseWebhookUrl(v.url) != null && v.events.length > 0;
}

export function WebhookConnectFields({
  value,
  onChange,
  disabled,
}: {
  value: WebhookConfig;
  onChange: (next: WebhookConfig) => void;
  disabled?: boolean;
}) {
  const [touched, setTouched] = React.useState(false);
  const urlInvalid = touched && value.url.trim().length > 0 && normaliseWebhookUrl(value.url) == null;

  const toggle = (event: WebhookEvent) => (checked: boolean | 'indeterminate') =>
    onChange({
      ...value,
      events: checked === true
        ? [...value.events, event]
        : value.events.filter((e) => e !== event),
    });

  return (
    <>
      <Input
        label="Endpoint URL"
        placeholder="https://hooks.acme.com/jimo/escalations"
        value={value.url}
        onChange={(e) => onChange({ ...value, url: (e.target as HTMLInputElement).value })}
        onBlur={() => setTouched(true)}
        disabled={disabled}
        status={urlInvalid ? 'negative' : 'none'}
        supportiveText={
          urlInvalid
            ? 'Enter an https:// address. The payload carries a transcript, so http is not accepted.'
            : 'Where we POST the hand-off. Must be https.'
        }
      />
      <Input
        label="Signing secret (Optional)"
        type="password"
        placeholder="whsec_…"
        value={value.secret}
        onChange={(e) => onChange({ ...value, secret: (e.target as HTMLInputElement).value })}
        disabled={disabled}
        supportiveText="Sent as an X-Jimo-Signature header so you can verify the call came from us."
      />

      <div className="flex flex-col gap-[var(--space-2)]">
        <span className="[font:var(--text-body-3)] text-[var(--color-text-primary)]">
          Events to send
        </span>
        <div className="flex flex-col gap-[var(--space-3)]">
          {WEBHOOK_EVENTS.map((event) => (
            <div key={event} className="flex flex-col gap-[var(--space-1)]">
              <Checkbox
                checked={value.events.includes(event)}
                onCheckedChange={toggle(event)}
                disabled={disabled}
                label={WEBHOOK_EVENT_LABEL[event]}
              />
              {/* Indented to the label, not the box: the hint belongs to the
                  row's text, and lining it up under the checkbox would read as
                  a second, unchecked option. */}
              <span className="pl-[var(--space-8)] [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
                {WEBHOOK_EVENT_HINT[event]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <PayloadPreview />

      <Alert
        type="neutral"
        title="What happens on your side"
        body="We POST once per event and retry twice on a non-2xx. Create the ticket, queue the job, or drop it in a channel — the transcript is in the body, so nothing has to be fetched back."
      />
    </>
  );
}

/**
 * The payload, collapsed by default.
 *
 * A `<details>` rather than a Menu or a modal step: it is reference material
 * read once while filling the field above it, so it must be able to sit OPEN
 * next to that field. A floating layer would cover the form it explains, and a
 * step would leave the form to go and read about it.
 */
function PayloadPreview() {
  return (
    <details className="group flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border-default)]">
      <summary className="flex cursor-pointer list-none items-center gap-[var(--space-2)] p-[var(--space-3)] [font:var(--text-subtitle-4)] text-[var(--color-text-secondary)] marker:content-none hover:text-[var(--color-text-primary)] [&::-webkit-details-marker]:hidden">
        {/* Without a caret this row reads as an empty input, not a disclosure —
            it sits directly under two real fields. `rotate`, not `transform`:
            Tailwind v4 compiles `rotate-180` to the standalone property, so a
            transition naming transform never fires. */}
        <span
          aria-hidden="true"
          className="flex size-4 shrink-0 items-center justify-center [transition:rotate_var(--transition-fast)] group-open:rotate-180"
        >
          <ArrowDown2 size={16} variant="Linear" color="currentColor" />
        </span>
        Example payload
      </summary>
      {/* Height-capped, and that is load-bearing rather than cosmetic:
          `ModalCard` is `overflow-hidden` with no max-height (the height ease
          needs it), so a card taller than the viewport puts its own footer out
          of reach with nothing to scroll. Fourteen lines of JSON expanding
          inline is enough to do that on a laptop. The payload scrolls in its
          own box instead, which is also the better read — it is reference
          material, not something to page through. */}
      <pre className="m-0 max-h-[200px] overflow-auto border-t border-[var(--color-border-default)] bg-[var(--color-neutral-50)] p-[var(--space-3)] [font:var(--text-body-4)] text-[var(--color-text-secondary)]">
        {PAYLOAD_PREVIEW}
      </pre>
    </details>
  );
}

/** How long "Connect and test" spends pretending to reach the endpoint. */
const TEST_MS = 900;

/**
 * Draft + the "Connect and test" beat — the same shape as `useCrispConnect`,
 * for the same reason: the button says "and test", so a save that returned
 * instantly would make the label a lie. The timer is cleared on unmount because
 * the dialog can close mid-beat via its own close button or Escape.
 */
export function useWebhookConnect(
  initial: WebhookConfig | null,
  onConnected: (v: WebhookConfig) => void,
) {
  const [value, setValue] = React.useState<WebhookConfig>(initial ?? EMPTY_WEBHOOK);
  const [busy, setBusy] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return {
    value,
    setValue,
    busy,
    canSubmit: webhookComplete(value) && !busy,
    submit: () => {
      if (busy || !webhookComplete(value)) return;
      // Stored normalised, not as typed: this is the value a POST would use,
      // and "hooks.acme.com" and "https://hooks.acme.com/" must not read as two
      // different endpoints on the row that displays it.
      const next: WebhookConfig = {
        url: normaliseWebhookUrl(value.url)!,
        secret: value.secret.trim(),
        events: value.events,
      };
      setBusy(true);
      timer.current = window.setTimeout(() => {
        setBusy(false);
        onConnected(next);
      }, TEST_MS);
    },
  };
}
