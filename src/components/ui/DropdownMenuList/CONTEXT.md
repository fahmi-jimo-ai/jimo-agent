# DropdownMenuList

**Atomic level:** Molecule
**Source:** `DropdownMenuList.tsx`

## What it does
A single row/item inside a dropdown menu. Handles selection, hover, disabled, and section-header states. Supports multi-select checkboxes, leading icons, and description subtext.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `state` | string | `'default'` `'hover'` `'selected'` `'hover-selected'` `'disabled'` `'list-header'` | `'default'` | Forced visual state for docs; real `:hover` still applies |
| `text` | ReactNode | — | `'Text'` | Primary label |
| `description` | ReactNode | — | — | Subtext below label |
| `showDescription` | boolean | — | `false` | Show description slot |
| `icon` | ReactNode | — | — | Leading icon (defaults to `HambergerMenu`) |
| `showIcon` | boolean | — | `true` | Show icon slot (ignored when `multiSelect`) |
| `multiSelect` | boolean | — | `false` | Shows checkbox on left instead of icon |
| `danger` | boolean | — | `false` | Red danger style |
| `onClick` | `(e) => void` | — | — | Click handler |
| `className` | string | — | — | Extra classes |

## States
`state` forces a visual state; the live `:hover` style still applies on top.
default → hover → selected → hover-selected → disabled (also: list-header, danger)

## Dependencies
None — renders its own checkbox SVGs inline.

## Import
```jsx
import { DropdownMenuList } from '../../../src/components/ui/DropdownMenuList/DropdownMenuList';
```

## Quick example
```jsx
<DropdownMenuList state="default" text="All environments" onClick={handleSelect} />
<DropdownMenuList state="selected" text="Production" showIcon icon={<Global size={16} />} />
<DropdownMenuList state="default" text="Delete" danger onClick={handleDelete} />
<DropdownMenuList state="list-header" text="Environments" />
```
