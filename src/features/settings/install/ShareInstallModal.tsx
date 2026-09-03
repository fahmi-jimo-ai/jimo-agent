import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { ModalCard } from '@/components/app/ModalCard';
import { useToast } from '@/components/app/toast';

/**
 * Figma 13:10582 — "Share installation instructions".
 *
 * The docs call it "Share to teammate" and say it "automatically drafts an
 * email ready to send", so this opens a real `mailto:` rather than pretending
 * to send one from a server this prototype does not have.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ShareInstallModal({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = React.useState('');
  const toast = useToast();
  const valid = EMAIL_RE.test(email.trim());

  const send = () => {
    const subject = encodeURIComponent('Install the Jimo snippet');
    const body = encodeURIComponent(
      `Hi,\n\nPlease add the Jimo snippet to the <head> of our site.\n\n` +
        `Project ID: ${projectId}\n` +
        `Instructions: https://help.usejimo.com/docs/settings/installation\n\nThanks!`,
    );
    window.open(`mailto:${email.trim()}?subject=${subject}&body=${body}`, '_self');
    toast({ type: 'positive', title: 'Draft email opened' });
    onClose();
  };

  return (
    <ModalCard
      title="Share installation instructions"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={send}>
            Draft email
          </Button>
        </>
      }
    >
      <Input
        label="Developer's email"
        type="email"
        placeholder="dev@yourcompany.com"
        value={email}
        supportiveText="Opens a pre-filled email with your project ID and a link to the docs."
        onChange={(e) => setEmail(e.target.value)}
      />
    </ModalCard>
  );
}
