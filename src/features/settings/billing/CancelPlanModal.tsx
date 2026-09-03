import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { ModalCard } from '@/components/app/ModalCard';

/**
 * Figma 13:12409 — "Plan successfully cancelled. Thank you for your feedback."
 * The artboard's confirmation copy implies a reason was asked for, so the flow
 * is ask -> confirm, as two steps of ONE card.
 *
 * The reason list is invented; nothing documents it.
 */
const REASONS = [
  'Too expensive',
  'Not using it enough',
  'Missing a feature we need',
  'Switching to something else',
  'Other',
];

export function CancelPlanModal({
  planName,
  renewsAt,
  onClose,
  onConfirm,
}: {
  planName: string;
  renewsAt: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [step, setStep] = React.useState<'reason' | 'confirm'>('reason');
  const [reason, setReason] = React.useState('');
  const [other, setOther] = React.useState('');

  const chosen = reason === 'Other' ? other.trim() : reason;
  const valid = chosen !== '';

  return (
    <ModalCard
      title={step === 'confirm' ? `Cancel ${planName}?` : 'Before you go'}
      variant={step === 'confirm' ? 'confirm' : 'card'}
      step={step}
      direction={step === 'reason' ? 'back' : 'forward'}
      onClose={onClose}
      footer={
        step === 'reason' ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Keep my plan
            </Button>
            <Button disabled={!valid} onClick={() => setStep('confirm')}>
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep('reason')}>
              Back
            </Button>
            <Button danger onClick={() => onConfirm(chosen)}>
              Cancel plan
            </Button>
          </>
        )
      }
    >
      {step === 'reason' ? (
        <div className="flex flex-col gap-[var(--space-3)]">
          <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            What made you decide to cancel?
          </span>
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={reason === r}
              className={`rounded-[var(--radius-lg)] border p-[var(--space-3)] text-left [font:var(--text-body-3)] ${
                reason === r
                  ? 'border-[var(--color-border-focus)] bg-[var(--color-brand-subtle)] text-[var(--color-brand-default)]'
                  : 'border-[var(--color-border-default)] text-[var(--color-text-primary)]'
              }`}
              onClick={() => setReason(r)}
            >
              {r}
            </button>
          ))}
          {reason === 'Other' && (
            <Input
              aria-label="Tell us more"
              placeholder="Tell us more"
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
          )}
        </div>
      ) : (
        <>
          You keep {planName} until{renewsAt ? ` ${renewsAt}` : ' the end of the period'}, then drop
          to Free. Your experiences stop showing once you pass the Free limits.
        </>
      )}
    </ModalCard>
  );
}
