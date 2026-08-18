# agent-escalation

The Jimo Agent **Escalation** page, built 1:1 from the Figma
([`Escalation`, node 43:6997](https://www.figma.com/design/5LL3WooWBeEfjNpUls93Zg/Escalation?node-id=43-6997)),
plus a live end-user widget simulator.

```sh
./run.sh              # dashboard        -> http://localhost:5174
                      # widget preview   -> http://localhost:5174/widget.html
./run.sh storybook    # component library -> http://localhost:6007
```

## What it is

Two surfaces that talk to each other through `localStorage`:

| Surface | Entry | What it does |
|---|---|---|
| **Escalation page** | `index.html` | Configure where hand-offs go, when they fire, and which topics skip the agent. |
| **Widget simulator** | `widget.html` | A mock customer app with the Jimo agent on it. It runs the rules you just configured, live — change a trigger on the dashboard and this tab reacts without a reload. |

Open the simulator from **Send a test escalation → Open the live widget**.

## Sources, and which one wins

Three artifacts described this feature and they disagreed. The precedence used throughout:

> **Figma** (UI, states, copy) **>** the old `jimo-escalation-v2_2.html` prototype (tokens and
> interaction idioms only) **>** the `support-handoff.md` PRD (domain naming, enums, rationale).

The HTML prototype is an **older, different design** — its Destination / Connected accounts /
What the team receives / Integration health cards do not exist in the Figma and are not built.
Four conflicts were resolved in Figma's favour: topics are classified pills rather than the PRD's
keyword-rules-with-behaviour; "On explicit request" is uncheckable; Support Email is a first-class
destination; the prototype's extra cards are dropped.

## Design system

Moji, vendored from `../../jimo-storybook` (it is `private: true` with no library build, so copying
is the documented path — see its `jimo-use-component` skill). `src/styles/tokens.css`,
`globals.css`, `global.css` and `src/lib/utils.ts` are byte-identical copies.
**Never hardcode a hex/px/rgba that has a token.**

One component is forked: `SecondaryNavSidebar` hardcodes a Train/Build/Evaluate IA upstream, so it
gained a `sections` prop. The fork is additive — the upstream default is unchanged.

## What is real and what is mocked

Real: every interaction, the state machine, persistence across reloads, cross-tab sync, and the
topic classifier (transcribed verbatim from the Figma spec, with its own worked examples as tests).

Mocked: vendor OAuth, the handoff chart data, and "Suggest topics" — which returns fixtures after a
two-second shimmer, not an LLM call. The simulator's phrase matchers in `src/data/fixtures.ts` under
`MATCHERS` are **inventions**: no source defines how a live message matches a topic pill, so they are quarantined
there and labelled rather than passed off as product logic.

## Demo data (dev only)

**Configure → Demo data** fills the page with a workspace that has been running a while — the
handoffs chart plus a full topic list — so the populated state is one click away. The row only
renders under `import.meta.env.DEV` and never reaches a production build. Turning it off restores
whatever you had configured before.

## Verify

```sh
npm run typecheck        # zero errors
npm test                 # classifier vs the Figma spec's 12 worked examples
npm run build-storybook  # zero errors
```

`stories/4-pages` has one story per Figma artboard, seeded to that exact state — so a story can be
diffed straight against the board it came from.
