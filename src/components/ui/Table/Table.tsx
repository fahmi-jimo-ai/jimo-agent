import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Moji Design System — Table.
// Foundation: shadcn primitive set (table / header / body / row / head / cell) + a TableUserCell
// helper for the avatar+title+subtitle column variant. cva + cn + data-slot; exports *Variants.
// Visuals: every class maps to a Moji token; no .css. Columns are min 180px and the scroll wrapper
// scrolls in both axes, so the table fits its content and never collapses a column.

type TableProps = React.ComponentProps<"table"> & { divider?: boolean }

function Table({ className, divider, ...props }: TableProps) {
  return (
    <div
      data-slot="table-scroll"
      className="w-full overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <table
        data-slot="table"
        data-divider={divider ? "true" : undefined}
        className={cn(
          "w-full border-collapse [font:var(--text-body-3)] text-[var(--color-text-primary)]",
          divider &&
            "[&_tbody>tr]:border-b [&_tbody>tr]:border-[var(--color-border-default)]",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />
}

const tableRowVariants = cva(
  "[transition:background-color_var(--transition-fast)]",
  {
    variants: {
      interactive: {
        true:
          "cursor-pointer hover:bg-[var(--color-bg-subtle)] " +
          "[&>td:first-child]:rounded-l-[var(--radius-lg)] [&>td:last-child]:rounded-r-[var(--radius-lg)]",
        false: "",
      },
    },
    defaultVariants: { interactive: false },
  },
)

type TableRowProps = React.ComponentProps<"tr"> &
  VariantProps<typeof tableRowVariants>

function TableRow({ className, interactive, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(tableRowVariants({ interactive }), className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "min-w-[180px] px-[var(--space-4)] pb-[var(--space-2)] text-left font-medium " +
          "[font:var(--text-body-3)] text-[var(--color-text-tertiary)]",
        className,
      )}
      {...props}
    />
  )
}

const tableCellVariants = cva(
  "min-w-[180px] px-[var(--space-4)] py-[var(--space-4)] align-middle [font:var(--text-body-3)]",
  {
    variants: {
      align: { left: "text-left", center: "text-center", right: "text-right" },
      muted: {
        true: "text-[var(--color-text-tertiary)]",
        false: "text-[var(--color-text-primary)]",
      },
    },
    defaultVariants: { align: "left", muted: false },
  },
)

type TableCellProps = React.ComponentProps<"td"> &
  VariantProps<typeof tableCellVariants>

function TableCell({ className, align, muted, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants({ align, muted }), className)}
      {...props}
    />
  )
}

type TableUserCellProps = Omit<TableCellProps, "title"> & {
  avatar?: React.ReactNode
  title?: React.ReactNode
  subtitle?: React.ReactNode
}

// The "avatar + title + subtitle" column variant. The consumer supplies the avatar element
// (e.g. <UserAvatar {...getAvatarProps(id)} />) so it stays decoupled from the avatar's props.
function TableUserCell({
  className,
  avatar,
  title,
  subtitle,
  ...props
}: TableUserCellProps) {
  return (
    <TableCell data-slot="table-user-cell" className={className} {...props}>
      <div className="flex items-center gap-[var(--space-3)]">
        {avatar}
        <div className="flex min-w-0 flex-col">
          <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
            {title}
          </span>
          {subtitle != null && (
            <span className="[font:var(--text-body-3)] text-[var(--color-text-tertiary)]">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </TableCell>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableUserCell,
  tableRowVariants,
  tableCellVariants,
}
