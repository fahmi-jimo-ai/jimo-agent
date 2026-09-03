import * as React from 'react';
import { Badge } from '@/components/ui/Chip/badge';
import { EXPERIENCE_STATUS_BADGE, EXPERIENCE_STATUS_LABEL, type ExperienceStatus } from '@/data/experiences';

/**
 * The status chip — `6:384` overlays a green "Live" on the card's thumbnail.
 *
 * A `Badge`, not a hand-drawn pill: the artboard's chip is Badge's `positive`
 * `secondary` at `small` down to the fill, border and type ramp. The colour
 * ladder for the other four lives in `EXPERIENCE_STATUS_BADGE` so the mosaic
 * card, the list row and the detail header can never disagree about it.
 */
export function StatusBadge({ status }: { status: ExperienceStatus }) {
  return (
    <Badge type={EXPERIENCE_STATUS_BADGE[status]} variant="secondary" size="small">
      {EXPERIENCE_STATUS_LABEL[status]}
    </Badge>
  );
}
