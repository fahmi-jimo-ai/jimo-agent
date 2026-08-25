import * as React from 'react';
import { Input } from '@/components/ui/Input/Input';
import { Alert } from '@/components/ui/Infobox/alert';
import type { CrispCredentials } from '@/state/types';

/**
 * The three Crisp credentials, with the "where do I get these" note.
 *
 * Lives on its own because the same form is reached two ways and must be the
 * same form both times: from the hero ("Connect Crisp Chat") as a standalone
 * dialog, and from Configuration as a step inside the dialog that is already
 * open. Only the shell and the footer differ — see `CrispConnectModal` and
 * `ConfigureModal`.
 *
 * Every field carries its own supportive text saying what the value IS, and the
 * neutral Infobox carries the one thing that is the same for all three: the
 * path through Crisp's settings that produces them. That split is deliberate —
 * repeating "Settings -> Workspace settings -> ..." under each field is three
 * copies of one instruction, and burying "what is a token identifier" in the
 * infobox makes it a wall nobody reads.
 */
export const EMPTY_CRISP: CrispCredentials = { websiteId: '', tokenIdentifier: '', tokenKey: '' };

/** All three are required — Crisp's API rejects a partial pair outright. */
export function crispComplete(v: CrispCredentials) {
  return !!(v.websiteId.trim() && v.tokenIdentifier.trim() && v.tokenKey.trim());
}

export function CrispConnectFields({
  value,
  onChange,
  disabled,
}: {
  value: CrispCredentials;
  onChange: (next: CrispCredentials) => void;
  disabled?: boolean;
}) {
  const set = (key: keyof CrispCredentials) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: (e.target as HTMLInputElement).value });

  return (
    <>
      <Input
        label="Website ID"
        placeholder="8c842b34-1d8e-4f2c-9f1a-0e6a3f0f9a11"
        value={value.websiteId}
        onChange={set('websiteId')}
        disabled={disabled}
        supportiveText="The Crisp workspace hand-offs are created in."
      />
      <Input
        label="Token identifier"
        placeholder="Identifier"
        value={value.tokenIdentifier}
        onChange={set('tokenIdentifier')}
        disabled={disabled}
        supportiveText="The public half of the API token pair."
      />
      <Input
        label="Token key"
        type="password"
        placeholder="Key"
        value={value.tokenKey}
        onChange={set('tokenKey')}
        disabled={disabled}
        supportiveText="The secret half. Crisp shows it once, when the token is created."
      />
      <Alert
        type="neutral"
        title="Where to find these"
        body="In Crisp: Settings → Workspace settings → Advanced configuration → API token. The token needs the conversation messages and sessions scopes."
      />
    </>
  );
}

/** How long "Connect and test" spends pretending to reach Crisp. */
const TEST_MS = 900;

/**
 * Draft + the "Connect and test" beat, shared by both entry points.
 *
 * The pause is the "and test" half of the button doing something: a prototype
 * that saved instantly would make the label a lie. The timer is cleared on
 * unmount because both hosts CAN disappear mid-beat — the dialog's own close
 * button, or Escape.
 */
export function useCrispConnect(initial: CrispCredentials | null, onConnected: (v: CrispCredentials) => void) {
  const [value, setValue] = React.useState<CrispCredentials>(initial ?? EMPTY_CRISP);
  const [busy, setBusy] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const trimmed = (): CrispCredentials => ({
    websiteId: value.websiteId.trim(),
    tokenIdentifier: value.tokenIdentifier.trim(),
    tokenKey: value.tokenKey.trim(),
  });

  return {
    value,
    setValue,
    busy,
    canSubmit: crispComplete(value) && !busy,
    submit: () => {
      if (busy || !crispComplete(value)) return;
      const next = trimmed();
      setBusy(true);
      timer.current = window.setTimeout(() => {
        setBusy(false);
        onConnected(next);
      }, TEST_MS);
    },
  };
}
