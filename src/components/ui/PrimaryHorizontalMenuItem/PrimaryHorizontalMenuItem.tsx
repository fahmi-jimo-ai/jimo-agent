import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge as Chip } from "../Chip/badge"

// Moji Design System — PrimaryHorizontalMenuItem (underline tab).
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of PrimaryHorizontalMenuItem.css.
// Presentational: `state` forces default/hover/active; real :hover applies on default.

type PrimaryTabState = "default" | "hover" | "active"

type PrimaryHorizontalMenuItemProps = Omit<React.ComponentProps<"div">, "ref"> & {
  label?: React.ReactNode
  state?: PrimaryTabState
  size?: "regular" | "small"
  showIcon?: boolean
  icon?: React.ReactNode
  showCounter?: boolean
  counter?: React.ReactNode
  showChip?: boolean
  chipLabel?: React.ReactNode
}

const PrimaryHorizontalMenuItem = React.forwardRef<HTMLDivElement, PrimaryHorizontalMenuItemProps>(
  (
    {
      label = "Menu",
      state = "default",
      size = "regular",
      showIcon = false,
      icon,
      showCounter = false,
      counter = 3,
      showChip = false,
      chipLabel = "Chip",
      onClick,
      className,
      ...rest
    },
    ref
  ) => {
    const isActive = state === "active"
    const isHover = state === "hover"
    const isDefault = state === "default"
    const isSmall = size === "small"

    const textColor = (hoverColor: string) =>
      isActive
        ? "text-[var(--color-blue-400)]"
        : isHover
          ? hoverColor
          : "text-[var(--color-neutral-600)]"

    return (
      <div
        ref={ref}
        data-slot="primary-tab"
        role="tab"
        aria-selected={isActive}
        tabIndex={0}
        onClick={onClick}
        className={cn(
          "group/tab inline-flex cursor-pointer flex-col items-center gap-[var(--space-2)] outline-none select-none",
          className
        )}
        {...rest}
      >
        <div className="pb-[var(--space-1)]">
          <div
            data-slot="primary-tab-content"
            className={cn(
              "flex items-center rounded-[var(--radius-md)] [transition:background-color_var(--transition-base)]",
              isSmall ? "gap-[var(--space-1)] px-1.5 py-0.5" : "gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-1)]",
              isHover && "bg-[var(--color-bg-muted)]",
              isDefault && "group-hover/tab:bg-[var(--color-bg-muted)]",
              "group-focus-visible/tab:outline-2 group-focus-visible/tab:outline-offset-2 group-focus-visible/tab:outline-[var(--color-blue-400)]"
            )}
          >
            {showIcon && icon && (
              <span
                aria-hidden="true"
                className={cn(
                  "flex items-center [transition:color_var(--transition-base)]",
                  textColor("text-[var(--color-neutral-700)]"),
                  isDefault && "group-hover/tab:text-[var(--color-neutral-700)]"
                )}
              >
                {icon}
              </span>
            )}
            <span
              className={cn(
                "whitespace-nowrap [transition:color_var(--transition-base)]",
                isSmall ? "[font:var(--text-body-4)]" : "[font:var(--text-body-3)]",
                textColor("text-[var(--color-neutral-700)]"),
                isDefault && "group-hover/tab:text-[var(--color-neutral-700)]"
              )}
            >
              {label}
            </span>
            {showCounter && (
              <span
                className={cn(
                  "whitespace-nowrap opacity-50 [transition:color_var(--transition-base)]",
                  isSmall ? "[font:var(--text-body-4)]" : "[font:var(--text-body-3)]",
                  textColor("text-[var(--color-neutral-800)]"),
                  isDefault && "group-hover/tab:text-[var(--color-neutral-800)]"
                )}
              >
                {counter}
              </span>
            )}
            {showChip && (
              <Chip type="brand" variant="primary" size="xx-small">
                {chipLabel}
              </Chip>
            )}
          </div>
        </div>
        <div
          data-slot="primary-tab-indicator"
          aria-hidden="true"
          className={cn(
            "h-0.5 w-full rounded-t-[var(--radius-sm)] bg-[var(--color-blue-400)] [transition:transform_var(--transition-base)]",
            isActive ? "scale-x-100" : "scale-x-0"
          )}
        />
      </div>
    )
  }
)
PrimaryHorizontalMenuItem.displayName = "PrimaryHorizontalMenuItem"

export { PrimaryHorizontalMenuItem }
