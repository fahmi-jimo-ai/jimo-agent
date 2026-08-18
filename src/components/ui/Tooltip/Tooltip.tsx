import * as React from "react"

import { cn } from "@/lib/utils"

// Moji Design System — Tooltip (presentational bubble).
// Moji-unique: not a Radix hover tooltip — consumers position it manually and
// toggle opacity/transform. Single line → navy pill (radius-full). When the text
// can't fit one line within --size-tooltip-max-width it wraps (at word boundaries,
// never mid-word) and the bubble becomes a rounded box (radius-xl, 8px padding).
function Tooltip({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  const ghostRef = React.useRef<HTMLSpanElement>(null)
  const bubbleRef = React.useRef<HTMLDivElement>(null)
  const [multiline, setMultiline] = React.useState(false)

  // The ghost measures the text on one line *with the single-line pill padding*.
  // If that would overflow the max width, the bubble wraps → switch to the box.
  // Measuring against the pill padding (not the box's) keeps the choice stable —
  // we never render a wrapped pill.
  React.useLayoutEffect(() => {
    if (!ghostRef.current || !bubbleRef.current) return
    const maxWidth = parseFloat(getComputedStyle(bubbleRef.current).maxWidth)
    setMultiline(ghostRef.current.scrollWidth > maxWidth)
  }, [children])

  return (
    <div data-slot="tooltip" className={cn("relative inline-block", className)}>
      {/* hidden single-line measurer — same font + single-line pill padding */}
      <span
        ref={ghostRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute whitespace-nowrap px-[var(--space-4)] py-[var(--space-2)] [font:var(--text-body-4)]"
      >
        {children}
      </span>
      {/* .tooltip__bubble */}
      <div
        ref={bubbleRef}
        data-slot="tooltip-bubble"
        data-multiline={multiline || undefined}
        className={cn(
          "relative z-[1] inline-block max-w-[var(--size-tooltip-max-width)] bg-[var(--color-neutral-800)] whitespace-normal break-words text-[var(--color-neutral-white)] [font:var(--text-body-4)]",
          multiline
            ? "rounded-[var(--radius-xl)] px-[var(--space-3)] py-[var(--space-2)]"
            : "rounded-[var(--radius-full)] px-[var(--space-4)] py-[var(--space-2)]"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { Tooltip }
