import * as React from "react"
import { HambergerMenu } from "iconsax-react"

import { cn } from "@/lib/utils"

// Moji Design System — DropdownMenuList (menu row).
// Foundation: .tsx + cn + data-slot. Visuals: verbatim port of DropdownMenuList.css.
// Presentational: `state` forces a visual state for documentation; real :hover also applies.

function CheckboxUnchecked() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="3.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function CheckboxChecked() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect width="16" height="16" rx="4" fill="currentColor" />
      <path d="M3.5 8L6.5 11L12.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type MenuListState = "default" | "hover" | "selected" | "hover-selected" | "disabled" | "list-header"

type DropdownMenuListProps = {
  state?: MenuListState
  danger?: boolean
  multiSelect?: boolean
  showIcon?: boolean
  icon?: React.ReactNode
  showDescription?: boolean
  text?: React.ReactNode
  description?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
}

function DropdownMenuList({
  state = "default",
  danger = false,
  multiSelect = false,
  showIcon = true,
  icon,
  showDescription = false,
  text = "Text",
  description,
  onClick,
  className,
}: DropdownMenuListProps) {
  const isSelected = state === "selected" || state === "hover-selected"
  const isDisabled = state === "disabled"
  const isHeader = state === "list-header"
  const isHover = state === "hover" || state === "hover-selected"

  if (isHeader) {
    return (
      <div
        data-slot="dropdown-menu-list"
        role="presentation"
        className={cn(
          "flex w-full min-w-[225px] cursor-default items-center gap-2 bg-[var(--color-neutral-100)] px-3 py-2",
          className
        )}
      >
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap [font:var(--text-body-4)] text-[var(--color-neutral-700)]">
          {text}
        </span>
      </div>
    )
  }

  // Text + bg state classes (mirrors the .menu-list-item-* precedence in the CSS).
  const stateText = danger
    ? "text-[var(--color-red-400)]"
    : isSelected || isHover
      ? "text-[var(--color-blue-400)]"
      : "text-[var(--color-neutral-800)]"

  return (
    <button
      type="button"
      data-slot="dropdown-menu-list"
      disabled={isDisabled}
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      className={cn(
        "group/row flex w-full min-w-[225px] items-center gap-2 border-0 p-3 text-left [font:var(--text-body-3)] [transition:background-color_var(--transition-fast),color_var(--transition-fast)]",
        isDisabled
          ? "cursor-not-allowed bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]"
          : cn("cursor-pointer bg-[var(--color-neutral-white)]", stateText),
        // forced hover bg
        isHover && !isDisabled && (danger ? "bg-[var(--color-red-100)]" : "bg-[var(--color-blue-100)]"),
        // real :hover
        !isDisabled &&
          (danger
            ? "hover:bg-[var(--color-red-100)]"
            : "hover:bg-[var(--color-blue-100)] hover:text-[var(--color-blue-400)]"),
        className
      )}
    >
      {multiSelect && (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center p-1",
            isSelected ? "text-[var(--color-blue-400)]" : "text-[var(--color-neutral-400)]"
          )}
        >
          {isSelected ? <CheckboxChecked /> : <CheckboxUnchecked />}
        </span>
      )}
      {!multiSelect && showIcon && (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-5 shrink-0 items-center [transition:color_var(--transition-fast)]",
            danger
              ? "text-[var(--color-red-400)]"
              : isSelected || isHover
                ? "text-[var(--color-blue-400)]"
                : "text-[var(--color-neutral-700)]",
            !isDisabled && !danger && "group-hover/row:text-[var(--color-blue-400)]"
          )}
        >
          {icon ?? <HambergerMenu size={16} variant="Linear" />}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{text}</span>
        {showDescription && description && (
          <span
            className={cn(
              "block overflow-hidden text-ellipsis whitespace-nowrap [font:var(--text-body-4)]",
              isDisabled ? "text-[var(--color-neutral-500)]" : "text-[var(--color-neutral-700)]"
            )}
          >
            {description}
          </span>
        )}
      </span>
    </button>
  )
}
DropdownMenuList.displayName = "DropdownMenuList"

export { DropdownMenuList }
