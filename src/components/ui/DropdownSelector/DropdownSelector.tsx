import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { HambergerMenu, ArrowDown2 } from "iconsax-react"

import { cn } from "@/lib/utils"

// Moji Design System — DropdownSelector (dropdown trigger button).
// Foundation: shadcn (cva + cn + data-slot). Visuals: verbatim port of DropdownSelector.css.
const selectorVariants = cva(
  "inline-flex items-center gap-[var(--space-2)] border border-[var(--color-border-default)] bg-[var(--color-bg-default)] text-[var(--color-text-primary)] whitespace-nowrap shadow-[var(--shadow-elevation-01)] [transition:border-color_var(--transition-fast),background-color_var(--transition-fast),color_var(--transition-fast)]",
  {
    variants: {
      size: {
        big: "px-3 py-2 rounded-[var(--radius-lg)] [font:var(--text-body-3)]",
        small: "p-2 rounded-[var(--radius-md)] [font:var(--text-body-4)]",
      },
    },
    defaultVariants: { size: "big" },
  }
)

type DropdownSelectorProps = Omit<React.ComponentProps<"button">, "size"> &
  VariantProps<typeof selectorVariants> & {
    text?: React.ReactNode
    withIcon?: boolean
    icon?: React.ReactNode
    withText?: boolean
    isOpen?: boolean
    hasValue?: boolean
  }

const DropdownSelector = React.forwardRef<HTMLButtonElement, DropdownSelectorProps>(
  (
    {
      size = "big",
      text,
      withIcon = false,
      icon,
      withText = true,
      isOpen = false,
      hasValue = false,
      disabled,
      className,
      ...rest
    },
    ref
  ) => {
    const stateClasses = disabled
      ? "cursor-not-allowed border-[var(--color-neutral-200)] bg-[var(--color-bg-muted)] text-[var(--color-text-disabled)]"
      : cn(
          "cursor-pointer enabled:active:bg-[var(--color-neutral-300)]",
          hasValue
            ? "border-[var(--color-border-focus)] bg-[var(--color-brand-subtle)] text-[var(--color-brand-default)]"
            : isOpen
              ? "border-[var(--color-border-focus)] bg-[var(--color-brand-subtle)]"
              : "hover:bg-[var(--color-bg-muted)]",
          // .dropdown-selector--placeholder
          withText && !text && "text-[var(--color-text-tertiary)]"
        )

    return (
      <button
        ref={ref}
        type="button"
        data-slot="dropdown-selector"
        data-size={size}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(selectorVariants({ size }), stateClasses, className)}
        {...rest}
      >
        {withIcon && (
          <span className="inline-flex size-5 shrink-0 items-center text-current">
            {icon ?? <HambergerMenu size={20} variant="Linear" />}
          </span>
        )}
        {withText && (
          <span className="flex-1 overflow-hidden text-ellipsis text-left">
            {text ?? <span className="text-[var(--color-text-tertiary)]">Select…</span>}
          </span>
        )}
        {withText && (
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex size-5 shrink-0 items-center text-current [transition:transform_var(--transition-fast)]",
              isOpen && "rotate-180"
            )}
          >
            <ArrowDown2 size={size === "small" ? 16 : 20} variant="Linear" />
          </span>
        )}
      </button>
    )
  }
)
DropdownSelector.displayName = "DropdownSelector"

export { DropdownSelector, selectorVariants }
