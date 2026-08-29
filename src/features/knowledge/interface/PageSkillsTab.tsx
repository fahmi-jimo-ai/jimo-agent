import * as React from 'react';
import { ArrowRight2 } from 'iconsax-react';
import { ContainedIcon } from '@/components/ui/ContainedIcon/ContainedIcon';
import { useSkills, skillsForPage } from '@/state/useSkills';
import { SKILL_MODE_LABEL, SKILL_MODE_TINT, type Skill, type SkillMode } from '@/data/skills';
import { SKILL_GLYPH } from '@/features/skills/skillGlyph';
import type { InterfacePage } from '@/data/interfacePages';
import { PageThumb } from './PageThumb';

/**
 * The page drawer's Skills tab — Figma `12987:13517`.
 *
 * Every skill whose `pageId` is this page, split into the artboard's two
 * groups. The casing is the artboard's own and it is INCONSISTENT — it prints
 * "Enabled Skills" with a capital S and "Disabled skills" with a small one.
 * Kept verbatim rather than tidied: a silent correction here is a silent
 * divergence from the file, and the note is cheaper than the drift.
 *
 * An empty group is omitted entirely — a heading over nothing states a fact
 * nobody asked for. Both empty is one muted line instead, matching how
 * `PageElementGroups` handles a page with no elements.
 *
 * ## The strip is decoration, and its tint is a literal class
 *
 * `PageThumb strip` is the faint panel the artboard puts at the right of each
 * row. Its tint arrives as `blockClass` from `STRIP_BLOCK` below — a static map
 * of LITERAL class strings, never a computed `bg-${mode}`, which Tailwind cannot
 * see. It is `aria-hidden` inside `PageThumb`, so it adds nothing to the row's
 * accessible name.
 *
 * The mode reads twice on purpose, once as colour and once as words: the
 * `ContainedIcon` carries `SKILL_MODE_TINT` and the second line spells it out,
 * so the row is legible without relying on the tint alone.
 */

/** Strip tint per mode. Literal classes — see the header. */
const STRIP_BLOCK: Record<SkillMode, string> = {
  execute: 'bg-[var(--color-green-200)]',
  guide: 'bg-[var(--color-blue-200)]',
  explain: 'bg-[var(--color-purple-200)]',
};

function SkillRow({
  skill,
  pageId,
  onOpenSkill,
}: {
  skill: Skill;
  pageId: string;
  onOpenSkill?: (skillId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenSkill?.(skill.id)}
      className="flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-neutral-white)] px-[var(--space-3)] py-[var(--space-3)] text-left [transition:border-color_var(--transition-fast)] hover:border-[var(--color-border-strong)]"
    >
      <ContainedIcon icon={SKILL_GLYPH[skill.mode]} tint={SKILL_MODE_TINT[skill.mode]} size={32} />

      <span className="flex min-w-0 flex-1 flex-col gap-[var(--space-1)]">
        <span className="truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
          {skill.name}
        </span>
        <span className="truncate [font:var(--text-body-4)] text-[var(--color-text-secondary)]">
          {SKILL_MODE_LABEL[skill.mode]} Skill
        </span>
      </span>

      <PageThumb
        pageId={pageId}
        strip
        blockClass={STRIP_BLOCK[skill.mode]}
        className="h-[32px] w-[64px] shrink-0"
      />

      <span
        aria-hidden="true"
        className="flex size-5 shrink-0 items-center justify-center text-[var(--color-text-tertiary)]"
      >
        <ArrowRight2 size={20} variant="Linear" color="currentColor" />
      </span>
    </button>
  );
}

function Group({
  label,
  skills,
  pageId,
  onOpenSkill,
}: {
  label: string;
  skills: Skill[];
  pageId: string;
  onOpenSkill?: (skillId: string) => void;
}) {
  if (skills.length === 0) return null;

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">{label}</p>
      <div className="flex flex-col gap-[var(--space-2)]">
        {skills.map((skill) => (
          <SkillRow
            key={skill.id}
            skill={skill}
            pageId={pageId}
            onOpenSkill={onOpenSkill}
          />
        ))}
      </div>
    </div>
  );
}

export function PageSkillsTab({
  page,
  onOpenSkill,
}: {
  page: InterfacePage;
  /** Hands the row back to `/skills` — see `KnowledgePage`'s round trip. */
  onOpenSkill?: (skillId: string) => void;
}) {
  const { skills } = useSkills();

  // Read from the store rather than from a prop: a skill toggled in the skills
  // page must move between the two groups here without this panel re-mounting.
  const mine = skillsForPage(skills, page.id);
  const active = mine.filter((s) => s.active);
  const inactive = mine.filter((s) => !s.active);

  if (mine.length === 0) {
    return (
      <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
        No skill runs on this page yet. Add one and it appears here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* The artboard's casing, inconsistency included — see the header. */}
      <Group
        label="Enabled Skills"
        skills={active}
        pageId={page.id}
        onOpenSkill={onOpenSkill}
      />
      <Group
        label="Disabled skills"
        skills={inactive}
        pageId={page.id}
        onOpenSkill={onOpenSkill}
      />
    </div>
  );
}
