import * as React from "react"

import { cn } from "@/lib/utils"

// Moji Design System — PrimaryNavGroup.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of PrimaryNavGroup.css.
// A vertical stack of PrimaryNavItems; width follows expanded/collapsed.

type PrimaryNavGroupProps = React.ComponentProps<"div"> & {
  type?: "expanded" | "collapsed"
}

function PrimaryNavGroup({ type = "expanded", children, className, ...rest }: PrimaryNavGroupProps) {
  return (
    <div
      data-slot="primary-nav-group"
      data-type={type}
      className={cn(
        "box-border flex flex-col gap-[var(--space-1)] px-[var(--space-1)]",
        type === "expanded" ? "w-[240px]" : "w-[48px] items-center",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export { PrimaryNavGroup }
