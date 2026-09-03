/**
 * Agent skills — Figma section `12987:11525` ("Building Skill from Dashboard").
 *
 * The list page (`12987:11526`) supplies the table and the two stat cards; the
 * drawer (`12987:14597` / `12987:15826`) supplies everything a row knows beyond
 * its cells — mode, host page, description, instructions and its own usage.
 *
 * Same convention as `knowledgeSources.ts` and `interfacePages.ts`: a skill is
 * created by the user, so the whole record is persisted rather than an id into
 * a fixture.
 *
 * ## The copy is this app's, the layout is the artboard's
 *
 * Every skill the artboards name — "Create new deal", "Analyze report",
 * "Create a new folder" — belongs to a CRM. That is the same frame family
 * CLAUDE.md already resolves for the reasoning trace: "that frame is a BROWSER
 * agent filling a CRM form, so every step, skill and citation the support
 * transcripts carry is made up". The resolution is repeated here, and it buys
 * something concrete: `DEMO_SKILLS` uses the five skill ids that conversation
 * traces in `analytics.ts` ALREADY cite, so the Usage tab's conversation list is
 * real data and the skill chip on `/conversations` links to a row that exists.
 *
 * ## Two artboard sets disagree, and both readings are recorded
 *
 * - Mode chips read `Execute` / `Guide` / `Explain` in the newer frames and
 *   `Agent acts` / `Agent guides` / `Explanation` in `12987:14597`. One label
 *   per mode wins — the newer one — so the table chip and the drawer's `Mode:`
 *   field can never disagree.
 * - The Add Skill menu's titles are stable across every frame and are a
 *   different register entirely ("Execute a flow"), so they are their own map.
 *
 * ## Invented, and labelled as such
 *
 * Everything numeric past the figures the artboards print — `6,248`, `▲ 5%`,
 * `321 Usage`, `193 Completed (82%)`, `42 Conversations` — comes from the seeded
 * generators at the bottom of this file. The instructions prose is modelled on
 * `12248:5817`'s shape (goal → inputs → numbered steps → failure note) with this
 * app's subject matter.
 */
import { CONVERSATIONS, type Conversation } from '@/data/analytics';
import type { IconTint } from '@/components/ui/ContainedIcon/ContainedIcon';

export type SkillMode = 'execute' | 'guide' | 'explain';

/** Menu order, and the order the mode filter lists them. */
export const SKILL_MODES: SkillMode[] = ['execute', 'guide', 'explain'];

/** The table's Mode chip and the drawer's `Mode:` field — one label, both places. */
export const SKILL_MODE_LABEL: Record<SkillMode, string> = {
  execute: 'Execute',
  guide: 'Guide',
  explain: 'Explain',
};

/** Chip colour, per `12244:814`. */
export const SKILL_MODE_TINT: Record<SkillMode, IconTint> = {
  execute: 'green',
  guide: 'blue',
  explain: 'purple',
};

/**
 * The `Add Skill` menu — copy transcribed verbatim from `12987:11928`, down to
 * the phrasing of each helper line.
 */
export const SKILL_MODE_MENU: Record<SkillMode, { title: string; description: string }> = {
  execute: {
    title: 'Execute a flow',
    description:
      'The agent completes the task by clicking, filling in forms, and navigating on behalf of the user.',
  },
  guide: {
    title: 'Guide user in a flow',
    description:
      'The user stays in control. The agent shows steps, checks results, and corrects errors.',
  },
  explain: {
    title: 'Answer complex questions',
    description:
      'The agent answers in text only using relevant elements and knowledge sources.',
  },
};

/**
 * Whether a skill belongs to one screen or to the whole product — PRD-584.
 *
 * This is NOT the same question as "does `pageId` resolve", and collapsing the
 * two would lose the distinction `SkillDescriptionTab` already draws: a skill
 * whose page was deleted is BROKEN and says so, while a global skill was never
 * about a screen in the first place. Gojob's recruiters ask "how long does a
 * contract last" from wherever they happen to be standing; anchoring that to
 * the homepage is a lie about the skill, and the homepage becomes a dumping
 * ground for everything generic.
 *
 * `scope: 'global'` therefore ignores `pageId` rather than requiring it to be
 * null — a skill can be promoted to global and demoted back without losing the
 * page it came from.
 */
export type SkillScope = 'page' | 'global';

export const SKILL_SCOPES: SkillScope[] = ['page', 'global'];

export function isSkillScope(value: unknown): value is SkillScope {
  return typeof value === 'string' && (SKILL_SCOPES as string[]).includes(value);
}

export interface Skill {
  id: string;
  name: string;
  /** The table's second line, and the drawer's Description block. */
  description: string;
  /** The drawer's Instructions block — free prose, newlines significant. */
  instructions: string;
  mode: SkillMode;
  /** Page-scoped or site-wide. See `SkillScope` — PRD-584. */
  scope: SkillScope;
  /** → `InterfacePage.id`. The drawer's `Interface: Dashboard ↗`.
   *  Ignored while `scope` is `'global'`. */
  pageId: string | null;
  active: boolean;
  /** Epoch ms — the Last updated column is relative, so an absolute would age. */
  updatedAt: number;
  /** Total runs. 0 is what makes the chip read "No runs yet". */
  usage: number;
  /** Runs that finished. Never above `usage`. */
  completed: number;
}

export function isSkillMode(value: unknown): value is SkillMode {
  return typeof value === 'string' && (SKILL_MODES as string[]).includes(value);
}

/**
 * The Completion rate cell. `null`, not 0, when the skill has never run — the
 * artboard gives that case its own chip ("No runs yet") rather than printing 0%,
 * and a skill that has not run is not a skill that fails.
 */
export function completionRate(skill: Skill): number | null {
  if (skill.usage <= 0) return null;
  return Math.round((skill.completed / skill.usage) * 100);
}

/** Ids are only ever local, so a counter plus the mode is enough. */
let seq = 0;
export function makeSkillId(mode: SkillMode): string {
  seq += 1;
  return `${mode}-${seq}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * The conversations whose reasoning traces actually fired this skill.
 *
 * Read off the transcripts rather than stored on the skill: a conversation is a
 * historical record and the skill store is editable, so anything cached here
 * would be a second copy free to drift from the trace the reader can see.
 */
export function conversationsForSkill(
  skillId: string,
  list: Conversation[] = CONVERSATIONS,
): Conversation[] {
  return list.filter((c) =>
    c.transcript.some((turn) => turn.skills?.some((s) => s.id === skillId)),
  );
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The seeded skills. A factory, not a constant, for the reason `DEMO_SOURCES`
 * gives: `updatedAt` is rendered relative, so a module-level literal would drift
 * to "3d ago" the moment the tab is left open.
 *
 * The first five ids are the ones `analytics.ts` traces already cite. The last
 * two exist to give the table a row with `usage: 0` (the "No runs yet" chip) and
 * a disabled row, both of which the artboard draws and neither of which any
 * cited skill happens to be.
 */
export function DEMO_SKILLS(): Skill[] {
  const now = Date.now();

  return [
    {
      id: 'skill-answer',
      name: 'Answer from knowledge',
      description:
        'Answers a product question in text, citing the knowledge sources it used. Use when the user asks how something works rather than asking to be taken somewhere.',
      instructions: [
        'Your goal is to answer the user\'s question in text, using only the indexed knowledge sources, and to cite what you used.',
        '',
        'Inputs needed from the user: the question itself. Nothing else is required.',
        '',
        'Steps:',
        '1. Read the question and identify the product concept it is about.',
        '2. Search the knowledge sources for that concept. Prefer a source that states the answer directly over one that implies it.',
        '3. If two sources disagree, prefer the more recently trained one and say that they disagree.',
        '4. Answer in at most three short paragraphs. Lead with the answer, then the caveat.',
        '5. Cite every source the answer leaned on, so the reader can check it.',
        '',
        'If something goes wrong: if no source covers the question, say so plainly and offer to escalate rather than guessing from general knowledge.',
      ].join('\n'),
      mode: 'explain',
      scope: 'page',
      pageId: 'page-dashboard',
      active: true,
      updatedAt: now - 2 * DAY,
      usage: 321,
      completed: 193,
    },
    {
      id: 'skill-clarify',
      name: 'Ask to clarify',
      description:
        'Asks one narrowing question when a request could mean two different things. Use before answering anything ambiguous, never after.',
      instructions: [
        'Your goal is to replace an ambiguous request with a specific one by asking exactly one question.',
        '',
        'Inputs needed from the user: their answer to the question you ask.',
        '',
        'Steps:',
        '1. Identify the two or three readings the request could have.',
        '2. Ask ONE question that separates them. Offer the readings as options rather than asking an open question.',
        '3. Wait. Do not answer any of the readings speculatively while waiting.',
        '4. Once answered, hand off to the skill that fits the clarified request.',
        '',
        'If something goes wrong: if the reply is still ambiguous, answer the most likely reading and say which one you picked.',
      ].join('\n'),
      mode: 'explain',
      // PRD-584: these two were never about a screen — they are the case the
      // ticket is asking for, and they now say so instead of reading as a
      // skill that lost its page.
      scope: 'global',
      pageId: null,
      active: true,
      updatedAt: now - 6 * HOUR,
      usage: 324,
      completed: 285,
    },
    {
      id: 'skill-navigate',
      name: 'Point to a page',
      description:
        'Walks the user to the right screen, one step at a time, waiting for them at each one. Use when the answer is a place in the product rather than a fact.',
      instructions: [
        'Your goal is to get the user to the screen that answers their question, without touching their account yourself.',
        '',
        'Inputs needed from the user: confirmation at each step. Do not advance on your own.',
        '',
        'Steps:',
        '1. Name the destination screen before you start, so the user knows where this ends.',
        '2. Highlight the next control to click. One control per step, never two.',
        '3. Wait for the user to act, then verify the page actually changed before continuing.',
        '4. If the page did not change, say what you expected to see and offer the direct link instead.',
        '5. On arrival, point at the specific element that answers the original question.',
        '',
        'If something goes wrong: if a step\'s control is missing, stop and escalate rather than improvising a different route.',
      ].join('\n'),
      mode: 'guide',
      scope: 'page',
      pageId: 'page-dashboard',
      active: true,
      updatedAt: now - 3 * DAY,
      usage: 324,
      completed: 143,
    },
    {
      id: 'skill-summarise',
      name: 'Summarise the thread',
      description:
        'Condenses a long back-and-forth into what was asked, what was tried and what is still open. Use before a handoff to a human.',
      instructions: [
        'Your goal is to produce a summary a human agent can act on without reading the transcript.',
        '',
        'Inputs needed from the user: none. Read the transcript.',
        '',
        'Steps:',
        '1. State the original request in one sentence, in the user\'s own terms.',
        '2. List what has already been tried and what each attempt produced.',
        '3. State what is still unresolved, and what you would try next.',
        '4. Keep it under 120 words. A summary nobody reads is worse than no summary.',
        '',
        'If something goes wrong: if the thread has no clear request, say that explicitly rather than inventing one.',
      ].join('\n'),
      mode: 'explain',
      // PRD-584: these two were never about a screen — they are the case the
      // ticket is asking for, and they now say so instead of reading as a
      // skill that lost its page.
      scope: 'global',
      pageId: null,
      active: true,
      updatedAt: now - 8 * DAY,
      usage: 96,
      completed: 84,
    },
    {
      id: 'skill-escalate',
      name: 'Escalate to a human',
      description:
        'Opens a ticket in the connected support tool with the transcript and severity attached. Use when the user asks for a person, or twice fails to get an answer.',
      instructions: [
        'Your goal is to hand the conversation to a human with enough context that they do not have to ask again.',
        '',
        'Inputs needed from the user: their email if the session is anonymous. Severity is inferred, not asked.',
        '',
        'Steps:',
        '1. Confirm the user actually wants a human. Do not escalate silently.',
        '2. Run the summarise skill and attach its output to the ticket body.',
        '3. Classify severity from the transcript\'s wording, not from the user\'s tone alone.',
        '4. Create the ticket in the configured support tool and show the user its reference.',
        '5. Tell the user what happens next and roughly when.',
        '',
        'If something goes wrong: if the support tool rejects the ticket, fall back to the escalation email and say that you did.',
      ].join('\n'),
      mode: 'execute',
      scope: 'page',
      pageId: 'page-integrations',
      active: true,
      updatedAt: now - 45 * MINUTE,
      usage: 324,
      completed: 285,
    },
    {
      id: 'skill-billing-update',
      name: 'Update the payment method',
      description:
        'Fills in a new card on the billing screen and saves it on the user\'s behalf. Use when a payment has failed and the user asks you to fix it.',
      instructions: [
        'Your goal is to replace the card on file so the next renewal succeeds.',
        '',
        'Inputs needed from the user: card number (required), expiry (required), CVC (required), billing email (optional, defaults to the account owner).',
        '',
        'Steps:',
        '1. Open Settings → Billing & Plan. Confirm the current plan is shown before continuing.',
        '2. Click "Update payment method". A card form appears.',
        '3. Fill the Card number field with {{card_number}}. Confirm the field shows a masked value.',
        '4. Fill Expiry with {{expiry}} and CVC with {{cvc}}.',
        '5. If {{billing_email}} was given, replace the Billing email field with it.',
        '6. Click Save. Wait for the success state — do not report success from having clicked.',
        '',
        'If something goes wrong: if the card is declined, do not retry it. Report the decline reason verbatim and stop.',
      ].join('\n'),
      mode: 'execute',
      scope: 'page',
      pageId: 'page-billing',
      active: true,
      updatedAt: now - 20 * MINUTE,
      usage: 0,
      completed: 0,
    },
    {
      id: 'skill-invite-teammate',
      name: 'Invite a teammate',
      description:
        'Sends a workspace invite with the right role. Use when the user asks to add somebody to their team.',
      instructions: [
        'Your goal is to send a workspace invite to one new teammate.',
        '',
        'Inputs needed from the user: email (required), role (optional, defaults to Member).',
        '',
        'Steps:',
        '1. Open Settings → Team & Permissions.',
        '2. Enter {{email}} in the "Invite by email" field.',
        '3. Set the Role select to {{role}}. If none was given, leave it on Member.',
        '4. Click "Send invite" and confirm the address appears under Pending invites.',
        '',
        'If something goes wrong: if the workspace is at its seat limit, stop and explain that a plan change is needed first.',
      ].join('\n'),
      mode: 'execute',
      scope: 'page',
      pageId: 'page-team',
      active: false,
      updatedAt: now - 14 * DAY,
      usage: 12,
      completed: 5,
    },
  ];
}

/* ── Charts ────────────────────────────────────────────────────────────────
   Same generator idiom as `analytics.ts` and `fixtures.ts`: a seeded LCG, never
   `Math.random`, so the silhouettes are identical on every render and a
   screenshot diff against the artboard stays meaningful. Duplicated rather than
   imported across, for the reason `analytics.ts` states — changing one chart's
   shape must not silently reshape another's. */

function lcg(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

/** The y-axis both list-page cards draw: 0 / 25 / 75. */
export const SKILL_Y_MAX = 75;

export interface UsesPoint {
  index: number;
  value: number;
}

export interface SkillUses {
  points: UsesPoint[];
  /** The card's headline figure and its delta chip — both printed on 12987:11526. */
  total: number;
  deltaPct: number;
  startLabel: string;
  endLabel: string;
}

/**
 * `Skill uses` — a rising line with local wobble, matching the artboard's
 * silhouette: it ends near the top of the plot after a run of small dips.
 */
export function buildSkillUses(): SkillUses {
  const rand = lcg(20260828);
  const count = 30;
  const points: UsesPoint[] = [];
  for (let index = 0; index < count; index++) {
    const trend = 18 + (index / (count - 1)) * 44;
    const wobble = (rand() - 0.5) * 14;
    points.push({ index, value: Math.max(4, Math.min(SKILL_Y_MAX, trend + wobble)) });
  }
  return {
    points,
    total: 6248,
    deltaPct: 5,
    startLabel: 'Jan 27',
    endLabel: 'Feb 27',
  };
}

export interface OutcomeWeek {
  label: string;
  resolved: number;
  abandoned: number;
}

/**
 * `Resolved vs abandoned` — six weekly columns. The artboard's first column is
 * visibly paler than the rest; that is the week the data starts mid-way, so it
 * is modelled as a genuinely smaller bar rather than a different fill.
 */
export function buildSkillOutcomes(): OutcomeWeek[] {
  const rand = lcg(20260829);
  const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'This wk'];
  return labels.map((label, i) => {
    const resolved = Math.round(24 + i * 4 + rand() * 10);
    const abandoned = Math.round(4 + rand() * 6);
    return { label, resolved, abandoned };
  });
}

export interface SkillUsageDay {
  index: number;
  label: string;
  completed: number;
  dropped: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * The drawer's stacked Completed / Dropped bars (`12987:15826`), whose axis runs
 * Jan 21 → Feb 27 in fourteen buckets.
 *
 * The two end labels are the artboard's and they are load-bearing, so the dates
 * are real day-of-year arithmetic rather than a "+3 days per bucket" step: a
 * fixed step overshoots into a Feb 30 that does not exist, and an axis that
 * disagrees with the frame it was transcribed from is worse than no axis.
 * Buckets are spread evenly across the span and the last one lands exactly on
 * the end date by construction.
 *
 * Seeded from the skill's OWN id, so two skills never draw the same chart and a
 * given skill always draws the same one.
 */
const USAGE_START_DOY = 21; // Jan 21
const USAGE_END_DOY = 31 + 27; // Feb 27
const USAGE_BUCKETS = 14;

/** Day-of-year → "Mon D", for a non-leap year. Jan/Feb is all this needs. */
function doyLabel(doy: number): string {
  let day = doy;
  let month = 0;
  const lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  while (day > lengths[month]) {
    day -= lengths[month];
    month += 1;
  }
  return `${MONTHS[month]} ${day}`;
}

export function buildSkillUsageDays(skillId: string): SkillUsageDay[] {
  let seed = 0;
  for (let i = 0; i < skillId.length; i++) seed = (seed * 31 + skillId.charCodeAt(i)) % 4294967296;
  const rand = lcg(seed + 7919);

  const span = USAGE_END_DOY - USAGE_START_DOY;
  const days: SkillUsageDay[] = [];
  for (let index = 0; index < USAGE_BUCKETS; index++) {
    const completed = Math.round(20 + rand() * 26);
    const dropped = Math.round(4 + rand() * 14);
    const doy = Math.round(USAGE_START_DOY + (index / (USAGE_BUCKETS - 1)) * span);
    days.push({ index, label: doyLabel(doy), completed, dropped });
  }
  return days;
}

export const SKILL_USAGE_SERIES = [
  { key: 'completed', label: 'Completed', color: 'var(--color-green-300)' },
  { key: 'dropped', label: 'Dropped', color: 'var(--color-red-200)' },
] as const;
