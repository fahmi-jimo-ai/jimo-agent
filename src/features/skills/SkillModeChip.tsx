import * as React from 'react';
import { Badge } from '@/components/ui/Chip/badge';
import { cn } from '@/lib/utils';
import { SKILL_MODE_LABEL, SKILL_MODE_TINT, type SkillMode } from '@/data/skills';

/**
 * The table's Mode chip — Figma `12987:16031`, tints per `12244:814`.
 *
 * ## A local tint on a Moji component, not a re-draw
 *
 * `Badge`'s `type` axis is `neutral | positive | negative | alert | brand`,
 * which is a SEMANTIC axis: green means good, red means bad, blue means brand.
 * The three modes are not a quality scale — Execute is not "more correct" than
 * Explain — and one of the artboard's three colours (purple) has no `type` at
 * all. So `type` cannot express this chip, and the choice is between a local
 * `<span>` that approximates a badge and the real `Badge` wearing three literal
 * class strings.
 *
 * This is the second: the shape, the radius, the type ramp, the icon slots and
 * the transition all stay Moji's, and only the three colour triples are local.
 * They are written out one per mode as LITERAL strings — never a computed
 * `bg-${tint}-100` — so Tailwind can see them and so they stay greppable, which
 * is the same rule `ContainedIcon` states for its own tint map.
 *
 * The triples are Moji's own secondary-chip convention (`-100` fill, `-300`
 * border, `-500` text), read straight off `badge.tsx`'s compound variants, so a
 * mode chip and a `positive` chip beside it are the same drawing.
 */
const MODE_CLASS: Record<SkillMode, string> = {
  // green — matches badge.tsx's own `positive` + `secondary` triple.
  execute:
    'bg-[var(--color-green-100)] border-[var(--color-green-300)] text-[var(--color-green-500)]',
  // blue — matches `brand` + `secondary`.
  guide: 'bg-[var(--color-blue-100)] border-[var(--color-blue-300)] text-[var(--color-blue-500)]',
  // purple — the tint `Badge` has no `type` for at all; same convention.
  explain:
    'bg-[var(--color-purple-100)] border-[var(--color-purple-300)] text-[var(--color-purple-500)]',
};

export function SkillModeChip({
  mode,
  className,
}: {
  mode: SkillMode;
  className?: string;
}) {
  return (
    <Badge
      size="small"
      // `neutral`/`secondary` is the base shape; the tint below replaces its
      // three colour classes and nothing else (twMerge keeps the later pair).
      type="neutral"
      variant="secondary"
      data-mode={mode}
      data-tint={SKILL_MODE_TINT[mode]}
      className={cn(MODE_CLASS[mode], className)}
    >
      {SKILL_MODE_LABEL[mode]}
    </Badge>
  );
}
