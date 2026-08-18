# Chip

**Atomic level:** Molecule
**Source:** `badge.tsx` (exported as `Badge` / `badgeVariants`)

## What it does
Compact tag/badge element. Used for status labels, filter tags, quick-select presets, and date ranges. When `onRemove` is provided, a remove (×) button appears.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `type` | string | `'neutral'` `'positive'` `'negative'` `'alert'` `'brand'` | `'neutral'` | Semantic color |
| `variant` | string | `'primary'` `'secondary'` | `'secondary'` | Filled vs outlined |
| `size` | string | `'regular'` `'small'` `'x-small'` `'xx-small'` | `'regular'` | |
| `iconOnly` | boolean | — | `false` | Square icon-only chip (renders `leftIcon ?? rightIcon`) |
| `leftIcon` | ReactNode | — | — | Icon before label |
| `rightIcon` | ReactNode | — | — | Icon after label (hidden when `onRemove` is set) |
| `onRemove` | function | — | — | If set, shows × button; called on click |
| `children` | node | — | — | Chip label text |

Also spreads native `<span>` props (`className`, etc.).

## Dependencies
- `CloseCircle` from `iconsax-react` (remove button)

## Import
```jsx
import { Badge } from '../../../src/components/ui/Chip/badge';
```

## Quick example
```jsx
<Badge type="positive">Live</Badge>
<Badge type="alert" variant="primary" size="small">Draft</Badge>
<Badge type="brand" onRemove={() => removeFilter('status')}>Status: Active</Badge>
<Badge type="neutral" size="x-small" leftIcon={<Calendar size={12} />}>Last 7 days</Badge>
```
