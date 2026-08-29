import * as React from 'react';
import {
  Routing2,
  Keyboard,
  ToggleOnCircle,
  Chart21,
  RowVertical,
  TextalignLeft,
} from 'iconsax-react';
import { ContainedIcon, type IconTint } from '@/components/ui/ContainedIcon/ContainedIcon';
import { cn } from '@/lib/utils';
import type { ElementGroup } from '@/data/interfacePages';

/**
 * The tinted glyph chip on an element-group row — Figma `12987:12416`.
 *
 * LOCAL WRAPPER around Moji's `ContainedIcon`, not a re-draw. The artboard gives
 * each of the six groups its own tint, and five of them land exactly on Moji's
 * `IconTint` axis. The sixth — Contents — is grey, and `ContainedIcon` has no
 * neutral tint to bind to.
 *
 * So this file renders `ContainedIcon` for the five and paints ONE extra pair of
 * token classes over it for Contents. `cn` is tailwind-merge, so the override is
 * deterministic rather than a race: both classes sit in the bg-color / text-color
 * groups and the later one wins. Forking `ContainedIcon` to add a `neutral` tint
 * would mean editing a vendored Moji file for one row, which CLAUDE.md rules out.
 *
 * `ROW_TINT` is the row's own ground (the `-100` fill behind the whole row); the
 * chip is one step deeper, which is what `glyph="ink"` already does.
 */
const GLYPH: Record<ElementGroup, React.ComponentType<{ size?: number | string; color?: string; variant?: string }>> = {
  navigation: Routing2,
  inputs: Keyboard,
  controls: ToggleOnCircle,
  data: Chart21,
  lists: RowVertical,
  contents: TextalignLeft,
};

/** The five groups Moji's tint axis covers. Contents is handled below. */
const TINT: Partial<Record<ElementGroup, IconTint>> = {
  navigation: 'blue',
  inputs: 'orange',
  controls: 'green',
  data: 'purple',
  lists: 'red',
};

/** The row's ground — the `-100` fill the artboard paints behind the whole row. */
export const ROW_TINT: Record<ElementGroup, string> = {
  navigation: 'bg-[var(--color-blue-100)]',
  inputs: 'bg-[var(--color-orange-100)]',
  controls: 'bg-[var(--color-green-100)]',
  data: 'bg-[var(--color-purple-100)]',
  lists: 'bg-[var(--color-red-100)]',
  contents: 'bg-[var(--color-neutral-100)]',
};

export function GroupChip({ group, size = 28 }: { group: ElementGroup; size?: number }) {
  return (
    <ContainedIcon
      icon={GLYPH[group]}
      tint={TINT[group] ?? 'blue'}
      glyph="ink"
      size={size}
      className={cn(
        'rounded-[var(--radius-md)]',
        // The one tint Moji has no axis for. Last class wins in twMerge.
        group === 'contents' &&
          'bg-[var(--color-neutral-200)] text-[var(--color-text-primary)]',
      )}
    />
  );
}
