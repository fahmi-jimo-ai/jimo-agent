# Escalation → Support Email: payload and configuration

What the agent has to send, and how the message is wired, when a workspace picks
**Support Email** as its escalation tool (`vendor: 'email'`, `supportEmail` set in
`SupportEmailModal`).

The email itself is a Customer.io **transactional message**. Everything the email
renders comes from `message_data` on the send call — nothing is read off a
profile. Read `escalation-email-variants.md` for why the four variants differ;
this file is the wire contract.

Source: Customer.io workspace `119516`, transactional message `17`, template `166`
(“Agent Escalation → Support Email (templated)”), read 2026-08-25.

---

## 1. The send

Workspace `119516` is on the **EU region**, so the host is `api-eu`, not `api`.

```
POST https://api-eu.customer.io/v1/send/email
Content-Type: application/json
Authorization: Bearer <APP_API_KEY>
```

The key is an **App API key** (Account Settings → API Credentials), not a Track
site-id/api-key pair.

Envelope:

| Field | Value | Notes |
|---|---|---|
| `transactional_message_id` | `"17"` | The id or the trigger name both work |
| `to` | the workspace's `supportEmail` | **Set on the API call.** The template leaves To empty on purpose |
| `message_data` | the object in §2 | Everything the body renders |
| `identifiers` | optional | Omit to send without attaching a profile; include `{ "id": "<cio profile id>" }` to attribute it |

`from`, `subject` and `body` exist on the endpoint but are **left out** — the
template already owns all three, and sending them overrides it.

## 2. `message_data`

Exactly the keys the template consumes. The Customer.io scaffold on the Review
step lists these and no others.

```jsonc
{
  "reason": "asked_for_human",       // asked_for_human | agent_stuck | frustration | topic_rule
  "behaviour": "immediate",          // immediate | card  — carried for parity, not rendered
  "escalated_at": "14:06 CET",
  "support_email": "support@acme.com",
  "first_message": "SSO login is failing for my team",
  "topic": "",                       // the matched Topic pill's label, "" when none matched
  "failed_answers": 2,               // triggers.failedAnswers.count
  "frustration_level": "Clear",      // Mild | Clear | Strong
  "brief": "I've connected Okta twice but my teammates still can't log in. The assistant walked me through the SSO guide and domain verification - the error is still there.",

  "user": {
    "id": "6a6304d1-9dc0-47ba-a5f3-6e4e28407b92",
    "name": "Marie Dubois",
    "first_name": "Marie",
    "email": "marie.dubois@acme.com",
    "avatar_url": "",                // optional; falls back to initials
    "profile_url": ""                // optional; defaults to https://app.usejimo.com/agent/escalation
  },

  "account": { "name": "Acme Corp", "plan": "Scale plan", "seats": 412 },

  "page": {
    "path": "/settings/sso",
    "url": "https://app.acme.com/settings/sso",
    "browser": "Chrome 128",
    "os": "macOS 15"
  },

  "transcript": [
    { "role": "user",  "time": "14:02", "text": "SSO login is failing for my team" },
    { "role": "agent", "time": "14:02", "text": "Let me check the SSO setup guide for you..." },
    { "role": "user",  "time": "14:04", "text": "I've already followed that, it didn't work" },
    { "role": "agent", "time": "14:04", "text": "Have you verified your domain in Okta?" },
    { "role": "user",  "time": "14:06", "text": "Verified twice, still the same error. Can I talk to a human?" },
    { "role": "agent", "time": "14:06", "text": "Of course - I'm bringing in the team now." }
  ]
}
```

That object is the template's saved sample data verbatim, so it is also the
canonical test payload.

### Field notes

- **`topic` is always sent, even when the reason is not `topic_rule`.**
  `matchTopic()` runs before the reason is decided and attaches the topic to
  whichever `Decision` comes back, so a `frustration` escalation on a matched
  topic carries both. Send `""` when nothing matched.
- **`user.email` may be blank.** An anonymous Jimo user has no email; the
  template detects that and renders “Anonymous” with the profile id as the
  subline. Send the key, empty.
- **`failed_answers` / `frustration_level` are the workspace's own settings**, not
  observed values. The email names the setting that produced the escalation, so
  a team reading it can tell a 2-strike workspace from a 3-strike one.
- Missing keys do not error — Customer.io renders transactional messages with
  missing variables as empty strings. Send every key.

## 3. Full example

```bash
curl -sS https://api-eu.customer.io/v1/send/email \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $CIO_APP_API_KEY" \
  -d '{
    "transactional_message_id": "17",
    "to": "support@acme.com",
    "message_data": { ... the object from §2 ... }
  }'
```

## 4. Message configuration

Read off template `166`, so this is what is already saved — not a spec to apply.

| Setting | Value |
|---|---|
| From | `Jimo <no-reply@jimo.email>` |
| To | *set in the API call* |
| Reply-To | not set — the reply path is the CTA button in the body, not the envelope |
| Layout | Empty Layout (the HTML is a complete document) |
| BCC | off (Fake BCC checked) |
| CSS pre-processing | on |
| Custom headers | 2 |
| Sending behaviour | sends to unsubscribed profiles; link clicks tracked |

**Subject** (one liquid line; the verb is the only part that varies):

```liquid
{% case trigger.reason %}{% when 'agent_stuck' %}Jimo couldn't answer {{ trigger.user.name }}{% when 'frustration' %}{{ trigger.user.name }} is losing patience{% when 'topic_rule' %}{{ trigger.topic | capitalize }} — {{ trigger.user.name }}{% else %}{{ trigger.user.name }} needs a person{% endcase %} — “{{ trigger.first_message | truncate: 60 }}”
```

`truncate: 60` is deliberate: Gmail shows ~70 characters on desktop and ~35 on iOS.

**Preheader:**

```liquid
{{ trigger.first_message }} — full transcript inside.
```

## 5. What each `reason` changes in the body

The template opens with a `case` on `trigger.reason` that assigns four variables;
everything downstream reads them. Nothing else in the email varies.

| `reason` | Chip (`pill`) | Trigger row (`trg`) | Row detail (`trgdetail`) | Headline |
|---|---|---|---|---|
| `asked_for_human` *(else)* | Asked for a human | Explicit request | — | `{name} needs a person` |
| `agent_stuck` | Jimo couldn't answer | Failed answers | `{failed_answers} in a row` | `Jimo couldn't answer {name}` |
| `frustration` | This is taking too long | Frustration | `{frustration_level}` | `{name} is losing patience` |
| `topic_rule` | Better handled by a person | Topic rule | `{topic}` | `{Topic} - {name}` |

The sub-headline is the same shape in all four: `{headline} - "{first_message}"`.

User, account, last page, browser/OS, the reply CTA and the footer are identical
across all four.

## 6. Status

The message is still in **setup** — Customer.io's Review step shows an *Activate*
button, and the transactional message only starts recording metrics once
activated and a first API call lands. Activating it is a deliberate step; it has
not been done.
