import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Add } from 'iconsax-react';
import { ContainedIcon } from '@/components/ui/ContainedIcon/ContainedIcon';
import {
  EXPERIENCE_LABEL,
  EXPERIENCE_PLURAL,
  EXPERIENCE_TINT,
  type ExperienceType,
} from '@/data/experiences';
import { EXPERIENCE_GLYPH } from './experienceGlyph';

/**
 * A type's dashboard with nothing in it.
 *
 * ## Invented — no artboard draws this
 *
 * `6:384` only ever draws the populated page, which is also why
 * `experiencesStore` seeds `DEMO_EXPERIENCES()`: an empty Tours dashboard is not
 * where a first visit lands. It is still reachable — delete every row of a type
 * and you are here — and a page that renders as a bare filter row with no way
 * forward is worse than one that invents a sensible entry point.
 *
 * What is NOT invented is the shape: the docs describe the real product's empty
 * state as "an interactive demo and a 'Create Tours & Modal' button, along with
 * suggested templates". There is no demo and no template library in this
 * prototype, so only the button survives — and it is the same button the
 * populated page's header carries, so the two paths build the same record.
 */
export function ExperiencesEmptyState({
  type,
  onCreate,
}: {
  type: ExperienceType;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-[var(--space-5)] py-[var(--space-10)] text-center">
      <ContainedIcon icon={EXPERIENCE_GLYPH[type]} tint={EXPERIENCE_TINT[type]} size={48} />
      <div className="flex flex-col items-center gap-[var(--space-2)]">
        <p className="m-0 [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
          No {EXPERIENCE_PLURAL[type].toLowerCase()} yet
        </p>
        <p className="m-0 max-w-[420px] [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
          Create your first {EXPERIENCE_LABEL[type].toLowerCase()} and it will show up here with
          its status, its audience and how it is performing.
        </p>
      </div>
      <Button
        leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
        onClick={onCreate}
      >
        New {EXPERIENCE_LABEL[type]}
      </Button>
    </div>
  );
}
