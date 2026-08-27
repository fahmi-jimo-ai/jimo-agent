/**
 * Fixtures for /statistics and /conversations — Figma 934:27942.
 *
 * Kept out of `fixtures.ts`, which is escalation-flavoured; `userProperties.ts`
 * is the precedent for a second data file.
 *
 * Everything here is DETERMINISTIC — a seeded LCG, not Math.random — for the
 * reason `fixtures.ts` already gives: the charts must be identical on every
 * render so screenshot diffs against the artboard stay meaningful.
 */
import type {
  AnalyticsRange,
  ResponseFilter,
  SegmentFilter,
  StatMetric,
} from '@/state/types';
import type { SourceKind } from '@/data/knowledgeSources';

/* Same generator as fixtures.ts. Duplicated rather than exported across, so
   changing one chart's silhouette can never silently reshape the other's. */
function lcg(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

/* ── Stat tiles ────────────────────────────────────────────────────────────
   The four figures the artboard prints, verbatim. `format` decides how the
   number is rendered; `suffix` is the artboard's "times" on the first tile. */
export interface StatTile {
  key: StatMetric;
  label: string;
  value: number;
  format: 'count' | 'percent';
  suffix?: string;
}

export const STAT_TILES: StatTile[] = [
  { key: 'opened', label: 'Copilot Opened', value: 12412, format: 'count', suffix: 'times' },
  { key: 'messages', label: 'Total Messages', value: 123123, format: 'count' },
  { key: 'users', label: 'Unique Users', value: 123123, format: 'count' },
  { key: 'success', label: 'Success Rate', value: 82, format: 'percent' },
];

export function formatStat(tile: StatTile): string {
  return tile.format === 'percent'
    ? `${tile.value}%`
    : tile.value.toLocaleString('en-US');
}

/* ── Usage chart ───────────────────────────────────────────────────────────
   One bar per day: a tall `usage` column, plus the small `like` / `dislike`
   footer the artboard stacks underneath it. The y-axis tops out at 75. */
export interface UsageDay {
  /** 0-based index within the window. */
  index: number;
  /** e.g. "May 9, 2025" — what the hover tooltip prints. */
  date: string;
  usage: number;
  like: number;
  dislike: number;
}

export const USAGE_SERIES = [
  { key: 'usage', label: 'Usage', color: 'var(--color-blue-200)' },
  // The -300 shades, matching REASON_SERIES' precedent in fixtures.ts: the -400s
  // read as alerts next to the light-blue column rather than as series colours.
  { key: 'like', label: 'Like', color: 'var(--color-green-300)' },
  { key: 'dislike', label: 'Dislike', color: 'var(--color-red-300)' },
] as const;

export const Y_MAX = 75;

/** How many daily buckets each range draws. `all-time` is the artboard's ~40. */
const RANGE_DAYS: Record<AnalyticsRange, number> = {
  'all-time': 40,
  'this-month': 31,
  'last-30-days': 30,
  'last-7-days': 7,
};

/**
 * Per-metric seed AND per-metric shape, so selecting a tile genuinely changes
 * the chart rather than relabelling the same bars.
 *
 * Note the bug in `HandoffsChart` that is deliberately not repeated here: it
 * memoises `buildChartDays()` with `[]` deps and passes no range, so its picker
 * only ever changes a label. Both arguments are real here.
 */
const METRIC_SHAPE: Record<StatMetric, { seed: number; base: number; spread: number }> = {
  opened: { seed: 20250509, base: 18, spread: 40 },
  messages: { seed: 20250510, base: 26, spread: 45 },
  users: { seed: 20250511, base: 12, spread: 30 },
  success: { seed: 20250512, base: 22, spread: 48 },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * The window's first day. Fixed, not `new Date()` — a fixture that moves with
 * the wall clock would make every screenshot diff a false positive.
 */
const WINDOW_START = { year: 2025, month: 3 /* Apr */, day: 3 };

function labelForIndex(index: number): string {
  // Plain day arithmetic over a 30-day month is enough for a fixture and keeps
  // the labels stable; nothing here is date maths anyone should rely on.
  const dayOfMonth = ((WINDOW_START.day + index - 1) % 30) + 1;
  const monthOffset = Math.floor((WINDOW_START.day + index - 1) / 30);
  const month = (WINDOW_START.month + monthOffset) % 12;
  const year = WINDOW_START.year + Math.floor((WINDOW_START.month + monthOffset) / 12);
  return `${MONTHS[month]} ${dayOfMonth}, ${year}`;
}

export function buildUsageDays(metric: StatMetric, range: AnalyticsRange): UsageDay[] {
  const { seed, base, spread } = METRIC_SHAPE[metric];
  const rand = lcg(seed);
  const count = RANGE_DAYS[range];
  const days: UsageDay[] = [];

  for (let index = 0; index < count; index++) {
    const usage = Math.min(Y_MAX, Math.round(base + rand() * spread));
    // Thin footer bands, sized in absolute axis units rather than as a share of
    // `usage`: the artboard draws them a few pixels tall whatever the column
    // above them does, and a proportional band turns into a block on tall days.
    const like = 2 + Math.round(rand() * 3);
    const dislike = 1 + Math.round(rand() * 2);
    days.push({ index, date: labelForIndex(index), usage, like, dislike });
  }
  return days;
}

/** The empty grid decision-8 asks for: axis and gridlines, no bars. */
export const EMPTY_USAGE: UsageDay[] = [];

/* ── Users reached ─────────────────────────────────────────────────────────
   The five rows the artboard draws, verbatim, including the repeated
   "Anonymous / #Jimer23123 / No email". */
export interface ReachedUser {
  id: string;
  name: string;
  handle: string;
  email: string | null;
  lastReached: string;
  segment: Exclude<SegmentFilter, 'all'>;
}

export const TOTAL_USERS = 2312;

export const USERS_REACHED: ReachedUser[] = [
  { id: 'u1', name: 'Anonymous', handle: '#Jimer23123', email: null, lastReached: '11 minutes ago', segment: 'new-users' },
  { id: 'u2', name: 'Anonymous', handle: '#Jimer23123', email: null, lastReached: 'Yesterday', segment: 'power-users' },
  { id: 'u3', name: 'Anonymous', handle: '#Jimer23123', email: null, lastReached: '2 days ago', segment: 'new-users' },
  { id: 'u4', name: 'Anonymous', handle: '#Jimer23123', email: null, lastReached: 'a week ago', segment: 'trialing' },
  { id: 'u5', name: 'Anonymous', handle: '#Jimer23123', email: null, lastReached: '2 weeks ago', segment: 'power-users' },
];

/* ── Conversations ─────────────────────────────────────────────────────────
   Same turn shape as `SAMPLE_TRANSCRIPT` in fixtures.ts, plus `feedback` —
   the artboard puts a Helpful / Not Helpful badge under some agent replies.

   Copy note: 934:29319 labels these "Helpful" / "Not Helpful" and 934:28534
   labels them "Liked" / "Disliked". The former ships (they describe the answer,
   not the reader's mood), and the four-filter toolbar from the latter ships
   with it. */
export interface ConversationTurn {
  from: 'user' | 'agent';
  at: string;
  text: string;
  feedback?: 'helpful' | 'not-helpful';
  /** Agent turns only — see the reasoning-trace block below. */
  steps?: ThinkingStep[];
  skills?: TriggeredSkill[];
  sources?: CitedSource[];
}

/* ── The reasoning trace ───────────────────────────────────────────────────
   INVENTED, and labelled as such, in the same spirit as `MATCHERS` in
   fixtures.ts and the 2s training delay in trainingTimers.ts. No artifact
   defines what an agent turn recorded while it was answering: the PRD does not
   model it, the escalation artboards do not draw it, and the one Figma frame
   that draws a trace — `12983:8096` in Interface-Knowledge — is a BROWSER agent
   filling a CRM form ("Go to Deals page", "Fill 12,000 in Amount field"), not a
   support agent answering from a knowledge base.

   So the SHAPE below is transcribed from that frame — an icon rail, a hairline
   connector, one label per step — and the CONTENT is made up to fit a support
   answer. `ThinkingStepKind` exists so the rail can pick a glyph without the
   fixture naming an icon; adding a kind means adding a glyph in
   `ThinkingTrace`, which is the point.

   `CitedSource` deliberately carries its own `label` / `kind` / `href` rather
   than being a bare id into `knowledgeSources.ts`. That is not duplication for
   convenience — a conversation is a HISTORICAL RECORD. The store starts empty
   (`knowledgeStore.ts` defaults `sources: []`; `DEMO_SOURCES()` only runs under
   the Demo switch) and a user can delete a source that an old answer used, so a
   citation that could only render by finding a live row would blank out exactly
   when the record matters most. `sourceId` is therefore a LINK, resolved at
   render time to decide whether "open in Knowledge" is offered at all — never
   the thing the row reads its own text from. */
export type ThinkingStepKind =
  | 'read'
  | 'navigate'
  | 'search'
  | 'compare'
  | 'draft'
  | 'escalate';

export interface ThinkingStep {
  kind: ThinkingStepKind;
  label: string;
}

/** A skill the turn fired. `/skills` is not built, so the id has nowhere to go
 *  yet — the chip acknowledges the click with the page's out-of-scope toast,
 *  the same contract `Test Knowledge` and `Export as CSV` already use. */
export interface TriggeredSkill {
  id: string;
  name: string;
}

export interface CitedSource {
  /** Matches a `KnowledgeSource.id` when the store still holds that row. */
  sourceId: string;
  /** Snapshot as of answering — see the block comment above. */
  label: string;
  kind: SourceKind;
  href?: string;
}

export interface Conversation {
  id: string;
  name: string;
  handle: string;
  email: string | null;
  /** Display string, e.g. "2 days ago". */
  at: string;
  /**
   * How old the conversation is, in days. Carried explicitly rather than
   * parsed back out of `at`: the range filter has to be able to narrow, and
   * reading prose to decide that is both fragile and untestable.
   */
  daysAgo: number;
  title: string;
  up: number;
  down: number;
  segment: Exclude<SegmentFilter, 'all'>;
  /** Date divider above the first turn, e.g. "Sat 15 Feb • 10:14 AM". */
  startedAt: string;
  transcript: ConversationTurn[];
}

/* The source ids below match `DEMO_SOURCES()` in knowledgeSources.ts, so with
   the Demo data switch on, a citation opens the row it names. With the switch
   off the store is empty, the citation still renders from its own snapshot, and
   only the "open in Knowledge" affordance drops away — which is the whole
   reason `CitedSource` carries its own text. */
const SRC_HOME: CitedSource = {
  sourceId: 'demo-url-home',
  label: 'https://usejimo.com',
  kind: 'url',
  href: 'https://usejimo.com',
};
const SRC_PRICING_PDF: CitedSource = {
  sourceId: 'demo-file-pricing',
  label: 'Jimo Pricing.pdf',
  kind: 'file',
};
const SRC_TOURS: CitedSource = {
  sourceId: 'demo-url-tours',
  label: 'https://usejimo.com/product/product-tours',
  kind: 'url',
  href: 'https://usejimo.com/product/product-tours',
};
const SRC_WHAT_IS_JIMO: CitedSource = {
  sourceId: 'demo-qa-what-is-jimo',
  label: 'What is Jimo?',
  kind: 'qa',
};

/** 934:28534's transcript, verbatim — the Login Issues thread. The reasoning
 *  trace on each agent turn is the invention documented above. */
const LOGIN_ISSUES: ConversationTurn[] = [
  { from: 'user', at: '10:14', text: 'Login Issues' },
  {
    from: 'agent',
    at: '10:14',
    text: 'I understand. Can you describe the issue youre facing?',
    feedback: 'not-helpful',
    // The turn that got a thumbs-down found nothing, and the trace says so —
    // an empty-handed trace is the most useful one on this page.
    steps: [
      { kind: 'read', label: 'Read the current page' },
      { kind: 'search', label: 'Searched knowledge for “login issues”' },
      { kind: 'compare', label: 'No source scored above the threshold' },
      { kind: 'draft', label: 'Asked a clarifying question instead' },
    ],
    skills: [{ id: 'skill-clarify', name: 'Ask to clarify' }],
  },
  { from: 'user', at: '10:15', text: 'Every time I try to log in, I get an error saying my password is incorrect.' },
  {
    from: 'agent',
    at: '10:15',
    text: 'Have you tried using the Forgot Password option to reset your password?',
    feedback: 'helpful',
    steps: [
      { kind: 'search', label: 'Searched knowledge for “password incorrect”' },
      { kind: 'compare', label: 'Matched 2 sources on account recovery' },
      { kind: 'draft', label: 'Drafted an answer from the top match' },
    ],
    skills: [{ id: 'skill-answer', name: 'Answer from knowledge' }],
    sources: [SRC_WHAT_IS_JIMO, SRC_HOME],
  },
  { from: 'user', at: '10:16', text: 'Yes, but I didnt receive the reset email.' },
  {
    from: 'agent',
    at: '10:16',
    text: 'Thanks — that usually means the address on file differs from the one you are checking. I can raise this with a human so they can confirm it for you.',
    steps: [
      { kind: 'search', label: 'Searched knowledge for “reset email not received”' },
      { kind: 'compare', label: 'No source covers mailbox delivery' },
      { kind: 'escalate', label: 'Matched the Login Issues escalation topic' },
      { kind: 'draft', label: 'Offered a hand-off to the support team' },
    ],
    skills: [
      { id: 'skill-escalate', name: 'Escalate to a human' },
      { id: 'skill-summarise', name: 'Summarise the thread' },
    ],
  },
];

const GENERIC: ConversationTurn[] = [
  { from: 'user', at: '09:02', text: 'How do I get started with this?' },
  {
    from: 'agent',
    at: '09:02',
    text: 'Happy to help. Which part are you setting up first?',
    steps: [
      { kind: 'read', label: 'Read the current page' },
      { kind: 'compare', label: 'Question is too broad to answer directly' },
      { kind: 'draft', label: 'Asked which area to start with' },
    ],
    skills: [{ id: 'skill-clarify', name: 'Ask to clarify' }],
  },
  { from: 'user', at: '09:03', text: 'The segment rules, mostly.' },
  {
    from: 'agent',
    at: '09:03',
    text: 'Segments are built from user properties you have already shared with the agent. Open Knowledge → User Context to see which ones are available.',
    feedback: 'helpful',
    steps: [
      { kind: 'search', label: 'Searched knowledge for “segment rules”' },
      { kind: 'compare', label: 'Matched 3 sources on segments and properties' },
      { kind: 'navigate', label: 'Resolved the Knowledge → User Context path' },
      { kind: 'draft', label: 'Drafted an answer with the route to follow' },
    ],
    skills: [
      { id: 'skill-answer', name: 'Answer from knowledge' },
      { id: 'skill-navigate', name: 'Point to a page' },
    ],
    sources: [SRC_TOURS, SRC_PRICING_PDF, SRC_HOME],
  },
];

/**
 * The artboard's list, including its own repetition — it draws the same
 * "UXWiz #DesignPro / Understanding user needs…" row eleven times to show the
 * pane scrolling. Kept, because a list that scrolls is the thing being drawn.
 */
export const CONVERSATIONS: Conversation[] = [
  { id: 'c1', name: 'Thomas Moussafer', handle: 'cb6e4bd4-4c15-4a4e-9d05-2f8c1b7a9e31', email: 'thomas@usejimo.com', at: '2 days ago', daysAgo: 2, title: 'User segments and its relationship with hints', up: 0, down: 0, segment: 'power-users', startedAt: 'Sat 15 Feb • 10:14 AM', transcript: LOGIN_ISSUES },
  { id: 'c2', name: 'InsightsGuru', handle: '#Techie123', email: null, at: '1 day ago', daysAgo: 1, title: 'Enhancing user experience through data', up: 5, down: 2, segment: 'new-users', startedAt: 'Sun 16 Feb • 09:02 AM', transcript: GENERIC },
  { id: 'c3', name: 'MarketMaven', handle: '#Trendy2023', email: null, at: '3 days ago', daysAgo: 3, title: 'The impact of UI design on conversion', up: 8, down: 1, segment: 'trialing', startedAt: 'Fri 14 Feb • 09:02 AM', transcript: GENERIC },
  { id: 'c4', name: 'DataDynamo', handle: '#AnalystX45', email: null, at: '5 hours ago', daysAgo: 0, title: 'Leveraging analytics for better decisions', up: 15, down: 4, segment: 'power-users', startedAt: 'Mon 17 Feb • 09:02 AM', transcript: GENERIC },
  { id: 'c5', name: 'CreativeMind', handle: '#ArtisticSoul', email: null, at: '12 hours ago', daysAgo: 0, title: 'Innovative approaches to onboarding', up: 3, down: 0, segment: 'new-users', startedAt: 'Mon 17 Feb • 09:02 AM', transcript: GENERIC },
  // The artboard repeats this row eleven times to show the pane scrolling, so
  // it is kept — but the ages are spread, or the range picker could never
  // narrow and would be the label-only control HandoffsChart's already is.
  ...Array.from({ length: 11 }, (_, i) => {
    const daysAgo = [4, 4, 6, 9, 12, 15, 21, 28, 34, 41, 55][i];
    const at =
      daysAgo < 7
        ? `${daysAgo} days ago`
        : daysAgo < 30
          ? `${Math.round(daysAgo / 7)} weeks ago`
          : `${Math.round(daysAgo / 30)} month${daysAgo >= 45 ? 's' : ''} ago`;
    return {
      id: `c${6 + i}`,
      name: 'UXWiz',
      handle: '#DesignPro',
      email: null,
      at,
      daysAgo,
      title: 'Understanding user needs in product design',
      up: 10,
      down: 7,
      segment: (['new-users', 'power-users', 'trialing'] as const)[i % 3],
      startedAt: 'Thu 13 Feb • 09:02 AM',
      transcript: GENERIC,
    };
  }),
];

/* ── Filtering ─────────────────────────────────────────────────────────────
   A pure function so it can be tested without a DOM — the same shape as
   `classifyChip`, which is the only other tested module here. */
export interface ConversationFilters {
  search: string;
  response: ResponseFilter;
  segment: SegmentFilter;
  range: AnalyticsRange;
}

/** How far back each range reaches, in days. `all-time` reaches everything. */
const RANGE_WINDOW: Record<AnalyticsRange, number> = {
  'all-time': Infinity,
  'this-month': 31,
  'last-30-days': 30,
  'last-7-days': 7,
};

export function filterConversations(
  list: Conversation[],
  { search, response, segment, range }: ConversationFilters
): Conversation[] {
  const q = search.trim().toLowerCase();
  return list.filter((c) => {
    const byQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q);
    const byResponse =
      response === 'all' || c.transcript.some((t) => t.feedback === response);
    const bySegment = segment === 'all' || c.segment === segment;
    const byRange = c.daysAgo <= RANGE_WINDOW[range];
    return byQuery && byResponse && bySegment && byRange;
  });
}
