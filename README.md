# jimo-agent

The Jimo Agent console, built 1:1 from Figma, plus a live end-user widget simulator.
Five Agent pages, and the six Experiences dashboards beside them:

- **Escalation** (`/escalation`) — [`Escalation`, node 43:6997](https://www.figma.com/design/5LL3WooWBeEfjNpUls93Zg/Escalation?node-id=43-6997)
- **Knowledge** (`/knowledge`) — [`Sources page`, section 932:27941](https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=932-27941) and [`Interface Knowledge`, section 12987:12415](https://www.figma.com/design/ZapclwcQZLBxoeYxfo1ms0/Interface-Knowledge?node-id=12987-12415), plus [`User Context`, node 901:16049](https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=901-16049) for the section that tab used to hold
- **Skills** (`/skills`) — [`Building Skill from Dashboard`, section 12987:11525](https://www.figma.com/design/ZapclwcQZLBxoeYxfo1ms0/Interface-Knowledge?node-id=12987-11525)
- **Experiences** — six dashboards and six detail pages, from the [index skeleton `6:384`](https://www.figma.com/design/z7EQ0w6HgJkQ80VDck0JaG/Agent-Designer-Sandbox?node-id=6-384) and the [detail skeleton `10:2269`](https://www.figma.com/design/z7EQ0w6HgJkQ80VDck0JaG/Agent-Designer-Sandbox?node-id=10-2269), with everything behind an undrawn affordance taken from the Jimo Help Center
- **Statistics** (`/statistics`) and **Conversations** (`/conversations`) — [`Analyze`, section 934:27942](https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=934-27942), redrawn for the two panes by [949:7217](https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=949-7217) / [949:7347](https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=949-7347)

```sh
./run.sh              # dashboard        -> http://localhost:5174
                      # widget preview   -> http://localhost:5174/widget.html
./run.sh storybook    # component library -> http://localhost:6007
```

## What it is

Two surfaces. The dashboard is one SPA with a route per page; the widget is a second Vite entry,
and the two tabs talk to each other through `localStorage`:

| Surface | Entry | What it does |
|---|---|---|
| **Escalation page** | `index.html` at `/escalation` | Configure where hand-offs go, when they fire, and which topics skip the agent. |
| **Knowledge page** | `index.html` at `/knowledge` | Two tabs. **Sources**: add the URLs, files, texts and videos the agent trains on, and watch each one train. **Interface**: the pages the agent has scanned, each opening a drawer of its elements and the skills built on it. Custom Answers is drawn but cut — nothing sits behind it yet. |
| **Skills page** | `index.html` at `/skills` | The agent's skills, what each one costs and how often it finishes. Add one by picking a mode, then the page it runs on. Open a row for its instructions, its usage, and the real conversations that fired it. |
| **Statistics page** | `index.html` at `/statistics` | Usage over time, by metric and date range. |
| **Conversations page** | `index.html` at `/conversations` | Every conversation, with its transcript and the agent's reasoning trace — which skills fired and which sources it cited. Both link out to the page that owns them. |
| **Experiences pages** | `index.html` at `/tours`, `/surveys`, `/banners`, `/hints`, `/checklists`, `/resource-centers` | Each type's dashboard: a mosaic or one of two lists, filtered by context, status, segment and tag. Open a card for its content, its per-type KPIs and whatever the selected KPI drills into. |
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
Also real, and easy to mistake for part of the prototype: three live third-party scripts load on the
dashboard — the Jimo invader, the Intercom messenger and the Crisp chat client (`src/lib/`). Note
that Crisp is therefore two unrelated things in this repo: that live widget, and the *simulated*
support vendor on `/escalation`.

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
