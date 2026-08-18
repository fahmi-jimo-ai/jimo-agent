# Tooltip

**Atomic level:** Atom
**Source:** `Tooltip.tsx`

## What it does
Presentational tooltip bubble. Moji-unique: not a Radix hover tooltip — consumers position it manually and toggle opacity/transform. Single line → a navy **pill** (`--radius-full`, `px-4 py-2`). When the text can't fit one line within `--size-tooltip-max-width` it wraps at word boundaries (never mid-word) and the bubble becomes a rounded **box** (`--radius-xl`, uniform `8px` padding). A tiny layout effect measures only this single boolean (`data-multiline`).

The component only renders the bubble. **The parent wrapper** is responsible for `position: absolute`, the hover opacity/transform transition, and placement.

## Props

| Prop | Type | Notes |
|------|------|-------|
| `children` | ReactNode | Tooltip text content |
| `className` | string | Merged onto the root via `cn()` |

## Important rules
- **Never** implement tooltips with CSS border-triangle tricks — always use this component.
- Always keep the tooltip in the DOM; toggle `opacity` + `transform` for animation (do NOT conditionally render with `{visible && <Tooltip>}`).
- The bubble appears sliding **from the element toward** its placement and exits back toward it. The wrapper owns the direction (e.g. `PrimaryNavItem` slides in from the left; `TertiaryNavItem` slides up) via `--transition-tooltip` (ease-out).

## Dependencies
None.

## Import
```jsx
import { Tooltip } from '../../../src/components/ui/Tooltip/Tooltip';
```

## Quick example
```jsx
<span style={{ position: 'relative' }}>
  <TriggerElement />
  <span style={{
    position: 'absolute', left: '110%', top: '50%', transform: 'translateY(-50%)',
    opacity: hovered ? 1 : 0, transition: 'opacity var(--transition-base)',
    pointerEvents: 'none',
  }}>
    <Tooltip>This is a tooltip</Tooltip>
  </span>
</span>
```
