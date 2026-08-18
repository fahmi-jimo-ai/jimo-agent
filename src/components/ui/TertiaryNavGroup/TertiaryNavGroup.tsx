import * as React from "react"

import { cn } from "@/lib/utils"
import { TertiaryNavItem } from "@/components/ui/TertiaryNavItem/TertiaryNavItem"

// Moji Design System — TertiaryNavGroup.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of TertiaryNavGroup.css.
// A bottom utility row of equal-width TertiaryNavItems, with a build-version line below.

type TertiaryNavGroupItem = {
  icon?: React.ReactNode
  label?: React.ReactNode
  href?: string
  tooltipArrowPosition?: "bottom" | "bottom-left"
}

type TertiaryNavGroupProps = Omit<React.ComponentProps<"div">, "children"> & {
  items?: TertiaryNavGroupItem[]
  version?: React.ReactNode
}

function TertiaryNavGroup({ items = [], version = "Version 1.0.0", className, ...rest }: TertiaryNavGroupProps) {
  return (
    <div data-slot="tertiary-nav-group">
      <div
        className={cn(
          "box-border flex w-full shrink-0 items-center gap-[var(--space-2)] border-t border-[var(--color-border-default)] bg-[var(--color-bg-default)] px-[var(--space-3)] py-[var(--space-2)]",
          className
        )}
        {...rest}
      >
        {items.map((item, i) => (
          <TertiaryNavItem
            key={i}
            icon={item.icon}
            label={item.label}
            href={item.href}
            tooltipArrowPosition={item.tooltipArrowPosition}
            className="w-auto flex-1"
          />
        ))}
      </div>
      <div>
        <p className="flex w-full justify-center pb-[var(--space-2)] [font:var(--text-body-5)] text-[var(--color-neutral-500)]">
          {version}
        </p>
      </div>
    </div>
  )
}

export { TertiaryNavGroup }
