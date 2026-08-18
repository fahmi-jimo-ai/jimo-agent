import * as React from "react"

import { cn } from "@/lib/utils"
import { ToastContainer } from "@/components/ui/Toast/Toast"

// Moji Design System — Page (app layout template).
// Foundation: presentational .tsx + cn + data-slot (no cva). Composes the standard page shell:
// nav (left sidebar) + header + scrollable main + toast. Slot-based so each region is fully
// configurable; `Subpage` can reuse it by swapping the header/nav slot. Main sections are auto
// `shrink-0` so they never collapse/clip inside the scrollable column.

type PageProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Left sidebar — e.g. <PrimaryNavSidebar /> or <SecondaryNavSidebar />. */
  nav?: React.ReactNode
  /** Top header — <PageHeader type="main" | "sub" />. */
  header?: React.ReactNode
  /** Toast node(s); wrapped in <ToastContainer> automatically. Falsy → nothing renders. */
  toast?: React.ReactNode
  /** Override classes on the scrollable main wrapper. */
  mainClassName?: string
  /** Default page padding on the main wrapper. Set false for a flush/custom layout. */
  padded?: boolean
}

function Page({
  nav,
  header,
  toast,
  children,
  className,
  mainClassName,
  padded = true,
  ...props
}: PageProps) {
  return (
    <div
      data-slot="page"
      className={cn(
        "flex h-screen w-full overflow-hidden bg-[var(--color-bg-default)]",
        className
      )}
      {...props}
    >
      {nav}

      <div data-slot="page-column" className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {header}

        <main
          data-slot="page-main"
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-[var(--space-5)] overflow-y-auto [&>*]:shrink-0",
            padded && "px-[var(--space-8)] pt-[var(--space-6)] pb-[var(--space-8)]",
            mainClassName
          )}
        >
          {children}
        </main>
      </div>

      {toast && <ToastContainer>{toast}</ToastContainer>}
    </div>
  )
}

export { Page }
