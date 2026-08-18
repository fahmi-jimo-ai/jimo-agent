import * as React from "react"

import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/Tooltip/Tooltip"

// Moji Design System — TertiaryNavItem.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of TertiaryNavItem.css.
// A 32px icon button that reveals a Tooltip above on hover. `state` forces hover;
// idle also reacts to real :hover. `tooltipArrowPosition` re-anchors the bubble.

type TertiaryNavItemState = "idle" | "hover"
type TooltipArrowPosition = "bottom" | "bottom-left"

type TertiaryNavItemProps = Omit<React.ComponentProps<"div">, "ref"> & {
  icon?: React.ReactNode
  label?: React.ReactNode
  state?: TertiaryNavItemState
  tooltipArrowPosition?: TooltipArrowPosition
  href?: string
}

function TertiaryNavItem({
  icon,
  label,
  state = "idle",
  tooltipArrowPosition = "bottom",
  href,
  className,
  ...rest
}: TertiaryNavItemProps) {
  const isHover = state === "hover"

  const classes = cn(
    "group relative box-border inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-lg)] p-[var(--space-2)] bg-[var(--color-bg-subtle)] select-none [transition:background-color_var(--transition-fast)]",
    "hover:bg-[var(--color-bg-muted)]",
    isHover && "bg-[var(--color-bg-muted)]",
    className
  )

  const content = (
    <>
      <span
        className="inline-flex h-4 w-4 items-center justify-center text-[var(--color-text-secondary)]"
        aria-hidden="true"
      >
        {icon}
      </span>
      {label && (
        // Outer span: static placement above the icon + horizontal anchoring.
        <span
          className={cn(
            "pointer-events-none absolute bottom-[calc(100%+var(--space-1))] left-1/2 z-[var(--z-dropdown)] -translate-x-1/2",
            tooltipArrowPosition === "bottom-left" && "left-0 translate-x-0"
          )}
        >
          {/* Inner span: bubble appears sliding up from the element and exits back down. */}
          <span
            className={cn(
              "block opacity-0 [transform:translateY(var(--space-2))] [transition:opacity_var(--transition-tooltip),transform_var(--transition-tooltip)]",
              "group-hover:opacity-100 group-hover:[transform:translateY(0)]",
              isHover && "opacity-100 [transform:translateY(0)]"
            )}
          >
            <Tooltip>{label}</Tooltip>
          </span>
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <a
        data-slot="tertiary-nav-item"
        className={classes}
        href={href}
        aria-label={typeof label === "string" ? label : undefined}
        {...(rest as unknown as React.ComponentProps<"a">)}
      >
        {content}
      </a>
    )
  }

  return (
    <div
      data-slot="tertiary-nav-item"
      className={classes}
      role="button"
      tabIndex={0}
      aria-label={typeof label === "string" ? label : undefined}
      {...rest}
    >
      {content}
    </div>
  )
}

export { TertiaryNavItem }
