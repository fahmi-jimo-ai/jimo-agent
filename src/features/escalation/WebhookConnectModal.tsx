import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { ModalCard } from '@/components/app/ModalCard';
import { WebhookConnectFields, useWebhookConnect } from './WebhookConnectFields';
import { VENDOR_LABEL, type WebhookConfig } from '@/state/types';

/**
 * "Connect Webhook", reached from the hero's enable menu — PRD-591.
 *
 * The exact twin of `CrispConnectModal`, and deliberately so: both vendors are
 * a form rather than a redirect, so both need a standalone dialog from the hero
 * and the SAME form as a step from Configuration. Two shapes for one job is how
 * the Crisp path and this one start to drift apart.
 */
export function WebhookConnectModal({
  onCancel,
  onConnected,
}: {
  onCancel: () => void;
  onConnected: (config: WebhookConfig) => void;
}) {
  const hook = useWebhookConnect(null, onConnected);

  return (
    <ModalCard
      title={`Connect ${VENDOR_LABEL.webhook}`}
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={hook.busy}>
            Cancel
          </Button>
          <Button disabled={!hook.canSubmit} onClick={hook.submit}>
            {hook.busy ? 'Sending…' : 'Send test event'}
          </Button>
        </>
      }
    >
      <WebhookConnectFields value={hook.value} onChange={hook.setValue} disabled={hook.busy} />
    </ModalCard>
  );
}
