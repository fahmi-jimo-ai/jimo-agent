import * as React from 'react';
import { Switch } from '@/components/ui/Toggle/switch';
import { Badge } from '@/components/ui/Chip/badge';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { ModalCard } from '@/components/app/ModalCard';
import { Menu, MenuItem } from '@/components/app/Menu';
import { VendorMark } from './VendorMark';
import { useToast } from '@/components/app/toast';
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
              <DropdownSelector
                size="big"
                // Moji's own placeholder markup, with this page's copy: the component only
                // applies its tertiary placeholder colour when `text` is empty, and an empty
                // `text` would swap the wording to "Select…".
                text={
                  vendor ? (
                    VENDOR_LABEL[vendor]
                  ) : (
                    <span className="text-[var(--color-text-tertiary)]">Select a tool</span>
                  )
                }
                isOpen={open}
                withIcon={!!vendor}
                icon={vendor ? <VendorMark vendor={vendor} size={20} /> : undefined}
                onClick={() => setOpen((o) => !o)}
              />
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

      {/* Ships in the production bundle too: this app is a prototype and the
          deployed build is what gets demoed, so the row has to be there. */}
      <Row
        title={
          <span className="flex items-center gap-[var(--space-2)]">
            Demo data
            <Badge type="alert" variant="secondary" size="x-small">
              Demo
            </Badge>
          </span>
        }
        description="Fill the page with a workspace that has been running a while — handoffs chart and a full topic list. Turning it off restores your own setup."
        control={<Switch checked={demo} onCheckedChange={(v) => setDemo(v === true)} />}
      />
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
