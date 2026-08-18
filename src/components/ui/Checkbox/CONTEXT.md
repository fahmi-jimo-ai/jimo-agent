# Checkbox

**Atomic level:** Atom
**Source:** `Checkbox.tsx`

## What it does
Standard checkbox built on the Radix Checkbox primitive, with an optional label. Supports an indeterminate (dash) state for "select all" patterns where some items are checked.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `label` | ReactNode | — | — | Optional label rendered beside box (wraps in a `<label>`) |
| `checked` | boolean \| `'indeterminate'` | — | — | Radix controlled state; pass `'indeterminate'` for the dash |
| `defaultChecked` | boolean | — | — | Uncontrolled initial state |
| `onCheckedChange` | function | — | — | `(checked: boolean \| 'indeterminate') => void` |
| `disabled` | boolean | — | `false` | |
| `id` | string | — | auto | Falls back to a generated id when `label` is set |

Plus all Radix `Checkbox.Root` props.

## States
unchecked → checked → indeterminate (each can be disabled) — driven by Radix `data-[state]` attributes mapped to Moji tokens via Tailwind; disabled via `disabled` attr.

## Dependencies
Radix `Checkbox` primitive (`radix-ui`).

## Import
```jsx
import { Checkbox } from '../../../src/components/ui/Checkbox/Checkbox';
```

## Quick example
```jsx
<Checkbox label="Remember me" checked={isChecked} onCheckedChange={setChecked} />
<Checkbox label="Select all" checked={allSelected ? true : someSelected ? 'indeterminate' : false} onCheckedChange={handleSelectAll} />
```
