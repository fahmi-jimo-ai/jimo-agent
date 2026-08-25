# jimo-agent — Claude Code reference

The Jimo Agent console, built 1:1 from Figma, plus a widget simulator. Two pages today:
**Escalation** (`/escalation`) and **Knowledge** (`/knowledge`); `/` redirects to Escalation.
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

`SecondaryNavSidebar` is forked to take a `sections` prop (upstream hardcodes its IA). Keep the
fork additive. Two more forks exist, both documented in the component's own `CONTEXT.md`:
`Table` takes `scroll` (default `true` = unchanged), and `DropdownMenuList`'s `selected` is filled
with `--color-brand-subtle` so a selected row matches the `DropdownSelector` above it.

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

## Invented, and labelled as such

`MATCHERS` in `src/data/fixtures.ts` — the phrase lists that decide explicit-ask, rejection and
frustration in the simulator, plus the substring topic matcher in
`src/features/widget/escalationEngine.ts`. No upstream source defines these. Keep them quarantined
and keep the comments saying so.

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

`src/state/demo.ts` + the third Configuration row. It is **not** gated on `import.meta.env.DEV` —
this repo is a prototype and the deployed Vercel build is what gets demoed, so the row has to
survive `npm run build`. Turning it on snapshots the real config to
`jimo.agent.escalation.demo-snapshot.v1` and restores it on the way out.

It deliberately does not use `seed()`: `seed()` calls `resetState()`, which would destroy the
user's vendor and topics for good.

## Verify before marking done

```sh
npm run typecheck && npm test && npm run build-storybook
```

All three must be clean. For visual changes, re-shoot the `Pages/EscalationPage` stories and diff
against the Figma artboard each one names in its `design` parameter.
