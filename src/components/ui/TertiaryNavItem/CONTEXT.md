# TertiaryNavItem

**Atomic level:** Molecule — `Molecules/Nav/TertiaryNavItem`
**Source:** `TertiaryNavItem.tsx`

## What it does
Icon-only (32px) footer navigation button. Reveals a `Tooltip` floating above on hover. Used in the footer area of nav sidebars for utility actions (help, settings, user profile).

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `icon` | ReactNode | — | — | The icon to display |
| `label` | ReactNode | — | — | Tooltip text; sets `aria-label` when a string |
| `state` | string | `'idle'` `'hover'` | `'idle'` | `'hover'` forces the hovered look + tooltip |
| `tooltipArrowPosition` | string | `'bottom'` `'bottom-left'` | `'bottom'` | Re-anchors the tooltip bubble |
| `href` | string | — | — | Renders as `<a>`; otherwise `<div role="button">` |

Also accepts native `div` props (spread onto the root).

## Dependencies
- `Tooltip` (floats above the trigger)

## Import
```jsx
import { TertiaryNavItem } from '../../../src/components/ui/TertiaryNavItem/TertiaryNavItem';
```

## Quick example
```jsx
import { Setting2 } from 'iconsax-react';
<TertiaryNavItem
  state="idle"
  label="Settings"
  icon={<Setting2 size={16} variant="Linear" color="currentColor" />}
/>
```

## States
`state="hover"` forces the hovered background and reveals the tooltip; idle items respond to real hover via `group-hover`.
