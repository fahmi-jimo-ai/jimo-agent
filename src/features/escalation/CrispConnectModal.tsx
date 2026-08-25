import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { ModalCard } from '@/components/app/ModalCard';
import { CrispConnectFields, useCrispConnect } from './CrispConnectFields';
import { VENDOR_LABEL, type CrispCredentials } from '@/state/types';

/**
 * "Connect Crisp Chat", reached from the hero's enable menu.
 *
 * Crisp is the one vendor that does not go through the OAuth redirect
 * placeholder, so it gets a form instead of a beat. This is a standalone
 * dialog because nothing is open behind it — from Configuration the SAME form
 * renders as a step of the dialog already on screen, never a second overlay.
 *
 * "Cancel", not "Skip for now": there is nothing to skip. Without the
 * credentials there is no Crisp connection at all, so the secondary action
 * backs out of connecting rather than deferring a detail of it.
 */
export function CrispConnectModal({
  onCancel,
  onConnected,
}: {
  onCancel: () => void;
  onConnected: (creds: CrispCredentials) => void;
}) {
  const crisp = useCrispConnect(null, onConnected);

  return (
    <ModalCard
      title={`Connect ${VENDOR_LABEL.crisp}`}
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={crisp.busy}>
            Cancel
          </Button>
          <Button disabled={!crisp.canSubmit} onClick={crisp.submit}>
            {crisp.busy ? 'Testing connection…' : 'Connect and test'}
          </Button>
        </>
      }
    >
      <CrispConnectFields value={crisp.value} onChange={crisp.setValue} disabled={crisp.busy} />
    </ModalCard>
  );
}
