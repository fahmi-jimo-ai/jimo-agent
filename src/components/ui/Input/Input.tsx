import * as React from "react"
import { ArrowDown2, TickCircle, CloseCircle, Warning2 } from "iconsax-react"

import { SpinnerIcon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

// Moji Design System — Input (unified field).
// Foundation: shadcn (.tsx + cn + data-slot). Visuals: verbatim port of Input.css.
// Kept as one composite component (label + control + status + icons + cta +
// dropdown chevron) to match the existing API and the .css exactly.

type InputStatus = "none" | "loading" | "positive" | "warning" | "negative"
type InputSize = "regular" | "small"
type InputVariant = "text" | "textarea" | "dropdown" | "dropdown-search"

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: InputSize
  status?: InputStatus
  inputType?: InputVariant
  label?: React.ReactNode
  supportiveText?: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  trailingText?: React.ReactNode
  cta?: React.ReactNode
  secondarySlot?: React.ReactNode
}

// .input-field__wrapper border per status (status border outranks focus border in the CSS).
const STATUS_BORDER: Record<InputStatus, string> = {
  none: "border-[var(--color-border-default)]",
  loading: "border-[var(--color-border-default)]",
  positive: "border-[var(--color-green-400)]",
  warning: "border-[var(--color-orange-500)]",
  negative: "border-[var(--color-red-400)]",
}

const STATUS_ICON_COLOR: Record<InputStatus, string> = {
  none: "",
  loading: "text-[var(--color-blue-400)]",
  positive: "text-[var(--color-green-400)]",
  warning: "text-[var(--color-orange-500)]",
  negative: "text-[var(--color-red-400)]",
}

const SUPPORTIVE_COLOR: Record<InputStatus, string> = {
  none: "text-[var(--color-text-secondary)]",
  loading: "text-[var(--color-text-secondary)]",
  positive: "text-[var(--color-green-500)]",
  warning: "text-[var(--color-orange-500)]",
  negative: "text-[var(--color-red-500)]",
}

const Input = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  (
    {
      size = "regular",
      status = "none",
      inputType = "text",
      type = "text",
      label,
      supportiveText,
      leftIcon,
      rightIcon,
      trailingText,
      cta,
      secondarySlot,
      placeholder,
      value,
      onChange,
      disabled,
      className,
      id,
      ...rest
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId

    const isTextarea = inputType === "textarea"
    const isDropdown = inputType === "dropdown" || inputType === "dropdown-search"
    const resolvedHtmlType = isDropdown ? "text" : type
    const isSmall = size === "small"

    // .input-field__wrapper — border color follows status; focus adds the blue ring,
    // and (only when status is none) the blue border too. Disabled overrides all.
    const wrapperClass = cn(
      "flex items-stretch overflow-hidden rounded-[var(--radius-md)] border bg-[var(--color-neutral-white)]",
      "[transition:border-color_var(--transition-fast),box-shadow_var(--transition-fast)]",
      disabled
        ? "cursor-not-allowed border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] [pointer-events:none]"
        : status === "none"
          ? cn(
              STATUS_BORDER.none,
              "[&:hover:not(:focus-within)]:border-[var(--color-border-strong)]",
              "focus-within:border-[var(--color-blue-400)] focus-within:shadow-[0_0_0_3px_rgba(18,96,235,0.15)]"
            )
          : cn(STATUS_BORDER[status], "focus-within:shadow-[0_0_0_3px_rgba(18,96,235,0.15)]")
    )

    const controlClass = cn(
      // .input-field__control
      "min-w-0 flex-1 border-0 bg-transparent text-[var(--color-text-primary)] outline-none",
      "placeholder:text-[var(--color-neutral-500)]",
      isSmall ? "[font:var(--text-body-3)]" : "[font:var(--text-body-2)]",
      disabled && "cursor-not-allowed text-[var(--color-text-disabled)]",
      isTextarea && "min-h-20 resize-y"
    )

    const iconClass =
      "inline-flex size-6 shrink-0 items-center text-[var(--color-neutral-500)] [&_svg]:size-6"

    return (
      <div data-slot="input-field" className={cn("flex w-full flex-col gap-1", className)}>
        {label && (
          <label
            data-slot="input-label"
            htmlFor={inputId}
            className={cn(
              "[font:var(--text-body-3)]",
              disabled ? "text-[var(--color-text-disabled)]" : "text-[var(--color-text-primary)]"
            )}
          >
            {label}
          </label>
        )}
        <div data-slot="input-wrapper" className={wrapperClass}>
          {secondarySlot && (
            <div
              className={cn(
                "flex max-w-[175px] shrink-0 items-center rounded-[0_2px_2px_0] bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] [font:var(--text-body-2)]",
                isSmall ? "p-2" : "px-2 py-3"
              )}
            >
              {secondarySlot}
            </div>
          )}
          <div
            data-slot="input-inner"
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 bg-[var(--color-neutral-white)]",
              isSmall ? "px-3 py-2" : "px-4 py-3",
              disabled && "bg-[var(--color-neutral-100)]"
            )}
          >
            {leftIcon && <span className={iconClass}>{leftIcon}</span>}
            {isTextarea ? (
              <textarea
                ref={ref as React.Ref<HTMLTextAreaElement>}
                id={inputId}
                data-slot="input-control"
                className={controlClass}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={onChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
                {...(rest as unknown as React.ComponentProps<"textarea">)}
              />
            ) : (
              <input
                ref={ref as React.Ref<HTMLInputElement>}
                id={inputId}
                data-slot="input-control"
                className={controlClass}
                type={resolvedHtmlType}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={onChange}
                {...rest}
              />
            )}
            {trailingText && (
              <span className="shrink-0 whitespace-nowrap text-[var(--color-neutral-700)] [font:var(--text-body-3)]">
                {trailingText}
              </span>
            )}
            {rightIcon && !isDropdown && <span className={iconClass}>{rightIcon}</span>}
            {cta && <div className="shrink-0">{cta}</div>}
            {isDropdown && (
              <span
                aria-hidden="true"
                className="inline-flex size-5 shrink-0 items-center text-[var(--color-neutral-500)]"
              >
                <ArrowDown2 size={20} variant="Linear" />
              </span>
            )}
          </div>
          {status !== "none" && (
            <span
              aria-hidden="true"
              className={cn(
                "mr-[var(--space-4)] inline-flex size-5 shrink-0 items-center self-center",
                STATUS_ICON_COLOR[status],
                status === "loading" && "[animation:spin_0.8s_linear_infinite]"
              )}
            >
              {status === "positive" && <TickCircle size={20} variant="Bold" color="currentColor" />}
              {status === "negative" && <CloseCircle size={20} variant="Bold" color="currentColor" />}
              {status === "warning" && <Warning2 size={20} variant="Bold" color="currentColor" />}
              {status === "loading" && <SpinnerIcon size={20} color="currentColor" />}
            </span>
          )}
        </div>
        {supportiveText && (
          <span
            data-slot="input-supportive"
            className={cn("[font:var(--text-body-4)]", SUPPORTIVE_COLOR[status])}
          >
            {supportiveText}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
