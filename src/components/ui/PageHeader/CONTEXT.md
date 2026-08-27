# PageHeader

**Atomic level:** Organism
**Source:** `PageHeader.tsx` (Tailwind + cn)

## What it does
Top section of a page. Two layouts: `main` (list/index page) and `sub` (detail/sub-page). Main shows a title + optional button group + optional tab bar. Sub shows a back button + title + optional actions.

**Critical rule:** `main` and `sub` PageHeaders must NEVER be rendered simultaneously. The sub header must replace (not stack below) the main header when navigating to a detail page.

## Props

| Prop | Type | Options | Default | Notes |
|------|------|---------|---------|-------|
| `type` | string | `'main'` `'sub'` | `'main'` | Layout variant |
| `title` | node | — | `'Page Title'` | Page title |
| `showButtonGroup` | boolean | — | `true` | Show action buttons |
| `buttonSize` | string | `'big'` `'small'` | `'big'` | Maps to Button size `default`/`sm` |
| `buttons` | array | `[{label, level, leftIcon?, onClick}]` | `[]` | `level` is `'primary'`/`'secondary'`/`'tertiary'` |
| `showTabs` | boolean | — | `true` | Show horizontal tab bar |
| `tabs` | array | `[{id, label?, icon?}]` | `[]` | Tab configs |
| `activeTab` | string | — | — | Active tab `id` |
| `onTabClick` | function | — | — | `(id) => void` |
| `onBackClick` | function | — | — | Back button handler (sub only) |
| `backIcon` | node | — | — | Custom back icon (sub only) |

Also accepts native `div` props; `ref` forwarded to the root.

## Dependencies
- `Button` (action buttons)
- `PrimaryHorizontalMenuGroup` (tab bar)

## Import
```jsx
import { PageHeader } from '../../../src/components/ui/PageHeader/PageHeader';
```

## Quick example
```jsx
// Main page
<PageHeader
  type="main"
  title="Tours"
  buttons={[{ label: 'Create tour', level: 'primary', onClick: openModal }]}
  tabs={[{ id: 'all', label: 'All' }, { id: 'live', label: 'Live' }, { id: 'draft', label: 'Draft' }]}
  activeTab={activeTab}
  onTabClick={setActiveTab}
/>

// Sub-page (replaces main — conditional swap)
{selectedTour
  ? <PageHeader type="sub" title={selectedTour.name} onBackClick={() => setSelectedTour(null)} />
  : <PageHeader type="main" title="Tours" ... />
}
```

## Local fork — `meta`

This copy has ONE additive fork on top of upstream Moji (same shape as
`SecondaryNavSidebar`'s `sections` and `Table`'s `scroll`):

| Prop | Type | Default | Notes |
|---|---|---|---|
| `meta` | `React.ReactNode` | — | Passive status line at the right end of the title row. |

Figma `934:27942` puts a `⟳ Updated Jan 20, 14:20PM` line there. It could not be
expressed with the existing API: every `buttons[]` entry is rendered as a
`<Button>`, which would make a read-only status line focusable and clickable,
and `children` is never rendered so there is no slot to reach for.

`meta` shares the title row's right cluster with the button group rather than
replacing it, and defaults to `undefined` — every pre-fork call site renders
byte-identically.

```jsx
<PageHeader
  title="Statistics"
  showTabs={false}
  showButtonGroup={false}
  meta={<><Refresh2 size={16} variant="Linear" color="currentColor" /> Updated Jan 20, 14:20PM</>}
/>
```
