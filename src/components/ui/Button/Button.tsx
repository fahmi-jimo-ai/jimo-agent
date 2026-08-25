import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Moji Design System — Button.
// Foundation: shadcn (cva + cn + Slot + data-slot).
// Visuals: a verbatim port of Button.css — every class maps to the matching
// Moji `.btn--*` rule (default←primary, outline←secondary, link←tertiary,
// `danger` modifier, sizes default←big / sm←small / icon* ← icon-only).
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-1.5",
    "cursor-pointer overflow-hidden whitespace-nowrap no-underline",
    // Radius lives on the `size` axis, not here — see the note above `size`.
    "border border-transparent bg-clip-padding",
    // NB: Tailwind v4's scale utility animates the `scale` property (not `transform`),
    // so the press ease MUST list `scale` here or it snaps instead of easing.
    "[transition:background-color_var(--transition-fast),color_var(--transition-fast),border-color_var(--transition-fast),box-shadow_var(--transition-fast),scale_var(--transition-fast)]",
    // press: subtle scale-down (colors/shadow stay per-variant). Skip popup triggers so they don't bounce.
    "enabled:active:not-aria-[haspopup]:scale-[0.98]",
    "outline-none disabled:cursor-not-allowed disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        // .btn--primary — navy fill
        default: [
          "bg-[var(--color-neutral-800)] text-[var(--color-neutral-white)] shadow-[var(--shadow-elevation-01)]",
          "enabled:hover:bg-[#1a2440]",
          "enabled:active:bg-[#0a1526] enabled:active:shadow-none",
          "disabled:bg-[var(--color-neutral-400)] disabled:text-[var(--color-neutral-white)] disabled:shadow-none",
        ],
        // .btn--secondary — white with neutral border
        outline: [
          "bg-[var(--color-neutral-white)] text-[var(--color-neutral-800)] border-[var(--color-border-default)] shadow-[var(--shadow-elevation-01)]",
          "enabled:hover:bg-[var(--color-neutral-50)] enabled:hover:border-[var(--color-neutral-400)]",
          "enabled:active:bg-[var(--color-neutral-100)] enabled:active:border-[var(--color-neutral-500)] enabled:active:shadow-none",
          "disabled:text-[var(--color-neutral-400)] disabled:border-[var(--color-neutral-200)] disabled:shadow-none",
        ],
        // .btn--tertiary — text-only link
        link: [
          "bg-transparent text-[var(--color-neutral-800)] shadow-none px-0 min-h-0",
          "enabled:hover:text-[var(--color-blue-400)] enabled:hover:underline",
          "enabled:active:text-[var(--color-blue-500)]",
          "disabled:text-[var(--color-neutral-400)]",
        ],
      },
      // ADDITIVE FORK (see CLAUDE.md): the radius moved off the base and onto
      // this axis, and the two SMALL sizes drop to --radius-md.
      //
      // Moji (here and upstream in jimo-storybook) puts --radius-lg on every
      // size. On a 34px icon button that is 12px of corner per side, leaving a
      // 10px flat bottom edge — and --shadow-elevation-01 is `0 2px 2px` with no
      // spread, so the only shadow that survives is a short hard-ended bar under
      // that strip. It reads as a clipped shadow, and it is what the Knowledge
      // row-action button looked like. Figma draws both small buttons at ~8px
      // (measured off 887:10867: the 34px "…" action and the 36px "Add
      // property"), which leaves a 19px flat edge and a shadow that wraps the
      // corners the way an elevation should.
      //
      // `default` (44) and `icon` (40) keep --radius-lg: no artboard measurement
      // was taken for them, and guessing would be a restyle, not a fix.
      size: {
        // .btn--big — 44px min-height, Montserrat SemiBold 16px
        default: "min-h-11 px-4 py-2.5 [font:var(--text-subtitle-3)] rounded-[var(--radius-lg)]",
        // .btn--small — 36px min-height, Montserrat SemiBold 14px
        sm: "min-h-9 px-3 py-2 [font:var(--text-subtitle-4)] rounded-[var(--radius-md)]",
        // .btn--icon-only.btn--big — 40×40
        icon: "size-10 min-h-0 p-2.5 rounded-[var(--radius-lg)]",
        // .btn--icon-only.btn--small — 34×34
        "icon-sm": "size-[34px] min-h-0 p-[9px] rounded-[var(--radius-md)]",
      },
      danger: { true: "", false: "" },
    },
    compoundVariants: [
      // .btn--primary.btn--danger
      {
        variant: "default",
        danger: true,
        class: [
          "bg-[var(--color-red-400)] text-[var(--color-neutral-white)]",
          "enabled:hover:bg-[var(--color-red-500)] enabled:active:bg-[var(--color-red-500)]",
        ],
      },
      // .btn--secondary.btn--danger
      {
        variant: "outline",
        danger: true,
        class: [
          "text-[var(--color-red-400)] border-[var(--color-red-300)]",
          "enabled:hover:bg-[var(--color-red-100)] enabled:hover:border-[var(--color-red-400)]",
        ],
      },
      // .btn--tertiary.btn--danger
      {
        variant: "link",
        danger: true,
        class: ["text-[var(--color-red-400)] enabled:hover:text-[var(--color-red-500)]"],
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      danger: false,
    },
  }
)

// Icon wrapper sizes mirror Button.css: big/icon = 20px, small/icon-sm = 16px.
const iconBoxBySize: Record<string, string> = {
  default: "size-5",
  sm: "size-4",
  icon: "size-5",
  "icon-sm": "size-4",
}

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
  }

function Button({
  className,
  variant = "default",
  size = "default",
  danger = false,
  asChild = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  const iconBox = iconBoxBySize[size ?? "default"]
  const iconOnly = size === "icon" || size === "icon-sm"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-danger={danger ? "" : undefined}
      className={cn(buttonVariants({ variant, size, danger }), className)}
      {...props}
    >
      {leftIcon && (
        <span
          data-slot="button-icon"
          aria-hidden="true"
          className={cn("inline-flex shrink-0 items-center justify-center", iconBox)}
        >
          {leftIcon}
        </span>
      )}
      {!iconOnly && children && <span data-slot="button-label">{children}</span>}
      {rightIcon && (
        <span
          data-slot="button-icon"
          aria-hidden="true"
          className={cn("inline-flex shrink-0 items-center justify-center", iconBox)}
        >
          {rightIcon}
        </span>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
