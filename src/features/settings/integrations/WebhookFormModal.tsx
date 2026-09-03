import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { ModalCard } from '@/components/app/ModalCard';
import { WEBHOOK_EVENT_CATEGORIES } from '@/data/settings';
import type { Webhook } from '@/state/useSettings';

/**
 * Add / edit a webhook. INVENTED layout — no artboard draws this screen — from
 * help.usejimo.com/docs/for-developers/for-developers/webhooks: "Add new
 * webhooks by specifying an endpoint and selecting events."
 *
 * The six categories are the docs' own list, verbatim.
 *
 * Add and Edit are ONE card, as SkillFormModal already establishes, and delete
 * is a `confirm` STEP of it rather than a second dialog.
 */
export function WebhookFormModal({
  existing,
  onClose,
  onSave,
  onDelete,
}: {
  existing?: Webhook;
  onClose: () => void;
  onSave: (endpoint: string, events: string[]) => void;
  onDelete?: () => void;
}) {
  const [step, setStep] = React.useState<'form' | 'delete'>('form');
  const [endpoint, setEndpoint] = React.useState(existing?.endpoint ?? '');
  const [events, setEvents] = React.useState<string[]>(existing?.events ?? []);

  // An endpoint Jimo POSTs to must be a real absolute http(s) URL. `new URL()`
  // alone would happily accept `javascript:` — the same trap normalisePreviewUrl
  // documents — so the protocol is checked explicitly.
  const validEndpoint = (() => {
    const v = endpoint.trim();
    if (v === '') return false;
    try {
      const u = new URL(v);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch {
      return false;
    }
  })();

  const valid = validEndpoint && events.length > 0;

  const toggle = (id: string) =>
    setEvents((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  return (
    <ModalCard
      title={step === 'delete' ? 'Delete this webhook?' : existing ? 'Edit webhook' : 'Add webhook'}
      variant={step === 'delete' ? 'confirm' : 'card'}
      step={step}
      direction={step === 'form' ? 'back' : 'forward'}
      onClose={onClose}
      footer={
        step === 'delete' ? (
          <>
            <Button variant="outline" onClick={() => setStep('form')}>
              Cancel
            </Button>
            <Button danger onClick={onDelete}>
              Delete webhook
            </Button>
          </>
        ) : (
          <>
            {existing && onDelete ? (
              <Button variant="link" danger onClick={() => setStep('delete')}>
                Delete
              </Button>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button disabled={!valid} onClick={() => onSave(endpoint.trim(), events)}>
              {existing ? 'Save webhook' : 'Add webhook'}
            </Button>
          </>
        )
      }
    >
      {step === 'delete' ? (
        <>Jimo will stop sending events to this endpoint. Past delivery logs are removed with it.</>
      ) : (
        <div className="flex flex-col gap-[var(--space-5)]">
          <Input
            label="Endpoint URL"
            placeholder="https://api.yourapp.com/jimo/webhook"
            value={endpoint}
            status={endpoint !== '' && !validEndpoint ? 'negative' : 'none'}
            supportiveText={
              endpoint !== '' && !validEndpoint
                ? 'Enter an absolute http:// or https:// URL.'
                : 'Jimo POSTs a JSON payload here. A response of 400 or above counts as a failure.'
            }
            onChange={(e) => setEndpoint((e.target as HTMLInputElement).value)}
          />

          <div className="flex flex-col gap-[var(--space-3)]">
            <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
              Events
            </span>
            {WEBHOOK_EVENT_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="flex items-start gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-[var(--space-3)] text-left"
                onClick={() => toggle(c.id)}
              >
                <Checkbox checked={events.includes(c.id)} aria-hidden tabIndex={-1} />
                <span className="flex min-w-0 flex-col gap-[2px]">
                  <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                    {c.label}
                  </span>
                  <span className="[font:var(--text-body-4)] text-[var(--color-text-secondary)]">
                    {c.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </ModalCard>
  );
}
