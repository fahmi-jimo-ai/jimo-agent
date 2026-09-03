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

## Fork: `SidebarItem` gained `href`, `trailing` and `className` (jimo-agent)

Added for `/settings`, whose sidebar footer group is Documentation (an external link with a
trailing ↗), Feedback, and Log out in red.

All three forward capabilities `SecondaryNavItem` **already had** and that upstream's
`SidebarItem` simply never exposed:

| Field | Maps to | Why it needs no new visual code |
|---|---|---|
| `href` | `SecondaryNavItem.href` | The item already renders an `<a>` when given one |
| `trailing` | `SecondaryNavItem.counter` | Already a right-aligned slot that inherits the state colour |
| `className` | `SecondaryNavItem.className` | Already run through `cn` (tailwind-merge), so a caller's `text-[var(--color-danger-default)]` beats `STATE_CLASS` |

The alternative was forking `SecondaryNavItem` with a `tone` axis and a trailing-icon prop, which
would have added visual code for something the component could already do. This fork is one type
and three pass-throughs.

The earlier `sections` fork is unchanged and still the reason this file is not upstream-identical.
