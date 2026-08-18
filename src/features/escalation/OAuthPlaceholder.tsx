import * as React from 'react';
import { VendorMark } from './VendorMark';
import { VENDOR_LABEL, type Vendor } from '@/state/types';

/**
 * Figma 35:3906 — a bare screen reading "Integration oAuth new tab".
 *
 * The artboard is a placeholder for a real provider redirect, so this stands in
 * for it: it shows for a beat, then resolves as connected. No real OAuth flow
 * exists in this build and none is implied.
 */
export function OAuthPlaceholder({ vendor }: { vendor: Vendor }) {
  return (
    // No min-height: the page renders this state header-less with the content
    // column set to `min-h-screen justify-center`, so centring is the parent's.
    <div className="flex w-full flex-col items-center gap-[var(--space-4)]">
      <VendorMark vendor={vendor} size={56} />
      <h2 className="m-0 [font:var(--text-subtitle-2)] text-[var(--color-text-primary)]">
        Integration oAuth new tab
      </h2>
      <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
        Authorising {VENDOR_LABEL[vendor]}…
      </p>
    </div>
  );
}
