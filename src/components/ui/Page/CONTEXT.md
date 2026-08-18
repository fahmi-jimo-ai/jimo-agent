# Page

**Atomic level:** Template (layout)
**Source:** `Page.tsx` (presentational + cn)

## What it does
The app-shell layout template every full page composes from: a left **nav**, a top **header**, a
scrollable **main** container (everything after the header), and a **toast** region. Slot-based — fill
each region and drop your page sections as children. Main sections are auto `shrink-0`, so they never
collapse or clip inside the scroll area. Use this for any new page; a `Subpage` variant can reuse it
by swapping the `header`/`nav` slot.

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `nav` | node | — | Left sidebar — `<PrimaryNavSidebar>` / `<SecondaryNavSidebar>` |
| `header` | node | — | Top header — `<PageHeader type="main" \| "sub">` |
| `toast` | node | — | Toast node(s); **auto-wrapped in `<ToastContainer>`**. Falsy → nothing renders |
| `children` | node | — | Main-container content. Each direct child is a section (auto `shrink-0`) |
| `padded` | boolean | `true` | Default page padding on main (`px space-8 / pt space-6 / pb space-8`). `false` for a flush/custom layout |
| `mainClassName` | string | — | Override classes on the scrollable main wrapper (e.g. change `gap`/padding) |

Also accepts native `<div>` props (`className` targets the root). Exported as `{ Page }`.

## Dependencies
- `ToastContainer` (from `Toast/Toast`) — wraps the `toast` slot.
- Consumer supplies the nav / header / toast / section components.

## Import
```jsx
import { Page } from '../../../src/components/ui/Page/Page';
```

## Quick example
```jsx
<Page
  nav={<PrimaryNavSidebar activeItem="Tours" projectName="Acme Inc." onItemClick={setNavItem} />}
  header={<PageHeader type="main" title="Engagement" showButtonGroup buttons={[...]} tabs={[...]} />}
  toast={toast && <Toast key={toast.id} type="positive" title="Saved" onDismiss={() => setToast(null)} />}
>
  <Alert type="brand" title="..." body="..." />   {/* each child = a main section, */}
  <ViewToolbar ... />                              {/* auto shrink-0 — no flexShrink needed */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
    {items.map((e) => <ExperienceCard key={e.id} layout="grid" {...e} />)}
  </div>
</Page>
```

`Templates/Page` is the empty starting point.
