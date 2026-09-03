import * as React from 'react';
import { DirectboxNotif, Notepad2, Notification1, Routing2, TaskSquare } from 'iconsax-react';
import { BannerIcon } from '@/components/ui/Icon/Icon';
import type { ElementIcon } from '@/components/ui/ContainedIcon/ContainedIcon';
import { type ExperienceType } from '@/data/experiences';

/**
 * Type → glyph, mirroring `skillGlyph.tsx`.
 *
 * The icons are NOT chosen here: they are lifted from `PrimaryNavSidebar`'s own
 * `NAV_ITEMS_ENGAGEMENT` and `NAV_ITEMS_CONTENT`, so the glyph on a card is the
 * glyph on the rail item that got you to the page. Picking a second set would
 * give the same object two faces one column apart.
 */
export const EXPERIENCE_GLYPH: Record<ExperienceType, ElementIcon> = {
  tour: Routing2,
  survey: Notepad2,
  banner: BannerIcon,
  hint: Notification1,
  checklist: TaskSquare,
  'resource-center': DirectboxNotif,
};

/** The element form, for the places that take a node rather than a component. */
export function experienceGlyph(type: ExperienceType, size = 20, variant = 'Linear') {
  const Glyph = EXPERIENCE_GLYPH[type];
  return <Glyph size={size} variant={variant} color="currentColor" />;
}
