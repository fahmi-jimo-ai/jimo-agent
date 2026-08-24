import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { ModalCard } from '@/components/app/ModalCard';

/** Figma 35:4224 — "What's your team support email?" */
export function SupportEmailModal({
  onCancel,
  onEnable,
}: {
  onCancel: () => void;
  onEnable: (email: string) => void;
}) {
  const [email, setEmail] = React.useState('');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <ModalCard
      title="What’s your team support email?"
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onEnable(email.trim())}>
            Enable escalation
          </Button>
        </>
      }
    >
      <Input
        label="Support Email"
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && valid) onEnable(email.trim());
        }}
        supportiveText="Escalation details will be sent to this email for user follow-up."
      />
    </ModalCard>
  );
}
