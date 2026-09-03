import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table/Table';
import { Badge } from '@/components/ui/Chip/badge';
import { PageThumb } from '@/features/knowledge/interface/PageThumb';
import { formatRelativeLong } from '@/lib/formatRelative';
import { EXPERIENCE_LABEL, type Experience } from '@/data/experiences';
import { experienceGlyph } from './experienceGlyph';
import { StatusBadge } from './StatusBadge';
import { ReachPill } from './ReachPill';
import { ExperienceRowMenu, type ExperienceActions } from './ExperienceRowMenu';

/**
 * The two list display modes — the docs' "detailed list (by default)" and
 * "simplified list". Neither is drawn: `6:384` only ever shows the mosaic.
 *
 * They are not invented, though. The docs enumerate the detailed row's contents
 * exactly — "status indicator, a small preview of the first step, the experience
 * name, creation date and tags, and a reach indicator", plus Edit / Settings /
 * Duplicate / Delete on hover — so this is a transcription into the columns
 * `Table` gives. The simplified list is the same row with the preview, the tags
 * and the reach dropped, which is the only thing "simplified" can mean when the
 * detailed one is defined down to its parts.
 *
 * One component with a `dense` flag rather than two files: they differ in which
 * columns render, and a near-copy is how the two would stop agreeing about what
 * a row means.
 *
 * `Table`'s columns all floor at `min-w-[180px]`, so every narrow one carries
 * `w-[1%] min-w-0 whitespace-nowrap` on BOTH its head and its cell — applying it
 * to the head alone leaves the column pinned by the body.
 */
const NARROW = 'w-[1%] min-w-0 whitespace-nowrap';

export function ExperienceTable({
  experiences,
  dense = false,
  showType,
  now = Date.now(),
  onOpen,
  actionsFor,
}: {
  experiences: Experience[];
  dense?: boolean;
  showType: boolean;
  now?: number;
  onOpen: (experience: Experience) => void;
  actionsFor: (experience: Experience) => ExperienceActions;
}) {
  return (
    <Table scroll={false}>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {showType && <TableHead className={NARROW}>Type</TableHead>}
          <TableHead className={NARROW}>Status</TableHead>
          {!dense && <TableHead className={NARROW}>Tags</TableHead>}
          {!dense && <TableHead className={NARROW}>Reach</TableHead>}
          {dense && <TableHead className={NARROW}>Created</TableHead>}
          {/* The actions column is headed by nothing on purpose — a "Actions"
              label would be the widest thing in a 34px column. */}
          <TableHead className={NARROW}>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {experiences.map((experience) => (
          <TableRow key={experience.id} interactive onClick={() => onOpen(experience)}>
            <TableCell className="max-w-[420px]">
              <span className="flex items-center gap-[var(--space-3)]">
                {!dense && (
                  <span className="h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-muted)]">
                    <PageThumb pageId={experience.steps[0]?.id ?? experience.id} />
                  </span>
                )}
                <span className="flex min-w-0 flex-col">
                  <span className="truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                    {experience.name}
                  </span>
                  {!dense && (
                    <span className="truncate [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
                      Created {formatRelativeLong(experience.createdAt, now)}
                    </span>
                  )}
                </span>
              </span>
            </TableCell>

            {showType && (
              <TableCell className={NARROW}>
                <Badge
                  type="neutral"
                  variant="secondary"
                  size="small"
                  leftIcon={experienceGlyph(experience.type, 16)}
                >
                  {EXPERIENCE_LABEL[experience.type]}
                </Badge>
              </TableCell>
            )}

            <TableCell className={NARROW}>
              <StatusBadge status={experience.status} />
            </TableCell>

            {!dense && (
              <TableCell className={NARROW}>
                {experience.tags.length === 0 ? (
                  <span className="text-[var(--color-text-tertiary)]">—</span>
                ) : (
                  <span className="flex items-center gap-[var(--space-2)]">
                    {experience.tags.map((tag) => (
                      <Badge key={tag} type="neutral" variant="secondary" size="small">
                        {tag}
                      </Badge>
                    ))}
                  </span>
                )}
              </TableCell>
            )}

            {!dense && (
              <TableCell className={NARROW}>
                <ReachPill segment={experience.segmentLabel} reached={experience.reached} />
              </TableCell>
            )}

            {dense && (
              <TableCell className={NARROW} muted>
                {formatRelativeLong(experience.createdAt, now)}
              </TableCell>
            )}

            {/* The row opens the detail, so the kebab has to stop the click —
                the same guard `SourceTable` puts on its row action buttons. */}
            <TableCell className={NARROW}>
              <span onClick={(e) => e.stopPropagation()} className="inline-flex">
                <ExperienceRowMenu experience={experience} actions={actionsFor(experience)} />
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
