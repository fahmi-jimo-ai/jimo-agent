import * as React from 'react';
import { Export, Edit2, Sms, Key, Link21 } from 'iconsax-react';
import { Switch } from '@/components/ui/Toggle/switch';
import { Badge } from '@/components/ui/Chip/badge';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { useModalClose } from '@/components/ui/ModalOverlay/ModalOverlay';
import { ModalCard } from '@/components/app/ModalCard';
import { Menu, MenuItem } from '@/components/app/Menu';
import { VendorMark } from './VendorMark';
import { OAuthPlaceholder } from './OAuthPlaceholder';
import { CrispConnectFields, useCrispConnect } from './CrispConnectFields';
import { WebhookConnectFields, useWebhookConnect } from './WebhookConnectFields';
import { useToast } from '@/components/app/toast';
import { useEscalation, setState } from '@/state/useEscalation';
import { setDemo } from '@/state/demo';
import {
  VENDOR_LABEL,
  WEBHOOK_EVENTS,
  type CrispCredentials,
  type Vendor,
  type WebhookConfig,
} from '@/state/types';

// `webhook` sits last on purpose: the four before it are tools we integrate
// with by name, and it is the "none of these" row — PRD-591.
const VENDORS: Vendor[] = ['intercom', 'zendesk', 'crisp', 'email', 'webhook'];
/** The two vendors whose Configure is an in-app form, not a redirect. */
const IN_APP_FORM: Vendor[] = ['crisp', 'webhook'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** How long the fake provider redirect is shown. Matches EscalationPage. */
const OAUTH_MS = 1200;

/**
 * Configuration — Figma 35:5642, with the connected-tool states from 105:4515
 * (Intercom / Zendesk / Crisp) and 105:4514 (Support Email).
 *
 * ## It is a stepped dialog, not a stack of dialogs
 *
 * Connecting Crisp, re-authorising Intercom and confirming a disable are all
 * STEPS of this one card — `ModalCard`'s `step` prop cross-slides them and
 * eases the height between layouts. Opening a second `ModalCard` over this one
 * would double the backdrop, give Escape two targets, and leave a mismatched
 * card visibly sticking out behind the new one.
 *
 * No `allowOverflow` any more: the tool dropdown does open past the card's
 * bottom edge, but `Menu` portals its panel to <body>, so the card's
 * overflow-hidden — now unconditional, because the step height animation needs
 * it — cannot reach it.
 *
 * ## The tool row owns whatever that tool needs
 *
 * Per both artboards the "Escalation Support Tool" row is a card in two parts:
 * the selector on top, and a section under a rule that belongs to the chosen
 * tool. Support Email puts its address there (read-only until you press
 * Change); the three chat vendors put a single full-width button there. The
 * selector itself never opens a flow — switching tools is instant, and the
 * section below then shows what the new tool still needs.
 */
type Step = 'config' | 'connect-crisp' | 'connect-webhook' | 'oauth' | 'disable';

export function ConfigureModal({ onClose }: { onClose: () => void }) {
  const { enabled, vendor, demo, crisp, webhook } = useEscalation();
  const toast = useToast();

  const [step, setStep] = React.useState<Step>('config');
  const [direction, setDirection] = React.useState<'forward' | 'back'>('forward');
  /** Which vendor the OAuth beat is currently standing in for. */
  const [authing, setAuthing] = React.useState<Vendor | null>(null);

  const go = (next: Step, dir: 'forward' | 'back' = 'forward') => {
    setDirection(dir);
    setStep(next);
  };

  // Hoisted out of the step rather than mounted with it: going back and forward
  // again keeps what was typed. It seeds from the saved credentials once, when
  // the dialog opens.
  const crispForm = useCrispConnect(crisp, (creds: CrispCredentials) => {
    setState({ crisp: creds, vendor: 'crisp', enabled: true });
    toast({
      type: 'positive',
      title: `${VENDOR_LABEL.crisp} connected`,
      body: 'The test hand-off came back clean.',
    });
    go('config', 'back');
  });

  // Same hoisting rule as crispForm: leaving the step and coming back keeps
  // what was typed, and it seeds from the saved endpoint once.
  const webhookForm = useWebhookConnect(webhook, (cfg: WebhookConfig) => {
    setState({ webhook: cfg, vendor: 'webhook', enabled: true });
    toast({
      type: 'positive',
      title: `${VENDOR_LABEL.webhook} connected`,
      body: 'The test call came back 200.',
    });
    go('config', 'back');
  });

  const configureTool = () => {
    if (!vendor) return;
    if (vendor === 'crisp') {
      go('connect-crisp');
      return;
    }
    if (vendor === 'webhook') {
      go('connect-webhook');
      return;
    }
    setAuthing(vendor);
    go('oauth');
  };

  const title =
    step === 'connect-crisp'
      ? `Connect ${VENDOR_LABEL.crisp}`
      : step === 'connect-webhook'
        ? `Connect ${VENDOR_LABEL.webhook}`
        : step === 'oauth' && authing
          ? `Connect ${VENDOR_LABEL[authing]}`
          : step === 'disable'
            ? 'Disable escalation?'
            : 'Configuration';

  const footer =
    step === 'connect-crisp' ? (
      <>
        <Button variant="outline" onClick={() => go('config', 'back')} disabled={crispForm.busy}>
          Cancel
        </Button>
        <Button disabled={!crispForm.canSubmit} onClick={crispForm.submit}>
          {crispForm.busy ? 'Testing connection…' : 'Connect and test'}
        </Button>
      </>
    ) : step === 'connect-webhook' ? (
      <>
        <Button variant="outline" onClick={() => go('config', 'back')} disabled={webhookForm.busy}>
          Cancel
        </Button>
        <Button disabled={!webhookForm.canSubmit} onClick={webhookForm.submit}>
          {webhookForm.busy ? 'Sending test call…' : 'Connect and test'}
        </Button>
      </>
    ) : step === 'disable' ? (
      <DisableFooter onCancel={() => go('config', 'back')} />
    ) : undefined;

  return (
    <ModalCard
      title={title}
      onClose={onClose}
      footer={footer}
      // The confirm shape (112:4938) is a step like any other, so the card
      // morphs 560 -> 440 into it rather than a second dialog opening over it.
      variant={step === 'disable' ? 'confirm' : 'card'}
      step={step}
      direction={direction}
    >
      {step === 'connect-crisp' ? (
        <CrispConnectFields value={crispForm.value} onChange={crispForm.setValue} disabled={crispForm.busy} />
      ) : step === 'connect-webhook' ? (
        <WebhookConnectFields
          value={webhookForm.value}
          onChange={webhookForm.setValue}
          disabled={webhookForm.busy}
        />
      ) : step === 'oauth' && authing ? (
        <OAuthStep
          vendor={authing}
          onDone={() => {
            setState({ vendor: authing, enabled: true });
            toast({ type: 'positive', title: `${VENDOR_LABEL[authing]} connected` });
            go('config', 'back');
          }}
        />
      ) : step === 'disable' ? (
        // One sentence: the confirm shape centres its body under a 32px
        // heading, and the paragraph this replaced was written for a
        // left-aligned 560 card.
        <p className="m-0">
          Your agent will stop routing requests to{' '}
          {vendor ? VENDOR_LABEL[vendor] : 'your support tool'} — your triggers, topics and
          connection stay saved.
        </p>
      ) : (
        <>
          <SettingCard>
            <SettingRow
              title="Enable Escalation"
              description="Let your agent routes requests to your team directly to connected customer support tool"
              control={
                <Switch
                  checked={enabled}
                  onCheckedChange={(v) => {
                    // Turning ON is harmless and immediate. Turning OFF stops
                    // every hand-off, so it asks first — and deliberately does
                    // NOT write state here, which is what leaves the switch
                    // still reading "on" behind the confirmation.
                    if (v !== true) {
                      go('disable');
                      return;
                    }
                    setState({ enabled: true });
                    toast({ type: 'positive', title: 'Escalation enabled successfully' });
                  }}
                />
              }
            />
          </SettingCard>

          <SettingCard>
            <SettingRow
              title="Escalation Support Tool"
              description="Connect your team’s preferred escalation support tool"
              control={<ToolSelector />}
            />
            {vendor === 'email' ? (
              <SettingExtra>
                <EmailSection />
              </SettingExtra>
            ) : vendor ? (
              <SettingExtra>
                {/* The only vendor whose config is worth reading back at a
                    glance: an endpoint is something you typed and may have
                    typo'd, where "Intercom" is just connected or not. Same
                    reason Support Email shows its address. */}
                {vendor === 'webhook' && webhook && <WebhookSummary config={webhook} />}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={configureTool}
                  // Crisp and Custom webhook are forms that never leave the app,
                  // so they get a key rather than 105:4515's leave-the-app
                  // glyph. The icon means "credentials, here", not "webhook".
                  rightIcon={
                    IN_APP_FORM.includes(vendor) ? (
                      <Key size={16} variant="Linear" color="currentColor" />
                    ) : (
                      <Export size={16} variant="Linear" color="currentColor" />
                    )
                  }
                >
                  {(vendor === 'crisp' && !crisp) || (vendor === 'webhook' && !webhook)
                    ? 'Connect'
                    : 'Configure'}{' '}
                  {VENDOR_LABEL[vendor]}
                </Button>
              </SettingExtra>
            ) : null}
          </SettingCard>

          {/* Ships in the production bundle too: this app is a prototype and the
              deployed build is what gets demoed, so the row has to be there. */}
          <SettingCard>
            <SettingRow
              title={
                <span className="flex items-center gap-[var(--space-2)]">
                  Demo data
                  <Badge type="alert" variant="secondary" size="x-small">
                    Demo
                  </Badge>
                </span>
              }
              description="Fill the app with a workspace that has been running a while — handoffs chart, a full topic list, and a trained Knowledge sources table. Turning it off restores your own setup."
              control={<Switch checked={demo} onCheckedChange={(v) => setDemo(v === true)} />}
            />
          </SettingCard>
        </>
      )}
    </ModalCard>
  );
}

/**
 * The tool select. Per 105:4515 the chosen tool reads as its plain name with a
 * check; every other row is phrased as the action picking it performs —
 * "Switch to Zendesk" — so the menu says what a row DOES, not merely what it is.
 */
function ToolSelector() {
  const { vendor } = useEscalation();
  const [open, setOpen] = React.useState(false);

  return (
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
          label={v === vendor ? VENDOR_LABEL[v] : `Switch to ${VENDOR_LABEL[v]}`}
          selected={v === vendor}
          onClick={() => {
            setState({ vendor: v });
            setOpen(false);
          }}
        />
      ))}
    </Menu>
  );
}

/**
 * 105:4514 — the address read-only with a Change button, then the same field
 * editable with a primary commit under it.
 *
 * It opens straight into edit when there is no address yet, which is the state
 * you land in right after switching the tool to Support Email: an empty
 * disabled field above a "Change" button would be a dead end.
 */
function EmailSection() {
  const { supportEmail } = useEscalation();
  const toast = useToast();
  const [editing, setEditing] = React.useState(!supportEmail);
  const [draft, setDraft] = React.useState(supportEmail ?? '');
  const valid = EMAIL_RE.test(draft.trim());

  const save = () => {
    if (!valid) return;
    setState({ supportEmail: draft.trim() });
    setEditing(false);
    toast({ type: 'positive', title: supportEmail ? 'Support email updated' : 'Support email saved' });
  };

  if (!editing && supportEmail) {
    return (
      <>
        <Input
          label="Support email"
          value={supportEmail}
          disabled
          readOnly
          leftIcon={<Sms size={24} variant="Linear" color="currentColor" />}
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          leftIcon={<Edit2 size={16} variant="Linear" color="currentColor" />}
          onClick={() => {
            setDraft(supportEmail);
            setEditing(true);
          }}
        >
          Change support email
        </Button>
      </>
    );
  }

  return (
    <>
      <Input
        label="Support email"
        type="email"
        placeholder="you@company.com"
        value={draft}
        onChange={(e) => setDraft((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
        }}
        leftIcon={<Sms size={24} variant="Linear" color="currentColor" />}
        supportiveText="Escalation details will be sent to this email for user follow-up."
      />
      <Button size="sm" className="w-full" disabled={!valid} onClick={save}>
        {supportEmail ? 'Update email' : 'Save support email'}
      </Button>
    </>
  );
}

/**
 * The connected endpoint, read back on the config step.
 *
 * Read-only rather than editable in place: the events belong to the same
 * decision as the URL, so editing one without the other would need this row to
 * grow the whole form. The Configure button below opens it.
 */
function WebhookSummary({ config }: { config: WebhookConfig }) {
  const count = config.events.length;
  return (
    <Input
      label="Endpoint"
      value={config.url}
      disabled
      readOnly
      leftIcon={<Link21 size={24} variant="Linear" color="currentColor" />}
      supportiveText={`Sending ${count} of ${WEBHOOK_EVENTS.length} events${
        config.secret ? ', signed' : ''
      }.`}
    />
  );
}

/** The redirect beat, as a step of this dialog rather than a page takeover. */
function OAuthStep({ vendor, onDone }: { vendor: Vendor; onDone: () => void }) {
  // onDone is a fresh closure every render, so it is read through a ref: a dep
  // on it would restart the timer on every parent render and the step would
  // never resolve.
  const done = React.useRef(onDone);
  done.current = onDone;

  React.useEffect(() => {
    const t = window.setTimeout(() => done.current(), OAUTH_MS);
    return () => window.clearTimeout(t);
  }, [vendor]);

  return (
    <div className="py-[var(--space-6)]">
      <OAuthPlaceholder vendor={vendor} />
    </div>
  );
}

/**
 * A component, not inline JSX, so it can reach `useModalClose` — `footer` is
 * rendered inside ModalOverlay's provider, so this gets the ANIMATED close
 * rather than yanking the card off screen.
 */
function DisableFooter({ onCancel }: { onCancel: () => void }) {
  const close = useModalClose();
  const toast = useToast();

  return (
    <>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        danger
        onClick={() => {
          setState({ enabled: false });
          toast({ type: 'neutral', title: 'Escalation disabled' });
          close?.();
        }}
      >
        Disable escalation
      </Button>
    </>
  );
}

/** The bordered container. One per setting; the tool card holds two sections. */
function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
      {children}
    </div>
  );
}

function SettingRow({
  title,
  description,
  control,
}: {
  title: React.ReactNode;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-[var(--space-6)] p-[var(--space-4)]">
      <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
        <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">{title}</span>
        <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">{description}</span>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

/** The tool-owned half of the tool card, under its own rule. */
function SettingExtra({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[var(--space-3)] border-t border-[var(--color-border-default)] p-[var(--space-4)]">
      {children}
    </div>
  );
}
