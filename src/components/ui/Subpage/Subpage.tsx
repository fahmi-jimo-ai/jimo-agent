import * as React from "react"

import { cn } from "@/lib/utils"
import { Page } from "@/components/ui/Page/Page"

// Moji Design System — Subpage (detail / sub-section layout template).
// Foundation: presentational .tsx + cn + data-slot (no cva). Composes the `Page` shell and
// specializes it for sub-section pages: nav = collapsed PrimaryNavSidebar + SecondaryNavSidebar,
// a light-blue (`--color-blue-50`) scrollable body holding a centered content column capped at
// `maxWidth` (1000px). The PageHeader scrolls INSIDE that column (first child), unlike `Page` where
// the header is pinned full-width above the scroll area. Reuses Page's auto ToastContainer +
// `[&>*]:shrink-0` anti-collapse fix; `subpage-content` repeats it so sections never collapse/clip.
//
// FORKED (jimo-agent, additive): `maxWidth` also takes a CSS length string, so a page can opt out of
// the centred cap with `maxWidth="100%"`. Upstream types it `number` and stamps it straight into
// `style`, where React appends `px` to a bare number — a string passes through untouched, so the
// default and every numeric call site are unchanged. `/conversations` needs it: Figma 949:7347
// annotates the panel "This entire box will fill the viewport". See CONTEXT.md.

type SubpageProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Left rail — a collapsed <PrimaryNavSidebar collapsed … />. */
  primaryNav?: React.ReactNode
  /** Second rail — <SecondaryNavSidebar … />. */
  secondaryNav?: React.ReactNode
  /** <PageHeader …/> — rendered as the first item inside the centered column. */
  header?: React.ReactNode
  /** Toast node(s); passed through to Page (auto-wrapped in <ToastContainer>). */
  toast?: React.ReactNode
  /** Content-column max width — px number, or a CSS length (`"100%"`) to fill. Default 1000. */
  maxWidth?: number | string
  /** Override classes on the content area below the header. */
  contentClassName?: string
}

function Subpage({
  primaryNav,
  secondaryNav,
  header,
  toast,
  children,
  className,
  maxWidth = 1000,
  contentClassName,
  ...props
}: SubpageProps) {
  return (
    <Page
      nav={
        <>
          {primaryNav}
          {secondaryNav}
        </>
      }
      toast={toast}
      padded={false}
      mainClassName="bg-[var(--color-blue-50)]"
      className={className}
      {...props}
    >
      <div data-slot="subpage-column" className="mx-auto w-full" style={{ maxWidth }}>
        {header}

        <div
          data-slot="subpage-content"
          className={cn(
            "flex flex-col gap-[var(--space-5)] px-[var(--space-8)] pt-[var(--space-6)] pb-[var(--space-8)] [&>*]:shrink-0",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </Page>
  )
}

export { Subpage }
