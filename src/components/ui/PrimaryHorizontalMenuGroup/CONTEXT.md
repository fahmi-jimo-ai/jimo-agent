# PrimaryHorizontalMenuGroup

**Atomic level:** Organism — `Organisms/HorizontalMenu/PrimaryHorizontalMenuGroup`
**Source:** `PrimaryHorizontalMenuGroup.tsx`

## What it does
Horizontal underline tab bar. Per-item underlines are hidden; a single group-level indicator (width/position measured from the DOM and kept as inline style) slides under the active tab. Supports icon, counter, and chip on each tab. Used in `PageHeader` and as a standalone section tab bar.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `tabs` | array | `[{ id, label?, icon?, showIcon?, showCounter?, counter?, showChip?, chipLabel? }]` | — | Tab definitions; `id` is required |
| `activeItem` | string | — | — | `id` of the active tab |
| `onTabClick` | function | — | — | `(id) => void` |
| `size` | string | `'regular'` `'small'` | `'regular'` | |
| `showIcon` | boolean | — | — | Force icon slot on all tabs (else per-tab) |
| `showCounter` | boolean | — | — | Force counter on all tabs (else per-tab) |
| `showChip` | boolean | — | — | Force chip on all tabs (else per-tab) |
| `chipLabel` | ReactNode | — | — | Override chip label for all tabs |

Also accepts native `div` props (except `onClick`).

## Dependencies
- `PrimaryHorizontalMenuItem`

## Import
```jsx
import { PrimaryHorizontalMenuGroup } from '../../../src/components/ui/PrimaryHorizontalMenuGroup/PrimaryHorizontalMenuGroup';
```

## Quick example
```jsx
<PrimaryHorizontalMenuGroup
  tabs={[
    { id: 'all', label: 'All', counter: 142 },
    { id: 'live', label: 'Live', counter: 12 },
    { id: 'draft', label: 'Draft', counter: 8 },
  ]}
  activeItem={activeTab}
  onTabClick={setActiveTab}
  showCounter
/>
```
