# Button

**Atomic level:** Atom
**Source:** `Button.tsx`

## What it does

Primary action trigger. Supports three visual variants (default / outline / link), four sizes (incl. two icon-only), danger state, `asChild` polymorphism, and left/right icon slots.

## Props

| Prop        | Type         | Options                                       | Default     | Notes                                        |
| ----------- | ------------ | --------------------------------------------- | ----------- | -------------------------------------------- |
| `variant`   | string       | `'default'` `'outline'` `'link'`              | `'default'` | Visual weight (default=primary, outline=secondary, link=tertiary) |
| `size`      | string       | `'default'` `'sm'` `'icon'` `'icon-sm'`       | `'default'` | `icon`/`icon-sm` render square icon-only     |
| `danger`    | boolean      | —                                             | `false`     | Red destructive style                        |
| `asChild`   | boolean      | —                                             | `false`     | Render via Radix `Slot.Root` onto child      |
| `leftIcon`  | ReactNode    | —                                             | —           | Icon before label                            |
| `rightIcon` | ReactNode    | —                                             | —           | Icon after label                             |
| `disabled`  | boolean      | —                                             | `false`     | Native `<button>` attr                       |
| `children`  | node         | —                                             | —           | Button label (omitted for icon sizes)        |

Plus all native `<button>` props. Exports `buttonVariants` (cva) for class composition.

## States

idle → hover → active → disabled — hover/active via Tailwind `enabled:hover:` / `enabled:active:` classes bound to Moji tokens; disabled via the `disabled` attr.

## Dependencies

Radix `Slot` (for `asChild`). Otherwise a standalone atom.

## Import

```jsx
import { Button, buttonVariants } from '../../../src/components/ui/Button/Button';
```

## Quick example

```jsx
<Button variant="default" size="default">Save</Button>
<Button variant="outline" size="sm" leftIcon={<Add size={16} />}>Add item</Button>
<Button variant="default" danger>Delete</Button>
<Button variant="outline" size="icon-sm" leftIcon={<Edit size={16} />} />
<Button asChild><a href="/docs">Docs</a></Button>
```

