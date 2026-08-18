import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge as Chip } from "@/components/ui/Chip/badge"
import { Tooltip } from "@/components/ui/Tooltip/Tooltip"

// Moji Design System — PrimaryNavItem.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of PrimaryNavItem.css.
// `state` forces idle/hover/active (idle also reacts to real :hover); `type`
// switches between the labelled row (default) and the 36px icon button (collapsed,
// which reveals a right-anchored Tooltip on hover).

type PrimaryNavItemState = "idle" | "hover" | "active"
type PrimaryNavItemType = "default" | "collapsed"

type PrimaryNavItemProps = Omit<React.ComponentProps<"div">, "ref"> & {
  state?: PrimaryNavItemState
  type?: PrimaryNavItemType
  label?: React.ReactNode
  icon?: React.ReactNode
  iconActive?: React.ReactNode
  chip?: React.ReactNode
  href?: string
}

const STATE_CLASS: Record<PrimaryNavItemState, string> = {
  idle: "bg-[var(--color-bg-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]",
  hover: "bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]",
  active: "bg-[var(--color-brand-subtle)] text-[var(--color-brand-default)]",
}

function PrimaryNavItem({
  state = "idle",
  type = "default",
  label,
  icon,
  iconActive,
  chip,
  href,
  className,
  ...rest
}: PrimaryNavItemProps) {
  const isCollapsed = type === "collapsed"
  const resolvedIcon = state === "active" && iconActive ? iconActive : icon

  const classes = cn(
    "group relative box-border inline-flex cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] p-[var(--space-2)] [font:var(--text-body-3)] select-none [transition:background-color_var(--transition-fast),color_var(--transition-fast)]",
    isCollapsed ? "h-9 w-9 justify-center gap-0" : "w-[232px]",
    STATE_CLASS[state],
    className
  )

  const content = (
    <>
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
        {resolvedIcon}
      </span>
      {!isCollapsed && label && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {!isCollapsed && chip && (
        <Chip type="brand" variant="primary" size="xx-small">
          {chip}
        </Chip>
      )}
      {isCollapsed && label && (
        <span
          className={cn(
            // Bubble sits to the right of the icon; appears sliding out from the
            // element (shifted left) to its place, and exits back toward it.
            "pointer-events-none absolute top-1/2 left-[calc(100%+var(--space-1))] z-[var(--z-dropdown)] whitespace-nowrap opacity-0 [transform:translate(calc(-1*var(--space-2)),-50%)] [transition:opacity_var(--transition-tooltip),transform_var(--transition-tooltip)]",
            "group-hover:opacity-100 group-hover:[transform:translate(0,-50%)]",
            state === "hover" && "opacity-100 [transform:translate(0,-50%)]"
          )}
        >
          <Tooltip>{label}</Tooltip>
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <a data-slot="primary-nav-item" data-state={state} className={classes} href={href} {...(rest as unknown as React.ComponentProps<"a">)}>
        {content}
      </a>
    )
  }

  return (
    <div data-slot="primary-nav-item" data-state={state} className={classes} role="button" tabIndex={0} {...rest}>
      {content}
    </div>
  )
}

export { PrimaryNavItem }
