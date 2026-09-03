# Section

**Atomic level:** Organism — `Organisms/Section`
**Source:** `Section.tsx`

## What it does
A titled card container for a page section. It provides three optional, presence-based slots — a header
**title** + **description** on the left, a **controls** cluster on the right of the header (switch, button,
tabs, sort…), and a **body** (`children`) for arbitrary content (tables, form fields, text, code blocks,
progress bars…). It replaces the hand-rolled `<section>` + title/description/action markup that settings-style
pages would otherwise repeat.

## Placement rule
- **`shadow` (default)** → use **inside a `Subpage`**. The `Subpage` template already supplies the
  `--color-blue-50` body the soft ambient shadow needs, so consumers set no background themselves. Do
  **not** place it on a plain white main `Page` (the shadow won't read).
- **`bordered`** → general purpose. Subtle border + `--shadow-elevation-01`; lives anywhere on a white
  main `Page` or any white background.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `variant` | string | `'shadow'` \| `'bordered'` | `'shadow'` | `shadow` = ambient shadow on blue-50; `bordered` = border + elevation-01 on white |
| `title` | ReactNode | — | — | Header title. ReactNode, so a badge/link can be embedded. Header renders when set |
| `description` | ReactNode | — | — | Optional sub-line under the title |
| `controls` | ReactNode | — | — | Right side of the header row (switch / button / tabs / sort) |
| `flushBody` | boolean | — | `false` | Set when the body is a `Table` (or any element with its own 16px edge padding). Reduces the card's horizontal padding to 8px and insets the header 16px, so the title lines up with the table's first cell content — not the table's outer edge |
| `children` | ReactNode | — | — | Body content. Body renders only when present |
| `className` | string | — | — | Merged onto the root `<section>` via `cn()` |
| …rest | `React.ComponentProps<'section'>` | — | — | Spread onto the root |

Header renders when `title`, `description`, or `controls` is passed; body renders when `children` exist.
Both can be omitted independently (header-only setting row, or body-only bare-table card).

## States / Variants
- `variant="shadow"` — white card, `--shadow-elevation-05` (subtle ambient), no border.
- `variant="bordered"` — white card, `border-[var(--color-border-default)]` + `--shadow-elevation-01`.
- Composition states: full (header + controls + body) · header-only · controls-only header · body-only.

Full-width and content-driven — it fills its container (Subpage column / Page section) and its height
follows its content. Root has **no** `overflow-hidden`, so dropdowns/tooltips in the slots aren't clipped.

## Dependencies
None required. The slots are filled by the consumer with existing Moji atoms (`Button`, `Switch`, `Input`,
etc.) or arbitrary markup. Exports `{ Section, sectionVariants }`.

## Import
```jsx
import { Section } from '../../../src/components/ui/Section/Section';
```

## Quick example
```jsx
<Section
  title="Identity Verification"
  description="Verify reached users’ identities using cryptographic keys."
  controls={<Switch defaultChecked />}
/>

<Section variant="bordered" title="321 users in this segment" controls={<Button size="sm" variant="outline">Sort by</Button>}>
  <UsersTable />
</Section>
```

## Fork: `Omit<React.ComponentProps<"section">, "title">` (jimo-agent)

`title` was already declared `React.ReactNode`, with a comment saying why ("so a badge/link can be
embedded"). Without the `Omit` it intersected with the DOM `title` attribute — a `string` — so the
declared type collapsed to `string & ReactNode` and the stated intent was unreachable.

Added when `/settings` needed `Members 5`, where the count is a differently-styled span beside the
title, exactly the case the original comment anticipated.

Not a new capability and not a visual change: every existing call site passes a string, which still
satisfies the prop. It is the same `Omit` that `Page`, `Subpage` and `PageHeader` already carry for
this collision — Section simply missed it.
