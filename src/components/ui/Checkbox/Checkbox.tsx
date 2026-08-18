import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Moji Design System — Checkbox.
// Foundation: shadcn (Radix Checkbox + data-slot). Visuals: verbatim port of
// Checkbox.css. Optional `label` reproduces the .checkbox-wrapper layout.
function Checkbox({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  label?: React.ReactNode
}) {
  const generatedId = React.useId()
  const inputId = id ?? (label ? generatedId : undefined)

  const box = (
    <span
      // .checkbox — 24×24 padded hit area
      className="relative inline-flex size-6 shrink-0 items-center justify-center p-1"
    >
      <CheckboxPrimitive.Root
        id={inputId}
        data-slot="checkbox"
        className={cn(
          // .checkbox__box — 16×16 visible box
          "flex size-4 items-center justify-center rounded-[var(--radius-sm)] border-[1.5px] bg-[var(--color-neutral-white)] text-transparent outline-none",
          "border-[var(--color-neutral-400)] [transition:border-color_var(--transition-fast),background-color_var(--transition-fast)]",
          // hover (enabled)
          "enabled:hover:border-[var(--color-blue-300)]",
          // checked / indeterminate
          "data-[state=checked]:border-[var(--color-blue-400)] data-[state=checked]:bg-[var(--color-blue-400)] data-[state=checked]:text-[var(--color-neutral-white)]",
          "data-[state=indeterminate]:border-[var(--color-blue-400)] data-[state=indeterminate]:bg-[var(--color-blue-400)] data-[state=indeterminate]:text-[var(--color-neutral-white)]",
          // disabled unchecked
          "disabled:border-[var(--color-neutral-200)] disabled:bg-[var(--color-neutral-50)]",
          // disabled checked / indeterminate
          "disabled:data-[state=checked]:border-[var(--color-neutral-400)] disabled:data-[state=checked]:bg-[var(--color-neutral-400)] disabled:data-[state=checked]:text-[var(--color-neutral-white)]",
          "disabled:data-[state=indeterminate]:border-[var(--color-neutral-400)] disabled:data-[state=indeterminate]:bg-[var(--color-neutral-400)] disabled:data-[state=indeterminate]:text-[var(--color-neutral-white)]",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          forceMount
          className="inline-flex"
        >
          {/* .checkbox__check — 12×12 */}
          <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5L6.5 11.5L12.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    </span>
  )

  if (!label) return box

  return (
    <label
      data-slot="checkbox-wrapper"
      htmlFor={inputId}
      className={cn(
        // .checkbox-wrapper
        "inline-flex cursor-pointer items-center gap-2 select-none",
        // disabled
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
      )}
    >
      {box}
      {/* .checkbox__label */}
      <span className="[font:var(--text-body-3)] text-[var(--color-text-primary)]">{label}</span>
    </label>
  )
}

export { Checkbox }
