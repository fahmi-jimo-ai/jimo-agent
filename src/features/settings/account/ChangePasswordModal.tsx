import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { ModalCard } from '@/components/app/ModalCard';

/**
 * Figma 13:14336 / 13:14458 — the two Change-password frames.
 *
 * The eight-character minimum is INVENTED: no artboard and no doc states a
 * password policy. It is here so the form has a failure state at all; a
 * validation rule that only ever passes is not a validation rule.
 */
const MIN = 8;

export function ChangePasswordModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');

  const tooShort = next !== '' && next.length < MIN;
  const mismatch = confirm !== '' && confirm !== next;
  const valid = current !== '' && next.length >= MIN && confirm === next;

  return (
    <ModalCard
      title="Change password"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Update password
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-[var(--space-4)]">
        <Input
          label="Current password"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <Input
          label="New password"
          type="password"
          value={next}
          status={tooShort ? 'negative' : 'none'}
          supportiveText={tooShort ? `At least ${MIN} characters.` : undefined}
          onChange={(e) => setNext(e.target.value)}
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirm}
          status={mismatch ? 'negative' : 'none'}
          supportiveText={mismatch ? 'Those do not match.' : undefined}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
    </ModalCard>
  );
}
