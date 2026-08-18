import * as React from "react"

import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/Tooltip/Tooltip"

// Moji Design System — IconButton.
// Foundation: custom .tsx (cn + data-slot) — a single look with one boolean
// state, so no cva and no *Variants export (same shape as Tooltip/TertiaryNavItem).
// Visuals: ported from the private `IconButton` inside the Agent Widget Builder's
// Topbar.tsx (the undo/redo pair). A bare 32px transparent glyph target that
// tints its background on hover and reveals a Tooltip below; disabled drops to
// 30% opacity and suppresses both the hover fill and the tooltip.
//
// The Tooltip stays MOUNTED and is toggled by opacity (house rule) — the source
// unmounted it while disabled; here `disabled` just holds the opacity at 0.

type IconButtonState = "idle" | "hover"

type IconButtonProps = Omit<React.ComponentProps<"button">, "ref"> & {
  /** Glyph element rendered inside the 32px target. */
  icon?: React.ReactNode
  /** Tooltip text revealed under the button on hover. */
  tip?: string
  /** Forces the hover presentation (Storybook / snapshot use). */
  state?: IconButtonState
}

function IconButton({
  icon,
  tip,
  state = "idle",
  disabled,
  className,
  "aria-label": ariaLabel,
  ...rest
}: IconButtonProps) {
  const [hover, setHover] = React.useState(false)
  const showTip = !disabled && (state === "hover" || hover)

  return (
    <span
      data-slot="icon-button"
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        data-slot="icon-button-trigger"
        disabled={disabled}
        aria-label={ariaLabel || tip || undefined}
        className={cn(
          "flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--radius-md)]",
          "text-[var(--color-text-secondary)] [transition:background-color_var(--transition-fast)]",
          "hover:bg-[var(--color-bg-muted)]",
          state === "hover" && !disabled && "bg-[var(--color-bg-muted)]",
          "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        )}
        {...rest}
      >
        {icon}
      </button>
      {tip && (
        // Wrapper owns placement + the reveal; the bubble itself is presentational.
        <span
          data-slot="icon-button-tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 top-[calc(100%+var(--space-1))] z-[var(--z-toast)] -translate-x-1/2",
            "[transition:opacity_var(--transition-tooltip)]",
            showTip ? "opacity-100" : "opacity-0"
          )}
        >
          <Tooltip>{tip}</Tooltip>
        </span>
      )}
    </span>
  )
}

export { IconButton }
