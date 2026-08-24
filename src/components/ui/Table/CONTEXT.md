# Table

**Atomic level:** Organism — `Organisms/Table`
**Source:** `Table.tsx`

## What it does
An atomic data-table primitive set — the same shape as shadcn's `Table` family — so a table is
assembled from the fundamental cell up to the organism, not driven by one monolithic `data` prop.
`Table` wraps a real `<table>` in a both-axis scroll container (scrollbar hidden — scroll still
works); columns have a **180px minimum width** so they never collapse, and the table fits its content
(scrolls vertically/horizontally when the container is smaller). Cells carry a **16px** horizontal
inset. Cell *content* is composed from existing Moji atoms — only the avatar+title+subtitle pattern
gets a dedicated helper (`TableUserCell`).

When a `Table` is the body of a `Section`, set `Section`'s `flushBody` prop: it reduces the card's
horizontal padding to 8px and insets the header 16px so the title aligns with the table's first cell
content (8 + 16 = the normal 24px content line).

## Parts (all exported from `Table.tsx`)

| Export | Element | Role |
|--------|---------|------|
| `Table` | `<div><table>` | Root. Scroll wrapper + `border-collapse`, body-3 / primary text |
| `TableHeader` | `<thead>` | Header group (no separator rule — matches the design) |
| `TableBody` | `<tbody>` | Body group |
| `TableRow` | `<tr>` | A row; `interactive` adds rounded hover highlight + pointer |
| `TableHead` | `<th>` | Column label — tertiary grey, `min-w-[180px]`, left-aligned |
| `TableCell` | `<td>` | A cell — `min-w-[180px]`, vertically centered; `align` + `muted` |
| `TableUserCell` | `<td>` | Avatar + title + subtitle cell (the user column variant) |

Also exports `tableRowVariants`, `tableCellVariants`.

## Props

**`Table`** — `React.ComponentProps<'table'>` plus:
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `divider` | boolean | `false` | When true, every body `<tr>` gets a bottom border (Contents-table look). Off = no row borders (Users-table look) |

**`TableRow`** — `React.ComponentProps<'tr'>` plus:
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `interactive` | boolean | `false` | Rounded subtle-bg hover + `cursor-pointer`. Use for clickable rows |

**`TableCell`** — `React.ComponentProps<'td'>` plus:
| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `align` | string | `left` \| `center` \| `right` | `left` | Text alignment |
| `muted` | boolean | — | `false` | Tertiary grey text (e.g. "No email") |

**`TableUserCell`** — `TableCell` props plus:
| Prop | Type | Notes |
|------|------|-------|
| `avatar` | ReactNode | The avatar element — pass `<UserAvatar {...getAvatarProps(id)} size={40} />` |
| `title` | ReactNode | Subtitle-4 primary line |
| `subtitle` | ReactNode | Optional body-3 tertiary line |

## Column-variant recipes (Figma "Column Variant")
The cell content types reuse existing atoms — drop them inside a `<TableCell>`:

| Variant | How |
|---------|-----|
| User (avatar + title + subtitle) | `<TableUserCell avatar title subtitle />` |
| Text | `<TableCell>…</TableCell>` (muted via `muted`) |
| Link | `<TableCell><a className="text-[var(--color-brand-default)] underline">…</a></TableCell>` |
| Tags | `<TableCell><MultipleTags tags={…} /></TableCell>` |
| Type / Status | `<TableCell><Badge type="neutral\|positive\|brand\|negative" leftIcon={…}>…</Badge></TableCell>` |

## States / Variants
- Row: default · `interactive` (rounded hover highlight).
- Table: default (no row borders) · `divider` (bottom-bordered rows).
- Cell: default primary · `muted` tertiary; `align` left/center/right.

## Dependencies
None hard-required — the parts are pure HTML primitives. In real usage cell content composes
`UserAvatar` (+ `getAvatarProps`), `Badge` (Chip), `MultipleTags`, and `Button` (row actions).

## Import
```jsx
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableUserCell,
} from '../../../src/components/ui/Table/Table';
```

## Quick example
```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Users</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Tags</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow interactive>
      <TableUserCell
        avatar={<UserAvatar {...getAvatarProps('u-1')} size={40} />}
        title="Samantha"
        subtitle="#Jimer23123"
      />
      <TableCell>samwonders@mail.com</TableCell>
      <TableCell><MultipleTags tags={[{ label: 'Tag 1' }, { label: 'Tag 2' }]} /></TableCell>
    </TableRow>
  </TableBody>
</Table>

// Bordered rows (e.g. inside a Section)
<Table divider>…</Table>
```
