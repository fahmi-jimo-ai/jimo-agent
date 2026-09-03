import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * A vendor's initial on a tinted tile.
 *
 * INVENTED, and labelled as such, for the same reason `Avatar` is: the
 * artboards use each vendor's real wordmark, and shipping seven third-party
 * logos into this repo would mean vendoring trademarked assets for a
 * prototype. The tint is derived from the id so a vendor keeps its colour
 * across renders and screenshot diffs.
 *
 * Escalation already has its own `VendorMark` for Intercom/Zendesk/Crisp/email;
 * this is a separate component rather than an extension of it because that one
 * is about the escalation vendor enum and draws real glyphs for four fixed
 * cases, while this one covers an open catalogue.
 */
const TINTS = [
  'bg-[var(--color-blue-100)] text-[var(--color-blue-500)]',
  'bg-[var(--color-green-100)] text-[var(--color-green-500)]',
  'bg-[var(--color-purple-100)] text-[var(--color-purple-500)]',
  'bg-[var(--color-orange-100)] text-[var(--color-orange-500)]',
  'bg-[var(--color-red-100)] text-[var(--color-red-500)]',
];

export function VendorMark({
  name,
  id,
  className,
}: {
  name: string;
  id: string;
  className?: string;
}) {
  const tint = TINTS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-10 shrink-0 select-none items-center justify-center rounded-[var(--radius-lg)] [font:var(--text-subtitle-3)]',
        tint,
        className,
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
