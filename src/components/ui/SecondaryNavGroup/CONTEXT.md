# SecondaryNavGroup

**Atomic level:** Organism — `Organisms/Nav/SecondaryNavGroup`
**Source:** `SecondaryNavGroup.tsx`

## What it does
Titled section container for `SecondaryNavItem` elements. Renders an optional title above a rounded, clipped (`overflow-hidden`) column of items.

## Props

| Prop | Type | Notes |
|------|------|-------|
| `title` | ReactNode | Section header label (optional) |
| `children` | node | `SecondaryNavItem` components |

Also accepts standard `<div>` props.

## Dependencies
Contains `SecondaryNavItem` items.

## Import
```jsx
import { SecondaryNavGroup } from '../../../src/components/ui/SecondaryNavGroup/SecondaryNavGroup';
```
