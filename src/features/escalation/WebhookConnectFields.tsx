import * as React from 'react';
import { Input } from '@/components/ui/Input/Input';
import { Alert } from '@/components/ui/Infobox/alert';
import type { WebhookConfig } from '@/state/types';

/**
 * The webhook endpoint, and what will be sent to it — PRD-591.
 *
 * ## Why this is a form and not a redirect
 *
 * Escalation V1 hands off to Crisp, Intercom or Zendesk. Gojob runs Freshdesk
 * without its chat product and a chatbot they wrote themselves, so none of the
 * three applies, and buying a fourth support tool to unlock escalation was
 * never going to happen. Their ask was smaller than an integration: when the
 * agent cannot answer, POST the recap somewhere they control.
 *
 * So this sits exactly where `CrispConnectFields` sits — the section under the
 * support-tool row, belonging to the chosen tool — and is built the same way,
 * because CLAUDE.md's rule for that row is that it owns whatever that tool
 * needs. Crisp needs a token pair. This needs an endpoint.
 *
 * ## The payload preview is the point, not decoration
 *
 * Julie's question on the call was whether the hand-off could carry the
 * conversation recap, and Jade's was whether a webhook could rebuild the
 * ticket on their side. Neither is answered by a URL field. The preview below
 * answers both by showing the three things the request carries — the
 * transcript, the question that went unanswered, and who asked it — which are
 * the three the ticket names.
 *
 * It is read-only and it is a FIXTURE: nothing here posts anything. Same
 * quarantine as the rest of this prototype's vendor work.
 */
export const EMPTY_WEBHOOK: WebhookConfig = { url: '', secret: '' };

/**
 * Exported and tested rather than inlined, for the reason `normalisePreviewUrl`
 * already is in this repo: `new URL()` is perfectly happy with
 * `javascript:alert(1)` and `mailto:support@acme.com`, and this value is a
 * destination the agent would POST to. Only http(s) is a webhook.
 */
export function isWebhookUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !!url.hostname;
  } catch {
    return false;
  }
}

/** The secret is optional — the endpoint is not. */
export function webhookComplete(v: WebhookConfig) {
  return isWebhookUrl(v.url);
}

/** Invented, like every other fixture here. The SHAPE is what PRD-591 asks
 *  for; no schema is specified anywhere, so this is a proposal for one. */
const PAYLOAD_PREVIEW = `{
  "event": "escalation.requested",
  "reason": "no_answer",
  "question": "I didn't receive the reset email",
  "user": { "id": "u_8c84…", "email": "renee@acme.com" },
  "transcript": [ { "from": "user", "text": "…" } ],
  "topic": "Login Issues"
}`;

export function WebhookConnectFields({
  value,
  onChange,
  disabled,
}: {
  value: WebhookConfig;
  onChange: (next: WebhookConfig) => void;
  disabled?: boolean;
}) {
  const set = (key: keyof WebhookConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: (e.target as HTMLInputElement).value });

  // Only complain once there is something to complain about — an empty field
  // the user has not reached yet is not an error.
  const badUrl = value.url.trim().length > 0 && !isWebhookUrl(value.url);

  return (
    <>
      <Input
        label="Endpoint URL"
        placeholder="https://api.acme.com/hooks/jimo-escalation"
        value={value.url}
        onChange={set('url')}
        disabled={disabled}
        status={badUrl ? 'negative' : 'none'}
        supportiveText={
          badUrl
            ? 'Enter a full http:// or https:// URL.'
            : 'Where the hand-off is POSTed. Your system creates the ticket from it.'
        }
      />
      <Input
        label="Signing secret"
        type="password"
        placeholder="Optional"
        value={value.secret}
        onChange={set('secret')}
        disabled={disabled}
        supportiveText="Sent as an X-Jimo-Signature header so you can verify the request is ours."
      />

      <div className="flex flex-col gap-[var(--space-2)]">
        <span className="[font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
          What gets sent
        </span>
        <pre className="m-0 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-neutral-100)] p-[var(--space-3)] [font:var(--text-body-5)] text-[var(--color-text-secondary)]">
          {PAYLOAD_PREVIEW}
        </pre>
      </div>

      <Alert
        type="neutral"
        title="Any support tool"
        body="Freshdesk, Jira, HubSpot or your own service — anything that can accept a POST. The agent stops at the hand-off; creating the ticket is your side."
      />
    </>
  );
}

/** How long "Send test event" spends pretending to reach the endpoint. */
const TEST_MS = 900;

/**
 * Draft + the test beat. Mirrors `useCrispConnect` deliberately: both are the
 * same shape of thing — a form that saves a credential and pretends to verify
 * it — and two hooks that behave differently for no reason is how the two
 * flows start to drift.
 */
export function useWebhookConnect(
  initial: WebhookConfig | null,
  onConnected: (v: WebhookConfig) => void
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
      const next: WebhookConfig = { url: value.url.trim(), secret: value.secret.trim() };
      setBusy(true);
      timer.current = window.setTimeout(() => {
        setBusy(false);
        onConnected(next);
      }, TEST_MS);
    },
  };
}
