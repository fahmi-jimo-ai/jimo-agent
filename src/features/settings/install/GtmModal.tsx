import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Alert } from '@/components/ui/Infobox/alert';
import { SpinnerIcon } from '@/components/ui/Icon/Icon';
import { ModalCard } from '@/components/app/ModalCard';
import { useSettings, publishGtmTag } from '@/state/useSettings';

/**
 * Figma 13:9732 / 13:10167 — "Install Jimo with Google Tag Manager", and the
 * "Tag is successfuly published" frame.
 *
 * ONE card with steps, never a dialog on a dialog: pick → publishing → done.
 * The artboard's own annotation is "Choose your preferred account and container
 * to create and publish the tag".
 *
 * The account and container lists are INVENTED — this prototype has no Google
 * OAuth and no Tag Manager API — and are free text rather than a fake dropdown
 * of made-up account names, which would read as real data in a screenshot.
 */
export function GtmModal({ onClose }: { onClose: () => void }) {
  const { install } = useSettings();
  const [account, setAccount] = React.useState(install.gtm.account ?? '');
  const [container, setContainer] = React.useState(install.gtm.container ?? '');

  const publishing = install.gtm.status === 'publishing';
  const published = install.gtm.status === 'published';
  const step = published ? 'done' : publishing ? 'publishing' : 'pick';
  const valid = account.trim() !== '' && container.trim() !== '';

  return (
    <ModalCard
      title={published ? 'Tag published' : 'Install Jimo with Google Tag Manager'}
      variant={published ? 'confirm' : 'card'}
      step={step}
      onClose={onClose}
      footer={
        published ? (
          <Button onClick={onClose}>Done</Button>
        ) : publishing ? undefined : (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!valid}
              onClick={() => publishGtmTag(account.trim(), container.trim())}
            >
              Create and publish tag
            </Button>
          </>
        )
      }
    >
      {published ? (
        <>
          Jimo is live in <strong>{install.gtm.container}</strong>. Reload your site and the Jimo
          toolbar should appear.
        </>
      ) : publishing ? (
        <div className="flex flex-col items-center gap-[var(--space-4)] py-[var(--space-8)]">
          <SpinnerIcon size={32} />
          <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            Creating and publishing the tag…
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-[var(--space-4)]">
          <Alert
            type="neutral"
            title="Alternative to pasting the snippet"
            body="Jimo creates the tag in the container you choose and publishes it to your workspace."
          />
          <Input
            label="Google Tag Manager account"
            placeholder="Acme Inc."
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
          <Input
            label="Container"
            placeholder="GTM-XXXXXXX"
            value={container}
            onChange={(e) => setContainer(e.target.value)}
          />
        </div>
      )}
    </ModalCard>
  );
}
