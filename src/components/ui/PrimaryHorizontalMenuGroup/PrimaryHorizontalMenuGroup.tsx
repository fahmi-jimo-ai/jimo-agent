import * as React from "react"

import { cn } from "@/lib/utils"
import { PrimaryHorizontalMenuItem } from "@/components/ui/PrimaryHorizontalMenuItem/PrimaryHorizontalMenuItem"

// Moji Design System — PrimaryHorizontalMenuGroup (underline tab bar).
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of PrimaryHorizontalMenuGroup.css.
// Per-item underline is hidden inside the group; a single group-level indicator
// slides under the active tab (measured from the DOM, kept as inline style).

type PrimaryGroupTab = {
  id: string
  label?: React.ReactNode
  icon?: React.ReactNode
  showIcon?: boolean
  showCounter?: boolean
  counter?: React.ReactNode
  showChip?: boolean
  chipLabel?: React.ReactNode
}

type PrimaryHorizontalMenuGroupProps = Omit<React.ComponentProps<"div">, "onClick"> & {
  tabs: PrimaryGroupTab[]
  activeItem?: string
  onTabClick?: (id: string) => void
  size?: "regular" | "small"
  showIcon?: boolean
  showCounter?: boolean
  showChip?: boolean
  chipLabel?: React.ReactNode
}

function PrimaryHorizontalMenuGroup({
  tabs,
  activeItem,
  onTabClick,
  size = "regular",
  showIcon,
  showCounter,
  showChip,
  chipLabel,
  className,
  ...rest
}: PrimaryHorizontalMenuGroupProps) {
  const groupRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [indicator, setIndicator] = React.useState({ width: 0, translateX: 0, ready: false })

  React.useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeItem)
    if (activeIndex === -1 || !groupRef.current) return
    const itemEl = itemRefs.current[activeIndex]
    if (!itemEl) return

    const groupRect = groupRef.current.getBoundingClientRect()
    const itemRect = itemEl.getBoundingClientRect()

    setIndicator({
      width: itemRect.width,
      translateX: itemRect.left - groupRect.left,
      ready: true,
    })
  }, [activeItem, tabs])

  return (
    <div
      data-slot="primary-tab-group"
      role="tablist"
      ref={groupRef}
      className={cn(
        "relative flex items-start gap-[var(--space-4)] overflow-visible border-b border-[var(--color-neutral-200)]",
        // hide per-item underline — the group indicator takes over
        "[&_[data-slot=primary-tab-indicator]]:hidden",
        className
      )}
      {...rest}
    >
      {tabs.map((tab, index) => (
        <PrimaryHorizontalMenuItem
          key={tab.id}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          label={tab.label}
          state={activeItem === tab.id ? "active" : "default"}
          size={size}
          icon={tab.icon}
          showIcon={showIcon ?? (tab.showIcon ?? !!tab.icon)}
          showCounter={showCounter ?? tab.showCounter}
          counter={tab.counter}
          showChip={showChip ?? tab.showChip}
          chipLabel={chipLabel ?? tab.chipLabel}
          onClick={() => onTabClick?.(tab.id)}
        />
      ))}
      <div
        data-slot="primary-group-indicator"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-[2] h-0.5 rounded-t-[var(--radius-sm)] bg-[var(--color-blue-400)] [transition:transform_var(--transition-base),width_var(--transition-base),opacity_var(--transition-fast)]"
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.translateX}px)`,
          opacity: indicator.ready ? 1 : 0,
        }}
      />
    </div>
  )
}

export { PrimaryHorizontalMenuGroup }
