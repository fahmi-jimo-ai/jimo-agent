import * as React from "react"

import { cn } from "@/lib/utils"

// Moji Design System — SecondaryNavItem.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of SecondaryNavItem.css.
// `state` forces idle/hover/active/disabled (idle also reacts to real :hover).
// Optional `counter` renders a right-aligned count that inherits the state color.

type SecondaryNavItemState = "idle" | "hover" | "active" | "disabled"

type SecondaryNavItemProps = Omit<React.ComponentProps<"div">, "ref"> & {
  state?: SecondaryNavItemState
  label?: React.ReactNode
  icon?: React.ReactNode
  iconActive?: React.ReactNode
  counter?: React.ReactNode
  href?: string
}

const STATE_CLASS: Record<SecondaryNavItemState, string> = {
  idle: "bg-[var(--color-bg-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]",
  hover: "bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]",
  active: "bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]",
  disabled: "bg-[var(--color-bg-default)] text-[var(--color-text-tertiary)] cursor-default pointer-events-none",
}

function SecondaryNavItem({
  state = "idle",
  label,
  icon,
  iconActive,
  counter,
  href,
  className,
  ...rest
}: SecondaryNavItemProps) {
  const isDisabled = state === "disabled"
  const resolvedIcon = state === "active" && iconActive ? iconActive : icon

  const classes = cn(
    "box-border flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] px-[var(--space-3)] py-[var(--space-2)] [font:var(--text-body-3)] select-none [transition:background-color_var(--transition-fast),color_var(--transition-fast)]",
    STATE_CLASS[state],
    className
  )

  const content = (
    <>
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
        {resolvedIcon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {counter != null && (
        <span className="shrink-0 [font:var(--text-body-3)] text-[color:inherit]">{counter}</span>
      )}
    </>
  )

  if (href) {
    return (
      <a
        data-slot="secondary-nav-item"
        data-state={state}
        className={classes}
        href={href}
        aria-disabled={isDisabled}
        {...(rest as unknown as React.ComponentProps<"a">)}
      >
        {content}
      </a>
    )
  }

  return (
    <div
      data-slot="secondary-nav-item"
      data-state={state}
      className={classes}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
      {...rest}
    >
      {content}
    </div>
  )
}

export { SecondaryNavItem }
