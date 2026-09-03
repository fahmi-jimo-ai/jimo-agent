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

## Local forks — `meta` and `actions`

This copy has TWO additive forks on top of upstream Moji (same shape as
`SecondaryNavSidebar`'s `sections` and `Table`'s `scroll`):

| Prop | Type | Default | Notes |
|---|---|---|---|
| `meta` | `React.ReactNode` | — | Passive status line at the right end of the title row. |
| `actions` | `React.ReactNode` | — | Right-cluster slot for an action `buttons[]` cannot express. |

### `meta`

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

### `actions`

`buttons[]` renders every entry as a bare `<Button>`, which is the whole problem
when the action is not one. Knowledge's **Test Knowledge** button opens a two-row
menu, and `Menu` (`src/components/app/Menu.tsx`) has to wrap its own trigger so it
can measure the trigger's rect and position the portaled panel from it — so the
trigger cannot be handed over as a config object.

`actions` renders immediately after the button group inside the same right-hand
cluster, so a page can use both. Undefined by default; every pre-fork call site
renders byte-identically.

```jsx
<PageHeader
  title="Knowledge"
  showButtonGroup={false}
  actions={
    <Menu open={open} onClose={close} align="right" trigger={<Button …>Test Knowledge</Button>}>
      <MenuItem icon={<Play size={20} variant="Linear" />} label="Preview here" onClick={…} />
      <MenuItem icon={<Monitor size={20} variant="Linear" />} label="Preview in-app" onClick={…} />
    </Menu>
  }
/>
```

### `icon` and `subtitle` — `type="sub"` only

The Experiences detail artboard (Agent Designer Sandbox `10:2269`) draws its
header as **[back] [type glyph] [name over a muted subline]**, with the actions
in the usual right cluster:

```
‹  [▣]  Onboarding Checklist            ⏵ Play   ⚙ Settings   ✎ Edit   …
        Checklists • Edited 3 days ago
```

Neither node can ride `title`. `title` renders **inside** the `<h2>`, so an icon
put there would sit inside a heading element at the heading's type ramp, and a
subline put there would be caught by that `<h2>`'s `whitespace-nowrap`.

They landed together because they are one design change — unlike `meta` and
`actions`, which arrived for two unrelated reasons. The flex column is emitted
**only when `subtitle != null`**, so a caller that passes just `icon`, and every
call site from before the fork, renders byte-identically.

Nothing new was needed for the right cluster: `Play` / `Settings` / `Edit` are
three `buttons[]` entries at `level: "secondary"` with `buttonSize="small"`
(→ `variant="outline" size="sm"`), and the kebab goes through `actions`.

```jsx
<PageHeader
  type="sub"
  icon={<ContainedIcon icon={TaskSquare} tint="yellow" size={36} />}
  title="Onboarding Checklist"
  subtitle="Checklists • Edited 3 days ago"
  buttonSize="small"
  buttons={[{ label: 'Play', level: 'secondary', leftIcon: <PlayCircle … /> , onClick: … }]}
  actions={<Menu …>{/* the kebab */}</Menu>}
  showTabs={false}
  onBackClick={…}
/>
```
