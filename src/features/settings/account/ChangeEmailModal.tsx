import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Alert } from '@/components/ui/Infobox/alert';
import { ModalCard } from '@/components/app/ModalCard';

/** Same rule the rest of the app uses — see `normalisePreviewUrl`'s reasoning. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Figma 13:14276 / 13:14397 — the two Change-email frames.
 *
 * ONE card with two steps, never two dialogs: `form` collects the new address,
 * `sent` confirms. The artboards draw both as separate frames because Figma has
 * no other way to show a sequence.
 */
export function ChangeEmailModal({
  current,
  onClose,
  onConfirm,
}: {
  current: string;
  onClose: () => void;
  onConfirm: (email: string) => void;
}) {
  const [step, setStep] = React.useState<'form' | 'sent'>('form');
  const [email, setEmail] = React.useState('');

  const valid = EMAIL_RE.test(email.trim()) && email.trim() !== current;

  return (
    <ModalCard
      title="Change email"
      step={step}
      onClose={onClose}
      footer={
        step === 'form' ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!valid} onClick={() => setStep('sent')}>
              Send confirmation
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              onConfirm(email.trim());
              onClose();
            }}
          >
            Done
          </Button>
        )
      }
    >
      {step === 'form' ? (
        <div className="flex flex-col gap-[var(--space-4)]">
          <Input label="Current email" value={current} disabled readOnly />
          <Input
            label="New email"
            type="email"
            placeholder="you@company.com"
            value={email}
            status={email !== '' && !valid ? 'negative' : 'none'}
            supportiveText={
              email !== '' && !valid
                ? email.trim() === current
                  ? 'That is already your email address.'
                  : 'Enter a valid email address.'
                : undefined
            }
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />
        </div>
      ) : (
        <Alert
          type="neutral"
          title="Check your inbox"
          body={`We sent a confirmation link to ${email.trim()}. Your email changes once you follow it.`}
        />
      )}
    </ModalCard>
  );
}
