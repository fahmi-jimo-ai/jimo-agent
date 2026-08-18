import * as React from 'react';
import { Setting2 } from 'iconsax-react';
import { Subpage } from '@/components/ui/Subpage/Subpage';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { PrimaryNavSidebar } from '@/components/ui/PrimaryNavSidebar/PrimaryNavSidebar';
import { SecondaryNavSidebar } from '@/components/ui/SecondaryNavSidebar/SecondaryNavSidebar';
import { AGENT_NAV_SECTIONS } from './navConfig';
import { EscalationHero } from './EscalationHero';
import { OAuthPlaceholder } from './OAuthPlaceholder';
import { SupportEmailModal } from './SupportEmailModal';
import { ConfigureModal } from './ConfigureModal';
import { TestEscalationModal } from './TestEscalationModal';
import { HandoffsChart } from './HandoffsChart';
import { TriggersSection } from './TriggersSection';
import { TopicsSection } from './TopicsSection';
import { VendorMark } from './VendorMark';
import { useToast } from './toast';
import { useEscalation, setState } from '@/state/useEscalation';
import type { Vendor } from '@/state/types';

/** How long the fake provider redirect is shown. */
const OAUTH_MS = 1200;

export function EscalationPage() {
  const { enabled, vendor, hasHandoffs } = useEscalation();
  const toast = useToast();

  const [emailFor, setEmailFor] = React.useState<Vendor | null>(null);
  const [oauthFor, setOauthFor] = React.useState<Vendor | null>(null);
  const [configuring, setConfiguring] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

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

  const pick = (v: Vendor) => {
    if (v === 'email') {
      setEmailFor(v);
      return;
    }
    // The three chat vendors go through the provider redirect placeholder.
    setOauthFor(v);
    window.setTimeout(() => {
      setOauthFor(null);
      enable(v);
    }, OAUTH_MS);
  };

  return (
    <Subpage
      maxWidth={1064}
      primaryNav={<PrimaryNavSidebar collapsed activeItem="Agent" />}
      secondaryNav={<SecondaryNavSidebar sections={AGENT_NAV_SECTIONS} activeItem="Escalation" />}
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
                onClick: () => setTesting(true),
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
      {configuring && <ConfigureModal onClose={() => setConfiguring(false)} />}
      {testing && <TestEscalationModal onClose={() => setTesting(false)} />}
    </Subpage>
  );
}
