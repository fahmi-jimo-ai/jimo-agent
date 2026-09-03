import * as React from 'react';
import { ExportSquare, Add, Trash } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { Section } from '@/components/ui/Section/Section';
import { Alert } from '@/components/ui/Infobox/alert';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { SettingCard, SettingRow } from '@/components/app/SettingRow';
import { formatRelative } from '@/lib/formatRelative';
import { useSettings } from '@/state/useSettings';
import type { IntegrationDef } from '@/data/settings';
import { SettingsShell } from '../SettingsShell';
import { VendorMark } from './VendorMark';

/**
 * Figma 13:9423 / 13:9525 / 13:9627 — the HubSpot detail page and its loading
 * state.
 *
 * Only HubSpot has field mapping in the artboards, and only HubSpot's doc page
 * describes matched vs synced fields, so `hasFieldMapping` gates those two
 * sections rather than every vendor pretending to have them. Everything else
 * gets the How-it-works / Resources / Disconnect shape the Slack doc describes
 * (its A–D anatomy: how it works, status, resource links, disconnect).
 *
 * The field ROWS are invented — no artboard prints a real field name — and the
 * add/remove affordances do not open an editor, because nothing designs one.
 */
export function IntegrationDetail({
  def,
  onBack,
  onDisconnect,
}: {
  def: IntegrationDef;
  onBack: () => void;
  onDisconnect: () => void;
}) {
  const s = useSettings();
  const state = s.integrations[def.id];

  return (
    <SettingsShell
      activeItem="Integrations"
      title={
        <span className="flex items-center gap-[var(--space-3)]">
          <VendorMark name={def.name} id={def.id} />
          {def.name} Integration
        </span>
      }
      meta={
        state?.connectedAt != null ? (
          <span>Last synced {formatRelative(state.connectedAt)}</span>
        ) : undefined
      }
      actions={
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to integrations
        </Button>
      }
    >
      <Alert
        type="neutral"
        title="How it works"
        body={def.description}
      />

      {def.hasFieldMapping && (
        <>
          <Section
            title="Matched fields"
            description="Fields that will be used to match users between HubSpot and Jimo. Must be unique for each user"
            controls={
              <Button size="sm" variant="outline" leftIcon={<Add size={20} variant="Linear" color="currentColor" />} disabled>
                Add field
              </Button>
            }
          >
            <FieldRows rows={state?.matched ?? []} empty="No matching field yet." />
          </Section>

          <Section
            title="Synced fields"
            description="Fields that will be synced in near real-time from HubSpot to Jimo. Only users observed by Jimo in your app will be synced."
            controls={
              <Button size="sm" variant="outline" leftIcon={<Add size={20} variant="Linear" color="currentColor" />} disabled>
                Add field
              </Button>
            }
          >
            <FieldRows rows={state?.synced ?? []} empty="No synced field yet." />
          </Section>
        </>
      )}

      <SettingCard>
        <SettingRow
          title="Resources"
          description="Read how this integration works and what it syncs."
          control={
            <Button
              variant="outline"
              rightIcon={<ExportSquare size={20} variant="Linear" color="currentColor" />}
              onClick={() => window.open(def.docs, '_blank', 'noopener,noreferrer')}
            >
              Documentation
            </Button>
          }
        />
        <SettingRow
          className="border-t border-[var(--color-border-default)]"
          title="Connection"
          description={
            state?.connected
              ? 'Jimo is connected to this workspace.'
              : 'Not connected.'
          }
          control={
            <span className="flex items-center gap-[var(--space-3)]">
              {state?.connected && (
                <Badge type="positive" size="x-small">
                  Connected
                </Badge>
              )}
              <Button danger variant="outline" onClick={onDisconnect} disabled={!state?.connected}>
                Disconnect
              </Button>
            </span>
          }
        />
      </SettingCard>
    </SettingsShell>
  );
}

function FieldRows({
  rows,
  empty,
}: {
  rows: { id: string; jimo: string; vendor: string }[];
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <span className="[font:var(--text-body-3)] text-[var(--color-text-tertiary)]">{empty}</span>
    );
  }
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      {rows.map((f) => (
        <div
          key={f.id}
          className="flex items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-[var(--space-3)]"
        >
          <span className="flex min-w-0 items-center gap-[var(--space-3)] [font:var(--text-body-3)]">
            <span className="text-[var(--color-text-primary)]">{f.jimo}</span>
            <span className="text-[var(--color-text-tertiary)]">&rarr;</span>
            <code className="text-[var(--color-text-secondary)]">{f.vendor}</code>
          </span>
          <IconButton
            aria-label={`Remove ${f.jimo} mapping`}
            tip="Remove"
            disabled
            icon={<Trash size={20} variant="Linear" color="currentColor" />}
          />
        </div>
      ))}
    </div>
  );
}
