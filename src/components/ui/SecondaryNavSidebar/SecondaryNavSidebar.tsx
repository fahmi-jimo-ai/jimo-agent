import * as React from "react"
import { Book, ShieldSecurity, MessageText, Flash, Setting2, MessageQuestion, Eye, Chart } from "iconsax-react"

import { cn } from "@/lib/utils"
import { SecondaryNavItem } from "@/components/ui/SecondaryNavItem/SecondaryNavItem"
import { SecondaryNavGroup } from "@/components/ui/SecondaryNavGroup/SecondaryNavGroup"

// Moji Design System — SecondaryNavSidebar.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of SecondaryNavSidebar.css.
// Titled sections of SecondaryNavItems separated by dividers; disabled sections
// append "(Coming Soon)" and render their items disabled.

const ICON_SIZE = 20

export type SidebarItem = {
  label: string
  icon: React.ReactNode
  iconActive: React.ReactNode
  disabled?: boolean
  /**
   * FORK vs Moji (jimo-agent): the three below forward capabilities
   * SecondaryNavItem ALREADY has, which upstream's SidebarItem simply never
   * exposed. Nothing new is drawn — see the item component:
   *   href      → it already renders an <a> when given one.
   *   trailing  → it already has a right-aligned `counter` slot that inherits
   *               the state colour. This is the ↗ on the settings Documentation row.
   *   className → it already runs class names through `cn` (tailwind-merge), so
   *               a caller's colour beats STATE_CLASS. This is the red Log out row.
   * Adding them here rather than forking SecondaryNavItem keeps the fork to one
   * type and zero visual code. See CONTEXT.md.
   */
  href?: string
  trailing?: React.ReactNode
  className?: string
}

export type SidebarSection = {
  title?: string
  disabled?: boolean
  items: SidebarItem[]
}

const SECTIONS: SidebarSection[] = [
  {
    title: "Train",
    items: [
      {
        label: "Knowledge",
        icon: <Book size={ICON_SIZE} variant="Linear" color="currentColor" />,
        iconActive: <Book size={ICON_SIZE} variant="Bold" color="currentColor" />,
      },
      {
        label: "Guardrails",
        icon: <ShieldSecurity size={ICON_SIZE} variant="Linear" color="currentColor" />,
        iconActive: <ShieldSecurity size={ICON_SIZE} variant="Bold" color="currentColor" />,
        disabled: true,
      },
    ],
  },
  {
    title: "Build",
    items: [
      {
        label: "Chat",
        icon: <MessageText size={ICON_SIZE} variant="Linear" color="currentColor" />,
        iconActive: <MessageText size={ICON_SIZE} variant="Bold" color="currentColor" />,
      },
      {
        label: "Triggers",
        icon: <Flash size={ICON_SIZE} variant="Linear" color="currentColor" />,
        iconActive: <Flash size={ICON_SIZE} variant="Bold" color="currentColor" />,
      },
      {
        label: "Actions",
        icon: <Setting2 size={ICON_SIZE} variant="Linear" color="currentColor" />,
        iconActive: <Setting2 size={ICON_SIZE} variant="Bold" color="currentColor" />,
      },
    ],
  },
  {
    title: "Evaluate",
    disabled: true,
    items: [
      {
        label: "Conversations",
        icon: <MessageQuestion size={ICON_SIZE} variant="Linear" color="currentColor" />,
        iconActive: <MessageQuestion size={ICON_SIZE} variant="Bold" color="currentColor" />,
        disabled: true,
      },
      {
        label: "Observe",
        icon: <Eye size={ICON_SIZE} variant="Linear" color="currentColor" />,
        iconActive: <Eye size={ICON_SIZE} variant="Bold" color="currentColor" />,
        disabled: true,
      },
      {
        label: "Analyze",
        icon: <Chart size={ICON_SIZE} variant="Linear" color="currentColor" />,
        iconActive: <Chart size={ICON_SIZE} variant="Bold" color="currentColor" />,
        disabled: true,
      },
    ],
  },
]

type SecondaryNavSidebarProps = React.ComponentProps<"div"> & {
  activeItem?: string
  onItemClick?: (label: string) => void
  /**
   * FORK vs Moji: upstream hardcodes SECTIONS and exposes no way to change them.
   * This build needs a different information architecture, so the list is a prop
   * that defaults to the upstream one — every existing usage is unaffected.
   */
  sections?: SidebarSection[]
}

function SecondaryNavSidebar({
  activeItem,
  onItemClick,
  sections = SECTIONS,
  className,
  ...rest
}: SecondaryNavSidebarProps) {
  return (
    <div
      data-slot="secondary-nav-sidebar"
      className={cn(
        "box-border flex h-full w-[280px] flex-col gap-[var(--space-3)] overflow-y-auto bg-[var(--color-bg-default)] px-[var(--space-3)] py-[var(--space-6)]",
        className
      )}
      {...rest}
    >
      {sections.map((section, idx) => (
        <React.Fragment key={section.title ?? idx}>
          {/*
            FORK vs Moji: the divider is the Copilot-Widget `Item/Navigation/TabLine`
            (42KccejbNYeHc3EP5P8vHd, 892:12023) — 12px of horizontal padding either
            side, and a 1px Neutral/300 rule at 50% opacity. `--color-border-default`
            already resolves to Neutral/300 (#e5e5e5); the inset and the opacity are
            what the node adds.
          */}
          {idx > 0 && (
            <div className="shrink-0 px-[var(--space-3)] py-[var(--space-2)]">
              <div className="h-px w-full bg-[var(--color-border-default)] opacity-50" />
            </div>
          )}
          <SecondaryNavGroup
            title={section.disabled && section.title ? `${section.title} (Coming Soon)` : section.title}
          >
            {section.items.map((item) => {
              const state = item.disabled ? "disabled" : item.label === activeItem ? "active" : "idle"
              return (
                <SecondaryNavItem
                  key={item.label}
                  state={state}
                  label={item.label}
                  icon={item.icon}
                  iconActive={item.iconActive}
                  href={item.href}
                  counter={item.trailing}
                  className={item.className}
                  onClick={state !== "disabled" ? () => onItemClick?.(item.label) : undefined}
                />
              )
            })}
          </SecondaryNavGroup>
        </React.Fragment>
      ))}
    </div>
  )
}

export { SecondaryNavSidebar }
