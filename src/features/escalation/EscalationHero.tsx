import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Menu, MenuItem } from '@/components/app/Menu';
import { VendorMark } from './VendorMark';
import { HeroArt } from './HeroArt';
import type { Vendor } from '@/state/types';

/**
 * The not-enabled state. Figma 43:6580.
 *
 * Copy is the LATER of the two drafts on the board — 35:4224 still says
 * "Set custom rules for when your agent should routes to your team" with plain
 * vendor names; 43:6580 supersedes it with the wording below and the
 * "Connect …" / "Add …" menu labels.
 */
const OPTIONS: Array<{ vendor: Vendor; label: string }> = [
  { vendor: 'intercom', label: 'Connect Intercom' },
  { vendor: 'zendesk', label: 'Connect Zendesk' },
  { vendor: 'crisp', label: 'Connect Crisp Chat' },
  { vendor: 'email', label: 'Add Support Email' },
  /* PROPOSAL (PRD-591) — the one row here the artboard does not draw.
     It is in the hero rather than only in Configuration because this menu IS
     the empty state's onboarding: a customer whose support tool is none of the
     four above would otherwise have to connect a tool they do not use and then
     switch away from it. Gojob is exactly that customer. */
  { vendor: 'webhook', label: 'Use a Webhook' },
];

export function EscalationHero({ onPick }: { onPick: (v: Vendor) => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    // No min-height and no flex-1: the page hides its header for this state and
    // gives the content column `min-h-screen justify-center`, so the centring
    // is done by the parent. A min-height here would only fight it.
    <div className="flex w-full items-center gap-[var(--space-8)] max-[900px]:flex-col">
      <div className="flex max-w-[420px] flex-1 flex-col items-start gap-[var(--space-4)]">
        <h2 className="m-0 [font:var(--text-heading-3)] tracking-[var(--text-heading-tracking)] text-[var(--color-text-primary)]">
          Route agent requests to support teams directly
        </h2>
        <p className="m-0 [font:var(--text-body-2)] text-[var(--color-text-secondary)]">
          Create escalation rules to direct agents to the right tool your support team already uses
          based on user topics and intents.
        </p>

        <Menu
          open={open}
          onClose={() => setOpen(false)}
          trigger={
            <Button
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={open}
              rightIcon={
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            >
              Enable escalation
            </Button>
          }
        >
          {OPTIONS.map((o) => (
            <MenuItem
              key={o.vendor}
              icon={<VendorMark vendor={o.vendor} size={18} />}
              label={o.label}
              onClick={() => {
                setOpen(false);
                onPick(o.vendor);
              }}
            />
          ))}
        </Menu>
      </div>

      <div className="flex flex-1 justify-center">
        <HeroArt />
      </div>
    </div>
  );
}
