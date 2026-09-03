import * as React from 'react';
import { Profile2User } from 'iconsax-react';
import { Badge } from '@/components/ui/Chip/badge';

/**
 * The card's reach indicator — `6:384` draws "All users - 0 reached" in an
 * outlined pill with a people glyph, and the docs call the same control on the
 * list row a "Reach Indicator" ("Champions - 0 reached").
 *
 * The separator is a hyphen, not an en dash: the artboard prints a hyphen, and
 * this pill is one of the few places it prints prose rather than a number.
 */
export function ReachPill({ segment, reached }: { segment: string; reached: number }) {
  return (
    <Badge
      type="neutral"
      variant="secondary"
      size="small"
      leftIcon={<Profile2User size={16} variant="Linear" color="currentColor" />}
      className="max-w-full bg-[var(--color-neutral-white)] [&>[data-slot=badge-label]]:min-w-0 [&>[data-slot=badge-label]]:truncate"
    >
      {segment} - {reached.toLocaleString('en-US')} reached
    </Badge>
  );
}
