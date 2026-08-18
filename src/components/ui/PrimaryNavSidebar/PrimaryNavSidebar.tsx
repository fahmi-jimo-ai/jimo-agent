import * as React from "react"
import {
  Flag2,
  Routing2,
  Notepad2,
  Notification1,
  Notification,
  TaskSquare,
  DirectboxNotif,
  Element3,
  Chart2,
  Profile2User,
  Setting2,
  MessageQuestion,
  ArrowDown2,
  SliderVertical,
  Like1,
  Book,
  Flash,
} from "iconsax-react"

import { cn } from "@/lib/utils"
import { BannerIcon, AgentIcon } from "@/components/ui/Icon/Icon"
import { PrimaryNavItem } from "@/components/ui/PrimaryNavItem/PrimaryNavItem"
import { PrimaryNavGroup } from "@/components/ui/PrimaryNavGroup/PrimaryNavGroup"
import { TertiaryNavGroup } from "@/components/ui/TertiaryNavGroup/TertiaryNavGroup"

// Moji Design System — PrimaryNavSidebar.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of PrimaryNavSidebar.css.
// Composes the project selector, grouped PrimaryNavItems (brand icons, Linear idle /
// Bold active), full-width separators, and an expanded-only footer utility row.

const ICON_SIZE = 20

type NavEntry = {
  label: string
  icon: React.ReactNode
  iconActive: React.ReactNode
  chip?: React.ReactNode
}

const NAV_ITEMS_TOP: NavEntry[] = [
  {
    label: "Get Started",
    icon: <Flag2 size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <Flag2 size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
]

const NAV_ITEMS_ENGAGEMENT: NavEntry[] = [
  {
    label: "Tours",
    icon: <Routing2 size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <Routing2 size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
  {
    label: "Surveys",
    icon: <Notepad2 size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <Notepad2 size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
  {
    label: "Banners",
    icon: <BannerIcon size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <BannerIcon size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
  {
    label: "Hints",
    icon: <Notification1 size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <Notification1 size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
]

const NAV_ITEMS_CONTENT: NavEntry[] = [
  {
    label: "Checklists",
    icon: <TaskSquare size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <TaskSquare size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
  {
    label: "Agent",
    icon: <AgentIcon size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <AgentIcon size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
  {
    label: "Resource Center",
    icon: <DirectboxNotif size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <DirectboxNotif size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
  {
    label: "Changelog Posts",
    icon: <SliderVertical size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <SliderVertical size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
]

const NAV_ITEMS_SPACES: NavEntry[] = [
  {
    label: "Spaces",
    icon: <Element3 size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <Element3 size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
]

const NAV_ITEMS_ANALYTICS: NavEntry[] = [
  {
    label: "Success Trackers",
    icon: <Chart2 size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <Chart2 size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
  {
    label: "Actions",
    icon: <Flash size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <Flash size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
  {
    label: "Users & Segments",
    icon: <Profile2User size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <Profile2User size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
]

const NAV_ITEMS_SETTINGS: NavEntry[] = [
  {
    label: "Settings",
    icon: <Setting2 size={ICON_SIZE} variant="Linear" color="currentColor" />,
    iconActive: <Setting2 size={ICON_SIZE} variant="Bold" color="currentColor" />,
  },
]

const Separator = () => (
  <div className="h-px w-full shrink-0 bg-[var(--color-bg-emphasis)]" />
)

function NavSection({
  items,
  activeItem,
  collapsed,
  onItemClick,
}: {
  items: NavEntry[]
  activeItem?: string
  collapsed: boolean
  onItemClick?: (label: string) => void
}) {
  return (
    <PrimaryNavGroup type={collapsed ? "collapsed" : "expanded"}>
      {items.map((item) => (
        <PrimaryNavItem
          key={item.label}
          state={item.label === activeItem ? "active" : "idle"}
          type={collapsed ? "collapsed" : "default"}
          label={item.label}
          icon={item.icon}
          iconActive={item.iconActive}
          chip={item.chip}
          onClick={() => onItemClick?.(item.label)}
        />
      ))}
    </PrimaryNavGroup>
  )
}

type PrimaryNavSidebarProps = React.ComponentProps<"div"> & {
  collapsed?: boolean
  activeItem?: string
  onItemClick?: (label: string) => void
  projectName?: string
  projectImage?: string
}

function PrimaryNavSidebar({
  collapsed = false,
  activeItem,
  onItemClick,
  projectName = "Jimo",
  projectImage,
  className,
  ...rest
}: PrimaryNavSidebarProps) {
  const sectionProps = { activeItem, collapsed, onItemClick }

  return (
    <div
      data-slot="primary-nav-sidebar"
      data-collapsed={collapsed}
      className={cn(
        "box-border flex h-full flex-col justify-between overflow-visible border-r border-[var(--color-border-default)] bg-[var(--color-bg-default)]",
        collapsed ? "w-[48px]" : "w-[240px]",
        className
      )}
      {...rest}
    >
      {/* Scrollable body */}
      <div
        className={cn(
          "flex flex-1 flex-col gap-[var(--space-2)] overflow-visible py-[var(--space-2)]",
          !collapsed && "overflow-x-hidden overflow-y-auto"
        )}
      >
        {/* Project selector */}
        <div className="px-[var(--space-1)]">
          <div
            className={cn(
              "flex cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] p-[var(--space-2)] text-[var(--color-text-primary)] [transition:background-color_var(--transition-fast)] hover:bg-[var(--color-bg-muted)]",
              collapsed && "justify-center gap-0"
            )}
          >
            {projectImage ? (
              <img
                className="block h-[22px] w-[22px] shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-brand-subtle)] object-cover"
                src={projectImage}
                alt={projectName}
              />
            ) : (
              <div className="block h-[22px] w-[22px] shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-brand-subtle)]" />
            )}
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                  {projectName}
                </span>
                <ArrowDown2 size={16} variant="Linear" color="currentColor" />
              </>
            )}
          </div>
        </div>

        <Separator />

        <NavSection items={NAV_ITEMS_ENGAGEMENT} {...sectionProps} />
        <Separator />
        <NavSection items={NAV_ITEMS_CONTENT} {...sectionProps} />
        <Separator />
        <NavSection items={NAV_ITEMS_SPACES} {...sectionProps} />
        <Separator />
        <NavSection items={NAV_ITEMS_ANALYTICS} {...sectionProps} />
        <Separator />
        <NavSection items={NAV_ITEMS_SETTINGS} {...sectionProps} />
      </div>

      {/* Footer — only shown in expanded mode */}
      {!collapsed && (
        <TertiaryNavGroup
          items={[
            { icon: <Like1 size={16} variant="Linear" color="currentColor" />, label: "Give Feedback", tooltipArrowPosition: "bottom-left" },
            { icon: <Notification size={16} variant="Linear" color="currentColor" />, label: "What's new?" },
            { icon: <Book size={16} variant="Linear" color="currentColor" />, label: "Documentation" },
            { icon: <MessageQuestion size={16} variant="Linear" color="currentColor" />, label: "Get Started" },
          ]}
        />
      )}
    </div>
  )
}

export { PrimaryNavSidebar }
