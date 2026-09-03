import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExportSquare } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { Section } from '@/components/ui/Section/Section';
import { useToast } from '@/components/app/toast';
import {
  useSettings,
  connectIntegration,
  disconnectIntegration,
  resumeIntegrations,
} from '@/state/useSettings';
import { INTEGRATION_CATALOGUE, integrationById, type IntegrationDef } from '@/data/settings';
import { SettingsShell } from '../SettingsShell';
import { VendorMark } from './VendorMark';
import { IntegrationDetail } from './IntegrationDetail';

/**
 * `/settings/integrations` — Figma 13:9349, reconciled against
 * help.usejimo.com/docs/integrations/integration-setup.
 *
 * The catalogue is the DOCS', not the artboard's. integration-setup splits
 * Jimo's integrations in two: "Available Integrations in Settings" (Intercom,
 * Segment, Zapier, HubSpot) and "Other Integrations in Workflows" (Calendly,
 * Figma, Invision, Maze). Slack, Crisp and Zendesk Knowledge each document a
 * Settings → Integrations page of their own, so they belong here too; the four
 * workflow ones do not appear on this page at all.
 *
 * Each vendor connects DIFFERENTLY — OAuth, an API key you paste into the
 * vendor, a marketplace plugin, credentials, a Zapier invite — so the card's
 * primary action carries the vendor's own copy rather than a generic Connect.
 * See `ConnectKind` in @/data/settings.
 *
 * `?integration=<id>` opens the detail view, read ONCE and then stripped, the
 * same shape `?source=` / `?page=` / `?skill=` already use: read it on every
 * render and it fights the back button, leave it in and a reload reopens it.
 */
export function IntegrationsPage({ initialDetailId }: { initialDetailId?: string } = {}) {
  const s = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [deepLink] = React.useState(() => params.get('integration'));
  const [openId, setOpenId] = React.useState<string | null>(initialDetailId ?? deepLink ?? null);

  React.useEffect(() => {
    if (!params.has('integration')) return;
    const next = new URLSearchParams(params);
    next.delete('integration');
    setParams(next, { replace: true });
  }, [params, setParams]);

  // `connecting` persists but its timer id does not — a row left mid-connect
  // when the tab closed would spin forever without this. Idempotent: arming an
  // id replaces its timer. Same pairing SourcesTab and InterfaceTab use.
  React.useEffect(() => {
    resumeIntegrations();
  }, []);

  const open = openId ? integrationById(openId) : null;
  if (open) {
    return (
      <IntegrationDetail
        def={open}
        onBack={() => setOpenId(null)}
        onDisconnect={() => {
          disconnectIntegration(open.id);
          toast({ type: 'neutral', title: `${open.name} disconnected` });
          setOpenId(null);
        }}
      />
    );
  }

  const cta = (def: IntegrationDef) => {
    const state = s.integrations[def.id];
    if (state?.connecting) return <Button variant="outline" disabled>Connecting…</Button>;
    if (state?.connected) {
      return (
        <Button variant="outline" onClick={() => setOpenId(def.id)}>
          {def.hasFieldMapping ? 'Configure' : 'Manage'}
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        rightIcon={
          def.connect === 'oauth' || def.connect === 'invite' || def.connect === 'marketplace' ? (
            <ExportSquare size={20} variant="Linear" color="currentColor" />
          ) : undefined
        }
        onClick={() => {
          connectIntegration(def.id);
          toast({ type: 'neutral', title: `Connecting ${def.name}…` });
        }}
      >
        {def.cta}
      </Button>
    );
  };

  return (
    <SettingsShell
      activeItem="Integrations"
      title="Integrations"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/settings/integrations/webhooks')}>
          Webhooks
        </Button>
      }
    >
      <Section
        title="Available in settings"
        description="Connect a service, then configure what flows between it and Jimo."
      >
        <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
          {INTEGRATION_CATALOGUE.map((def) => {
            const state = s.integrations[def.id];
            return (
              // Title row, then the description at full width, then the action.
              // The CTA copy is per-vendor and some of it is long ("Enable Jimo
              // in Zapier"), so a same-row button would squeeze every
              // description to a different width and leave the grid ragged.
              <div
                key={def.id}
                className="flex flex-col justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-[var(--space-4)]"
              >
                <div className="flex min-w-0 gap-[var(--space-3)]">
                  <VendorMark name={def.name} id={def.id} />
                  <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
                    <span className="flex items-center gap-[var(--space-2)]">
                      <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
                        {def.name}
                      </span>
                      {state?.connected && (
                        <Badge type="positive" size="x-small">
                          Connected
                        </Badge>
                      )}
                    </span>
                    <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
                      {def.description}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end">{cta(def)}</div>
              </div>
            );
          })}
        </div>
      </Section>
    </SettingsShell>
  );
}
