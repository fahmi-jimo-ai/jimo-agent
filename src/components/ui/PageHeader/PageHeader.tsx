import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button/Button"
import { PrimaryHorizontalMenuGroup } from "@/components/ui/PrimaryHorizontalMenuGroup/PrimaryHorizontalMenuGroup"

// Moji Design System — PageHeader.
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of PageHeader.css.
// `type="main"` and `type="sub"` never render together — swapped conditionally.
//
// ADDITIVE FORK (see CLAUDE.md, same shape as SecondaryNavSidebar's `sections`
// and Table's `scroll`): the `meta` prop. Figma 934:27942 puts a passive
// "⟳ Updated Jan 20, 14:20PM" status line at the right end of the title row.
// `buttons[]` cannot carry it — every entry is rendered as a <Button>, so the
// line would become focusable and clickable — and `children` is never rendered,
// so there is no slot to reach. `meta` shares the title row's right cluster
// with the button group rather than replacing it. Default undefined, so every
// existing call site renders byte-identically.

// Adapt PageHeader's legacy button API → shadcn Button props.
const LEVEL_TO_VARIANT: Record<string, "default" | "outline" | "link"> = {
  primary: "default",
  secondary: "outline",
  tertiary: "link",
}
const SIZE_TO_SIZE: Record<string, "default" | "sm"> = { big: "default", small: "sm" }

type PageHeaderButton = {
  label?: React.ReactNode
  level?: string
  leftIcon?: React.ReactNode
  onClick?: () => void
}

type PageHeaderTab = { id: string; label?: React.ReactNode; icon?: React.ReactNode }

type PageHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
  type?: "main" | "sub"
  title?: React.ReactNode
  showButtonGroup?: boolean
  buttonSize?: "big" | "small"
  showTabs?: boolean
  /** ADDITIVE FORK — passive right-hand status line. See the header comment. */
  meta?: React.ReactNode
  buttons?: PageHeaderButton[]
  tabs?: PageHeaderTab[]
  activeTab?: string
  onTabClick?: (id: string) => void
  onBackClick?: () => void
  backIcon?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      type = "main",
      title = "Page Title",
      showButtonGroup = true,
      buttonSize = "big",
      showTabs = true,
      meta,
      buttons = [],
      tabs = [],
      activeTab,
      onTabClick,
      onBackClick,
      backIcon,
      className,
      ...rest
    },
    ref
  ) => {
    const buttonGroup = showButtonGroup && buttons.length > 0 && (
      <div className="flex items-center gap-[var(--space-4)]">
        {buttons.map((btn, i) => (
          <Button
            key={i}
            variant={LEVEL_TO_VARIANT[btn.level ?? ""] ?? "outline"}
            size={SIZE_TO_SIZE[buttonSize] ?? "default"}
            leftIcon={btn.leftIcon}
            onClick={btn.onClick}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    )

    return (
      <div
        ref={ref}
        data-slot="page-header"
        data-type={type}
        className={cn(
          "flex w-full flex-col items-stretch pt-[var(--space-6)]",
          type === "sub" && "pt-[var(--space-8)]",
          className
        )}
        {...rest}
      >
        {/* ── Title row ── */}
        <div className="flex items-center justify-between px-[var(--space-8)] pb-[var(--space-6)]">
          {type === "main" ? (
            <h1 className="m-0 [font:var(--text-heading-3)] [letter-spacing:var(--text-heading-tracking)] whitespace-nowrap text-[var(--color-text-primary)]">
              {title}
            </h1>
          ) : (
            <div className="flex items-center gap-[var(--space-4)]">
              <Button variant="outline" size="icon-sm" leftIcon={backIcon} onClick={onBackClick} aria-label="Go back" />
              <h2 className="m-0 [font:var(--text-subtitle-1)] [letter-spacing:0] whitespace-nowrap text-[var(--color-text-primary)]">
                {title}
              </h2>
            </div>
          )}
          {(meta != null || buttonGroup) && (
            <div className="flex shrink-0 items-center gap-[var(--space-5)]">
              {meta != null && (
                <div
                  data-slot="page-header-meta"
                  className="flex items-center gap-[var(--space-2)] [font:var(--text-body-4)] text-[var(--color-text-tertiary)]"
                >
                  {meta}
                </div>
              )}
              {buttonGroup}
            </div>
          )}
        </div>

        {/* ── Tab bar ── */}
        {showTabs && tabs.length > 0 && (
          <div>
            <div className="px-[var(--space-8)]">
              <PrimaryHorizontalMenuGroup tabs={tabs} activeItem={activeTab} onTabClick={onTabClick} />
            </div>
          </div>
        )}
      </div>
    )
  }
)

PageHeader.displayName = "PageHeader"

export { PageHeader }
