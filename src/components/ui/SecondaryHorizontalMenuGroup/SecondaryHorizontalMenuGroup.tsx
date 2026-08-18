import * as React from "react"

import { cn } from "@/lib/utils"
import { SecondaryHorizontalMenuItem } from "@/components/ui/SecondaryHorizontalMenuItem/SecondaryHorizontalMenuItem"

// Moji Design System — SecondaryHorizontalMenuGroup (segmented pill bar).
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of SecondaryHorizontalMenuGroup.css.
// A single sliding pill provides the active background (measured from the DOM, kept
// as inline style); the active item's own background is suppressed inside the group.

type SecondaryGroupTab = {
  id: string
  tabName?: React.ReactNode
  icon?: React.ReactNode
}

type SecondaryHorizontalMenuGroupProps = Omit<React.ComponentProps<"div">, "onClick"> & {
  tabs: SecondaryGroupTab[]
  activeItem?: string
  onTabClick?: (id: string) => void
  size?: "small" | "big"
  withText?: boolean
}

function SecondaryHorizontalMenuGroup({
  tabs,
  activeItem,
  onTabClick,
  size = "small",
  withText = true,
  className,
  ...rest
}: SecondaryHorizontalMenuGroupProps) {
  const groupRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [pill, setPill] = React.useState({ width: 0, translateX: 0, ready: false })

  React.useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeItem)
    if (activeIndex === -1 || !groupRef.current) return
    const itemEl = itemRefs.current[activeIndex]
    if (!itemEl) return

    const groupRect = groupRef.current.getBoundingClientRect()
    const itemRect = itemEl.getBoundingClientRect()

    setPill({
      width: itemRect.width,
      translateX: itemRect.left - groupRect.left,
      ready: true,
    })
  }, [activeItem, tabs])

  return (
    <div
      data-slot="secondary-tab-group"
      role="tablist"
      ref={groupRef}
      className={cn(
        "relative flex items-center gap-[var(--space-1)] rounded-[var(--radius-md)] bg-[var(--color-bg-muted)] p-[var(--space-1)]",
        // pill provides the active background — suppress the item's own
        "[&_[data-slot=secondary-tab][aria-selected=true]]:!bg-transparent [&_[data-slot=secondary-tab][aria-selected=true]]:!shadow-none",
        className
      )}
      {...rest}
    >
      <div
        data-slot="secondary-group-pill"
        aria-hidden="true"
        className="pointer-events-none absolute top-[var(--space-1)] bottom-[var(--space-1)] left-0 z-0 rounded-[var(--radius-md)] bg-[var(--color-bg-default)] shadow-[var(--shadow-elevation-02)] [transition:transform_var(--transition-base),width_var(--transition-base),opacity_var(--transition-fast)]"
        style={{
          width: pill.width,
          transform: `translateX(${pill.translateX}px)`,
          opacity: pill.ready ? 1 : 0,
        }}
      />
      {tabs.map((tab, index) => (
        <SecondaryHorizontalMenuItem
          key={tab.id}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          tabName={tab.tabName}
          state={activeItem === tab.id ? "active" : "inactive"}
          size={size}
          icon={tab.icon}
          withText={withText}
          onClick={() => onTabClick?.(tab.id)}
          className="relative z-[1] min-w-0 flex-1"
        />
      ))}
    </div>
  )
}

export { SecondaryHorizontalMenuGroup }
