import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowDown2 } from "iconsax-react"

import { cn } from "@/lib/utils"

// Moji Design System — SelectField (flat select-row trigger).
// Foundation: shadcn (.tsx + cva + cn + data-slot). Visuals: Figma
// KhddnEI8qGtD0NMbrYmxhj node 3072:16392 (right panel "Action" / "Width" rows),
// bound to Moji tokens via Tailwind arbitrary values.
//
// TRIGGER ONLY — no menu, no popover state, no config coupling. The caller owns
// the menu and composes it from Popover + DropdownMenuGroup + DropdownMenuList.
// Deliberately NOT DropdownSelector: see CONTEXT.md for the rationale.

const selectFieldVariants = cva(
  cn(
    "group flex w-full items-center gap-[var(--space-2)] rounded-[var(--radius-md)] text-left",
    "border border-[var(--color-border-default)] bg-[var(--color-bg-default)]",
    "[transition:border-color_var(--transition-fast),background-color_var(--transition-fast)]",
    "enabled:cursor-pointer enabled:hover:border-[var(--color-border-strong)]",
    // Visible focus indicator (we remove the UA outline, so we must replace it).
    "focus-visible:border-[var(--color-border-focus)] focus-visible:outline-none",
    "focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand-default)_15%,transparent)]",
    "disabled:cursor-not-allowed disabled:text-[var(--color-text-tertiary)]"
  ),
  {
    variants: {
      size: {
        // 4 + 24 content + 4 + 2 border = 34px, matching ColorField.
        default: "px-[var(--space-2)] py-[var(--space-1)]",
        // 4 + 32 chip + 4 (+2 border) = 40px of box, 42px including the hairline.
        chip: "py-[var(--space-1)] pl-[var(--space-1)] pr-[var(--space-2)]",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type SelectFieldProps = Omit<React.ComponentProps<"button">, "size" | "value"> &
  VariantProps<typeof selectFieldVariants> & {
    /** Current value; when `undefined` the placeholder shows. */
    value?: React.ReactNode
    placeholder?: string
    /** 16px leading glyph. */
    icon?: React.ReactNode
    /** Wrap the icon in a 32px neutral chip (makes the row 40px). */
    iconChip?: boolean
    /** Caller-owned popover state — rotates the chevron, sets aria-expanded. */
    open?: boolean
    chevron?: boolean
  }

const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
  (
    {
      value,
      placeholder = "Select...",
      icon,
      iconChip = false,
      open = false,
      chevron = true,
      size,
      disabled,
      className,
      ...rest
    },
    ref
  ) => {
    const resolvedSize = size ?? (iconChip ? "chip" : "default")
    const isEmpty = value === undefined || value === null || value === ""

    return (
      <button
        ref={ref}
        type="button"
        data-slot="select-field"
        data-size={resolvedSize}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(selectFieldVariants({ size: resolvedSize }), className)}
        {...rest}
      >
        {icon &&
          (iconChip ? (
            <span
              data-slot="select-field-icon"
              aria-hidden="true"
              className={cn(
                "inline-flex size-[var(--space-8)] shrink-0 items-center justify-center",
                "rounded-[var(--radius-md)] bg-[var(--color-neutral-100)]",
                disabled ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text-secondary)]",
                "[&_svg]:size-4"
              )}
            >
              {icon}
            </span>
          ) : (
            <span
              data-slot="select-field-icon"
              aria-hidden="true"
              className={cn(
                "inline-flex size-4 shrink-0 items-center justify-center",
                disabled ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text-secondary)]",
                "[&_svg]:size-4"
              )}
            >
              {icon}
            </span>
          ))}

        {/* Outer span carries the 24px content height (so a chip-less row is 34px);
            the inner span does the ellipsis — `truncate` on a flex box is a no-op. */}
        <span
          data-slot="select-field-value"
          className="flex min-h-[var(--space-6)] min-w-0 flex-1 items-center"
        >
          <span
            className={cn(
              "truncate [font:var(--text-body-4)]",
              disabled
                ? "text-[var(--color-text-tertiary)]"
                : isEmpty
                  ? "text-[var(--color-text-tertiary)]"
                  : "text-[var(--color-text-primary)]"
            )}
          >
            {isEmpty ? placeholder : value}
          </span>
        </span>

        {chevron && (
          <span
            data-slot="select-field-chevron"
            aria-hidden="true"
            className={cn(
              "inline-flex size-4 shrink-0 items-center justify-center text-[var(--color-text-tertiary)]",
              // Tailwind v4's rotate-* utility animates the `rotate` property,
              // not `transform` — transition both so the flip is smooth.
              "[transition:rotate_var(--transition-fast),transform_var(--transition-fast)]",
              open && "rotate-180"
            )}
          >
            <ArrowDown2 size={16} variant="Linear" />
          </span>
        )}
      </button>
    )
  }
)
SelectField.displayName = "SelectField"

export { SelectField, selectFieldVariants }
export type { SelectFieldProps }
