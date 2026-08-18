# PrimaryNavItem

**Atomic level:** Molecule — `Molecules/Nav/PrimaryNavItem`
**Source:** `PrimaryNavItem.tsx`

## What it does
Single navigation item in the primary left sidebar. When the sidebar is collapsed (`type="collapsed"`), the label is hidden and a tooltip appears on hover (arrow pointing left → tooltip floats right). Supports an optional badge chip and brand icons for Jimo products.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `state` | string | `'idle'` `'hover'` `'active'` | `'idle'` | `idle` also reacts to real hover; `hover`/`active` force the state |
| `type` | string | `'default'` `'collapsed'` | `'default'` | Collapsed = 36px icon button, hides label + reveals tooltip |
| `label` | ReactNode | — | — | Nav item label |
| `icon` | ReactNode | — | — | Icon for idle/default state |
| `iconActive` | ReactNode | — | — | Icon swapped in for active state |
| `chip` | ReactNode | — | — | Optional badge text (e.g. "New"), expanded only |
| `href` | string | — | — | If set, renders as `<a>`; otherwise `<div role="button">` |

Also accepts standard `<div>`/`<a>` props (`onClick`, `className`, …).

## States
idle (also reacts to real hover) → hover → active. Collapsed items reveal a right-anchored `Tooltip` on hover.

## Dependencies
- `Tooltip` — shown in collapsed mode, positioned right of the icon by a wrapper span
- `Chip` (`Chip/badge`) — renders the optional `chip` badge

## Jimo brand icons (mandatory)
When the item is a Jimo product, use the fixed brand icon from the CLAUDE.md table — not a generic substitute. See `Icon/CONTEXT.md` for the full table.

## Import
```jsx
import { PrimaryNavItem } from '../../../src/components/ui/PrimaryNavItem/PrimaryNavItem';
```

## Quick example
```jsx
import { Routing2 } from 'iconsax-react';
<PrimaryNavItem
  state="active"
  label="Tours"
  icon={<Routing2 size={20} variant="Linear" color="currentColor" />}
  iconActive={<Routing2 size={20} variant="Bold" color="currentColor" />}
/>
```
