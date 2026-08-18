# Subpage

**Atomic level:** Template (layout)
**Source:** `Subpage.tsx` (presentational + cn; composes `Page`)

## What it does
The layout shell for **detail / sub-section pages**. Specializes `Page`: the nav is a **collapsed**
`PrimaryNavSidebar` (48px) sitting next to a `SecondaryNavSidebar` (280px), and the main body is a
light-blue (`--color-blue-50`) scrollable area holding a **centered content column capped at 1000px**.
The `PageHeader` is the first child of that column (it scrolls *inside* the column), then your page
content follows. Slot-based — fill each region and drop your sections as children (auto `shrink-0`).

**Subpage vs Page:** `Page` = full-width primary nav + a header pinned full-width above the scroll
area, white body. `Subpage` = collapsed primary + secondary nav, a centered 1000px column on a blue
body, header scrolling inside the column.

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `primaryNav` | node | — | Left rail — pass `<PrimaryNavSidebar collapsed … />` |
| `secondaryNav` | node | — | Second rail — `<SecondaryNavSidebar … />` |
| `header` | node | — | `<PageHeader …/>` — rendered as the first item inside the centered column |
| `toast` | node | — | Toast node(s); passed to `Page`, **auto-wrapped in `<ToastContainer>`**. Falsy → nothing renders |
| `children` | node | — | Content below the header (inside the 1000px column). Each direct child is a section (auto `shrink-0`) |
| `maxWidth` | number | `1000` | Content-column max width in px |
| `contentClassName` | string | — | Override classes on the content area below the header (e.g. change `gap`/padding) |

Also accepts native `<div>` props (`className` targets the `Page` root). Exported as `{ Subpage }`.

## Dependencies
- `Page` (from `Page/Page`) — supplies the root shell, scroll, toast wrapping, anti-collapse fix.
- Consumer supplies the `primaryNav` (collapsed) / `secondaryNav` / `header` / `toast` / section components.

## Import
```jsx
import { Subpage } from '../../../src/components/ui/Subpage/Subpage';
```

## Quick example
```jsx
<Subpage
  primaryNav={<PrimaryNavSidebar collapsed activeItem="Agent" projectName="Acme Inc." onItemClick={setNav} />}
  secondaryNav={<SecondaryNavSidebar activeItem="Knowledge" onItemClick={setSub} />}
  header={<PageHeader type="main" title="Knowledge base" showTabs tabs={[...]} activeTab={tab} onTabClick={setTab}
                      showButtonGroup buttons={[{ label: 'New', level: 'primary', leftIcon: <Add/>, onClick: save }]} />}
  toast={toast && <Toast key={toast.id} type="positive" title="Saved" onDismiss={() => setToast(null)} />}
>
  <Alert type="brand" title="..." body="..." />   {/* each child = a section in the centered column, */}
  <div>...</div>                                   {/* auto shrink-0 — no flexShrink needed */}
</Subpage>
```

`Templates/Subpage` is the empty starting point. For top-level (full-width) pages use `Page`
(`Templates/Page`).
