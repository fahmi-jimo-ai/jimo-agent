# jimo-agent — Claude Code reference

The Jimo Agent console, built 1:1 from Figma, plus a widget simulator. Five agent pages:
**Escalation** (`/escalation`), **Knowledge** (`/knowledge`), **Skills** (`/skills`),
**Statistics** (`/statistics`) and **Conversations** (`/conversations`); `/` redirects to
Escalation. The sidebar lists two more — Chat and Launcher — which are deliberately inert,
because nothing is designed behind them.

Plus **`/settings/*`**, which is a SECOND PRODUCT inside the same shell: the Jimo platform's
settings, not the agent's. It has its own source of truth and its own rules — see *Settings is a
second product* below.
Read `README.md` first for what the app is; this file is the working rules.

## Run

```sh
./run.sh              # dashboard  -> :5174   (widget at /widget.html)
./run.sh storybook    # storybook  -> :6007
```

## Source precedence — the tiebreaker for every ambiguity

> **Figma** (`5LL3WooWBeEfjNpUls93Zg`, section `43:6997`) **>** `~/Downloads/jimo-escalation-v2_2.html`
> **>** `~/Downloads/support-handoff.md`

The HTML prototype is an older, superseded design. Take tokens and interaction idioms from it;
never take page structure. The PRD supplies enum names and rationale, never UI.

**`/settings/*` has a different chain**, because it comes from a different file and a different
authority:

> **Jimo Help Center** (`help.usejimo.com/docs/settings/*`) **>** Figma
> `z7EQ0w6HgJkQ80VDck0JaG` section `13:27205` **>** the agent console's own conventions.

Those artboards are dated December 2023 and describe a product that has since moved. They stay the
authority on **layout, spacing, component choice and interaction shape**; the docs are the authority
on **names, enums, limits, field sets and behaviour**. Where the docs contradict each other, the page
that documents the screen wins. The differences this already resolved are tabulated in
`src/data/settings.ts` and at each site.

## The ONE rule — tokens only

Inherited from Moji. Never hardcode a hex, px or rgba that has a token; bind to
`var(--token)` via a Tailwind arbitrary value:

```jsx
className="bg-[var(--color-blue-400)] px-[var(--space-3)] rounded-[var(--radius-lg)]"  // ✅
className="bg-[#1260eb] px-[12px]"                                                     // ❌
```

Inline `style` is for genuinely dynamic values only, and React treats bare numbers as px — pass
token strings (`style={{ gap: 'var(--space-3)' }}`).

## Stack

Vite 6 · React 18.3.1 (**not** 19) · TS non-strict · Tailwind v4 (CSS-first, no config file) ·
Storybook 10 + `@storybook/react-vite` · `radix-ui` **1.6 unified package** (not `@radix-ui/react-*`) ·
`iconsax-react@0.0.8` · `react-router-dom` · cva + clsx + tailwind-merge. Node 22, npm.

The dashboard is a **single SPA** (`index.html` → `BrowserRouter`) with one route per page; the
widget is still a **second Vite entry** (`widget.html`) and is deliberately outside the router,
because it is opened in its own tab. `vercel.json` carries the SPA rewrite, and its negative
lookahead is what keeps `/widget.html` and `/assets/*` serving as themselves — do not simplify it
to a blanket `/(.*) -> /index.html`.

## Vendored Moji — use it 1:1, never re-draw it

If Moji ships a component for the job, **import it and pass props**. Do not hand-roll a
`<button>`/`<div>` that approximates its look, and do not restyle it into a different shape with
`className` overrides. A near-copy always drifts: it silently loses the hover / open / active /
disabled states, the icon sizing, the chevron rotation and the type ramp, and none of that shows
up in typecheck or tests.

```jsx
<DropdownSelector size="big" text={label} isOpen={open} withIcon icon={<Calendar size={20} />} />  // ✅
<button className="… rounded-[var(--radius-full)] [font:var(--text-subtitle-4)] …">{label}</button> // ❌
```

Before writing any trigger, pill, row, field or panel: grep `src/components/ui/` for it, and read
the `.tsx` (not `{Name}.docs.js`). If the component is genuinely missing a capability, the fix is a
**local wrapper around** the Moji component, or an additive fork — never a parallel implementation.
Say so in a comment when you do.

Two conversions already made this way, use them as the reference: `HandoffsChart` (date range) and
`ConfigureModal` (support tool) both render `DropdownSelector` inside the local `Menu` floating
layer. `Menu` + `MenuItem` are the one sanctioned local pieces here — upstream `DropdownFilter` was
never vendored and `DropdownMenuList` has no trailing-check row.

Known upstream bug, do not "fix" it locally: `DropdownSelector`'s chevron declares
`[transition:transform_…]` but `rotate-180` compiles to the standalone `rotate:` property, so the
flip snaps. That is what Storybook does too, so it stays — matching Moji beats a local improvement.

## Floating layers are portaled — never clip a menu

Every dropdown, popover and menu goes through `src/components/app/Menu.tsx`, which portals its
panel to `document.body` and positions it from the trigger's rect. An absolutely-positioned panel
is clipped by any ancestor `overflow`, and captured by any ancestor that ends on a `transform` —
`Table`'s scroll wrapper and `ModalOverlay`'s content animation are both already in that category,
and neither is near the menu in the source.

Do not fix a clipped menu by adding `overflow-visible` to whatever ancestor clipped it this time.
The full rule, the four requirements for any new floating layer, and how to assert it, live in
Storybook: **Foundations/Floating Layers** (`stories/0-foundations/FloatingLayers.mdx`).

Two consequences that bite: a body-level panel is a *sibling* of `ModalOverlay`, so it needs
`z-[calc(var(--z-modal)+1)]`, not `--z-dropdown`; and outside-click detection must test the panel
as well as the trigger. Also — never put a value in a positioning layout effect's dep array that is
a fresh object each render (`children` is), or the effect re-measures, re-renders and loops.

## A flow is one dialog with steps — never a dialog on a dialog

`ModalCard` takes a `step` string. Changing it cross-slides the card's whole interior and eases the
height between the two layouts; `direction: 'back'` slides the return leg the other way. Every
multi-beat flow uses it — Configuration -> Connect Crisp -> back, the re-auth redirect, and the
disable confirmation are all steps of the ONE card the Configure button opened.

Rendering a second `ModalCard` over the first is the bug: two backdrops darken the page twice,
Escape gets two targets, and the card underneath stays visible at the wrong size behind the new one.

`ModalCard` draws two shapes, chosen with `variant`. `card` is the form dialog (`43:6997` family:
header bar, close button, `--space-6` gutters, right-aligned footer, 560 wide). `confirm` is
`112:4938`: the one-question shape — headerless, no close button, title and body centred, two equal
buttons filling the row, 440 wide. A step may change the variant, and the card eases its width as
well as its height, so a flow can stop and ask something mid-way without a second dialog appearing.

That makes `confirm` a variant where `PickerDialog` is a sibling, and the distinction is the rule:
the picker is opened on its own and never shares a flow with `ModalCard`, so it owns its overlay;
the confirm is only ever reached from inside a `ModalCard` flow, so it must not own one. Its shell
radius is `--radius-xxl` (20px) — the artboard says 24 and the ramp ends at 20, and staying on the
token beat forking `tokens.css` for one dialog. The artboard's navy primary is the default; a
destructive confirm opts into `Button`'s `danger`.

Two things that follow from the height ease:
- The card is unconditionally `overflow-hidden`, so `allowOverflow` is gone. That is only safe
  because `Menu` portals its panel to `<body>` — an in-tree floating panel WOULD be clipped.
- `AutoHeight` holds a pixel height only for the 200ms of one ease, then drops back to `auto`. It
  does the measuring in a plain layout effect with no dep array, NOT a ResizeObserver: RO callbacks
  are driven by the rendering lifecycle, so in a tab that is not painting they never fire and the
  card sticks at whatever height it last saw. Layout effects run on commit regardless.

## Sources is a table over a store, and training is faked

`/knowledge` opens on **Sources** (Figma section `932:27941`). Its tab bar — Interface ·
Sources · Custom Answers — is that section's, and it replaced the older bar that named User
Context. `UserContextSection` is unchanged and still storied under `Organisms/`; the design
dropped the tab, not the work.

**Interface is designed now** (`12987:12415`) and the tab bar therefore switches: `PageHeader`
gets a real `onTabClick`, and `activeTab` is component state. Which tab you are on is NOT
persisted — that is where a reader is inside a page, not configuration, the same line
`ThinkingTrace` draws for its open state.

Unlike `userProperties`, a knowledge source is created by the user and exists nowhere else, so
the whole record is persisted (`sources` in `KnowledgeState`) rather than an id into a fixture.
The store key did not change: `parseKnowledge` merges over `INITIAL_KNOWLEDGE`, so a payload
written before `sources` existed reads forward with the defaults.

Training is simulated and quarantined in `src/state/trainingTimers.ts`. The pairing that
matters: `training` **is** persisted — a row that says Training… should still say so after a
reload rather than claim it finished while the tab was closed — but a timer id means nothing
across a reload, so `SourcesTab` calls `resumeTraining()` on mount. Drop either half and a
spinner strands forever.

Where the artboards contradict each other or themselves, the resolution is in the component's
header comment, never silent: the Added column (`SourceTable`), the token quota
(`TokenUsageCard`), Cancel-not-Back and the undesigned file dropzone (`AddSourceModal`), the
two different card orders (`SourcesEmptyState`), and Video, which has a dialog in the file but
no way into it from the newer frames.

**Test Knowledge is a menu now, and the label did not change.** The artboard's 36px secondary
button with its play glyph is untouched; what changed is that it opens **Preview here** (the
simulator, `openWidget()`) and **Preview in-app** (a `ModalCard` that asks for the app's URL).
It goes through `PageHeader`'s `actions` fork rather than `buttons[]`, because `Menu` wraps its own
trigger in order to measure it. `normalisePreviewUrl` is tested rather than inlined: the value
reaches `window.open`, and `new URL()` accepts `javascript:` and `mailto:you@acme.com` just as
happily as `https:`.

**`?source=<id>` opens the Content Detail drawer.** A citation in a conversation's reasoning trace
links here by source id. `KnowledgePage` reads the param ONCE into `SourcesTab`'s `initialDetailId`
and then strips it, so the drawer is a destination rather than a mode — reading it on every render
would fight the close button, and leaving the param would reopen the drawer on reload.

## Skills is the picker plus a form, and the widget builder is not here

`/skills` is Figma section `12987:11525`. Five artboards, all built: the list
(`12987:11526`), the page picker (`12987:11947`), and the drawer's three views — Description
(`12987:14597`), Usage (`12987:15826`) and a conversation opened *inside* it (`12987:16446`).

**The flow stops at the form on purpose.** `12544:22994` and `12197:27548` carry it on inside the
WIDGET: recommended flows, `Record Steps`, a live recorded-step list, lettered A/B clarifying
questions, an element-picker tray, then a summary card to save. That is a state machine on top of
`escalationEngine`, which today only answers support questions — the same shape of gap CLAUDE.md
already records for the widget's five undrawn states. It is a separate project, not a missing `if`.
Here the picker hands off to `SkillFormModal`, the same card `Edit` opens, so both paths build a
record the same way. Delete is a `confirm` **step** of that card, never a second dialog.

**The copy is this app's; only the layout is the artboard's.** Every skill Figma names — "Create
new deal", "Analyze report" — belongs to a CRM, the same frame family the reasoning trace was
transcribed from. So `DEMO_SKILLS` uses the five ids `analytics.ts` traces ALREADY cite
(`skill-answer`, `skill-clarify`, `skill-navigate`, `skill-summarise`, `skill-escalate`), and that
buys something concrete: the Usage tab's conversation list is derived from real `CONVERSATIONS`,
and the skill chip on `/conversations` deep-links to a row that exists. `skills.test.ts` asserts
that every cited id resolves, so the link cannot quietly open a drawer onto nothing.

Three artboard contradictions, each resolved in the component's own header:

- **Mode labels.** `Execute` / `Guide` / `Explain` (the newer frames) beat `Agent acts` /
  `Agent guides` / `Explanation` (`12987:14597`). One label per mode, so the table chip and the
  drawer's `Mode:` field cannot disagree. The Add Skill menu's long titles are a different
  register and stay their own map.
- **The table takes the union of two frames** — `12987:11526` draws Name + description subline /
  Last updated / Usage / Completion rate; `12987:16031` draws a Mode chip and no subline. Five
  columns.
- **The back chevron `12987:15136` draws on the Description tab has nothing behind it** — that tab
  is the drawer's root. It renders only in the conversation view.

`skillsStore` seeds **populated**, which is the opposite of `knowledgeStore`. A source is something
the user types, so an empty Sources tab is a true statement about a new workspace; a skill list is
not, no empty state is designed, and the deployed build is what gets demoed. `SkillsEmptyState` is
invented and still reachable — delete every row — it just is not where a first visit lands. That is
also why `demo.ts` is not extended: the Demo data switch fills stores that are empty by default.

## Interface is a page catalogue, and a skill is built on one

`/knowledge`'s **Interface** tab is Figma `12987:12415`. It is what makes the skill page-picker and
the skill drawer's `Interface: Dashboard` link mean anything, which is why it landed with Skills
rather than before or after it.

`pages` lives in `KnowledgeState` under the existing key — `parseKnowledge` merges over
`INITIAL_KNOWLEDGE`, so a payload written before `pages` existed reads forward with the catalogue
and no migration step. Like skills and unlike sources, it is **seeded populated**: a page catalogue
is the output of a scanner, and there is no scanner here.

Scanning is faked the same way training is, through the same module: `armTraining(id, finishScan,
SCAN_MS)` in `src/state/trainingTimers.ts`. The pairing is identical and so is the trap — `status`
IS persisted, a timer id is not, so `InterfaceTab` calls `resumeScanning()` on mount or a card says
"Scanning page..." forever. Drop either half and the spinner strands.

The page drawer and the skill drawer are the same shell: `Drawer` with `header` and `footer` slots
(see below), a `PrimaryHorizontalMenuGroup` tab bar, and view state that is deliberately NOT
persisted. Its `Details` tab is invented — no frame draws one — and says so in the file.

**Two deep links, one shape.** `/knowledge?page=<id>` opens the page drawer; `/skills?skill=<id>`
opens the skill drawer. Both round-trip: the skill drawer's `Interface:` field goes one way, the
page drawer's Skills tab comes back. Each reads its param ONCE and strips it, exactly as
`?source=` already did — read it every render and it fights the close button, leave it in and a
reload reopens the drawer.

## Conversations is the one full-bleed page, and the panel owns a ground

`/conversations` was redrawn against Figma `949:7217` (list row) and `949:7347` (panel), which
supersede `934:28534` / `934:29319` for the two panes. The page states — no data, no results —
are still the older frames'.

`949:7347` annotates the panel **"This entire box will fill the viewport"**, so the page passes
`maxWidth="100%"` through `AppShell` into `Subpage`. That is a documented additive fork: upstream
types `maxWidth` as `number` and stamps it into `style`, where React appends `px` to a bare number,
so a string passes through untouched and every numeric call site is unchanged. The header and the
toolbar widen with the card on purpose — widening the card alone leaves them floating over a page
that is a different width from its own content. The `--space-8` gutters stay.

Two invariants inside the panes:

- **The transcript has a ground of its own** (Blue/100 = `--color-brand-subtle`), with a white
  header bar above it, and the agent bubble is therefore WHITE. On the old white pane the agent's
  turns had to be tinted grey to be visible; that inversion is the redesign.
- **The feedback label straddles the bubble's bottom-left corner**, and that is one negative margin,
  not absolute positioning: the bubble carries the extra `--space-4` of bottom padding to overlap
  into, and the label is pulled up `--space-3` from a gapless wrapper. Absolute positioning would
  need a measured height and would break the moment the label's text changed length.

`Share conversation` is the one kebab row that is not a dead end — `949:7292` annotates it, so it
raises a positive toast reading "Conversation Link Copied" and takes its own prop. The two hover
affordances hang off USER turns only, which is where both artboards draw them, and which is how
they read: you answer a question, and you write a custom answer FOR a question.

## The reasoning trace is one object drawn on two surfaces

`ThinkingTrace` (`/conversations`) and the widget's `.ag-pill` → `.ag-runlog` are the same idea:
one line of what the agent did, opening onto the list of what it did. Keep them recognisable as
each other — a change to one is a question about the other.

Three rules the component's header comment expands on:

- **The rail is drawn by LAYOUT, not by the fixture.** Figma builds it as a rigid second column of
  16px glyphs and 14.3px connectors whose pitch happens to match the label column's. That desyncs
  the moment a label wraps, which these labels do at this width. Each step is one row instead: the
  rail cell stretches, the icon takes the first line's 18px, the connector is `flex-1` through the
  rest. No magic 14.3.
- **Open state is local and NOT persisted.** `AnalyticsState` is a config store — range, metric,
  filters, the selected row. Where a reader is inside a page is not configuration.
- **`rotate`, not `transform`.** Tailwind v4 compiles `rotate-180` to the standalone `rotate:`
  property, so a transition naming `transform` never fires. Same trap `Menu` documents for `scale`
  and `Drawer` for `translate`.

A citation has up to two destinations and they are not the same thing: the Content Detail drawer
(what the agent indexed) and the resource itself (whether the source is still true). The row prefers
the drawer, falls back to the resource, and greys out only when neither exists — the answer did use
it, and a record that quietly drops its sources is worse than one that admits it lost them.

## A drawer is a sibling of the card, not a third variant

`src/components/app/Drawer.tsx` is the Content Detail panel (`932:18232`). It is NOT a
`ModalCard` variant: a detail panel is not a beat of any flow, it is opened on its own and
dismissed on its own, which puts it beside `PickerDialog` rather than inside the one-card rule.
It is still a floating layer, so it meets all four Floating-Layers requirements — and note its
transition names **`translate`**, not `transform`, for the same reason `Menu` names `scale`.

**Additive fork for the two new drawers** (skill `12987:15826`, page `12987:12416`): `header`
replaces the built-in title row wholesale, and `footer` pins below a scrolling body. Both default
to exactly what the file did before, so `SourceDetailDrawer` is untouched. A caller that passes
`header` owns its own close button — there is no "title plus extras" mode, because all three
headers put the close control somewhere different and a prop per placement is a prop per chance to
render none of them right. Note the consequence: with a `footer`, the BODY scrolls rather than the
panel, or the footer would slide away with the content. The full-bleed conversation view needs no
third prop — `cn` is tailwind-merge, so a caller's `className="p-0"` already beats the panel's
padding.

It paints `--color-blue-50`, the colour `Subpage` paints, because without a ground of its own
the header row sits on the backdrop and the page shows through it.

## Settings is a second product, and the docs outrank the artboards

`/settings/*` is Figma section `13:27205` of a DIFFERENT file (`z7EQ0w6HgJkQ80VDck0JaG`) and a
different product: the Jimo platform's settings — project identity, themes, snippet installation,
rate limiting, team, integrations, plan, billing, account. It is not the agent's configuration,
which stays in Escalation's `ConfigureModal` and was deliberately left untouched.

It renders into the SAME `AppShell` with the secondary sidebar swapped. That is why `AppShell` took
`sections` / `routes` / `railItem`, all defaulting to the agent nav so the five agent pages are
unchanged. **A label absent from `routes` stays inert** — the mechanism Chat and Launcher already
use, and now what makes the undesigned `Events` item honest without a `disabled` flag.

**One route per settings page**, unlike Knowledge's tabs. A sidebar is the same nav affordance as
Escalation/Knowledge/Skills, and the docs link to `i.usejimo.com/settings/team` and `/settings/billing`
as addresses, so the paths mirror the docs'. Sub-tabs WITHIN a page (Team's Members|Roles,
Installation's Install|Identification) stay component state, exactly as Knowledge's do.

**The interaction rule the artboards imply but never state: text fields go through the save bar,
switches commit instantly.** The bar is only drawn on General and My Account; Notifications' two
switches, Auto-Join and Force Identify write straight through. A toggle that silently does nothing
until you find a Save button is the worse behaviour. It lives in `SaveBar.tsx` with `useDraft`, and
is `sticky` inside the content column rather than portalled — it belongs to the page, so it needs no
measurement effect and no ancestor can capture it.

**`subscription` starts at `none`.** That means Billing's own "No history yet" artboard (`13:13269`)
is where a fresh workspace lands, and every paid Billing state is reachable only by actually running
checkout. The opposite of `skillsStore` seeding populated, for the reason that store's comment gives
in reverse: a workspace claiming invoices it never bought is a false statement, a demo skill list is
not.

**Money lives in `plan/pricing.ts`, pure and tested.** Two rules it encodes that are easy to get
wrong: the coupon applies BEFORE tax (taxing first charges VAT on money nobody paid), and yearly
prices are STORED, not derived. `monthly × 0.84` gives 99/240/391 where the published prices are
99/239/389 — they are marketing figures rounded to end in 9, so the real discounts are 16.1/16.4/16.5%
and `YEARLY_DISCOUNT` is display-only. Deriving them would overcharge every yearly customer.

**Four screens have no artboard at all** — Roles, Webhooks, Environments, Troubleshoot — and each
says so in its own header. They exist because the docs describe them as real settings pages; they are
built from this repo's existing layout vocabulary and should be expected to be redrawn. `RolesTab`
deliberately does NOT invent a permission matrix: the docs name no individual permissions, and a
made-up grid of checkboxes would read as product truth in a screenshot.

**The theme builder (`13:10825`) is a second application and is deliberately a shell.** All 18 of its
accordion groups are drawn COLLAPSED, so not one interior is designed, and its live preview needs a
renderer for Jimo tours, surveys and changelogs that this repo does not have. The theme LIST is
complete; the builder gives you the header, navigator, preview chrome and the one NPS card the
artboard actually draws. Same gap as the widget's five undrawn states and the skill recorder: a
separate project, not a missing `if`. If that file starts growing a preview renderer, stop.

Three traps caught while building it, all worth knowing before touching a vendored component:
`SecondaryHorizontalMenuGroup` names its label field **`tabName`**, not `label`, and silently falls
back to `"Report"` — a wrong prop renders identical tabs with no type error. `Section`'s `title`
declared `ReactNode` but lacked the `Omit<…, "title">` that `Page`/`Subpage`/`PageHeader` carry, so it
collapsed to `string`; that Omit is now added. And `iconsax` has no `Broadcast` or `Cursor`, so the
Webhooks and Events glyphs are `Radar` and `Mouse`.

## The support tool row owns whatever that tool needs

Figma `105:4515` (Intercom / Zendesk / Crisp) and `105:4514` (Support Email) draw the "Escalation
Support Tool" row as a card in two parts: the selector on top, and a section under a rule that
belongs to the chosen tool. The selector itself never opens a flow — switching is instant, and the
section below then shows what the new tool still needs. Its menu names the SELECTED tool plainly
and phrases every other row as "Switch to …".

Crisp is the one vendor that is not an OAuth redirect: it takes a workspace token pair, so it has a
credentials form (`CrispConnectFields`, shared verbatim by the standalone `CrispConnectModal` the
hero opens and by Configuration's `connect-crisp` step) and the only vendor state persisted locally
(`crisp` in `EscalationState`).

Turning the Enable switch OFF does not write state — it opens the `disable` step, which is what
leaves the switch still reading "on" behind the confirmation. Turning it on stays immediate.

## Vendored Moji — do not edit `../../jimo-storybook`

`src/components/ui/*`, `src/styles/*` and `src/lib/utils.ts` are copies. The upstream repo is
read-only for this project. Traps that already bit once:

- Export names ≠ directory names: `Chip/badge.tsx`→`Badge`, `Toggle/switch.tsx`→`Switch`,
  `Infobox/alert.tsx`→`Alert`. Always deep-import `@/components/ui/{Name}/{Name}`.
- `{Name}.docs.js` and Moji's root `Design.md` are **stale**. The `.tsx` is the only truth.
- `ModalOverlay` has no `stopPropagation` on its content — `ModalCard` adds it. Without it every
  click inside a dialog closes the dialog.
- `PageHeaderButton` takes `level`, not `variant`.
- Floating panels must name **`scale`** (not `transform`) in the transition — Tailwind v4 compiles
  `scale-*` to the standalone `scale:` property.
- Verify every iconsax name against the package before use; Moji's own brand table lists `Flash1`,
  which does not exist in the 993 exports.

`SecondaryNavSidebar` is forked twice: `sections` (upstream hardcodes its IA), and `SidebarItem`
gaining `href` / `trailing` / `className` for the settings footer group — all three forward
capabilities `SecondaryNavItem` ALREADY had, so that fork is one type and zero visual code. Keep both
additive. Four more forks exist, each documented in the component's own `CONTEXT.md`:
`Table` takes `scroll` (default `true` = unchanged); `DropdownMenuList`'s `selected` is filled
with `--color-brand-subtle` so a selected row matches the `DropdownSelector` above it; and
`PageHeader` takes `meta` (a passive status line) plus `actions` (a right-cluster slot for an
action `buttons[]` cannot express — every entry there is rendered as a bare `<Button>`, so a
`Menu` trigger has nowhere to go). And `Section` takes `Omit<React.ComponentProps<"section">, "title">`, which is a
BUG FIX rather than a capability: its `title` already declared `ReactNode` with a comment saying why,
but the missing Omit collapsed it to `string` and made the stated intent unreachable.

These local copies may be forked; `../../jimo-storybook` may not. When a fork lands here, say so in
the component's header comment AND its `CONTEXT.md`, so the next reader can tell it from drift.

## Widget CSS

`src/styles/widget.css` is ported from `demo-apps/trigger-demo/builder/src/styles/widget.css` with
exactly two changes, both load-bearing and both commented at the top of the file:

1. Its `:root { --agent-* }` block is scoped to `#agent`, or those globals leak into every
   Storybook story.
2. `--spring` is defined, because the source reads it from `host.css`, which is not ported — and a
   shorthand transition with an unresolvable `var()` is dropped whole.

Panel surfaces share a six-property contract (bg / border-width / style / colour / radius / shadow)
and there is **exactly one panel radius terminal: 20px**. A new panel that invents its own radius
is the bug.

**The CSS is ahead of nothing — keep the MARKUP in step instead.** That stylesheet styles all nine
of the prototype's states, and `AgentWidget.tsx` used to render four, so `.ag-pill`, `.ag-runlog`,
`.ag-botbar` and the `.ag-opt-*` rows styled nodes that did not exist. The slots now match
`trigger-demo/builder/src/prototype/prototype.html` one for one, in its order. When that prototype
moves, the fix is here in the TSX — reach for widget.css only if the two files have genuinely
diverged, and then re-port it whole rather than patching a rule.

Five of those states — `asking`, the two `guide-*` and the two `execute-*` — are **layout only**.
`escalationEngine` answers support questions; it has no host app to guide anyone around, so nothing
produces them. They are reached through `AgentWidget`'s `state` override, which Storybook uses, and
everything they say is invented (see below). Wiring them means giving the widget a host to act on,
which is a different piece of work, not a missing `if`.

## Invented, and labelled as such

`MATCHERS` in `src/data/fixtures.ts` — the phrase lists that decide explicit-ask, rejection and
frustration in the simulator, plus the substring topic matcher in
`src/features/widget/escalationEngine.ts`. No upstream source defines these. Keep them quarantined
and keep the comments saying so.

The Sources tab adds three more, each commented at its own site: the 2s training delay in
`src/state/trainingTimers.ts`, the two rules "Regenerate rules with AI" produces in
`UrlRuleRows.tsx`, and the per-source token cost in `AddSourceModal.tsx`.

The **reasoning trace** adds two, both in `src/data/analytics.ts`. Its SHAPE is transcribed from
Figma `12983:8096` (Interface-Knowledge) — an icon rail, a hairline connector, one label per step —
but that frame is a BROWSER agent filling a CRM form ("Go to Deals page", "Fill 12,000 in Amount
field"), so every step, skill and citation the support transcripts carry is made up. `CitedSource`
carries its own `label` / `kind` / `href` on purpose: a conversation is a historical record, the
knowledge store starts EMPTY, and a citation that could only render by finding a live row would
blank out exactly when the record matters. `sourceId` is a link, never the row's text.

The five undrawn widget states add a third: everything `PILL_FACE`, `BOTBAR_TEXT`, `RUN_LOG` and
`QUESTION` say in `AgentWidget.tsx`. The prototype's own copy is about a CRM deal pipeline; these
are the support equivalents, and no artboard or PRD defines them.

**Skills** and the **Interface** tab add the largest batch, each commented at its own site:
`DEMO_SKILLS`' instructions prose and every figure past the ones the artboards print (`6,248`,
`5%`, `321`, `193 (82%)`, `42 Conversations`); the `buildSkillUses` / `buildSkillOutcomes` /
`buildSkillUsageDays` generators; the 50% cut that turns the Completion rate chip red; the option
sets behind `Default`, `All Skills`, `All time` and `All Responses`, of which only the last
actually filters; the drawer kebab's `Duplicate` / `Delete` rows; `SkillFormModal`'s field labels;
`SkillsEmptyState`; `DEMO_PAGES` and every element label in it; `PageThumb`'s wireframe, which is
drawn from tokens rather than baked as a PNG because the artboard's thumbnails are screenshots of
somebody else's product; `ScanPageModal` and the 4s `SCAN_MS` behind it; and the page drawer's
`Details` tab, which no frame draws at all.

**Settings** adds the last batch, each commented at its own site: `FREE_SEATS` and the three-person
`DEMO_MEMBERS` (paired deliberately — the pairing is what keeps BOTH designed Team states reachable);
`EXTRA_SEAT_MONTHLY`, `VAT_RATE` and the `JIMO50OFF` coupon, none of which any doc states; the five
`ENVIRONMENT_COLOURS` and `ENVIRONMENT_ICONS`; `DEMO_EXPERIENCES` behind the rate-limit picker;
`VendorMark`, which draws a vendor's initial on a tinted tile rather than vendoring seven trademarked
wordmarks; `RolesTab` and `WebhooksPage` and `EnvironmentsPage` and `TroubleshootPage` entire, since
no frame draws any of them; the GTM account/container fields; `CancelPlanModal`'s reason list; the
password minimum; and the theme builder's generic style panel.

Deliberately NOT invented, and worth keeping that way: a permission matrix on `RolesTab` (the docs
name no permissions, so a grid of checkboxes would read as product truth), syntax highlighting in
`CodeBlock` (it would need a colour system that is not in `tokens.css`), and a free colour picker
for environments (`ColourSwatchField` stores a token NAME, because a picker yields `#3f7d2a` and
that would be the first raw hex in the codebase).

`src/lib/classifyChip.ts` is the opposite: transcribed **verbatim** from Figma node `29:12197`.
Do not "improve" its rules — `classifyChip.test.ts` encodes the spec's own 12 worked examples.

## The empty state is a PNG, and it has no header

`src/assets/escalation-empty-state.png` is Figma node `43:6941` exported at 3x. Do **not** rebuild
it from SVG/DOM primitives — that is what `HeroArt.tsx` used to do and it drifted. Its baked
background is Blue/50, the same colour Subpage paints, so the flat edges disappear into the page.

`EscalationPage` hides its `PageHeader` entirely for this state (`heroOnly`), per `43:6580`, and
hands the content column `min-h-screen justify-center py-0` so the hero is genuinely centred rather
than pushed down by a min-height. The OAuth beat keeps the header.

## Demo data

`src/state/demo.ts` + the third Configuration row. One switch fills both pages: escalation and
knowledge are separate stores under separate keys, so `setDemo` keeps two snapshots. It is
**not** gated on `import.meta.env.DEV` —
this repo is a prototype and the deployed Vercel build is what gets demoed, so the row has to
survive `npm run build`. Turning it on snapshots the real config to
`jimo.agent.escalation.demo-snapshot.v1` and restores it on the way out.

It deliberately does not use `seed()`: `seed()` calls `resetState()`, which would destroy the
user's vendor and topics for good.

## Two REAL vendor scripts run on the dashboard

`src/lib/jimo.ts` and `src/lib/intercom.ts`, both called from `main.tsx` at module scope. These are
not simulated — they load the live Jimo invader (project `69331a7f…` on
`testing.undercity.usejimo.com`, `JIMO_DEBUG` on) and the live Intercom messenger (workspace
`l8fng6ag`). Everything else in this repo fakes its vendors; these two do not, so treat them as
production surfaces.

Three rules the files' own headers expand on:

- **Dashboard only, never `widget.html`.** That entry is OUR simulated agent widget, and the real
  Jimo launcher beside it would put two agents on one screen.
- **Module scope, not a `useEffect`.** No component wraps the SPA — `main.tsx` mounts the router
  directly — so both installs guard against a second call instead (`window.jimo != null`; Intercom
  re-`update`s a booted messenger rather than appending its script twice). That is also what makes
  StrictMode's double invoke a no-op.
- **Intercom boots ANONYMOUS.** There is no auth and no current user to read. A `user_id` boot
  would create a real contact in the real workspace, which cannot be undone from this side, and it
  would need an Identity Verification HMAC from a server this prototype does not have.

`installIntercom` is now two lines over the real `@intercom/messenger-js-sdk` (0.0.20), and its
own double-call guard is gone because the SDK has one (a `_intercom_npm_loader` script id, and a
re-`update` rather than a second script). It used to hand-write what that package does, because
`npm install` cannot reach the registry from this machine — ENOTFOUND on every host, a broken
system resolver rather than an npm problem, since the network is fine when given an IP. The
package was therefore installed from a checksum-verified tarball fetched by IP and unpacked into
`node_modules`; `package.json` and `package-lock.json` carry the ordinary registry entry, so CI
and Vercel install it the normal way. **Until that resolver is fixed, a plain `npm install` or
`npm ci` here fails and will prune the unpacked copy** — re-unpack it rather than assuming the
dependency was never added. Known collision, deliberately left alone: Jimo and Intercom both drop
a bottom-right launcher, so they overlap on `/escalation`.

## Verify before marking done

```sh
npm run typecheck && npm test && npm run build-storybook
```

All three must be clean. For visual changes, re-shoot the `Pages/EscalationPage` stories and diff
against the Figma artboard each one names in its `design` parameter.
