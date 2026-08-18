# ContainedIcon

**Atomic level:** Atom — `Atoms/ContainedIcon`
**Source:** `ContainedIcon.tsx` (exports `ContainedIcon` / `containedIconVariants`)

## What it does
A small rounded, tinted square holding a bold glyph — the layer-tree / scope-chip icon used by
`PropertySection`'s "For every ⬦ Suggestion item" affordance. Tint follows the Moji `-100` background
+ `-500` foreground convention (the same static class-map pattern as `MultipleTags` — no dynamic
Tailwind class names). When the owning row is selected it goes solid brand-blue, so the icon inverts
to a translucent-white chip with a white glyph. A second treatment, `glyph="ink"`, swaps that for the
Figma layer-tree look — a `-200` background under a black outline glyph.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `icon` | `ElementIcon` | — | **required** | A **component type** (e.g. `MagicStar`), **not** an element. ContainedIcon renders it itself so it can inject `color="currentColor"` and `variant="Bold"`, which is what makes the tint apply |
| `tint` | `IconTint` | `'blue'` \| `'green'` \| `'orange'` \| `'purple'` \| `'red'` \| `'yellow'` | `'blue'` | `-100` background + `-500` glyph |
| `size` | number | — | `18` | Square edge length in px (the glyph is `round(size * 0.72)`) |
| `glyph` | `'tint' \| 'ink'` | `'tint'` \| `'ink'` | `'tint'` | Glyph treatment. `'tint'` = `-100` background + `-500` **Bold** glyph — the scope chips in `PropertySection`. `'ink'` = `-200` background + a black (`--color-text-primary`) **Linear** outline glyph — the Figma layer-tree row icon |
| `selected` | boolean | — | `false` | Inverts to the translucent-white treatment for a selected (brand-blue) row |
| `className` | string | — | — | Merged onto the root `<span>` via `cn()` |
| …rest | `React.ComponentProps<'span'>` (minus `color`) | — | — | Spread onto the root (`style` is merged, not clobbered) |

The root is `aria-hidden="true"` — it is decoration beside a real label, never the label itself.

## States / Variants
`containedIconVariants({ tint, selected })`:

| Variant | Options | Default |
|---------|---------|---------|
| `tint` | `blue` `green` `orange` `purple` `red` `yellow` | none (see note) |
| `selected` | `true` `false` | `false` |
| `glyph` | `tint` `ink` | `tint` |

`tint` has **no cva default on purpose**: the component passes `tint: null` when `selected`, so exactly
one background class is ever emitted and two never race inside `twMerge`. The prop default (`'blue'`)
lives on the component signature.

The `glyph` axis carries no classes itself — the six `-200` + black pairings live in
`compoundVariants` (`{ tint, glyph: 'ink' }`, one per tint) so every class name stays a literal, never
a computed string. With `glyph` unset no compound can match, so an existing call site emits exactly
the class string it did before the axis existed.

**`selected` beats `ink`**, and it falls out of the same `tint: null`: an ink compound needs a non-null
`tint` to match, so it cannot fire on a selected row. Deliberate — `selected` + `ink` is not a
combination the layer tree produces, so there is no third surface for it.

`data-tint` / `data-selected` are exposed on the root.

## Types
`ElementIcon` (`React.ComponentType<{ size?, color?, variant?, className? }>` — fits both
iconsax-react icons and the custom `AgentIcon`) and `IconTint` are declared **here** and re-exported.
`PropertySection` type-imports both from this file.

## Dependencies
None — `cva` + `cn` only. Exports `{ ContainedIcon, containedIconVariants }` plus the
`ContainedIconProps` / `ElementIcon` / `IconTint` types.

## Import
```jsx
import { ContainedIcon } from '../../../src/components/ui/ContainedIcon/ContainedIcon';
```

## Quick example
```jsx
import { MagicStar } from 'iconsax-react';

<ContainedIcon icon={MagicStar} tint="purple" size={16} />
<ContainedIcon icon={MagicStar} tint="purple" size={16} selected />
<ContainedIcon icon={MagicStar} tint="purple" size={16} glyph="ink" />
```
