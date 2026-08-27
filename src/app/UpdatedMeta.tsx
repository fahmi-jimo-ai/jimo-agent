import * as React from 'react';
import { Refresh2 } from 'iconsax-react';

/**
 * The "⟳ Updated Jan 20, 14:20PM" status line both analytics pages carry —
 * Figma 934:27942 draws it at the right end of the title row on every artboard.
 *
 * Fed to `PageHeader`'s forked `meta` prop. The timestamp is the artboard's own
 * string, fixed rather than derived from the clock: a fixture that moves with
 * wall time makes every screenshot diff a false positive.
 */
export const UPDATED_AT = 'Updated Jan 20, 14:20PM';

export function UpdatedMeta() {
  return (
    <>
      <Refresh2 size={16} variant="Linear" color="currentColor" />
      <span>{UPDATED_AT}</span>
    </>
  );
}
