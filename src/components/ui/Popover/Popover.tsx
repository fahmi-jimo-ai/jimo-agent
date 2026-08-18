import * as React from "react"

import { cn } from "@/lib/utils"

// Moji Design System — Popover.
// Foundation: custom stateful .tsx (no cva, no Radix) + cn + data-slot.
// Visuals: every value bound to a Moji token; no component .css.
//
/**
 * A minimal popover primitive: renders a trigger and an absolutely-positioned
 * panel, closing on outside click or Escape. No portal — the panel is a sibling
 * of the trigger, so the wrapper owns the `position: relative` room (handled
 * here). Reach for it whenever a control has to open a layer over the page:
 * colour pickers, shadow editors, select menus, property-panel dropdowns.
 *
 * THIS IS THE CORRECTED REFERENCE FOR THE FLOATING-LAYER MOTION CONTRACT.
 * `DropdownFilter`, `DropdownFilterNested` and `DatePicker` all carry the
 * transform-only bug described below today; build a new floating layer on this
 * component rather than copy-pasting one of theirs.
 *
 * Panel chrome: by default the panel IS the card (border + bg + shadow +
 * radius), because most callers drop BARE content into it (a colour picker, a
 * shadow editor). Menu callers instead render a `DropdownMenuGroup`, which is
 * ITSELF a Moji card — so they MUST pass `unstyled` to strip this outer chrome,
 * or you get a card-in-a-card (see `DropdownFilter`: its positioning wrapper is
 * bare and `DropdownMenuGroup` is the only card). Rule: `unstyled` whenever the
 * child is already a card.
 *
 * Vertical flip: the panel opens downward by default, but if it would overflow
 * the viewport bottom it flips to open upward (measured once per open, no lib —
 * `useSmartPopupOffset` only clamps horizontally, so the two are complementary,
 * not alternatives). This fixes controls near the bottom of a scrolled panel.
 *
 * Motion: the Moji open/close animation — scale .85 → 1 + opacity 0 → 1 over
 * 150ms (`opacity` on `ease`, `scale` on `cubic-bezier(0.16,1,0.3,1)`),
 * anchored at the corner the panel grows from. Four things make it work and are
 * each easy to break:
 *   1. The panel is KEPT MOUNTED for the 150ms exit (`visible`), so closing
 *      animates too — `{open && …}` would only ever animate the enter.
 *   2. The enter class flips on a DOUBLE rAF (`entered`), because a single
 *      frame lands in the same style recalc as the mount and the browser has no
 *      "from" value to interpolate — the panel would just pop in.
 *   3. `transform-origin` follows BOTH axes: alignment picks left/right, and
 *      `flipUp` picks bottom over top. Get it wrong and the panel scales out of
 *      the wrong corner, away from its own trigger.
 *   4. The transition list names `scale` AND `transform` on purpose. Tailwind
 *      v4 compiles `scale-*` to the standalone `scale:` CSS property
 *      (`.scale-[0.85] { scale: 0.85 }`), NOT to a `transform` matrix — so the
 *      usual `[transition:opacity_150ms_ease,transform_150ms_…]` animates the
 *      fade while the scale SNAPS. Verified against the generated stylesheet,
 *      and easy to mistake for working because the opacity alone reads as
 *      motion. `transform` stays in the list for any caller that sets a real
 *      `transform:` in `panelClassName`.
 * The animation classes live in the ALWAYS-ON part of the className — `unstyled`
 * strips card chrome only, and every menu caller passes `unstyled`.
 *
 * Pointer events are enabled for the whole enter (keying them on the enter flag
 * instead leaves 2 frames of `pointer-events: none` after the click that opened
 * the panel — a trap for a fast clicker and for interaction-test drivers) and
 * disabled for the exit, so a click can't hit a panel on its way out.
 */
// The duration is written twice on purpose — here for the exit timer, and as a
// literal inside the class string below. Tailwind extracts classes statically,
// so an interpolated `[transition:…${ENTER_MS}ms…]` would emit no CSS at all and
// silently kill the animation. Do not DRY these two together.
const ENTER_MS = 150

/** Horizontal pin. `center` carries the centering transform itself — Tailwind v4
 *  emits `translate:` and `scale:` as separate properties, so it composes with
 *  the scale animation instead of overwriting it (a `transform:` shorthand
 *  would). It is static positioning, so `translate` is deliberately NOT in the
 *  transition list. */
const ALIGN_X = {
  left: "left-0",
  right: "right-0",
  center: "left-1/2 -translate-x-1/2",
} as const

/** The corner the panel grows out of — always the one nearest its trigger. */
const ORIGIN = {
  down: { left: "origin-top-left", right: "origin-top-right", center: "origin-top" },
  up: { left: "origin-bottom-left", right: "origin-bottom-right", center: "origin-bottom" },
} as const

export function Popover({
  trigger,
  children,
  align = "left",
  panelClassName = "",
  unstyled = false,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode
  children: React.ReactNode | ((close: () => void) => React.ReactNode)
  /** Which edge the panel is pinned to. `center` also owns the centering
   *  transform, so callers never hand-roll `-translate-x-1/2` in
   *  `panelClassName` — a transform there would fight the scale animation and
   *  leave `transform-origin` anchored to the wrong corner. */
  align?: "left" | "right" | "center"
  panelClassName?: string
  /** Drop the card chrome (border/bg/shadow/radius) — pass when the child is
   *  already a card, e.g. a `DropdownMenuGroup`. */
  unstyled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(false)
  const open = controlledOpen ?? uncontrolled
  const setOpen = (v: boolean) => {
    onOpenChange?.(v)
    if (controlledOpen === undefined) setUncontrolled(v)
  }
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [flipUp, setFlipUp] = React.useState(false)

  // `visible` = mounted (stays true through the exit animation).
  // `entered` = at rest (scale 1 / opacity 1). See the motion note above.
  const [visible, setVisible] = React.useState(open)
  const [entered, setEntered] = React.useState(false)
  const exitTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const enterRaf = React.useRef(0)

  React.useEffect(() => {
    if (open) {
      clearTimeout(exitTimer.current)
      setVisible(true)
      enterRaf.current = requestAnimationFrame(() =>
        requestAnimationFrame(() => setEntered(true))
      )
    } else {
      cancelAnimationFrame(enterRaf.current)
      setEntered(false)
      exitTimer.current = setTimeout(() => setVisible(false), ENTER_MS)
    }
    return () => {
      cancelAnimationFrame(enterRaf.current)
      clearTimeout(exitTimer.current)
    }
  }, [open])

  // Measure once per open: flip upward if the downward panel would overflow the
  // viewport bottom AND there's more room above than below. Keyed on `visible`,
  // not `open` — the panel has to exist to be measured, and resetting mid-exit
  // would make a flipped panel jump to the other side as it fades.
  React.useLayoutEffect(() => {
    if (!visible) {
      setFlipUp(false)
      return
    }
    const panel = panelRef.current
    const wrap = wrapRef.current
    if (!panel || !wrap) return
    const panelH = panel.offsetHeight
    const triggerBox = wrap.getBoundingClientRect()
    const vh = window.innerHeight
    const spaceBelow = vh - triggerBox.bottom
    const spaceAbove = triggerBox.top
    if (panelH + 8 > spaceBelow && spaceAbove > spaceBelow) setFlipUp(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  React.useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown, true)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown, true)
      document.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div ref={wrapRef} data-slot="popover" className="relative">
      {trigger({ open, toggle: () => setOpen(!open) })}
      {visible && (
        <div
          ref={panelRef}
          data-slot="popover-panel"
          className={cn(
            "absolute z-[var(--z-dropdown)] [transition:opacity_150ms_ease,scale_150ms_cubic-bezier(0.16,1,0.3,1),transform_150ms_cubic-bezier(0.16,1,0.3,1)]",
            entered ? "scale-100 opacity-100" : "scale-[0.85] opacity-0",
            open ? "pointer-events-auto" : "pointer-events-none",
            !unstyled &&
              "rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-default)] shadow-[var(--shadow-elevation-04)]",
            flipUp ? "bottom-full mb-1" : "top-full mt-1",
            ALIGN_X[align],
            ORIGIN[flipUp ? "up" : "down"][align],
            panelClassName
          )}
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  )
}

Popover.displayName = "Popover"
