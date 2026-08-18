# SecondaryNavSidebar

**Atomic level:** Organism — `Organisms/Nav/SecondaryNavSidebar`
**Source:** `SecondaryNavSidebar.tsx`

## What it does
Secondary sidebar (`280px`) for sub-navigation within a product. Navigation items and sections are hardcoded (not configurable). Currently wired for the Agent product: Train / Build / Evaluate sections separated by dividers. Disabled sections append "(Coming Soon)" to the title and render their items disabled.

## Props

| Prop | Type | Notes |
|------|------|-------|
| `activeItem` | string | Label of the active nav item |
| `onItemClick` | function | `(label) => void` (not fired for disabled items) |

Also accepts standard `<div>` props.

## Dependencies
- `SecondaryNavItem`
- `SecondaryNavGroup`

## Import
```jsx
import { SecondaryNavSidebar } from '../../../src/components/ui/SecondaryNavSidebar/SecondaryNavSidebar';
```
