import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CloseCircle } from "iconsax-react"

import { cn } from "@/lib/utils"

// Moji Design System — Chip / Label → Badge.
// Foundation: shadcn (cva + cn + data-slot). Visuals: verbatim port of Chip.css.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-transparent whitespace-nowrap [transition:background-color_var(--transition-fast),color_var(--transition-fast)]",
  {
    variants: {
      // .chip--{type}
      type: {
        neutral: "",
        positive: "",
        negative: "",
        alert: "",
        brand: "",
      },
      // .chip--{primary|secondary}
      variant: {
        primary: "",
        secondary: "",
      },
      // .chip--{size}
      size: {
        regular: "px-3 py-2 [font:var(--text-body-3)]",
        small: "px-3 py-1 [font:var(--text-body-4)]",
        "x-small": "px-2 py-1 [font:var(--text-body-4)]",
        "xx-small": "px-2 py-0.5 [font:var(--text-body-4)]",
      },
      iconOnly: { true: "gap-0 justify-center", false: "" },
    },
    compoundVariants: [
      // ── type × variant color combos (Chip.css) ──
      {
        type: "neutral",
        variant: "secondary",
        class: "bg-[var(--color-neutral-white)] border-[var(--color-neutral-300)] text-[var(--color-neutral-800)]",
      },
      { type: "neutral", variant: "primary", class: "bg-[var(--color-neutral-200)] text-[var(--color-neutral-800)]" },
      {
        type: "positive",
        variant: "secondary",
        class: "bg-[var(--color-green-100)] border-[var(--color-green-300)] text-[var(--color-green-500)]",
      },
      { type: "positive", variant: "primary", class: "bg-[var(--color-green-400)] text-[var(--color-neutral-white)]" },
      {
        type: "negative",
        variant: "secondary",
        class: "bg-[var(--color-red-100)] border-[var(--color-red-300)] text-[var(--color-red-500)]",
      },
      { type: "negative", variant: "primary", class: "bg-[var(--color-red-400)] text-[var(--color-neutral-white)]" },
      {
        type: "alert",
        variant: "secondary",
        class: "bg-[var(--color-orange-100)] border-[var(--color-orange-300)] text-[var(--color-orange-500)]",
      },
      { type: "alert", variant: "primary", class: "bg-[var(--color-orange-500)] text-[var(--color-neutral-white)]" },
      {
        type: "brand",
        variant: "secondary",
        class: "bg-[var(--color-blue-100)] border-[var(--color-blue-300)] text-[var(--color-blue-500)]",
      },
      { type: "brand", variant: "primary", class: "bg-[var(--color-blue-400)] text-[var(--color-neutral-white)]" },
      // ── icon-only square dimensions per size (Chip.css) ──
      { iconOnly: true, size: "regular", class: "size-8 p-2" },
      { iconOnly: true, size: "small", class: "size-6 p-1" },
      { iconOnly: true, size: "x-small", class: "size-5 p-1" },
      { iconOnly: true, size: "xx-small", class: "size-4 p-0.5" },
    ],
    defaultVariants: {
      type: "neutral",
      variant: "secondary",
      size: "regular",
      iconOnly: false,
    },
  }
)

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    onRemove?: React.MouseEventHandler<HTMLButtonElement>
  }

function Badge({
  className,
  type = "neutral",
  variant = "secondary",
  size = "regular",
  iconOnly = false,
  leftIcon,
  rightIcon,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-type={type}
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ type, variant, size, iconOnly }), className)}
      {...props}
    >
      {iconOnly ? (
        leftIcon ?? rightIcon
      ) : (
        <>
          {leftIcon && (
            <span data-slot="badge-icon" className="inline-flex size-4 shrink-0 items-center">
              {leftIcon}
            </span>
          )}
          {children && <span data-slot="badge-label">{children}</span>}
          {rightIcon && !onRemove && (
            <span data-slot="badge-icon" className="inline-flex size-4 shrink-0 items-center">
              {rightIcon}
            </span>
          )}
        </>
      )}
      {onRemove && (
        <button
          type="button"
          data-slot="badge-remove"
          onClick={onRemove}
          aria-label="Remove"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-none p-0 text-inherit opacity-70 [transition:opacity_var(--transition-fast)] hover:opacity-100"
        >
          <CloseCircle size={16} variant="Bold" color="currentColor" />
        </button>
      )}
    </span>
  )
}

export { Badge, badgeVariants }
