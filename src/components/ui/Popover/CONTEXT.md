# Popover

**Atomic level:** Atom — `Atoms/Builder/Popover`
**Source:** `Popover.tsx`

> **Ported from** `trigger-demo/builder/src/components/controls/Popover.tsx` (the Agent Widget Builder's
> panel-control primitive) — a near-verbatim copy, since the original imports nothing but React.
>
> **Promotion candidate.** It lives under `Builder/` because that is where it came from, but the motion
> contract it encodes is system-wide. When the floating layers below are fixed against it, move this
> out of `Builder/` into the general library.

## What it does

Renders a trigger and an absolutely-positioned panel beside it, closing on outside click or Escape.
Reach for it whenever a control has to open a layer over the page: colour pickers, shadow editors,
select menus, property-panel dropdowns. There is no portal — the panel is a sibling of the trigger,
so the component owns the `position: relative` wrapper itself.

**This is the corrected reference for the floating-layer motion contract** (`CLAUDE.md` → Component
Composition Rules). `DropdownFilter`, `DropdownFilterNested` and `DatePicker` all carry the
transform-only bug today; build a new floating layer on `Popover` rather than copy-pasting one of
theirs. The four halves of the contract, all of them in the source and all easy to break:

1. `scale .85 → 1` + `opacity 0 → 1` over **150ms** — `opacity` on `ease`, `scale` on
   `cubic-bezier(0.16,1,0.3,1)`.
2. The panel stays **mounted through the 150ms exit** (a `visible` flag, unmounted on a timer).
   `{open && <Panel/>}` can only ever animate the enter.
3. The enter class flips on a **double `requestAnimationFrame`** — a single frame shares the mount's
   style recalc, leaving no "from" value, and the panel pops.
4. The transition names **`scale` AND `transform`**. Tailwind v4 compiles `scale-*` to the standalone
   `scale:` CSS property, not to a transform matrix, so a `transform`-only transition fades correctly
   while the scale snaps — and the fade alone is convincing enough to hide it.

Shipped class string, verbatim:

```
[transition:opacity_150ms_ease,scale_150ms_cubic-bezier(0.16,1,0.3,1),transform_150ms_cubic-bezier(0.16,1,0.3,1)]
```

`transform-origin` follows the corner the panel actually opens from (`align` × `flipUp`), or the panel
grows out of thin air away from its own trigger.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `trigger` | `(props: { open: boolean; toggle: () => void }) => ReactNode` | — | **required** | Render prop. The component owns no trigger markup of its own. |
| `children` | `ReactNode \| ((close: () => void) => ReactNode)` | — | **required** | Panel content. Pass a function to get a `close()` callback (e.g. to dismiss on row select). |
| `align` | string | `'left'` · `'center'` · `'right'` | `'left'` | Which edge the panel is pinned to. `center` carries its own centering transform. |
| `panelClassName` | string | — | `''` | Extra classes on the panel, appended last so they win. |
| `unstyled` | boolean | — | `false` | Drop the card chrome (border / bg / shadow / radius). Motion classes are unaffected. |
| `open` | boolean | — | `undefined` | Controlled open state. Omit for uncontrolled. |
| `onOpenChange` | `(open: boolean) => void` | — | `undefined` | Fires on every open/close, controlled or not. |

**Never pass a `transform` through `panelClassName`** (e.g. `-translate-x-1/2` to centre the panel) — it
fights the scale animation and leaves `transform-origin` anchored to the wrong corner. Use
`align="center"`, which composes correctly because Tailwind v4 emits `translate:` and `scale:` as
separate properties.

**`unstyled` is not cosmetic.** By default the panel IS the card, because most callers drop bare
content into it. A caller whose child is already a card — a `DropdownMenuGroup`, say — must pass
`unstyled` or render a card inside a card.

## States / Variants

| State | What renders |
|-------|-------------|
| Closed (at rest) | Panel unmounted. |
| Entering | Mounted at `scale .85 / opacity 0`, then `scale 1 / opacity 1` on the second rAF. `pointer-events` are live for the whole enter. |
| Open | `scale 1 / opacity 1`, pinned per `align`. |
| Exiting | Still mounted for 150ms at `scale .85 / opacity 0`, `pointer-events: none` so a click can't hit a panel on its way out. |
| Flipped up | If the downward panel would overflow the viewport bottom **and** there is more room above, it pins to `bottom-full` and the origin moves to the bottom corner. Measured once per open. |
| Styled / unstyled | Card chrome (`--radius-lg`, `--color-border-default`, `--color-bg-default`, `--shadow-elevation-04`) vs none. |

Dismissal: outside `mousedown` (capture phase) or `Escape`.

Vertical flip complements `useSmartPopupOffset` (`src/hooks/`), which only clamps horizontally — the
two are not alternatives.

## Dependencies

None. React + `cn()` only — no other Moji UI component, no Radix, no positioning library.

## Import

```jsx
import { Popover } from '../../../src/components/ui/Popover/Popover';
```

Inside a component `.tsx`:

```tsx
import { Popover } from '@/components/ui/Popover/Popover';
```

## Quick example

```jsx
<Popover
  align="right"
  trigger={({ open, toggle }) => (
    <Button variant="outline" size="sm" aria-expanded={open} onClick={toggle}>
      Filter
    </Button>
  )}
>
  {(close) => <FilterPanel onApply={close} />}
</Popover>
```

Menu callers — the child is already a card, so strip the chrome:

```jsx
<Popover unstyled trigger={renderSelector}>
  <DropdownMenuGroup>{rows}</DropdownMenuGroup>
</Popover>
```
