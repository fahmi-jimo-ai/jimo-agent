# TertiaryNavGroup

**Atomic level:** Organism — `Organisms/Nav/TertiaryNavGroup`
**Source:** `TertiaryNavGroup.tsx`

## What it does
Footer navigation group rendered at the bottom of `PrimaryNavSidebar`. Renders a row of equal-width `TertiaryNavItem` buttons for utility actions (help, notifications, user), with a build-version line below.

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `items` | array | `[]` | `[{ icon, label, href?, tooltipArrowPosition? }]` |
| `version` | ReactNode | `'Version 1.0.0'` | Version label shown below the row |

Also accepts native `div` props (spread onto the row).

## Dependencies
- `TertiaryNavItem`

## Import
```jsx
import { TertiaryNavGroup } from '../../../src/components/ui/TertiaryNavGroup/TertiaryNavGroup';
```
