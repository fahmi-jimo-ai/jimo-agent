# Input

**Atomic level:** Molecule
**Source:** `Input.tsx` (kept as ONE unified field component)

## What it does
Multi-variant text field. Supports plain text, textarea, dropdown trigger, and dropdown-search trigger variants. Shows status icons (positive/negative/warning/loading), labels, supportive text, and left/right icon slots. Forwards a ref to the underlying `<input>`/`<textarea>`.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `inputType` | string | `'text'` `'textarea'` `'dropdown'` `'dropdown-search'` | `'text'` | Determines layout and behavior (dropdown variants append a chevron) |
| `size` | string | `'regular'` `'small'` | `'regular'` | |
| `status` | string | `'none'` `'loading'` `'positive'` `'warning'` `'negative'` | `'none'` | Shows status icon in right slot |
| `label` | ReactNode | — | — | Field label above input |
| `supportiveText` | ReactNode | — | — | Helper/error text below input |
| `placeholder` | string | — | — | |
| `leftIcon` | ReactNode | — | — | Icon in left slot |
| `rightIcon` | ReactNode | — | — | Icon in right slot (hidden for dropdown variants) |
| `trailingText` | ReactNode | — | — | Inline text before the right icon/cta |
| `cta` | ReactNode | — | — | CTA node in right slot |
| `secondarySlot` | ReactNode | — | — | Leading boxed slot (e.g. a prefix/affix) |
| `disabled` | boolean | — | `false` | |
| `type` | string | HTML input types | `'text'` | HTML `type` attribute (forced to `'text'` for dropdown variants) |

Also spreads native `<input>` props (minus `size`).

## argType remapping (stories)
- `inputType` → control label `"type"`
- `status` → control label `"state"`
- `type` (HTML) → control label `"htmlType"`

## States
default → hover → focus → positive / negative / warning / loading / disabled

## Dependencies
- `SpinnerIcon` from `Icon.tsx` (loading state)

## Import
```jsx
import { Input } from '../../../src/components/ui/Input/Input';
```

## Quick example
```jsx
<Input label="Email" placeholder="you@example.com" type="email" />
<Input inputType="textarea" label="Notes" placeholder="Add notes…" />
<Input status="negative" label="Password" supportiveText="Must be at least 8 characters" />
<Input inputType="dropdown" placeholder="Select option…" />
```
