import type { TopicCategory } from '@/lib/classifyChip';

export type Vendor = 'intercom' | 'zendesk' | 'crisp' | 'email';
export type FailedCount = 1 | 2 | 3;
export type FrustrationLevel = 'mild' | 'clear' | 'strong';
export type Range = 'this-month' | 'last-30-days' | 'last-7-days';

/**
 * Crisp's API credentials. Crisp is the one vendor here that is NOT an OAuth
 * redirect — its hand-off integration is a workspace token pair you paste in,
 * so it needs somewhere to live. Intercom and Zendesk keep nothing locally:
 * their placeholder redirect stands in for a real authorisation.
 */
export interface CrispCredentials {
  websiteId: string;
  tokenIdentifier: string;
  tokenKey: string;
}

export interface Topic {
  id: string;
  label: string;
  category: TopicCategory;
}

export interface Triggers {
  explicit: { on: boolean };
  failedAnswers: { on: boolean; count: FailedCount };
  frustration: { on: boolean; level: FrustrationLevel };
}

export interface Suggestions {
  status: 'idle' | 'generating' | 'ready';
  items: Topic[];
  selectedIds: string[];
  collapsed: boolean;
}

export interface EscalationState {
  enabled: boolean;
  /** Whether any hand-off has happened yet. Gates the chart — see PRD 5.9. */
  hasHandoffs: boolean;
  vendor: Vendor | null;
  supportEmail: string | null;
  /** Set once the Crisp credentials form has been submitted. */
  crisp: CrispCredentials | null;
  /** Committed triggers — what the agent actually runs on. */
  triggers: Triggers;
  /** Edited by the trigger cards. `Confirm` copies draft -> triggers. */
  draftTriggers: Triggers;
  topics: Topic[];
  suggestions: Suggestions;
  range: Range;
  /**
   * "Populated workspace" demo. Toggled from the third Configuration row, in
   * dev and in the deployed build alike. See `src/state/demo.ts` — turning it
   * off restores the snapshot taken when it was turned on.
   */
  demo: boolean;
}

export const VENDOR_LABEL: Record<Vendor, string> = {
  intercom: 'Intercom',
  zendesk: 'Zendesk',
  crisp: 'Crisp Chat',
  email: 'Support Email',
};

export const DEFAULT_TRIGGERS: Triggers = {
  explicit: { on: true },
  failedAnswers: { on: true, count: 2 },
  frustration: { on: true, level: 'clear' },
};

export const INITIAL_STATE: EscalationState = {
  enabled: false,
  hasHandoffs: false,
  vendor: null,
  supportEmail: null,
  crisp: null,
  triggers: DEFAULT_TRIGGERS,
  draftTriggers: DEFAULT_TRIGGERS,
  topics: [],
  suggestions: { status: 'idle', items: [], selectedIds: [], collapsed: false },
  range: 'this-month',
  demo: false,
};

/* ────────────────────────────────────────────────────────────────────────────
 * Analytics — the /statistics and /conversations pages.
 *
 * Figma 42KccejbNYeHc3EP5P8vHd section 934:27942 draws these as ONE page called
 * "Analyze" with a Statistics|Conversations tab bar. They ship as two routed
 * pages instead, because `AGENT_NAV_SECTIONS` has always listed them as two
 * peer sidebar items and the tab bar was a second, competing switcher for the
 * same choice. The artboards are otherwise followed as drawn.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Deliberately NOT escalation's `Range`. That enum has no `all-time`, and the
 * two pickers are unrelated controls — sharing a type would let one page's
 * default silently become the other's.
 */
export type AnalyticsRange = 'all-time' | 'this-month' | 'last-30-days' | 'last-7-days';

/** Which stat tile is selected. The selection is what the chart plots. */
export type StatMetric = 'opened' | 'messages' | 'users' | 'success';

export type ResponseFilter = 'all' | 'helpful' | 'not-helpful';
export type SegmentFilter = 'all' | 'new-users' | 'power-users' | 'trialing';

/**
 * Whether the reach table counts people or accounts — PRD-587.
 *
 * It lives in `AnalyticsState` rather than in component state because it is
 * configuration, not where a reader is inside a page: a B2B workspace whose
 * unit of account is the company wants that to still be true on the next
 * visit. Same line `ThinkingTrace` draws for its open state, on the other side.
 */
export type ReachGrouping = 'user' | 'company';

export const GROUPING_LABEL: Record<ReachGrouping, string> = {
  user: 'By user',
  company: 'By company',
};

export interface AnalyticsState {
  /** Gates the zeroed-tile state — the analytics twin of `hasHandoffs`. */
  hasData: boolean;
  range: AnalyticsRange;
  metric: StatMetric;
  /** "All Segments" on the Users reached card. */
  segment: SegmentFilter;
  /** People or accounts, on that same card — PRD-587. */
  grouping: ReachGrouping;

  /** Gates "No conversations yet" (934:30359), which hides the toolbar too. */
  hasConversations: boolean;
  convoSearch: string;
  convoRange: AnalyticsRange;
  convoResponse: ResponseFilter;
  convoSegment: SegmentFilter;
  convoSelectedId: string | null;
}

export const RANGE_LABEL: Record<AnalyticsRange, string> = {
  'all-time': 'All Time',
  'this-month': 'This month',
  'last-30-days': 'Last 30 days',
  'last-7-days': 'Last 7 days',
};

export const RESPONSE_LABEL: Record<ResponseFilter, string> = {
  all: 'All Responses',
  helpful: 'Helpful',
  'not-helpful': 'Not Helpful',
};

export const SEGMENT_LABEL: Record<SegmentFilter, string> = {
  all: 'All Segments',
  'new-users': 'New users',
  'power-users': 'Power users',
  trialing: 'Trialing',
};

export const INITIAL_ANALYTICS: AnalyticsState = {
  hasData: true,
  range: 'all-time',
  // 934:27943 draws the Success Rate tile selected, so that is the default.
  metric: 'success',
  segment: 'all',
  // Users, because that is what the artboard draws and what most workspaces
  // measure. A B2B workspace switches once and it sticks.
  grouping: 'user',
  hasConversations: true,
  convoSearch: '',
  convoRange: 'all-time',
  convoResponse: 'all',
  convoSegment: 'all',
  convoSelectedId: null,
};
