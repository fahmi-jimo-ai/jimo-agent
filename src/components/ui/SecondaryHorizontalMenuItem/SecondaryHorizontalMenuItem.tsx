import * as React from "react"

import { cn } from "@/lib/utils"

// Moji Design System — SecondaryHorizontalMenuItem (segmented/pill tab).
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of SecondaryHorizontalMenuItem.css.
// Presentational: `state` forces inactive/hover/active; real :hover applies on inactive.

type SecondaryTabState = "inactive" | "hover" | "active"

type SecondaryHorizontalMenuItemProps = Omit<React.ComponentProps<"div">, "ref"> & {
  tabName?: React.ReactNode
  state?: SecondaryTabState
  size?: "small" | "big"
  withText?: boolean
  icon?: React.ReactNode
}

const SecondaryHorizontalMenuItem = React.forwardRef<HTMLDivElement, SecondaryHorizontalMenuItemProps>(
  (
    {
      tabName = "Report",
      state = "inactive",
      size = "small",
      withText = true,
      icon,
      onClick,
      className,
      ...rest
    },
    ref
  ) => {
    const isActive = state === "active"
    const isHover = state === "hover"
    const isInactive = state === "inactive"
    const isBig = size === "big"

    const slotColor = isActive
      ? "text-[var(--color-text-primary)]"
      : isHover
        ? "text-[var(--color-neutral-700)]"
        : "text-[var(--color-neutral-600)]"

    return (
      <div
        ref={ref}
        data-slot="secondary-tab"
        role="tab"
        aria-selected={isActive}
        tabIndex={0}
        onClick={onClick}
        className={cn(
          "group/tab flex cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-transparent outline-none select-none [transition:background-color_var(--transition-base),box-shadow_var(--transition-base)]",
          // padding by size + type
          !withText ? "p-[var(--space-2)]" : isBig ? "px-[var(--space-4)] py-[var(--space-2)]" : "px-[var(--space-4)] py-[var(--space-1)]",
          // states
          isActive && "bg-[var(--color-bg-default)] shadow-[var(--shadow-elevation-02)]",
          isHover && "bg-[var(--color-neutral-300)]",
          isInactive && "hover:bg-[var(--color-neutral-300)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-400)]",
          className
        )}
        {...rest}
      >
        <div className={cn("flex items-center", withText ? "gap-[var(--space-2)]" : "gap-0")}>
          {icon && (
            <span
              aria-hidden="true"
              className={cn(
                "flex items-center [transition:color_var(--transition-base)]",
                slotColor,
                isInactive && "group-hover/tab:text-[var(--color-neutral-700)]"
              )}
            >
              {icon}
            </span>
          )}
          {withText && (
            <span
              className={cn(
                "text-center whitespace-nowrap [transition:color_var(--transition-base)]",
                isBig ? "[font:var(--text-body-2)]" : "[font:var(--text-body-3)]",
                slotColor,
                isInactive && "group-hover/tab:text-[var(--color-neutral-700)]"
              )}
            >
              {tabName}
            </span>
          )}
        </div>
      </div>
    )
  }
)
SecondaryHorizontalMenuItem.displayName = "SecondaryHorizontalMenuItem"

export { SecondaryHorizontalMenuItem }
