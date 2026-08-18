# DropdownMenuGroup

**Atomic level:** Organism — `Organisms/Dropdown/DropdownMenuGroup`
**Source:** `DropdownMenuGroup.tsx`

## What it does
Scrollable wrapper container for a list of `DropdownMenuList` items. Handles the panel sizing/overflow. Usually used inside `DropdownFilter` — rarely composed manually.

## Props

| Prop | Type | Notes |
|------|------|-------|
| `maxHeight` | `number \| string` | Enables scroll; number is treated as px. When set, adds a custom scrollbar |
| `children` | ReactNode | `DropdownMenuList` items |
| `className` | string | Extra classes |

Also accepts all native `<div>` props (extends `React.ComponentProps<"div">`).

## Dependencies
Contains `DropdownMenuList` items.

## Import
```jsx
import { DropdownMenuGroup } from '../../../src/components/ui/DropdownMenuGroup/DropdownMenuGroup';
```

## Quick example
```jsx
<DropdownMenuGroup maxHeight={240}>
  <DropdownMenuList state="default" text="Option A" onClick={() => select('a')} />
  <DropdownMenuList state="selected" text="Option B" onClick={() => select('b')} />
</DropdownMenuGroup>
```
