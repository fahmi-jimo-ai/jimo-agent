# SecondaryHorizontalMenuGroup

**Atomic level:** Organism — `Organisms/HorizontalMenu/SecondaryHorizontalMenuGroup`
**Source:** `SecondaryHorizontalMenuGroup.tsx`

## What it does
Pill-style horizontal tab bar (segmented control). A single sliding pill (width/position measured from the DOM, kept as inline style) provides the active background; the active item's own background is suppressed inside the group. Each tab can show an icon, text, or both. Used for view-mode toggles (e.g. Grid / List / Compact).

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `tabs` | array | `[{ id, tabName?, icon? }]` | — | Tab definitions; `id` is required |
| `activeItem` | string | — | — | `id` of the active tab |
| `onTabClick` | function | — | — | `(id) => void` |
| `size` | string | `'small'` `'big'` | `'small'` | |
| `withText` | boolean | — | `true` | Show tab label text |

Also accepts native `div` props (except `onClick`).

## Dependencies
- `SecondaryHorizontalMenuItem`

## Import
```jsx
import { SecondaryHorizontalMenuGroup } from '../../../src/components/ui/SecondaryHorizontalMenuGroup/SecondaryHorizontalMenuGroup';
```

## Quick example
```jsx
import { Grid9, RowVertical, Maximize2 } from 'iconsax-react';

<SecondaryHorizontalMenuGroup
  tabs={[
    { id: 'grid', tabName: 'Grid', icon: <Grid9 size={16} variant="Linear" color="currentColor" /> },
    { id: 'list', tabName: 'List', icon: <RowVertical size={16} variant="Linear" color="currentColor" /> },
    { id: 'compact', tabName: 'Compact', icon: <Maximize2 size={16} variant="Linear" color="currentColor" /> },
  ]}
  activeItem={viewMode}
  onTabClick={setViewMode}
/>
```
