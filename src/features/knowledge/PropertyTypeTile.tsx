import * as React from 'react';
import { Calendar, Sms, Tag, Task } from 'iconsax-react';
import { ContainedIcon, type ElementIcon } from '@/components/ui/ContainedIcon/ContainedIcon';
import { JimoMark } from '@/components/brand/JimoMark';
import { cn } from '@/lib/utils';
import type { DataType, PropertySource } from '@/data/userProperties';

/**
 * LOCAL WRAPPER around Moji's ContainedIcon — not a re-implementation.
 *
 * `glyph="ink"` is already exactly the treatment Figma uses (a `-200` tint with
 * a black Linear glyph rather than the `-100`/`-500` pair), so the red/Custom
 * tile is the Moji component verbatim. Three things need adapting on top:
 *
 *  1. Jimo-sourced tiles are Yellow/**300** (#FFE7A4, node 887:10867), and the
 *     `ink` compound only reaches yellow-200 (#FDF8C9, a much paler lemon).
 *     One bg override, in the bg-color group so twMerge resolves it cleanly.
 *  2. The tile is 40px with a 24px glyph; ContainedIcon sizes glyphs at 0.72×,
 *     which would give 29. Passing size=33 to land on 24 would break the box,
 *     so the glyph size is corrected with a child selector instead. That
 *     selector names `svg`, not `*`: it exists to normalise the icon canvas,
 *     and forcing a square on the "Aa" text glyph would crop it, since "Aa"
 *     is wider than it is tall.
 *  3. Two of the six glyphs are not iconsax icons — "Aa" is text and the UUID
 *     glyph is the Jimo mark — so both are adapted to ContainedIcon's
 *     ElementIcon component shape below. Both are tuned to the same optical
 *     size as the four real icons: JimoMark now fills its box the way an
 *     iconsax Linear glyph does (see JimoMark.tsx), and "Aa" is set so its cap
 *     height lands on the icons' content height rather than overshooting it.
 *
 * Radius: Figma measures ~6px on the 40px tile against ContainedIcon's
 * --radius-sm (4px); --radius-md (8px) is the nearer token and reads right.
 */

/**
 * The canvas every glyph on this tile is normalised to. Kept in sync by hand
 * with the `[&>svg]:size-6` below — Tailwind cannot read a constant.
 */
const GLYPH_BOX = 24;

/**
 * "Aa" — the Text glyph, which has no icon equivalent.
 *
 * The incoming `size` is ContainedIcon's 0.72× figure (29 on a 40px tile), which
 * the tile then overrides back to GLYPH_BOX for every real icon. Sizing the text
 * off 29 is what made "Aa" outweigh its neighbours, so it is sized off the same
 * normalised canvas they are. 0.75 lands the cap height on Figma's (887:10867).
 */
const AaGlyph: ElementIcon = ({ color = 'currentColor' }) => (
  <span
    aria-hidden="true"
    style={{ fontSize: GLYPH_BOX * 0.75, color }}
    className="inline-flex h-6 shrink-0 items-center justify-center [font:var(--text-subtitle-4)] leading-none"
  >
    Aa
  </span>
);

const JimoGlyph: ElementIcon = () => <JimoMark size={GLYPH_BOX} />;

const GLYPH: Record<DataType, ElementIcon> = {
  uuid: JimoGlyph,
  text: AaGlyph,
  email: Sms,
  datetime: Calendar,
  list: Task,
  tags: Tag,
};

export function PropertyTypeTile({
  dataType,
  source,
  size = 40,
}: {
  dataType: DataType;
  source: PropertySource;
  size?: number;
}) {
  return (
    <ContainedIcon
      icon={GLYPH[dataType]}
      tint={source === 'jimo' ? 'yellow' : 'red'}
      glyph="ink"
      size={size}
      className={cn(
        'rounded-[var(--radius-md)] [&>svg]:size-6',
        // (1) above — Yellow/300, not the `ink` compound's yellow-200.
        source === 'jimo' && 'bg-[var(--color-yellow-300)]'
      )}
    />
  );
}
