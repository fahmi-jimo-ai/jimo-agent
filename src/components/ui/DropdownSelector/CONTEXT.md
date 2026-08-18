# DropdownSelector

**Atomic level:** Molecule
**Source:** `DropdownSelector.tsx`

## What it does
Trigger button for dropdown panels. Shows a chevron that rotates when open. Can display an icon, text label, or both. Used inside `DropdownFilter` and `DropdownFilterNested` — rarely used standalone.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `size` | `'big' \| 'small'` | `'big'` `'small'` | `'big'` | |
| `text` | ReactNode | — | — | Displayed value; falls back to a `Select…` placeholder |
| `withIcon` | boolean | — | `false` | Show the icon slot (defaults to `HambergerMenu`) |
| `icon` | ReactNode | — | — | Icon to display in the icon slot |
| `withText` | boolean | — | `true` | Show text label + chevron |
| `isOpen` | boolean | — | `false` | Chevron rotates and applies open style when true |
| `hasValue` | boolean | — | `false` | Shows filled/selected style |
| `disabled` | boolean | — | `false` | |

Also accepts all native `<button>` props (extends `React.ComponentProps<"button">`, minus `size`). Forwards a ref to the button.

## Dependencies
None — standalone trigger.

## Import
```jsx
import { DropdownSelector } from '../../../src/components/ui/DropdownSelector/DropdownSelector';
```

## Quick example
```jsx
<DropdownSelector text="All statuses" isOpen={open} hasValue={selected.length > 0} />
```
