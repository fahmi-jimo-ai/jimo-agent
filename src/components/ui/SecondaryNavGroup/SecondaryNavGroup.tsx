import * as React from "react"

import { cn } from "@/lib/utils"

// Moji Design System — SecondaryNavGroup.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of SecondaryNavGroup.css.
// Optional title above a rounded, clipped column of SecondaryNavItems, spaced 2px apart
// (2px has no --space token — the ramp starts at 4px — so the literal stands).

type SecondaryNavGroupProps = React.ComponentProps<"div"> & {
  title?: React.ReactNode
}

function SecondaryNavGroup({ title, children, className, ...rest }: SecondaryNavGroupProps) {
  return (
    <div data-slot="secondary-nav-group" className={cn("flex w-full flex-col", className)} {...rest}>
      {title && (
        <span className="[font:var(--text-body-3)] pb-[var(--space-2)] pl-[var(--space-3)] whitespace-nowrap text-[var(--color-text-secondary)]">
          {title}
        </span>
      )}
      <div className="flex flex-col gap-[2px] overflow-hidden rounded-[var(--radius-xl)]">{children}</div>
    </div>
  )
}

export { SecondaryNavGroup }
