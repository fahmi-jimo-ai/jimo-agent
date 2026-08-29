import * as React from 'react';
import { ChoiceCard } from '@/features/knowledge/sources/ChoiceCard';
import { SKILL_MODES, SKILL_MODE_MENU, type SkillMode } from '@/data/skills';
import { skillGlyph } from './skillGlyph';

/**
 * The Skills table with nothing in it.
 *
 * ## Invented — no artboard draws this
 *
 * `12987:11525` only ever draws the populated page, which is also why
 * `skillsStore` seeds `DEMO_SKILLS()` rather than an empty list: an empty
 * Skills table is not where a first visit lands. It is still reachable — delete
 * every row and you are here — and a table that renders as a bare header row
 * with no way forward is worse than one that invents a sensible entry point.
 *
 * So this is built from parts that ARE designed, and nothing else is made up:
 * `ChoiceCard` is the Sources empty state's own card (899:15518), reused rather
 * than re-drawn; the three titles and descriptions are `SKILL_MODE_MENU`, which
 * is transcribed verbatim from the Add Skill menu (`12987:11928`); the glyphs
 * are `skillGlyph`. Picking a card is the same act as picking that menu row, so
 * `onPick` hands back a mode and the page opens the same form.
 *
 * Three cards, one per mode, in `SKILL_MODES` order — the Add Skill menu's
 * order, since the two lists are now literally the same list.
 */
export function SkillsEmptyState({ onPick }: { onPick: (mode: SkillMode) => void }) {
  return (
    <div className="flex flex-wrap gap-[var(--space-2)] px-[var(--space-4)]">
      {SKILL_MODES.map((mode) => (
        <ChoiceCard
          key={mode}
          title={SKILL_MODE_MENU[mode].title}
          description={SKILL_MODE_MENU[mode].description}
          icon={skillGlyph(mode)}
          onClick={() => onPick(mode)}
          className="min-w-[220px]"
        />
      ))}
    </div>
  );
}
