import * as React from 'react';
import { Switch } from '@/components/ui/Toggle/switch';
import { Badge } from '@/components/ui/Chip/badge';
import { ModalCard } from './ModalCard';
import { Menu, MenuItem } from './Menu';
import { VendorMark } from './VendorMark';
import { useToast } from './toast';
import { useEscalation, setState } from '@/state/useEscalation';
import { setDemo } from '@/state/demo';
import { VENDOR_LABEL, type Vendor } from '@/state/types';

const VENDORS: Vendor[] = ['intercom', 'zendesk', 'crisp', 'email'];

/** Figma 35:5642 — "Configuration". */
export function ConfigureModal({ onClose }: { onClose: () => void }) {
  const { enabled, vendor, demo } = useEscalation();
  const [open, setOpen] = React.useState(false);
  const toast = useToast();

  return (
    // allowOverflow: the tool dropdown opens past the card's bottom edge, and
    // the default overflow-hidden would slice it off.
    <ModalCard title="Configuration" onClose={onClose} allowOverflow>
      <Row
        title="Enable Escalation"
        description="Let your agent routes requests to your team directly to connected customer support tool"
        control={
          <Switch
            checked={enabled}
            onCheckedChange={(v) => {
              const on = v === true;
              setState({ enabled: on });
              toast(
                on
                  ? { type: 'positive', title: 'Escalation enabled successfully' }
                  : { type: 'neutral', title: 'Escalation disabled' }
              );
            }}
          />
        }
      />

      <Row
        title="Escalation Support Tool"
        description="Connect your team’s preferred escalation support tool"
        control={
          <Menu
            open={open}
            onClose={() => setOpen(false)}
            align="right"
            trigger={
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="flex cursor-pointer items-center gap-[var(--space-2)] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-neutral-white)] px-[var(--space-3)] py-[var(--space-2)] [font:var(--text-body-3)] text-[var(--color-text-primary)] [transition:border-color_var(--transition-fast)] hover:border-[var(--color-neutral-400)]"
              >
                {vendor && <VendorMark vendor={vendor} size={18} />}
                {vendor ? VENDOR_LABEL[vendor] : 'Select a tool'}
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            }
          >
            {VENDORS.map((v) => (
              <MenuItem
                key={v}
                icon={<VendorMark vendor={v} size={18} />}
                label={VENDOR_LABEL[v]}
                selected={v === vendor}
                onClick={() => {
                  setState({ vendor: v });
                  setOpen(false);
                }}
              />
            ))}
          </Menu>
        }
      />

      {/* Dev only — stripped from the production bundle by Vite's `import.meta.env.DEV`
          constant folding, so this row cannot leak into a build. */}
      {import.meta.env.DEV && (
        <Row
          title={
            <span className="flex items-center gap-[var(--space-2)]">
              Demo data
              <Badge type="alert" variant="secondary" size="x-small">
                Dev only
              </Badge>
            </span>
          }
          description="Fill the page with a workspace that has been running a while — handoffs chart and a full topic list. Turning it off restores your own setup."
          control={<Switch checked={demo} onCheckedChange={(v) => setDemo(v === true)} />}
        />
      )}
    </ModalCard>
  );
}

function Row({
  title,
  description,
  control,
}: {
  title: React.ReactNode;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-[var(--space-4)]">
      <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
        <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">{title}</span>
        <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">{description}</span>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
