import type { TopicCategory } from '@/lib/classifyChip';

export type Vendor = 'intercom' | 'zendesk' | 'crisp' | 'email';
export type FailedCount = 1 | 2 | 3;
export type FrustrationLevel = 'subtle' | 'slight' | 'furious';
export type Range = 'this-month' | 'last-30-days' | 'last-7-days';

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
  frustration: { on: true, level: 'slight' },
};

export const INITIAL_STATE: EscalationState = {
  enabled: false,
  hasHandoffs: false,
  vendor: null,
  supportEmail: null,
  triggers: DEFAULT_TRIGGERS,
  draftTriggers: DEFAULT_TRIGGERS,
  topics: [],
  suggestions: { status: 'idle', items: [], selectedIds: [], collapsed: false },
  range: 'this-month',
  demo: false,
};
