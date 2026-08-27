import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { ModalCard } from '@/components/app/ModalCard';

/**
 * "Preview in-app" — the second row of the Test Knowledge menu.
 *
 * Invented, and labelled as such: no artboard draws this step. The menu itself
 * is Fahmi's spec ("Preview here" with a play icon, "Preview in-app" with a
 * monitor icon); what "in-app" needs — somewhere to put the agent — is not, so
 * this asks for the page and stops there.
 *
 * ONE `ModalCard` with a single step, not a dialog over the menu: the menu is a
 * floating layer that closes on the same click, so by the time this mounts
 * there is nothing underneath it. Should this ever grow a second beat (pick an
 * environment, then a page), it becomes a `step` on THIS card — never a second.
 *
 * Validation is deliberately narrow. `new URL()` accepts `mailto:` and
 * `javascript:` just as happily as `https:`, and this value goes straight into
 * `window.open`, so the protocol is checked rather than assumed.
 */
export function normalisePreviewUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // A bare host is what people type. Give it a scheme before parsing, or
  // "acme.com" parses as a relative URL and fails for the wrong reason.
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  // A scheme WITHOUT `//` slips past the test above — "mailto:you@acme.com"
  // gets the https:// prefix and then parses as user `mailto`, password `you`,
  // host `acme.com`. Credentials in a preview URL are never what was meant, so
  // rejecting them closes that door without special-casing schemes.
  if (url.username || url.password) return null;
  // A single word would otherwise resolve against the dashboard's own host.
  if (!url.hostname.includes('.')) return null;
  return url.toString();
}

export function PreviewInAppModal({
  onClose,
  onOpen,
}: {
  onClose: () => void;
  onOpen: (url: string) => void;
}) {
  const [value, setValue] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  const normalised = normalisePreviewUrl(value);
  // Only complain once they have stopped typing into an empty field — an error
  // that fires on the first keystroke is scolding, not helping.
  const invalid = touched && value.trim().length > 0 && normalised == null;

  const submit = () => {
    if (!normalised) {
      setTouched(true);
      return;
    }
    onOpen(normalised);
  };

  return (
    <ModalCard
      title="Preview in your app"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={normalised == null} onClick={submit}>
            Open preview
          </Button>
        </>
      }
    >
      <Input
        label="App URL"
        type="url"
        placeholder="https://app.acme.com"
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
            : 'The agent opens on this page with your current knowledge and skills.'
        }
      />
    </ModalCard>
  );
}
