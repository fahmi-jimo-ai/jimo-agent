import * as React from 'react';
import type { Experience } from '@/data/experiences';
import { ExperienceCard } from './ExperienceCard';
import type { ExperienceActions } from './ExperienceRowMenu';

/**
 * The card grid — `6:384`.
 *
 * Three columns at `--space-5`, which is the artboard's arithmetic rather than a
 * number anyone chose: `AppShell`'s 1064 column less its two `--space-8` gutters
 * is 1000, and 3 × 320 + 2 × 20 = 1000. Declared `grid-cols-3` rather than an
 * auto-fill minmax for the reason `PageGrid` states — an auto-fill grid would
 * silently re-flow to 2 or 4 at other widths and stop matching the board.
 *
 * `now` is a prop defaulted once so every card's "Created N days ago" is read
 * off one clock, the same discipline `SkillTable` uses for its Last updated
 * column.
 */
export function ExperienceMosaic({
  experiences,
  showType,
  now = Date.now(),
  onOpen,
  actionsFor,
}: {
  experiences: Experience[];
  showType: boolean;
  now?: number;
  onOpen: (experience: Experience) => void;
  actionsFor: (experience: Experience) => ExperienceActions;
}) {
  return (
    <div className="grid grid-cols-3 gap-[var(--space-5)]">
      {experiences.map((experience) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          showType={showType}
          now={now}
          onOpen={() => onOpen(experience)}
          actions={actionsFor(experience)}
        />
      ))}
    </div>
  );
}
