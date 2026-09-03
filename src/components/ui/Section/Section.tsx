import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Moji Design System — Section.
// Foundation: shadcn (cva + cn + data-slot); exports sectionVariants.
// Visuals: white card, radius-xl; `shadow` vs `bordered` variant; every class maps to a Moji token.
const sectionVariants = cva(
  "flex w-full flex-col gap-[var(--space-6)] rounded-[var(--radius-xl)] bg-[var(--color-bg-default)] px-[var(--space-6)] py-[var(--space-6)]",
  {
    variants: {
      variant: {
        // `shadow` — soft ambient shadow, no border. Designed for the Subpage body (--color-blue-50).
        shadow: "[box-shadow:var(--shadow-elevation-05)]",
        // `bordered` — subtle border + elevation-01. General purpose; lives on any white/main-page surface.
        bordered:
          "border border-[var(--color-border-default)] [box-shadow:var(--shadow-elevation-01)]",
      },
    },
    defaultVariants: { variant: "shadow" },
  },
)

/*
 * FORK vs Moji (jimo-agent): `Omit<..., "title">`.
 *
 * `title` below already DECLARES ReactNode and its comment already says why —
 * "so a badge/link can be embedded" — but without the Omit it intersects with
 * the DOM `title` attribute (string), collapsing to `string & ReactNode`, and
 * the declared intent could never actually be used. This restores it.
 *
 * Not a new capability and not a visual change: every existing call site passes
 * a string, which still satisfies it. It is the same Omit `Page`, `Subpage` and
 * `PageHeader` already carry for exactly this collision.
 */
type SectionProps = Omit<React.ComponentProps<"section">, "title"> &
  VariantProps<typeof sectionVariants> & {
    title?: React.ReactNode // header title (ReactNode so a badge/link can be embedded)
    description?: React.ReactNode // optional sub-line under the title
    controls?: React.ReactNode // right side of the header row (switch, button, tabs, sort…)
    // Set when the body is a Table (or any element with its own 16px edge padding).
    // Pulls the card's horizontal padding in to 8px and insets the header 16px, so the title
    // lines up with the table's first cell content instead of the table's outer edge.
    flushBody?: boolean
  }

function Section({
  className,
  variant,
  title,
  description,
  controls,
  flushBody,
  children,
  ...props
}: SectionProps) {
  const hasHeading = title != null || description != null
  const hasHeader = hasHeading || controls != null

  return (
    <section
      data-slot="section"
      data-variant={variant ?? "shadow"}
      data-flush-body={flushBody ? "true" : undefined}
      className={cn(
        sectionVariants({ variant }),
        flushBody && "px-[var(--space-2)]",
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <div
          data-slot="section-header"
          className={cn(
            "flex w-full items-center justify-between gap-[var(--space-4)]",
            flushBody && "px-[var(--space-4)]",
          )}
        >
          {hasHeading && (
            <div
              data-slot="section-heading"
              className="flex min-w-0 flex-col gap-[var(--space-1)]"
            >
              {title != null && (
                <div
                  data-slot="section-title"
                  className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]"
                >
                  {title}
                </div>
              )}
              {description != null && (
                <div
                  data-slot="section-description"
                  className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]"
                >
                  {description}
                </div>
              )}
            </div>
          )}
          {controls != null && (
            <div
              data-slot="section-controls"
              className="flex shrink-0 items-center gap-[var(--space-3)]"
            >
              {controls}
            </div>
          )}
        </div>
      )}
      {children != null && (
        <div data-slot="section-content" className="w-full">
          {children}
        </div>
      )}
    </section>
  )
}

export { Section, sectionVariants }
