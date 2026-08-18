import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { TickCircle, Warning2, CloseCircle, InfoCircle } from "iconsax-react"

import { cn } from "@/lib/utils"

// Moji Design System — Infobox → Alert.
// Foundation: shadcn (cva + cn + data-slot). Visuals: verbatim port of Infobox.css.
const alertVariants = cva(
  "flex w-full shrink-0 items-center gap-4 overflow-hidden rounded-[var(--radius-lg)] border px-4 py-3",
  {
    variants: {
      type: {
        neutral: "bg-[var(--color-neutral-100)] border-[var(--color-neutral-400)]",
        positive: "bg-[var(--color-green-100)] border-[var(--color-green-500)]",
        warning: "bg-[var(--color-orange-100)] border-[var(--color-orange-500)]",
        danger: "bg-[var(--color-red-100)] border-[var(--color-red-500)]",
        brand: "bg-[var(--color-blue-100)] border-[var(--color-blue-300)]",
      },
    },
    defaultVariants: { type: "neutral" },
  }
)

type AlertType = NonNullable<VariantProps<typeof alertVariants>["type"]>

// .infobox--{type} .infobox__icon
const ICON_COLOR: Record<AlertType, string> = {
  neutral: "text-[var(--color-neutral-700)]",
  positive: "text-[var(--color-green-400)]",
  warning: "text-[var(--color-orange-500)]",
  danger: "text-[var(--color-red-400)]",
  brand: "text-[var(--color-blue-400)]",
}

// .infobox--{type} .infobox__title (neutral keeps neutral-800)
const TITLE_COLOR: Record<AlertType, string> = {
  neutral: "text-[var(--color-neutral-800)]",
  positive: "text-[var(--color-green-500)]",
  warning: "text-[var(--color-orange-500)]",
  danger: "text-[var(--color-red-500)]",
  brand: "text-[var(--color-blue-400)]",
}

function DefaultIcon({ type }: { type: AlertType }) {
  switch (type) {
    case "positive":
      return <TickCircle size={24} variant="Bold" color="currentColor" />
    case "warning":
      return <Warning2 size={24} variant="Bold" color="currentColor" />
    case "danger":
      return <CloseCircle size={24} variant="Bold" color="currentColor" />
    case "brand":
    case "neutral":
    default:
      return <InfoCircle size={24} variant="Bold" color="currentColor" />
  }
}

type AlertProps = Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof alertVariants> & {
    title?: React.ReactNode
    body?: React.ReactNode
    showIcon?: boolean
    icon?: React.ReactNode
    ctaLabel?: React.ReactNode
    onCta?: React.MouseEventHandler<HTMLButtonElement>
  }

function Alert({
  className,
  type = "neutral",
  title,
  body,
  showIcon = true,
  icon,
  ctaLabel,
  onCta,
  ...props
}: AlertProps) {
  const resolvedType: AlertType = type ?? "neutral"
  return (
    <div data-slot="alert" data-type={resolvedType} className={cn(alertVariants({ type }), className)} {...props}>
      {showIcon && (
        <span
          aria-hidden="true"
          className={cn("inline-flex size-6 shrink-0", ICON_COLOR[resolvedType])}
        >
          {icon ?? <DefaultIcon type={resolvedType} />}
        </span>
      )}
      <div data-slot="alert-content" className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p data-slot="alert-title" className={cn("[font:var(--text-subtitle-4)]", TITLE_COLOR[resolvedType])}>
            {title}
          </p>
          {body && (
            <p data-slot="alert-body" className="[font:var(--text-body-4)] text-[var(--color-neutral-700)]">
              {body}
            </p>
          )}
        </div>
        {ctaLabel && onCta && (
          <button
            type="button"
            data-slot="alert-cta"
            onClick={onCta}
            className="inline-flex cursor-pointer items-center gap-2 self-start border-0 bg-none p-0 text-[var(--color-blue-400)] [font:var(--text-subtitle-4)] [transition:color_var(--transition-fast)] hover:text-[var(--color-blue-500)] hover:underline"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export { Alert, alertVariants }
