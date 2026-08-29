import * as React from 'react';
import { InfoCircle } from 'iconsax-react';
import { Badge } from '@/components/ui/Chip/badge';
import { completionRate, type Skill } from '@/data/skills';

/**
 * The Completion rate cell — Figma `12987:11526`.
 *
 * Three chips, and the first one is the reason this is a component rather than
 * a formatted number: the artboard gives a never-run skill its OWN chip reading
 * "No runs yet" instead of printing 0%, which is why `completionRate()` returns
 * `null` rather than 0. A skill that has not been tried has not failed.
 *
 * That state is drawn OUTLINED and neutral, which is `Badge`'s `neutral` +
 * `secondary` pairing verbatim (white fill, Neutral/300 border, Neutral/800
 * text) — no local classes needed.
 *
 * ## Invented: the 50% cut
 *
 * The artboard prints exactly two numeric chips — 44% red and 88% green — and
 * never says where the boundary is. 50% is the midpoint between the only two
 * examples that exist, it is the value a reader would guess from the two chips,
 * and it is the only threshold that needs no further justification. Invented,
 * and labelled here rather than left to look transcribed.
 */
const FAILING_BELOW = 50;

export function CompletionRateChip({ skill }: { skill: Skill }) {
  const rate = completionRate(skill);

  if (rate === null) {
    return (
      <Badge size="small" type="neutral" variant="secondary">
        No runs yet
      </Badge>
    );
  }

  const failing = rate < FAILING_BELOW;

  return (
    <Badge
      size="small"
      type={failing ? 'negative' : 'positive'}
      variant="secondary"
      className="tabular-nums"
      leftIcon={
        failing ? <InfoCircle size={16} variant="Linear" color="currentColor" /> : undefined
      }
    >
      {rate}%
    </Badge>
  );
}
