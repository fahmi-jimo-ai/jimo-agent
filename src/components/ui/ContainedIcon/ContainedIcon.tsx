import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Moji Design System — ContainedIcon.
// Foundation: shadcn (cva + cn + data-slot); exports containedIconVariants.
// A small rounded, tinted square holding a glyph — the layer-tree / scope row
// icon. Every class here comes from a STATIC map (same pattern as MultipleTags —
// no dynamic Tailwind class names). When the owning row is selected it goes solid
// brand-blue, so the icon inverts to a translucent-white chip with a white glyph.
//
// Two glyph treatments, on the `glyph` axis:
//   - 'tint' (DEFAULT): the Moji `-100` bg + `-500` fg convention with a Bold
//     glyph — the scope chips in PropertySection's "For every ⬦ Suggestion item".
//   - 'ink': `-200` bg + a BLACK, OUTLINE (Linear) glyph — the Figma layer-tree
//     look, where the selection blue lives on the ROW, not on the icon.
//
// The ink treatment lands in `compoundVariants` (one per tint) rather than in a
// computed class string, so the emitted names stay statically greppable. That
// DOES put a second `bg-`/`text-` class in front of twMerge for ink — unlike the
// `selected` branch below, which avoids it by nulling `tint` out. It is safe and
// deliberate here: both pairs sit in twMerge's bg-color / text-color groups, so
// the later (ink) one wins deterministically rather than racing. Verified: given
// 'bg-[var(--color-blue-100)] text-[var(--color-blue-500)]' followed by
// 'bg-[var(--color-blue-200)] text-[var(--color-text-primary)]', twMerge returns
// only the second pair.
// With `glyph` unset no compound can match, so every pre-existing call site
// emits the exact class string it did before this axis existed.

/** Row icon component — fits both iconsax-react icons and the custom AgentIcon. */
type ElementIcon = React.ComponentType<{
  size?: number | string
  color?: string
  variant?: string
  className?: string
}>

/** The six Moji tints available for contained icons (bg `-100`, glyph `-500`). */
type IconTint = "blue" | "green" | "orange" | "purple" | "red" | "yellow"

const containedIconVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)]",
  {
    variants: {
      tint: {
        blue: "bg-[var(--color-blue-100)] text-[var(--color-blue-500)]",
        green: "bg-[var(--color-green-100)] text-[var(--color-green-500)]",
        orange: "bg-[var(--color-orange-100)] text-[var(--color-orange-500)]",
        purple: "bg-[var(--color-purple-100)] text-[var(--color-purple-500)]",
        red: "bg-[var(--color-red-100)] text-[var(--color-red-500)]",
        yellow: "bg-[var(--color-yellow-100)] text-[var(--color-yellow-500)]",
      },
      selected: {
        true: "bg-[color-mix(in_srgb,var(--color-neutral-white)_20%,transparent)] text-[var(--color-neutral-white)]",
        false: "",
      },
      // Carries no classes of its own — 'tint' is already the `tint` map above,
      // and 'ink' is delivered by the compoundVariants below so each pairing is
      // a literal, greppable class name.
      glyph: { tint: "", ink: "" },
    },
    compoundVariants: [
      // `glyph: 'ink'` — the layer-tree treatment: one step deeper on the tint,
      // black outline glyph. One entry per tint, never a computed class string.
      { tint: "blue", glyph: "ink", class: "bg-[var(--color-blue-200)] text-[var(--color-text-primary)]" },
      { tint: "green", glyph: "ink", class: "bg-[var(--color-green-200)] text-[var(--color-text-primary)]" },
      { tint: "orange", glyph: "ink", class: "bg-[var(--color-orange-200)] text-[var(--color-text-primary)]" },
      { tint: "purple", glyph: "ink", class: "bg-[var(--color-purple-200)] text-[var(--color-text-primary)]" },
      { tint: "red", glyph: "ink", class: "bg-[var(--color-red-200)] text-[var(--color-text-primary)]" },
      { tint: "yellow", glyph: "ink", class: "bg-[var(--color-yellow-200)] text-[var(--color-text-primary)]" },
    ],
    // No `tint` default here on purpose: the component nulls `tint` out when
    // `selected`, so exactly one background class is ever emitted (never two
    // that would race in twMerge). That null is also what makes `selected` beat
    // `ink` for free — an ink compound needs a non-null `tint` to match, so it
    // cannot fire on a selected row. Deliberate: `selected` + `ink` is not a
    // combination the layer tree produces, and inventing a third surface for it
    // would be a design decision nobody has made.
    defaultVariants: { selected: false, glyph: "tint" },
  },
)

type ContainedIconProps = Omit<React.ComponentProps<"span">, "color"> &
  Omit<VariantProps<typeof containedIconVariants>, "tint" | "glyph"> & {
    /** A COMPONENT type (e.g. `MagicStar`), not an element — it is rendered here
     *  with `color="currentColor"` so the tint class drives the glyph colour. */
    icon: ElementIcon
    tint?: IconTint
    /** Square edge length in px. */
    size?: number
    /** Glyph treatment: 'tint' = `-100` bg + `-500` Bold glyph (default);
     *  'ink' = `-200` bg + a black Linear glyph (the layer-tree look). */
    glyph?: "tint" | "ink"
  }

function ContainedIcon({
  icon: Glyph,
  tint = "blue",
  size = 18,
  selected = false,
  glyph = "tint",
  className,
  style,
  ...props
}: ContainedIconProps) {
  return (
    <span
      data-slot="contained-icon"
      data-tint={selected ? undefined : tint}
      data-selected={selected ? "true" : undefined}
      aria-hidden="true"
      className={cn(
        containedIconVariants({ tint: selected ? null : tint, selected, glyph }),
        className,
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <Glyph
        size={Math.round(size * 0.72)}
        color="currentColor"
        variant={glyph === "ink" ? "Linear" : "Bold"}
      />
    </span>
  )
}

export { ContainedIcon, containedIconVariants }
export type { ContainedIconProps, ElementIcon, IconTint }
