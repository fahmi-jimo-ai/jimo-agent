import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { ModalCard } from '@/components/app/ModalCard';
import { normalisePreviewUrl } from '../PreviewInAppModal';

/**
 * "Scan a page" — the link selection the Interface tab's primary button opens.
 *
 * ## Invented, and labelled as such
 *
 * The artboards put scanning INSIDE the host app: `1. Scan` draws a panel in the
 * customer's own product reading "Your agent have no context of this page yet"
 * over a "Scan this page" button. Nothing draws the dashboard's half of it —
 * there is no frame in this file for "which page?".
 *
 * So this is the smallest honest surface: one field, one step, modelled on
 * `PreviewInAppModal`, which already answers the same question ("where is your
 * app?") for the same reason. ONE `ModalCard`, no steps — should it ever grow a
 * second beat, that beat becomes a `step` on THIS card, never a second card.
 *
 * `normalisePreviewUrl` is imported rather than reimplemented. It is already
 * unit-tested and already closes the three doors that matter here — `new URL()`
 * accepts `javascript:` and `mailto:you@acme.com` as happily as `https:`, and
 * this value reaches `window.open`. A second validator would be a second place
 * for that to be got wrong.
 */

/**
 * The card's `URL equals:` chip is stored bare, with no scheme, because that is
 * what the artboard prints. Exported for the test.
 */
export function toUrlRule(url: string): string {
  const parsed = new URL(url);
  return `${parsed.host}${parsed.pathname}`.replace(/\/$/, '');
}

/**
 * The card's title. The last path segment reads as the page's name far more
 * often than the host does ("/settings/billing" → "Billing"), so it wins; a
 * bare host falls back to its first label. Hyphens and underscores become
 * spaces and the result is title-cased, because "billing-and-plan" is a slug,
 * not a name.
 */
export function toPageName(url: string): string {
  const parsed = new URL(url);
  const last = parsed.pathname.split('/').filter(Boolean).pop();
  const raw = last ?? parsed.host.split('.')[0];
  return raw
    .replace(/[-_]+/g, ' ')
    .replace(/\.[a-z]+$/i, '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export function ScanPageModal({
  onClose,
  onScan,
}: {
  onClose: () => void;
  onScan: (url: string) => void;
}) {
  const [value, setValue] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  const normalised = normalisePreviewUrl(value);
  // Matching PreviewInAppModal: only complain once they have stopped typing.
  // An error that fires on the first keystroke is scolding, not helping.
  const invalid = touched && value.trim().length > 0 && normalised == null;

  const submit = () => {
    if (!normalised) {
      setTouched(true);
      return;
    }
    onScan(normalised);
  };

  return (
    <ModalCard
      title="Scan a page"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={normalised == null} onClick={submit}>
            Scan
          </Button>
        </>
      }
    >
      <Input
        label="Page URL"
        type="url"
        placeholder="https://app.acme.com/dashboard"
        value={value}
        status={invalid ? 'negative' : 'none'}
        onChange={(e) => setValue((e.target as HTMLInputElement).value)}
        onBlur={() => setTouched(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        supportiveText={
          invalid
            ? 'That is not a web address. Use an http:// or https:// URL.'
            : 'The agent opens this page, maps its elements, and reads them whenever a user asks.'
        }
      />
    </ModalCard>
  );
}
