# SecondaryNavItem

**Atomic level:** Molecule — `Molecules/Nav/SecondaryNavItem`
**Source:** `SecondaryNavItem.tsx`

## What it does
Single item in the secondary sidebar. Supports idle, active, and disabled states. Renders as `<a>` when `href` is provided, otherwise `<div role="button">`.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `state` | string | `'idle'` `'hover'` `'active'` `'disabled'` | `'idle'` | `idle` also reacts to real hover; others force the state |
| `label` | ReactNode | — | — | Item label |
| `icon` | ReactNode | — | — | Icon for idle state |
| `iconActive` | ReactNode | — | — | Icon swapped in for active state |
| `counter` | ReactNode | — | — | Optional count shown on the right (Body 3, inherits state color) |
| `href` | string | — | — | If set, renders as `<a>`; otherwise `<div role="button">` |

Also accepts standard `<div>`/`<a>` props. Disabled items set `aria-disabled` and remove pointer events.

## States
idle (also reacts to real hover) → hover → active → disabled

## Dependencies
None.

## Import
```jsx
import { SecondaryNavItem } from '../../../src/components/ui/SecondaryNavItem/SecondaryNavItem';
```

## Quick example
```jsx
import { Book1, BookSquare } from 'iconsax-react';
<SecondaryNavItem
  state="idle"
  label="Knowledge"
  icon={<Book1 size={18} variant="Linear" color="currentColor" />}
  iconActive={<BookSquare size={18} variant="Bold" color="currentColor" />}
/>
```
