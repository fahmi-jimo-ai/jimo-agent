import * as React from 'react';
import { ExportSquare, Global, InfoCircle } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { formatRelative } from '@/lib/formatRelative';
import { SKILL_MODE_LABEL, type Skill } from '@/data/skills';
import type { InterfacePage } from '@/data/interfacePages';
import { skillGlyph } from './skillGlyph';

/**
 * The skill drawer's Description tab — Figma `12987:14597`.
 *
 * Two `Section` cards stacked: the meta row plus the description prose, then
 * Instructions. Same shape `SourceDetailDrawer` uses for Content Detail, and for
 * the same reason it gives — the values are a definition list, not a table.
 *
 * ## The meta row is three columns, not three rows
 *
 * `12987:14597` lays Mode / Interface / Last updated side by side above the
 * description, which is why this is a `grid-cols-3` rather than the 160px
 * label column `SourceDetailDrawer` draws. Three short values read as a header
 * band; stacked they would push the description below the fold of a 600px
 * panel, which is the one thing the tab exists to show.
 *
 * ## A skill that lost its page says so
 *
 * `Interface` is a link to the scanned page the skill was built on. `pageId` is
 * nullable by design (`skills.ts`), and a page can also be removed from the
 * Interface tab after a skill was pointed at it — so the value falls back to a
 * muted em dash and renders NO link. Printing a page name that no longer
 * resolves, or a link that opens nothing, would be worse than admitting the
 * host page is gone.
 *
 * ## `{{placeholder}}` is highlighted, numbered lines are not re-parsed
 *
 * The artboard shows the instruction placeholders picked out from the prose, so
 * `{{…}}` runs get the brand tint. The numbered steps are already numbered
 * inside the string, so the body is `whitespace-pre-wrap` and nothing splits it
 * into a list — an `<ol>` here would renumber prose the author wrote by hand.
 */

/** Splits on `{{token}}` runs, keeping them. */
const PLACEHOLDER_SPLIT = /(\{\{[^}]+\}\})/g;
/** Anchored and NOT global: a /g regex carries `lastIndex` between `.test`
 *  calls, so reusing the splitter to classify each part would match every other
 *  placeholder and skip the rest. */
const IS_PLACEHOLDER = /^\{\{[^}]+\}\}$/;

function Instructions({ text }: { text: string }) {
  return (
    <p className="m-0 whitespace-pre-wrap rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-[var(--space-4)] py-[var(--space-3)] [font:var(--text-body-3)] text-[var(--color-text-primary)]">
      {text.split(PLACEHOLDER_SPLIT).map((part, i) =>
        IS_PLACEHOLDER.test(part) ? (
          <span
            key={i}
            className="rounded-[var(--radius-sm)] bg-[var(--color-brand-subtle)] px-[var(--space-1)] [font:var(--text-subtitle-4)] text-[var(--color-brand-default)]"
          >
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </p>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--space-2)]">
      <span className="[font:var(--text-body-4)] text-[var(--color-text-secondary)]">{label}</span>
      <span className="flex min-w-0 items-center gap-[var(--space-2)] [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
        {children}
      </span>
    </div>
  );
}

export function SkillDescriptionTab({
  skill,
  page,
  onOpenPage,
}: {
  skill: Skill;
  /** The skill's host page, or `null` when `pageId` is unset or has been removed. */
  page: InterfacePage | null;
  onOpenPage: (pageId: string) => void;
}) {
  return (
    <>
      <Section className="gap-[var(--space-5)]">
        <div className="grid grid-cols-3 gap-[var(--space-4)]">
          <Meta label="Mode">
            <span aria-hidden="true" className="flex shrink-0 items-center">
              {skillGlyph(skill.mode, 20)}
            </span>
            {SKILL_MODE_LABEL[skill.mode]}
          </Meta>
          <Meta label="Interface">
            {/* PRD-584. Three readings, not two: a page, "Global" for a skill
                that was never about a screen, and the em dash for one whose
                page is gone. Collapsing the last two is exactly the confusion
                the ticket is about — one of them is working as intended and
                the other is broken. */}
            {skill.scope === 'global' ? (
              <span className="flex min-w-0 items-center gap-[var(--space-1)] text-[var(--color-text-primary)]">
                <Global size={16} variant="Linear" color="currentColor" />
                <span className="truncate">Global</span>
              </span>
            ) : page ? (
              <button
                type="button"
                onClick={() => onOpenPage(page.id)}
                className="flex min-w-0 cursor-pointer items-center gap-[var(--space-1)] border-0 bg-transparent p-0 text-left [font:var(--text-subtitle-4)] text-[var(--color-brand-default)] [transition:color_var(--transition-fast)] hover:text-[var(--color-brand-hover)] hover:underline"
              >
                <span className="truncate">{page.name}</span>
                <ExportSquare size={16} variant="Linear" color="currentColor" />
              </button>
            ) : (
              <span className="text-[var(--color-text-tertiary)]">—</span>
            )}
          </Meta>
          <Meta label="Last updated">{formatRelative(skill.updatedAt)}</Meta>
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <span className="flex items-center gap-[var(--space-1)] [font:var(--text-body-4)] text-[var(--color-text-secondary)]">
            Description
            <span aria-hidden="true" className="flex items-center">
              <InfoCircle size={16} variant="Linear" color="currentColor" />
            </span>
          </span>
          <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-primary)]">
            {skill.description}
          </p>
        </div>
      </Section>

      <Section title="Instructions">
        <Instructions text={skill.instructions} />
      </Section>
    </>
  );
}
