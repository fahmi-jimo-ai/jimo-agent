# SecondaryHorizontalMenuItem

**Atomic level:** Molecule — `Molecules/HorizontalMenu/SecondaryHorizontalMenuItem`
**Source:** `SecondaryHorizontalMenuItem.tsx`

## What it does
Individual segmented/pill tab in the secondary horizontal tab bar (`SecondaryHorizontalMenuGroup`). Can show icon-only or icon + text. Carries `data-slot="secondary-tab"` the group targets. Rarely used standalone — consume via `SecondaryHorizontalMenuGroup`.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `tabName` | ReactNode | — | `'Report'` | Tab label |
| `state` | string | `'inactive'` `'hover'` `'active'` | `'inactive'` | `'hover'` forces the hovered look |
| `size` | string | `'small'` `'big'` | `'small'` | |
| `withText` | boolean | — | `true` | Show label text (icon-only when `false`) |
| `icon` | ReactNode | — | — | Tab icon |
| `onClick` | function | — | — | Click handler |

Forwards a ref to the root and accepts native `div` props.

## Dependencies
None.

## Import
```jsx
import { SecondaryHorizontalMenuItem } from '../../../src/components/ui/SecondaryHorizontalMenuItem/SecondaryHorizontalMenuItem';
```

## States
`state="hover"` forces the hovered background/text; `inactive` items respond to real hover. `active` gets the elevated white pill background.
