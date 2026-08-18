# PrimaryNavGroup

**Atomic level:** Organism — `Organisms/Nav/PrimaryNavGroup`
**Source:** `PrimaryNavGroup.tsx`

## What it does
Vertical stack container for `PrimaryNavItem` elements. Width follows the sidebar state: `240px` when expanded, `48px` (center-aligned) when collapsed.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `type` | string | `'expanded'` `'collapsed'` | `'expanded'` | Mirrors sidebar state; sets group width |
| `children` | node | — | — | `PrimaryNavItem` components |

Also accepts standard `<div>` props.

## Dependencies
Contains `PrimaryNavItem` items.

## Import
```jsx
import { PrimaryNavGroup } from '../../../src/components/ui/PrimaryNavGroup/PrimaryNavGroup';
```
