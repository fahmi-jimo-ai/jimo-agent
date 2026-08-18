import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Moji Design System — Toggle (Radix Switch).
// Foundation: shadcn. Visuals: verbatim port of Toggle.css.
function Switch({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  label?: React.ReactNode
}) {
  const generatedId = React.useId()
  const inputId = id ?? (label ? generatedId : undefined)

  const control = (
    <SwitchPrimitive.Root
      id={inputId}
      data-slot="switch"
      className={cn(
        // .toggle__track — 48×28
        "group inline-flex h-7 w-12 shrink-0 items-center justify-start rounded-[var(--radius-full)] p-0.5 outline-none",
        "bg-[var(--color-neutral-400)] [transition:background-color_0.25s_ease]",
        // hover unchecked (enabled)
        "enabled:data-[state=unchecked]:hover:bg-[var(--color-neutral-500)]",
        // checked
        "data-[state=checked]:bg-[var(--color-blue-400)]",
        // disabled unchecked
        "disabled:data-[state=unchecked]:bg-[var(--color-neutral-500)] disabled:data-[state=unchecked]:opacity-60",
        // disabled checked
        "disabled:data-[state=checked]:bg-[var(--color-blue-200)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // .toggle__thumb — 24×24, slides 20px
          "flex size-6 items-center justify-center overflow-hidden rounded-full bg-[var(--color-neutral-white)] text-transparent",
          // GPU-compositor layer so the slide stays smooth (no frame skips)
          "[will-change:translate]",
          // off direction — --transition-tooltip (200ms ease-out). NB: Tailwind v4's translate-x utility
          // animates the `translate` property (not `transform`), so the transition MUST target `translate`.
          "translate-x-0 [transition:translate_var(--transition-tooltip),background-color_var(--transition-fast),color_var(--transition-fast)]",
          // checked — slide + reveal checkmark; on direction uses --transition-slow (300ms ease)
          "data-[state=checked]:translate-x-5 data-[state=checked]:text-[var(--color-blue-400)]",
          "data-[state=checked]:[transition:translate_var(--transition-slow),background-color_var(--transition-fast),color_var(--transition-fast)]",
          // disabled checked thumb
          "group-disabled:data-[state=checked]:bg-[var(--color-blue-100)] group-disabled:data-[state=checked]:text-[var(--color-blue-300)]"
        )}
      >
        {/* .toggle__check — 16×16 */}
        <svg className="size-4 shrink-0" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 7.5L5.5 10L11 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )

  if (!label) return control

  return (
    <label
      data-slot="switch-wrapper"
      htmlFor={inputId}
      className={cn(
        // .toggle-wrapper
        "group/switch inline-flex cursor-pointer items-center gap-2 select-none",
        "has-[:disabled]:cursor-not-allowed"
      )}
    >
      {control}
      {/* .toggle__label */}
      <span className="[font:var(--text-body-3)] text-[var(--color-text-primary)] group-has-[:disabled]/switch:text-[var(--color-text-disabled)]">
        {label}
      </span>
    </label>
  )
}

export { Switch }
