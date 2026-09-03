import * as React from 'react';
import { Badge } from '@/components/ui/Chip/badge';
import { PageThumb } from '@/features/knowledge/interface/PageThumb';
import { formatRelativeLong } from '@/lib/formatRelative';
import { EXPERIENCE_LABEL, type Experience } from '@/data/experiences';
import { experienceGlyph } from './experienceGlyph';
import { StatusBadge } from './StatusBadge';
import { ReachPill } from './ReachPill';
import { ExperienceRowMenu, type ExperienceActions } from './ExperienceRowMenu';

/**
 * One card in the mosaic — Agent Designer Sandbox `6:384` ("Poke Card").
 *
 * Four stacked parts in the artboard's order: a preview of the first step with
 * the status chip laid over it, the name, "Created N days ago", and the reach
 * pill. The docs describe the same four on the list row, plus the hover
 * actions this kebab carries.
 *
 * ## The thumbnail is `PageThumb`, not a screenshot
 *
 * The artboard draws a flat grey rectangle — a placeholder, not a design — and
 * the docs describe it as "a small preview of the first step". There is no
 * renderer here that could produce that preview, so it reuses the wireframe
 * `PageThumb` already draws from tokens for exactly this problem, seeded off the
 * first step's id so two cards never show the same silhouette.
 *
 * ## The type badge appears only when it says something
 *
 * A Tours page shows only tours, so a "Tour" badge on every card would be noise.
 * It renders when the `Contexts` filter has been widened past one type — which
 * is the rule the Spaces doc already states for a multi-type view ("each
 * experience card includes its type badge").
 *
 * ## The kebab must not open the detail
 *
 * The whole card is the link, so the kebab's wrapper stops the click — the same
 * guard `PageCard` uses. The menu's own panel needs none: `Menu` portals it to
 * `<body>`, so a click inside it was never a descendant of this card.
 */
export function ExperienceCard({
  experience,
  showType,
  now,
  onOpen,
  actions,
}: {
  experience: Experience;
  showType: boolean;
  now: number;
  onOpen: () => void;
  actions: ExperienceActions;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${experience.name}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onOpen();
      }}
      className="group/card flex cursor-pointer flex-col gap-[var(--space-3)] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-default)] p-[var(--space-4)] outline-none [transition:border-color_var(--transition-fast),box-shadow_var(--transition-fast)] hover:border-[var(--color-border-strong)] hover:[box-shadow:var(--shadow-elevation-02)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-400)]"
    >
      <div className="relative">
        <div className="aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)]">
          <PageThumb pageId={experience.steps[0]?.id ?? experience.id} />
        </div>

        <div className="absolute top-[var(--space-3)] left-[var(--space-3)] flex items-center gap-[var(--space-2)]">
          <StatusBadge status={experience.status} />
          {showType && (
            <Badge
              type="neutral"
              variant="secondary"
              size="small"
              leftIcon={experienceGlyph(experience.type, 16)}
            >
              {EXPERIENCE_LABEL[experience.type]}
            </Badge>
          )}
        </div>

        {/* Hover-revealed on the artboard, and focus-revealed here too — a
            control that only exists under a pointer is unreachable from the
            keyboard otherwise. */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[var(--space-3)] right-[var(--space-3)] opacity-0 [transition:opacity_var(--transition-fast)] group-hover/card:opacity-100 focus-within:opacity-100"
        >
          <ExperienceRowMenu experience={experience} actions={actions} />
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-start gap-[var(--space-1)]">
        <p className="m-0 w-full truncate [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
          {experience.name}
        </p>
        <p className="m-0 w-full truncate [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
          Created {formatRelativeLong(experience.createdAt, now)}
        </p>
      </div>

      <ReachPill segment={experience.segmentLabel} reached={experience.reached} />
    </div>
  );
}
