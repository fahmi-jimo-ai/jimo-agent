# SelectField

**Atomic level:** Molecule — `Molecules/SelectField`
**Source:** `SelectField.tsx` (exports `SelectField` / `selectFieldVariants`)

## What it does
The select row trigger from the properties panel (Figma `KhddnEI8qGtD0NMbrYmxhj` node `3072:16392` —
the "Action" and "Width" rows). A **flat bordered box** with an optional leading glyph (bare 16px, or
wrapped in a 32px neutral chip), the current value or an `--color-text-tertiary` placeholder, and a
chevron that rotates when the caller's menu is open.

**Trigger only, and purely presentational** — no menu, no popover state, no config coupling. Root is a
`<button type="button">` so a popover can anchor to it; ref forwarded.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `value` | ReactNode | — | — | Current value; `undefined`/`''` shows the placeholder |
| `placeholder` | string | — | `'Select...'` | |
| `icon` | ReactNode | — | — | 16px leading glyph |
| `iconChip` | boolean | — | `false` | Wraps the icon in a 32px `--color-neutral-100` `--radius-md` chip (and selects the `chip` size) |
| `open` | boolean | — | `false` | Caller-owned popover state — rotates the chevron and sets `aria-expanded` |
| `chevron` | boolean | — | `true` | The Figma panel rows render **without** a chevron — pass `chevron={false}` to match them |
| `disabled` | boolean | — | `false` | `--color-text-tertiary` + `cursor-not-allowed` |
| `size` | string | `'default'` \| `'chip'` | derived | cva variant. Omit it and it follows `iconChip` |
| `className` | string | — | — | Merged onto the root `<button>` via `cn()` |
| …rest | `React.ComponentProps<'button'>` minus `size`/`value` | — | — | Spread onto the root; ref forwarded |

## States / Variants
`selectFieldVariants({ size })`, also exposed as `data-size`:

| Variant | Options | Default | Height |
|---------|---------|---------|--------|
| `size` | `'default'` | `'default'` | 4 + 24 content + 4 + 2 border = **34px** (matches `ColorField`) |
| | `'chip'` | | 4 + 32 chip + 4 = **40px** of box (42px including the hairline) |

Interaction states are Tailwind prefixes on the cva base: `enabled:hover:` border-strong,
`focus-visible:` border-focus + a `color-mix` ring, `disabled:` tertiary text. `open` rotates the
chevron 180° and sets `aria-expanded` — nothing else (the Figma node shows no open border state).

## Why this exists and is NOT `DropdownSelector`
`DropdownSelector` is a **shadow-bearing pill** (`--shadow-elevation-01`) that flips to a brand-blue
border/background/text once it `hasValue`, with `--radius-lg` at `big` size. The properties-panel field
in Figma is the opposite: a **flat box with no shadow**, a plain `--color-border-default` hairline, an
N500 (`--color-text-tertiary`) placeholder, an optional icon chip, and no brand-blue "selected"
treatment — every row in the panel has a value, so a blue-when-filled trigger would turn the whole
panel blue. Do **not** "simplify" this back into `DropdownSelector`; they are different components with
different jobs.

## Composing the menu — do not duplicate it
`SelectField` renders no menu. Build the menu from the existing pieces — a caller-owned popover around
`DropdownMenuGroup` + `DropdownMenuList`:

```jsx
<SelectField value={labelFor(value)} open={open} onClick={toggle} chevron={false} />
{open && (
  <DropdownMenuGroup maxHeight={260}>
    {options.map((opt) => (
      <DropdownMenuList key={opt} text={labelFor(opt)}
        state={opt === value ? 'selected' : 'default'} showIcon={false}
        onClick={() => { onChange(opt); close(); }} />
    ))}
  </DropdownMenuGroup>
)}
```

Never re-implement a menu list inside or beside this component.

## Implementation notes
- The value span is nested (outer flex holds the 24px content height, inner span does the ellipsis)
  because `truncate` on a flex container is a no-op.
- The chevron transitions **`rotate`** as well as `transform` — Tailwind v4's `rotate-180` animates the
  `rotate` property (same gotcha documented in `Toggle/switch.tsx`).
- Accessibility: `aria-haspopup="listbox"`, `aria-expanded={open}`, and a `focus-visible` ring (the UA
  outline is removed, so it is replaced with a token-derived `color-mix` ring).

## Data slots
`select-field` (root, `data-size`) · `select-field-icon` · `select-field-value` ·
`select-field-chevron`

## Dependencies
`ArrowDown2` from `iconsax-react` (chevron). Exports `{ SelectField, selectFieldVariants }` plus the
`SelectFieldProps` type.

## Import
```jsx
import { SelectField } from '../../../src/components/ui/SelectField/SelectField';
```

## Quick example
```jsx
<SelectField icon={<Flash size={16} variant="Bold" color="currentColor" />} iconChip
  placeholder="Add action..." open={open} onClick={toggle} />
<SelectField icon={<Maximize size={16} color="currentColor" />} value="Auto" chevron={false} />
```
