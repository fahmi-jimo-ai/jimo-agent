import type { TopicCategory } from '@/lib/classifyChip';

export type Vendor = 'intercom' | 'zendesk' | 'crisp' | 'email' | 'webhook';
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

/**
 * The events a webhook subscription can carry — PRD-592.
 *
 * PRD-591 is the productised hand-off ("create a ticket in MY tool") and
 * PRD-592 is the raw data path ("push the conversation to my endpoint"). They
 * are one settings surface here rather than two, because both are the same
 * missing capability: the agent has no way to talk to a tool we do not ship an
 * integration for. `escalation` is what PRD-591 needs; the other three are
 * PRD-592's catalogue.
 */
export type WebhookEvent =
  | 'escalation'
  | 'unanswered'
  | 'conversation-started'
  | 'conversation-ended';

export const WEBHOOK_EVENTS: WebhookEvent[] = [
  'escalation',
  'unanswered',
  'conversation-started',
  'conversation-ended',
];

export const WEBHOOK_EVENT_LABEL: Record<WebhookEvent, string> = {
  escalation: 'Escalation triggered',
  unanswered: 'Agent could not answer',
  'conversation-started': 'Conversation started',
  'conversation-ended': 'Conversation ended',
};

export const WEBHOOK_EVENT_HINT: Record<WebhookEvent, string> = {
  escalation: 'The hand-off itself — transcript, the unanswered question, and who asked.',
  unanswered: 'Fires before any hand-off, so you can catch gaps the agent recovered from.',
  'conversation-started': 'One call per conversation opened.',
  'conversation-ended': 'Carries the full transcript and the resolution.',
};

/**
 * A customer's own endpoint. Unlike the three chat vendors this is not an
 * integration we ship — it is the escape hatch for the support tools we do not
 * (Freshdesk, an in-house desk, a queue).
 *
 * Persisted locally for the same reason `crisp` is: there is no OAuth redirect
 * standing in for it, so the values a user pastes have to live somewhere.
 */
export interface WebhookConfig {
  url: string;
  /** Optional. Signs the payload so the receiver can verify it came from us. */
  secret: string;
  events: WebhookEvent[];
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
  /** Set once the webhook endpoint form has been submitted. */
  webhook: WebhookConfig | null;
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
  // Not a brand name, because it is not a vendor: it is whatever desk the
  // customer already runs. "Custom webhook" says that; "Webhook" alone reads
  // like a fifth product we integrate with.
  webhook: 'Custom webhook',
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
  webhook: null,
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

export interface AnalyticsState {
  /** Gates the zeroed-tile state — the analytics twin of `hasHandoffs`. */
  hasData: boolean;
  range: AnalyticsRange;
  metric: StatMetric;
  /** "All Segments" on the Users reached card. */
  segment: SegmentFilter;

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
  hasConversations: true,
  convoSearch: '',
  convoRange: 'all-time',
  convoResponse: 'all',
  convoSegment: 'all',
  convoSelectedId: null,
};
