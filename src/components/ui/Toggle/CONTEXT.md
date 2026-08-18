# Toggle

**Atomic level:** Atom
**Source:** `switch.tsx` (exported as `Switch`)

## What it does
Switch/toggle control for boolean settings, built on the Radix Switch primitive. Renders an optional label beside the pill-shaped track; the thumb reveals a checkmark when on.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `label` | ReactNode | — | — | Optional label beside the toggle (wraps in a `<label>`) |
| `checked` | boolean | — | — | Radix controlled on/off |
| `defaultChecked` | boolean | — | — | Uncontrolled initial state |
| `onCheckedChange` | function | — | — | `(checked: boolean) => void` |
| `disabled` | boolean | — | `false` | |
| `id` | string | — | auto | Falls back to a generated id when `label` is set |

Plus all Radix `Switch.Root` props.

## States
off → on (each can be disabled) — driven by Radix `data-[state=checked]` mapped to Moji tokens via Tailwind; disabled via `disabled` attr.

## Dependencies
Radix `Switch` primitive (`radix-ui`).

## Import
```jsx
import { Switch } from '../../../src/components/ui/Toggle/switch';
```

## Quick example
```jsx
<Switch label="Enable notifications" checked={enabled} onCheckedChange={setEnabled} />
```
