# PrimaryNavSidebar

**Atomic level:** Organism — `Organisms/Nav/PrimaryNavSidebar`
**Source:** `PrimaryNavSidebar.tsx`

## What it does
Main collapsible left sidebar with fixed Jimo product navigation. Navigation items and sections are hardcoded (not configurable via props). Displays a project logo/name selector at the top. Supports expanded (`240px`) and collapsed (`48px`) states — collapsed hides labels and reveals item tooltips on hover. The footer utility row is shown in expanded mode only.

**Fixed navigation structure:**
1. Project selector (image/initial + name + chevron)
2. Engagement (Tours, Surveys, Banners, Hints)
3. Content (Checklists, Agent, Resource Center, Changelog Posts)
4. Spaces
5. Analytics (Success Trackers, Actions, Users & Segments)
6. Settings
7. Footer (expanded only): Give Feedback, What's new?, Documentation, Get Started

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `collapsed` | boolean | `false` | Collapsed/expanded state |
| `activeItem` | string | — | Label of the active nav item |
| `onItemClick` | function | — | `(label) => void` |
| `projectName` | string | `'Jimo'` | Displayed in project slot |
| `projectImage` | string | — | Image URL for project logo (falls back to a brand-subtle square) |

Also accepts standard `<div>` props.

## Important: overflow rule
`overflow-y: auto` clips positioned tooltips. The root and body use `overflow-visible`; `overflow-y-auto` (with `overflow-x-hidden`) is only added to the scrollable body when expanded, so collapsed tooltips are never clipped.

## Dependencies
- `PrimaryNavItem`
- `PrimaryNavGroup`
- `TertiaryNavGroup` (expanded footer)
- All Jimo product brand icons from iconsax-react + `BannerIcon`, `AgentIcon` from `Icon.tsx`

## Import
```jsx
import { PrimaryNavSidebar } from '../../../src/components/ui/PrimaryNavSidebar/PrimaryNavSidebar';
```
