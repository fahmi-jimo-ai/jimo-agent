# Escalation email: the four variants

`escalation-email.html` renders one email, but that email reads differently
depending on why the agent gave up. The toggle at the top of the file switches
between the four cases. This is what separates them.

## Which one fires

`evaluate()` in `src/features/widget/escalationEngine.ts` runs its checks in a
fixed order and returns on the first hit, so a message that satisfies two
triggers only produces the higher one:

1. `asked_for_human` (explicit ask)
2. `topic_rule` (message matches a topic pill)
3. `agent_stuck` (rejection streak reaches the configured count)
4. `frustration` (frustration phrases at the configured sensitivity)

## At a glance

| Variant | Fires when | Controlled by | Behaviour | Chip |
|---|---|---|---|---|
| `asked_for_human` | The user asks for a person in so many words | Explicit request toggle | `immediate` | green |
| `topic_rule` | The message matches a topic the team added | The topic pills | `immediate` | blue + the topic pill |
| `agent_stuck` | N answers in a row get rejected | Failed answers count (default 2) | `card` | purple |
| `frustration` | Frustration phrases at or above the set tier | Frustration level (default Clear) | `card` | red |

`behaviour` is the other half of the decision. `immediate` means the hand-off
opened straight away. `card` means the agent offered first and waited, which is
why those two transcripts run one turn longer: the last turn is the user
accepting.

## asked_for_human

The user said something like "can I talk to a human". Nothing is inferred, so
this is the cheapest one to trust.

- Subject: `Marie Dubois needs a person, "SSO login is failing for my team"`
- Sub-copy tells the team Marie was already promised a person, so the reply is
  expected rather than a surprise.
- 6 turns. The agent tried twice before she asked.

## agent_stuck

Two answers in a row landed badly. The count is the team's own setting, so the
email names it: a workspace set to 3 would have let this run one turn longer.

- Subject: `Jimo couldn't answer Marie Dubois, "SSO login is failing for my team"`
- The brief says which suggestions were already tried, which is the part that
  saves the agent repeating them.
- 7 turns. The agent asked whether to bring someone in; Marie said yes.

## frustration

No rejection streak and no explicit ask. The agent read tone. This is the
softest signal of the four, so the email says which sensitivity produced it,
and the transcript is there to be argued with.

- Subject: `Marie Dubois is stuck, "SSO login is failing for my team"`
- 7 turns, same accept step as `agent_stuck`.

## topic_rule

The message matched a topic the team added on the Escalation page, so the agent
handed over without attempting an answer at all. That makes it the shortest
conversation and the one where the support team has the least context from the
agent, and the most from the topic itself.

- Subject leads with the topic, because that is a routing rule the team wrote
  and will filter on: `Team invites, Marie Dubois: "team invites are failing for
  3 of my colleagues"`
- Only variant that shows the topic chip and the Topic rule row.
- 2 turns.

## What does not change

User, account, last page, browser and OS, the reply button, and the footer are
identical in all four. So is the shape of the email: chips, headline, one line
of why, the user's own words, then reply, then context, then the transcript.

## About the topic chip

Three of the four variants have no topic. That is a fact about these sample
conversations, not a rule: `matchTopic()` runs before the reason is decided and
attaches the topic to whichever `Decision` comes back, so a frustration
escalation on a matched topic carries both. The SSO messages simply do not match
any pill in the sample workspace.
