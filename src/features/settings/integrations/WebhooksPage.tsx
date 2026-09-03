import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Add, Refresh } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { Switch } from '@/components/ui/Toggle/switch';
import { Section } from '@/components/ui/Section/Section';
import { Alert } from '@/components/ui/Infobox/alert';
import { Menu, MenuItem } from '@/components/app/Menu';
import { useToast } from '@/components/app/toast';
import { formatRelative } from '@/lib/formatRelative';
import {
  useSettings,
  setWebhooks,
  withWebhookAdded,
  withWebhookPatched,
  withWebhookRemoved,
  type Webhook,
} from '@/state/useSettings';
import {
  makeWebhookId,
  WEBHOOK_EVENT_CATEGORIES,
  WEBHOOK_RETRY_SCHEDULE,
} from '@/data/settings';
import { SettingsShell } from '../SettingsShell';
import { CodeBlock } from '../CodeBlock';
import { WebhookFormModal } from './WebhookFormModal';

/**
 * `/settings/integrations/webhooks` — INVENTED layout, docs-sourced content.
 *
 * No artboard draws this screen. The artboards DO put a Webhooks item at the
 * top level of the settings sidebar, and the docs put the page at
 * Settings → Integrations → Webhooks, so the nav item keeps the artboard's
 * position and routes to the docs' address.
 *
 * Everything factual here is from
 * help.usejimo.com/docs/for-developers/for-developers/webhooks: the six event
 * categories, "a webhook request failed if the status code returned by your
 * endpoint is 400 or above", the retry schedule, the manual retry, and the
 * `tour.completed` payload shown as the sample body.
 *
 * The list starts EMPTY, like sources: a webhook is an endpoint the user types.
 */
const SAMPLE_PAYLOAD = `{
  "event": "tour.completed",
  "version": "0",
  "time": 1740133769000,
  "experience": {
    "uid": "0814ae77-568d-41c0-912a-0b4c63dc03ff",
    "title": "Onboarding",
    "type": "TOUR",
    "state": "LIVE"
  },
  "jimer": {
    "uid": "17dff65e-434d-4454-bb57-a1167fefbb6b",
    "username": "Sam",
    "email": null
  }
}`;

export function WebhooksPage() {
  const { webhooks } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const [formFor, setFormFor] = React.useState<Webhook | 'new' | null>(null);
  const [kebabFor, setKebabFor] = React.useState<string | null>(null);

  const label = (ids: string[]) =>
    ids.length === WEBHOOK_EVENT_CATEGORIES.length
      ? 'All events'
      : ids
          .map((id) => WEBHOOK_EVENT_CATEGORIES.find((c) => c.id === id)?.label ?? id)
          .join(', ');

  return (
    <SettingsShell
      activeItem="Webhooks"
      title="Webhooks"
      actions={
        <div className="flex items-center gap-[var(--space-3)]">
          <Button variant="outline" size="sm" onClick={() => navigate('/settings/integrations')}>
            Integrations
          </Button>
          <Button
            size="sm"
            leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
            onClick={() => setFormFor('new')}
          >
            Add webhook
          </Button>
        </div>
      }
    >
      <Alert
        type="neutral"
        title="Retries"
        body={`If your endpoint returns 400 or above, Jimo retries: ${WEBHOOK_RETRY_SCHEDULE.join(', then ')}. You can also retry a delivery by hand below.`}
      />

      <Section
        title="Endpoints"
        description="Jimo POSTs a JSON payload to each endpoint when one of its events fires."
      >
        {webhooks.length === 0 ? (
          <div className="flex flex-col items-start gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] p-[var(--space-6)]">
            <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
              No webhooks yet
            </span>
            <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
              Add an endpoint and pick which events reach it.
            </span>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
              onClick={() => setFormFor('new')}
            >
              Add webhook
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-[var(--space-3)]">
            {webhooks.map((w) => {
              const failures = w.deliveries.filter((d) => !d.ok).length;
              return (
                <div
                  key={w.id}
                  className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-[var(--space-4)]"
                >
                  <div className="flex items-start justify-between gap-[var(--space-4)]">
                    <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
                      <span className="flex items-center gap-[var(--space-2)]">
                        <code className="truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                          {w.endpoint}
                        </code>
                        {failures > 0 && (
                          <Badge type="negative" size="x-small">
                            {failures} failing
                          </Badge>
                        )}
                      </span>
                      <span className="[font:var(--text-body-4)] text-[var(--color-text-secondary)]">
                        {label(w.events)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-[var(--space-3)]">
                      <Switch
                        checked={w.active}
                        aria-label={`${w.endpoint} active`}
                        onCheckedChange={(v) =>
                          setWebhooks(withWebhookPatched(webhooks, w.id, { active: v === true }))
                        }
                      />
                      <Menu
                        open={kebabFor === w.id}
                        onClose={() => setKebabFor(null)}
                        align="right"
                        trigger={
                          <Button
                            variant="link"
                            size="sm"
                            aria-label={`Actions for ${w.endpoint}`}
                            aria-haspopup="menu"
                            onClick={() => setKebabFor((k) => (k === w.id ? null : w.id))}
                          >
                            •••
                          </Button>
                        }
                      >
                        <MenuItem
                          label="Edit"
                          onClick={() => {
                            setKebabFor(null);
                            setFormFor(w);
                          }}
                        />
                        <MenuItem
                          icon={<Refresh size={20} variant="Linear" color="currentColor" />}
                          label="Retry failed deliveries"
                          onClick={() => {
                            setKebabFor(null);
                            setWebhooks(
                              withWebhookPatched(webhooks, w.id, {
                                deliveries: w.deliveries.map((d) =>
                                  d.ok ? d : { at: Date.now(), status: 200, ok: true },
                                ),
                              }),
                            );
                            toast({ type: 'positive', title: 'Deliveries retried' });
                          }}
                        />
                      </Menu>
                    </div>
                  </div>

                  {w.deliveries.length > 0 && (
                    <div className="flex flex-col gap-[var(--space-1)] border-t border-[var(--color-border-default)] pt-[var(--space-3)]">
                      <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-secondary)]">
                        Recent activity
                      </span>
                      {w.deliveries.slice(-5).reverse().map((d, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-[var(--space-3)] [font:var(--text-body-4)] text-[var(--color-text-tertiary)]"
                        >
                          <Badge type={d.ok ? 'positive' : 'negative'} size="x-small">
                            {d.status}
                          </Badge>
                          {formatRelative(d.at)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Payload" description="Every event carries this envelope, plus event-specific fields.">
        <CodeBlock code={SAMPLE_PAYLOAD} />
      </Section>

      {formFor && (
        <WebhookFormModal
          existing={formFor === 'new' ? undefined : formFor}
          onClose={() => setFormFor(null)}
          onSave={(endpoint, events) => {
            if (formFor === 'new') {
              setWebhooks(
                withWebhookAdded(webhooks, {
                  id: makeWebhookId(),
                  endpoint,
                  events,
                  active: true,
                  deliveries: [],
                }),
              );
              toast({ type: 'positive', title: 'Webhook added' });
            } else {
              setWebhooks(withWebhookPatched(webhooks, formFor.id, { endpoint, events }));
              toast({ type: 'positive', title: 'Webhook updated' });
            }
            setFormFor(null);
          }}
          onDelete={
            formFor === 'new'
              ? undefined
              : () => {
                  setWebhooks(withWebhookRemoved(webhooks, formFor.id));
                  setFormFor(null);
                  toast({ type: 'neutral', title: 'Webhook deleted' });
                }
          }
        />
      )}
    </SettingsShell>
  );
}
