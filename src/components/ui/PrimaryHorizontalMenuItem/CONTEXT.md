# PrimaryHorizontalMenuItem

**Atomic level:** Molecule — `Molecules/HorizontalMenu/PrimaryHorizontalMenuItem`
**Source:** `PrimaryHorizontalMenuItem.tsx`

## What it does
Individual underline tab in the primary horizontal tab bar (`PrimaryHorizontalMenuGroup`). Supports an icon, numeric counter, and a chip. Carries `data-slot="primary-tab"` and a `data-slot="primary-tab-indicator"` underline the group can target. Rarely used standalone — consume via `PrimaryHorizontalMenuGroup`.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `label` | ReactNode | — | `'Menu'` | Tab label |
| `state` | string | `'default'` `'hover'` `'active'` | `'default'` | `'hover'` forces the hovered look |
| `size` | string | `'regular'` `'small'` | `'regular'` | |
| `showIcon` | boolean | — | `false` | Show the leading icon |
| `icon` | ReactNode | — | — | Leading icon |
| `showCounter` | boolean | — | `false` | Show the counter |
| `counter` | ReactNode | — | `3` | Counter value |
| `showChip` | boolean | — | `false` | Show the chip |
| `chipLabel` | ReactNode | — | `'Chip'` | Chip label text |
| `onClick` | function | — | — | Click handler |

Forwards a ref to the root and accepts native `div` props.

## Dependencies
- `Chip` (`Badge` — brand/primary, size `xx-small`)

## Import
```jsx
import { PrimaryHorizontalMenuItem } from '../../../src/components/ui/PrimaryHorizontalMenuItem/PrimaryHorizontalMenuItem';
```

## States
`state="hover"` forces the hovered background/text; `default` items respond to real hover via `group-hover`. `active` colors the label blue and reveals the underline indicator.
