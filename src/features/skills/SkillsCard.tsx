import * as React from 'react';
import { Section } from '@/components/ui/Section/Section';
import { PropertyEmptyState } from '@/features/knowledge/PropertyEmptyState';
import { filterSkills, splitByScope } from '@/state/skillsStore';
import type { SkillModeFilter, SkillSort } from '@/state/skillsStore';
import type { Skill, SkillMode } from '@/data/skills';
import { SkillsToolbar } from './SkillsToolbar';
import { SkillTable } from './SkillTable';
import { SkillsEmptyState } from './SkillsEmptyState';

/**
 * The Skills list — Figma `12987:11526`.
 *
 * Three body states, the same shape `SourcesCard` uses:
 *   - no skills at all: the entry cards. There is nothing to search.
 *   - some skills: the table.
 *   - a filter that matches nothing: the table is replaced, the toolbar stays.
 *
 * ## The toolbar is ABOVE the card, not in its header
 *
 * This is where it parts company with `SourcesCard`, and it is the artboard's
 * arrangement rather than a preference: `12987:11526` puts the search field and
 * the two filters on the page ground, with the white table card starting below
 * them. So the `Section` has no `title` and no `controls` — the toolbar IS the
 * header on this artboard — and the two are stacked here rather than nested.
 *
 * The card keeps `flushBody` because its body is a `Table` (Table/CONTEXT.md).
 * The toolbar sits outside that, so it carries no `--space-4` inset of its own,
 * unlike `SourceToolbar`, which lives on the table's cell line.
 *
 * Filtering happens here, on the unfiltered list the page passes down, via the
 * store's own `filterSkills` — the same pure helper the vitest suite covers, so
 * the search, the mode filter and the four sorts cannot drift from their tests.
 */
export function SkillsCard({
  skills,
  search,
  onSearch,
  mode,
  onMode,
  sort,
  onSort,
  onOpen,
  onAdd,
}: {
  /** Unfiltered — the card filters. */
  skills: Skill[];
  search: string;
  onSearch: (value: string) => void;
  mode: SkillModeFilter;
  onMode: (value: SkillModeFilter) => void;
  sort: SkillSort;
  onSort: (value: SkillSort) => void;
  onOpen: (skill: Skill) => void;
  onAdd: (mode: SkillMode) => void;
}) {
  const shown = filterSkills(skills, { search, mode, sort });
  const hasAny = skills.length > 0;

  /* PRD-584. Two tables, not a "Scope" column: Zoe asked to be able to separate
     "explains a screen" from "explains a concept", and a column you can sort by
     still interleaves them. The split happens AFTER filtering, so search and
     the mode filter keep working across both, and a heading only appears when
     that half has rows — a lone "Global" header over nothing would make an
     empty list look broken. */
  const { page: pageScoped, global: globalScoped } = splitByScope(shown);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* No toolbar with nothing to filter — the same call SourcesCard makes. */}
      {hasAny && (
        <SkillsToolbar
          search={search}
          onSearch={onSearch}
          mode={mode}
          onMode={onMode}
          sort={sort}
          onSort={onSort}
        />
      )}

      {!hasAny ? (
        <Section flushBody>
          <SkillsEmptyState onPick={onAdd} />
        </Section>
      ) : shown.length === 0 ? (
        <Section flushBody>
          <PropertyEmptyState title="No skills found" />
        </Section>
      ) : (
        <>
          {pageScoped.length > 0 && (
            <Section flushBody title={globalScoped.length > 0 ? 'On a page' : undefined}>
              <SkillTable skills={pageScoped} onOpen={onOpen} />
            </Section>
          )}
          {globalScoped.length > 0 && (
            <Section
              flushBody
              title={pageScoped.length > 0 ? 'Everywhere' : undefined}
            >
              <SkillTable skills={globalScoped} onOpen={onOpen} />
            </Section>
          )}
        </>
      )}
    </div>
  );
}
