# agent-escalation — Claude Code reference

The Jimo Agent Escalation page, built 1:1 from Figma, plus a widget simulator.
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
`iconsax-react@0.0.8` · cva + clsx + tailwind-merge. Node 22, npm. **No router** — the widget is a
second Vite entry (`widget.html`).

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
fork additive.

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

## Dev-only demo data

`src/state/demo.ts` + the third Configuration row, gated on `import.meta.env.DEV` (Vite folds the
constant, so the row is absent from `npm run build` — verified by grepping `dist/`). Turning it on
snapshots the real config to `jimo.escalation.demo-snapshot.v1` and restores it on the way out.

It deliberately does not use `seed()`: `seed()` calls `resetState()`, which would destroy the
user's vendor and topics for good.

## Verify before marking done

```sh
npm run typecheck && npm test && npm run build-storybook
```

All three must be clean. For visual changes, re-shoot the `Pages/EscalationPage` stories and diff
against the Figma artboard each one names in its `design` parameter.
