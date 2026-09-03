---
name: design-triage-prototype
description: >
  Runs Fahmi's daily design triage and prototype routine end to end. Pulls design-blocked Linear
  tickets from the usejimo2 Prod-Support team for a date window, groups them into executions,
  publishes one artifact that lists every PRD with its exact title, analyses the pattern across them,
  and draws a token-styled mockup plus an Option A / Option B pair for each execution. Then it stops
  and waits for approval. Once Fahmi accepts, it builds each approved execution on its own branch in
  the jimo-agent prototype, deploys each branch to Vercel, opens a draft PR, and comments the
  deployment link plus test steps on every ticket in the group. Trigger on the "Design triage and
  prototype" routine, and when Fahmi says "run design triage", "triage yesterday's design tickets",
  "design triage and prototype", or asks to turn recent Linear design tickets into prototypes.
  Never write a daily triage artifact without this skill.
---

# Design triage and prototype

Two phases with a hard stop between them. Phase A proposes. Phase B builds. Nothing in Phase B runs
until Fahmi has said yes, and only the executions he named actually run.

Working repo: `jimo-agent`. Linear workspace: `usejimo2`. Timezone: Asia/Jakarta.

Write everything Fahmi reads in plain language. No em dashes anywhere. Lead with the outcome, not
the process. Minimal bold. No AI tropes.

---

## Phase A: triage and propose

### A1. Resolve the window

A Tuesday to Friday run covers yesterday. A Monday run covers Friday, Saturday and Sunday. If the
user names a window, that wins.

### A2. Pull the candidates

`Linear:list_issues` with `team: "Prod-Support"`, `updatedAt` set to the window, and
`fields: ["title", "url", "status", "labels", "updatedAt"]`.

Keep tickets that still need design before they can close. In practice that is status `Triage`,
`To design` or `To Clarify`. Drop anything already handed to dev, already in the roadmap, canceled,
or expired.

### A3. De-dup gate. Do not skip this.

For every candidate, call `Linear:list_comments`. Skip the ticket if it already carries a comment
starting `**Design prototype for review**` that is newer than the ticket's own last substantive
update. A previous run already proposed something for it, and re-proposing the same ticket every
night is the failure mode this gate exists to prevent.

If every candidate is skipped, say so in one line and stop. Do not manufacture work.

### A4. Read each surviving ticket properly

`Linear:get_issue` with `includeRelations: true` and `includeCustomerNeeds: true`. Hold the full
description, the verbatim customer quote, the customer name, the labels and the related issue ids.
Read the related issues too. They tell you the scope boundary.

### A5. Ground each ticket twice

1. `Jimo Documentation:searchDocumentation` for what the real product does today on that surface.
   The ticket describes a gap; you need to know what the gap is against.
2. `CLAUDE.md` in this repo for which page or component the change lands on. It is the map from a
   product surface to a route: `/escalation`, `/knowledge`, `/skills`, `/statistics`,
   `/conversations`, `/widget.html`.

### A6. Group into executions

Group by shared component, not by shared label. Four tickets that all describe the agent widget
failing to say what it is doing are one execution, because they are one component and one fix.

Aim for fewer, larger executions. Six tickets landing as three groups is a good ratio. A group of
one is fine when a ticket genuinely stands alone.

Name each execution after the outcome, not the tickets: "Make the widget say what it is doing", not
"PRD-599 and friends".

### A7. Write the artifact

Load the `artifact-design` skill first. Then copy
`references/artifact-template.html` into the scratchpad, fill it, and publish with the `Artifact`
tool. Read `references/mockup-kit.md` before drawing anything.

**The structure is fixed. This order, every run:**

1. **Title and one line.** The date, how many tickets, how many executions.

2. **PRDs in this run.** A numbered list. Each entry is the id, then the exact Linear title copied
   verbatim, then a one or two sentence summary of what the ticket actually asks for. Do not
   paraphrase the title. Do not shorten it.

3. **Patterns.** Straight after the list, before any solution. What these tickets have in common,
   what the common root cause is, and why they group the way they do. This is the section that earns
   the grouping.

4. **One section per execution.** Each carries, in this order:
   - The PRDs it covers, each written as id plus title.
   - **Problem statement.** What is broken or missing, in the user's terms.
   - **Goal.** What is true after this ships that is not true now. One sentence, outcome shaped.
   - **Illustration.** See below. Not optional.
   - **Option A** and **Option B.** Both real, both buildable. State which one you recommend and
     why, and name the specific risk of each. Never invent a strawman B to make A look good.
   - **Where it lands.** The route in the prototype, for example `/conversations` or
     `/widget.html`.

5. **What I need from you.** Approve all, or name the executions to run.

**The naming rule, everywhere in the artifact:** a PRD id never appears alone. Every mention carries
its title. `PRD-599 (Agent action step fails with a generic error...)`, never `PRD-599`. This holds
in the list, in the pattern analysis, in the execution sections and in the option copy.

### A8. Illustrations

Every execution gets one. This is the part that makes the artifact reviewable instead of readable.

**A screen or UI change** gets a Before frame and an After frame side by side, with numbered pins on
the After frame calling out exactly what changed and a short legend under it.

**A flow change** gets a horizontal strip of frames, one per step, numbered, with an arrow between
each. One frame per beat of the flow. Label each frame with what the user just did.

Draw both from the primitives in `references/mockup-kit.md`, using the token palette the template
inlines. Frames stay on the product's light palette even when the artifact renders in dark mode. The
page around them is theme aware. The mockup is a picture of the product, not of the artifact.

Keep them small. A frame is an illustration of the idea, not a pixel-accurate redraw. What matters
is that Fahmi can see the change without reading a paragraph about it.

### A9. Stop

Publish the artifact, hand over the link, and end the turn. Do not create a branch, do not write
code, do not deploy, do not comment on Linear.

---

## Phase B: execute

Only after Fahmi accepts. Only the executions he approved. If he approved some and not others, the
rest are dropped, not deferred silently.

### B1. Branch per execution

One branch per execution, never per ticket. Name it `<current branch>-<slug>` where `<current
branch>` is what the session is checked out on and `<slug>` names the outcome, for example
`widget-legibility`. The session's push access is scoped to that branch prefix, so a branch built
from anything else will fail to push.

Branch off `main`. Never commit to `main`, never push to `main`, never merge anything.

### B2. Build it

Follow `CLAUDE.md` exactly. The rules that get broken most often:

- Tokens only. Never a raw hex, px or rgba that has a token.
- Import the Moji component, do not redraw it. Grep `src/components/ui/` first.
- Floating layers go through `src/components/app/Menu.tsx` and portal to the body.
- A flow is one `ModalCard` with steps, never a dialog on a dialog.
- Anything invented gets a comment at its own site saying so.
- Do not edit `src/styles/widget.css`. It is a 1:1 port. Additions go in a sibling sheet loaded
  after it.

### B3. Verify before deploying

```sh
npm run typecheck && npm test && npm run build-storybook && npm run build
```

All four clean. A red check means fix it, not deploy it.

### B4. Deploy

```sh
vercel build --token "$VERCEL_TOKEN" --yes
vercel deploy --prebuilt --token "$VERCEL_TOKEN" --yes
```

`VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are in the environment.

Capture the deployment URL. Then `curl -sI` it and confirm a 200 before it is used anywhere. A URL
that has not been checked does not go in a Linear comment.

### B5. Push and open a draft PR

Push the branch, open the PR as a draft against `main`. Title is the execution's outcome name. Body
explains what changed and which tickets it answers, each named with id plus title.

### B6. Comment on Linear

One comment per ticket in the execution, using `references/linear-comment.md`.

Only if B4 returned 200. An execution that did not deploy gets no comment at all, and the failure is
reported to Fahmi in chat instead. A Linear comment pointing at a dead link is worse than no comment.

### B7. Report back

The final chat message is only this, per execution, and nothing else:

1. The Vercel link including the exact path to look at, for example
   `https://jimo-agent-xxxx.vercel.app/conversations`.
2. A short plain summary of what was built and why that shape. No em dashes. No jargon.
3. The tickets commented, each as id plus title.

No preamble, no methodology, no list of files changed. Fahmi wants the links and the reasoning.

---

## Guardrails

- Never push to `main`.
- Never skip the approval gate between Phase A and Phase B.
- Never comment on Linear for an execution that did not deploy successfully.
- Never re-triage a ticket that already carries a `**Design prototype for review**` comment.
- Never write a bare PRD id without its title.
- Never present an Option B you would not actually build.
- Never claim a check passed without running it.
