import * as React from 'react';
import { Setting2, Export } from 'iconsax-react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { AppShell } from '@/app/AppShell';
import { EscalationHero } from './EscalationHero';
import { OAuthPlaceholder } from './OAuthPlaceholder';
import { SupportEmailModal } from './SupportEmailModal';
import { CrispConnectModal } from './CrispConnectModal';
import { ConfigureModal } from './ConfigureModal';
import { HandoffsChart } from './HandoffsChart';
import { TriggersSection } from './TriggersSection';
import { TopicsSection } from './TopicsSection';
import { VendorMark } from './VendorMark';
import { useToast } from '@/components/app/toast';
import { openWidget } from './openWidget';
import { useEscalation, setState } from '@/state/useEscalation';
import { VENDOR_LABEL, type CrispCredentials, type Vendor } from '@/state/types';

/** How long the fake provider redirect is shown. */
const OAUTH_MS = 1200;

export function EscalationPage() {
  const { enabled, vendor, hasHandoffs } = useEscalation();
  const toast = useToast();

  const [emailFor, setEmailFor] = React.useState<Vendor | null>(null);
  const [crispOpen, setCrispOpen] = React.useState(false);
  const [oauthFor, setOauthFor] = React.useState<Vendor | null>(null);
  const [configuring, setConfiguring] = React.useState(false);

  // No topbar until escalation actually exists. Figma 43:6580 (the empty state)
  // and 35:3906 (the OAuth beat) are both bare screens with centred content;
  // only the configured page gets a header. Gating on `enabled` alone rather
  // than also on `oauthFor` matters — otherwise the header pops in for the
  // 1.2s of the redirect placeholder and then reflows when the buttons arrive.
  const bare = !enabled;

  const enable = (v: Vendor, email?: string) => {
    setState({ enabled: true, vendor: v, supportEmail: email ?? null });
    toast({ type: 'positive', title: 'Escalation enabled successfully' });
  };

  // No confirmation step: the toolbar button IS the send. The toast carries the
  // widget link, because watching it happen live is the point of a test.
  const sendTest = () => {
    const name = vendor ? VENDOR_LABEL[vendor] : 'your support tool';
    toast({
      type: 'positive',
      title: `Test escalation sent to ${name}`,
      body:
        vendor === 'email'
          ? 'Look for a new email carrying the brief and the transcript.'
          : 'Look for a conversation tagged “test” — the private note is attached, invisible to the user.',
      secondaryAction: (
        <span className="inline-flex items-center gap-[var(--space-2)]">
          <Export size={16} variant="Linear" color="currentColor" />
          Open widget
        </span>
      ),
      onSecondaryAction: openWidget,
    });
  };

  const pick = (v: Vendor) => {
    if (v === 'email') {
      setEmailFor(v);
      return;
    }
    // Crisp is credentials, not a redirect: its hand-off integration is a
    // workspace token pair you paste in, so it gets a form of its own.
    if (v === 'crisp') {
      setCrispOpen(true);
      return;
    }
    // Intercom and Zendesk go through the provider redirect placeholder.
    setOauthFor(v);
    window.setTimeout(() => {
      setOauthFor(null);
      enable(v);
    }, OAUTH_MS);
  };

  return (
    <AppShell
      activeItem="Escalation"
      // py-0 + min-h-screen: `page-main` is the full viewport tall once the
      // header is gone, so this makes the content column exactly as tall and
      // `justify-center` can do real vertical centring.
      contentClassName={bare ? 'min-h-screen justify-center py-0' : undefined}
      header={
        bare ? undefined : (
          <PageHeader
            title="Escalation"
            showButtonGroup
            buttons={[
              {
                label: 'Send a test escalation',
                leftIcon: vendor ? <VendorMark vendor={vendor} size={20} /> : undefined,
                onClick: sendTest,
              },
              {
                label: 'Configure',
                leftIcon: <Setting2 size={20} variant="Linear" color="currentColor" />,
                onClick: () => setConfiguring(true),
              },
            ]}
          />
        )
      }
    >
      {oauthFor ? (
        <OAuthPlaceholder vendor={oauthFor} />
      ) : !enabled ? (
        <EscalationHero onPick={pick} />
      ) : (
        <>
          {hasHandoffs && <HandoffsChart />}
          <TriggersSection />
          <TopicsSection />
        </>
      )}

      {emailFor && (
        <SupportEmailModal
          onCancel={() => setEmailFor(null)}
          onEnable={(email) => {
            setEmailFor(null);
            enable('email', email);
          }}
        />
      )}
      {crispOpen && (
        <CrispConnectModal
          onCancel={() => setCrispOpen(false)}
          onConnected={(creds: CrispCredentials) => {
            setCrispOpen(false);
            setState({ crisp: creds });
            enable('crisp');
          }}
        />
      )}
      {configuring && <ConfigureModal onClose={() => setConfiguring(false)} />}
    </AppShell>
  );
}
