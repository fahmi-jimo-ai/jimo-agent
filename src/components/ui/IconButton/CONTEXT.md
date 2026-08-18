# IconButton

**Atomic level:** Atom — `Atoms/Builder/IconButton`
**Source:** `IconButton.tsx`

## What it does
A bare 32×32 icon target with a hover-revealed `Tooltip` and a disabled state. Reach for it when a
toolbar needs a glyph-only affordance that paints nothing at rest — the undo/redo pair in the Agent
Widget Builder's topbar is the canonical usage. At rest it is transparent; hover tints the background
(`--color-bg-muted`) and fades the tooltip in below the button; `disabled` drops the whole target to
30% opacity and suppresses both the hover fill and the tooltip.

**Ported from the private `IconButton` inside `trigger-demo/builder/src/components/Topbar.tsx`.**

### Why bespoke rather than a Moji `Button`
`Button` has icon-only sizes (`icon` 40×40, `icon-sm` 34×34), but every `Button` variant paints a
surface — a navy fill, or white plus a border and `--shadow-elevation-01` — and none of them carries a
tooltip. This is the opposite shape: a 32px target with **no surface until hover**, a hover hint that
names the shortcut, and a 30%-opacity disabled look instead of `Button`'s disabled fill/border recolour.
Wrapping `Button` would mean cancelling its background, border, shadow and press-scale, which is a
different component wearing `Button`'s name.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `icon` | ReactNode | — | — | Glyph element. iconsax icons take `color="currentColor"` so the token class tints them |
| `tip` | string | — | — | Tooltip text. Also becomes the `aria-label` when none is passed |
| `state` | string | `'idle'` \| `'hover'` | `'idle'` | Forces the hover presentation (Storybook / Chromatic). Real `:hover` still works in `idle` |
| `disabled` | boolean | — | `false` | Native `<button>` prop. Suppresses the hover fill and the tooltip |
| `className` | string | — | — | Merged onto the root `<span>` via `cn()` |
| …rest | `React.ComponentProps<"button">` | — | — | Spread onto the inner `<button>` (`onClick`, `aria-label`, `title`, …) |

No `cva` — single look, one boolean state — so there is **no `iconButtonVariants` export**.

## States / Variants
- **idle** — transparent background, `--color-text-secondary` glyph, tooltip at `opacity: 0`
- **hover** — `--color-bg-muted` background, tooltip fades in below on `--transition-tooltip`
- **disabled** — `opacity: 0.3`, `cursor: not-allowed`, hover fill and tooltip both suppressed

## Dependencies
`Tooltip` — rendered inside a positioning wrapper owned by this component (`absolute`, centered under
the button, `z-[var(--z-toast)]`). Per the house rule the bubble stays **mounted** and is toggled by
`opacity`, never `{visible && <Tooltip/>}`. This is the one deliberate deviation from the source, which
unmounted the tooltip while disabled.

## Import
```jsx
import { IconButton } from '../../../src/components/ui/IconButton/IconButton';
```

## Quick example
```jsx
import { ArrowRotateLeft, ArrowRotateRight } from 'iconsax-react';

<div style={{ display: 'flex', alignItems: 'center' }}>
  <IconButton
    icon={<ArrowRotateLeft size={17} color="currentColor" />}
    tip="Undo (⌘Z)"
    onClick={undo}
  />
  <IconButton
    icon={<ArrowRotateRight size={17} color="currentColor" />}
    tip="Redo (⇧⌘Z)"
    disabled={!canRedo}
    onClick={redo}
  />
</div>
```
