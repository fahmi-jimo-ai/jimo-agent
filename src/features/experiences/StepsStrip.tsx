import * as React from 'react';
import { Badge } from '@/components/ui/Chip/badge';
import { Section } from '@/components/ui/Section/Section';
import { PageThumb } from '@/features/knowledge/interface/PageThumb';
import {
  EXPERIENCE_STEPS_HEADING,
  type Experience,
} from '@/data/experiences';

/**
 * The content overview — Agent Designer Sandbox `10:2271`, the block headed
 * "Hints" above the Insights section.
 *
 * One white card holding a row of step previews, each a thumbnail with its
 * caption and a small pill under it. The heading is per type
 * (`EXPERIENCE_STEPS_HEADING`) because the artboard's own word for a Checklist's
 * pieces is "Hints" and that is not what a Survey's are called.
 *
 * The thumbnails reuse `PageThumb` for the reason `ExperienceCard` gives: the
 * artboard draws flat grey placeholders, the docs call them "a small preview of
 * the first step", and there is no renderer here that could produce one — so a
 * token-drawn wireframe, seeded per step id, is the honest stand-in.
 *
 * The steps are laid out `flex-1` rather than on a grid: the artboard draws two
 * side by side filling the card, and a Tour with four should divide the same
 * row rather than leave a hole in a fixed grid.
 */
export function StepsStrip({ experience }: { experience: Experience }) {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <h2 className="m-0 [font:var(--text-subtitle-2)] text-[var(--color-text-primary)]">
        {EXPERIENCE_STEPS_HEADING[experience.type]}
      </h2>
      <Section>
        <div className="flex flex-wrap gap-[var(--space-5)]">
          {experience.steps.map((step) => (
            <div
              key={step.id}
              className="flex min-w-[200px] flex-1 flex-col items-start gap-[var(--space-3)]"
            >
              <div className="aspect-[3/1] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)]">
                <PageThumb pageId={step.id} />
              </div>
              <p className="m-0 w-full truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                {step.label}
              </p>
              <Badge type="neutral" variant="secondary" size="small">
                {step.badge}
              </Badge>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
