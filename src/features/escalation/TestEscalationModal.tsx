import * as React from 'react';
import { Export } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { ModalCard } from './ModalCard';
import { VendorMark } from './VendorMark';
import { useToast } from './toast';
import { openWidget } from './openWidget';
import { useEscalation } from '@/state/useEscalation';
import { VENDOR_LABEL } from '@/state/types';
import { SAMPLE_BRIEF, SAMPLE_NOTE } from '@/data/fixtures';

const SEND_MS = 900;

/**
 * "Send a test escalation" has no designed result state in Figma, so this is
 * the agreed invention: show BOTH payloads side by side before sending, because
 * the whole feature rests on the difference between them — the brief is the
 * user's own visible message, the note is private to the support agent.
 */
export function TestEscalationModal({ onClose }: { onClose: () => void }) {
  const { vendor, topics } = useEscalation();
  const [sending, setSending] = React.useState(false);
  const toast = useToast();
  const name = vendor ? VENDOR_LABEL[vendor] : 'your support tool';
  const canNote = vendor !== 'email';

  const send = () => {
    setSending(true);
    window.setTimeout(() => {
      onClose();
      toast({
        type: 'positive',
        title: `Test escalation sent to ${name}`,
        body: canNote
          ? 'Look for a conversation tagged “test” — the private note is attached, invisible to the user.'
          : 'Look for a new email carrying the brief and the transcript.',
        // The modal that held the widget link has just closed, so the toast
        // carries it — this is the moment you want to watch it happen.
        secondaryAction: (
          <span className="inline-flex items-center gap-[var(--space-2)]">
            <Export size={16} variant="Linear" color="currentColor" />
            Open widget
          </span>
        ),
        onSecondaryAction: openWidget,
      });
    }, SEND_MS);
  };

  return (
    <ModalCard
      title="Send a test escalation"
      onClose={onClose}
      width={720}
      footer={
        <>
          {/* The live simulator's only entry point. It lives here rather than in
              the page toolbar so the Escalation page stays 1:1 with the Figma,
              and this modal already means "try this for real". */}
          <Button variant="link" onClick={openWidget}>
            Open the live widget ↗
          </Button>
          <span className="flex-1" />
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={sending} onClick={send}>
            {sending ? 'Sending…' : `Send to ${name}`}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-[var(--space-2)] [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
        {vendor && <VendorMark vendor={vendor} size={18} />}
        This is exactly what a real hand-off delivers.
      </div>

      <div className="grid grid-cols-2 gap-[var(--space-4)] max-[820px]:grid-cols-1">
        {/* What the user sends — public, in their own voice, never redacted. */}
        <Panel label="What the user sends" hint="Posted as the user, in their own words">
          <div className="flex justify-end">
            <p className="m-0 max-w-[92%] rounded-[var(--radius-lg)] rounded-br-[var(--radius-sm)] bg-[var(--color-blue-400)] px-[var(--space-4)] py-[var(--space-3)] [font:var(--text-body-3)] text-[var(--color-text-inverse)]">
              {SAMPLE_BRIEF}
            </p>
          </div>
        </Panel>

        {/* What only the team sees. */}
        <Panel
          label="The private note"
          hint={canNote ? 'Visible to your team only — never to the user' : 'Email carries the transcript inline'}
        >
          <dl className="m-0 flex flex-col gap-[var(--space-2)]">
            <NoteLine k="User" v={SAMPLE_NOTE.user} />
            <NoteLine k="Page" v={SAMPLE_NOTE.page} />
            <NoteLine k="Reason" v={SAMPLE_NOTE.reason} />
            <NoteLine k="Topic" v={topics[0]?.label ?? SAMPLE_NOTE.topic} />
            <NoteLine k="Transcript" v={SAMPLE_NOTE.transcript} />
          </dl>
          <div className="mt-[var(--space-3)] flex gap-[var(--space-2)]">
            <Badge type="neutral" variant="secondary" size="xx-small">jimo-handoff</Badge>
            <Badge type="neutral" variant="secondary" size="xx-small">test</Badge>
          </div>
        </Panel>
      </div>
    </ModalCard>
  );
}

function Panel({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] p-[var(--space-4)]">
      <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">{label}</span>
      {children}
      <span className="[font:var(--text-body-4)] text-[var(--color-text-tertiary)]">{hint}</span>
    </div>
  );
}

function NoteLine({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-[var(--space-2)] [font:var(--text-body-4)]">
      <dt className="w-[72px] shrink-0 text-[var(--color-text-tertiary)]">{k}</dt>
      <dd className="m-0 min-w-0 flex-1 text-[var(--color-text-secondary)]">{v}</dd>
    </div>
  );
}
