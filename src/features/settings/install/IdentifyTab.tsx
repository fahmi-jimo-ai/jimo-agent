import * as React from 'react';
import { ExportSquare } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Switch } from '@/components/ui/Toggle/switch';
import { Section } from '@/components/ui/Section/Section';
import { Alert } from '@/components/ui/Infobox/alert';
import { SettingCard, SettingRow } from '@/components/app/SettingRow';
import { useSettings, setInstall } from '@/state/useSettings';
import { CodeBlock } from '../CodeBlock';
import { identifySnippet, verifySnippet, attributeSnippets } from './snippets';

/**
 * The Identification tab — help.usejimo.com/docs/settings/installation, whose
 * own link is i.usejimo.com/settings/install/identify.
 *
 * NO ARTBOARD draws this as a tab; 13:10701 / 13:10761 draw Identity
 * Verification and the SDK attribute commands as part of one long Installation
 * page. The docs split them, and the docs win, so Installation has two tabs.
 *
 * Both switches commit instantly — the settings-wide rule; see SaveBar.tsx.
 *
 * The "push set BEFORE identify" note appears twice in the docs and is the one
 * ordering mistake that silently loses attributes, so it is stated here rather
 * than left to the linked page.
 */
export function IdentifyTab() {
  const { install } = useSettings();

  return (
    <>
      <Section
        title="Identify users"
        description="Align Jimo's tracking with your own user ids for precise MAU counting and clean attribution."
      >
        <CodeBlock code={identifySnippet} />
      </Section>

      <SettingCard>
        <SettingRow
          title="Force Identify"
          description="Only initialise Jimo once a user is identified. No session is ever logged as anonymous, which stops anonymous traffic inflating your MAU."
          control={
            <Switch
              checked={install.forceIdentify}
              aria-label="Force identify"
              onCheckedChange={(v) => setInstall({ forceIdentify: v === true })}
            />
          }
        />
        <SettingRow
          className="border-t border-[var(--color-border-default)]"
          title="Identity Verification"
          description="Verify reached users' identities by verifying their email using a cryptographic key."
          control={
            <span className="flex items-center gap-[var(--space-3)]">
              <Button
                variant="link"
                rightIcon={<ExportSquare size={20} variant="Linear" color="currentColor" />}
                onClick={() =>
                  window.open(
                    'https://help.usejimo.com/docs/for-developers/for-developers/sdk-guides/setup-identify-verification',
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                How to set up
              </Button>
              <Switch
                checked={install.identityVerification}
                aria-label="Identity verification"
                onCheckedChange={(v) => setInstall({ identityVerification: v === true })}
              />
            </span>
          }
        />
      </SettingCard>

      {install.identityVerification && (
        <Section
          title="Pass the signed identifier"
          description="Send it with every identify call once verification is on."
        >
          <CodeBlock code={verifySnippet} />
        </Section>
      )}

      <Section
        title="Use Jimo SDK commands to set user attributes"
        description="After installing Jimo, use the SDK to segment users manually."
      >
        <div className="flex flex-col gap-[var(--space-4)]">
          <Alert
            type="neutral"
            title="Order matters"
            body="Push your set commands BEFORE the identify call. Everything is buffered and applied in order once the profile is initialised."
          />
          {attributeSnippets.map((s) => (
            <CodeBlock key={s.label} label={s.label} code={s.code} />
          ))}
        </div>
      </Section>
    </>
  );
}
