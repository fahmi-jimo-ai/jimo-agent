import * as React from "react"

import { cn } from "@/lib/utils"

// Moji Design System — DropdownMenuGroup (menu container card).
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of DropdownMenuGroup.css.
function DropdownMenuGroup({
  children,
  maxHeight,
  className,
  style,
  ...rest
}: React.ComponentProps<"div"> & { maxHeight?: number | string }) {
  return (
    <div
      data-slot="dropdown-menu-group"
      role="listbox"
      className={cn(
        // .menu-group
        "min-w-[225px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-white)] shadow-[0_5px_15px_rgba(0,0,0,0.07)]",
        // .menu-group--scrollable + custom scrollbar
        maxHeight &&
          "overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[9px] [&::-webkit-scrollbar-thumb]:bg-[var(--color-neutral-300)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--color-neutral-400)]",
        className
      )}
      style={{
        ...style,
        ...(maxHeight
          ? { maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }
          : {}),
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
DropdownMenuGroup.displayName = "DropdownMenuGroup"

export { DropdownMenuGroup }
