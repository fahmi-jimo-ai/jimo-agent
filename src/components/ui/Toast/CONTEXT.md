# Toast / ToastContainer

**Atomic level:** Molecule (Toast) + Organism (ToastContainer)
**Source:** `Toast.tsx` (Tailwind + cn)

## What it does
Temporary slide-in notification with phase-based animation (entering → visible → exiting). Auto-dismisses after `duration` ms. Supports primary and secondary action buttons. `ToastContainer` is the fixed bottom-center wrapper that stacks multiple toasts.

## Props — Toast

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `type` | string | `'positive'` `'warning'` `'negative'` `'neutral'` | `'neutral'` | Semantic color + icon |
| `title` | node | — | — | Bold heading |
| `body` | node | — | — | Body text |
| `dismissable` | boolean | — | `true` | Show × close button |
| `onDismiss` | function | — | — | Called on close or auto-dismiss |
| `primaryAction` | node | — | — | Primary CTA label (renders a `default` Button) |
| `onPrimaryAction` | function | — | — | |
| `secondaryAction` | node | — | — | Secondary CTA label (renders an `outline` Button) |
| `onSecondaryAction` | function | — | — | |
| `duration` | number | — | `4000` | Auto-dismiss delay in ms (`Infinity` disables) |
| `className` | string | — | — | Extra classes merged onto the root |

## Props — ToastContainer
`children` only — wraps toasts and positions the stack at bottom-center.

## Important: interactive pattern
Toast must be mounted/unmounted from state — never pre-rendered statically:

```jsx
function ToastDemo(props) {
  const [visible, setVisible] = React.useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setVisible(true)}>Show Toast</Button>
      <ToastContainer>
        {visible && <Toast {...props} onDismiss={() => setVisible(false)} />}
      </ToastContainer>
    </>
  );
}
```

## Dependencies
- `Button` (action buttons)
- `CloseIcon` from `Icon.tsx` (dismiss button)

## Import
```jsx
import { Toast, ToastContainer } from '../../../src/components/ui/Toast/Toast';
```
