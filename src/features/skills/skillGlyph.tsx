import * as React from 'react';
import { MessageText, Mouse, Routing2 } from 'iconsax-react';
import type { ElementIcon } from '@/components/ui/ContainedIcon/ContainedIcon';
import type { SkillMode } from '@/data/skills';

/**
 * One glyph per skill mode — Figma `12987:11526` / `12987:16031` / `12987:11928`.
 *
 * The same job `kindGlyph` does for knowledge sources, and deliberately the same
 * signature: the table's Mode tile, the mode filter's rows, the Add Skill menu
 * and the empty state's cards all read from here, so none of them can drift.
 *
 * The Figma instances are named literally, and all three names are verified
 * against iconsax-react@0.0.8's exports:
 *   vuesax/linear/mouse → Mouse (execute)
 *   routing-2           → Routing2 (guide)
 *   message-text        → MessageText (explain)
 *
 * Two shapes, because two consumers need two different things and a second map
 * would be a second source of truth:
 *   - `SKILL_GLYPH` is the COMPONENT, which is what `ContainedIcon` takes (it
 *     renders the glyph itself so its tint class can drive the colour);
 *   - `skillGlyph()` is the rendered element, which is what `DropdownMenuList`,
 *     `ChoiceCard` and `Button` take.
 */
export const SKILL_GLYPH: Record<SkillMode, ElementIcon> = {
  execute: Mouse,
  guide: Routing2,
  explain: MessageText,
};

export function skillGlyph(mode: SkillMode, size = 20): React.ReactNode {
  const Glyph = SKILL_GLYPH[mode];
  return <Glyph size={size} variant="Linear" color="currentColor" />;
}
