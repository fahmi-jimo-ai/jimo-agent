/**
 * In-app experiences — Tours, Surveys, Banners, Hints, Checklists and Resource
 * Centers.
 *
 * ## Sources, and which one wins
 *
 * > **The two skeletons** (Agent Designer Sandbox `z7EQ0w6HgJkQ80VDck0JaG`:
 * > index `6:384`, detail `10:2269`) **>** the **Jimo Help Center** (what sits
 * > behind an undrawn affordance, and the per-type KPI sets) **>** the **Jimo
 * > MCP** (the live enums and realistic figures).
 *
 * The skeletons are skeletons: the index is drawn once, for Resource Centers,
 * in mosaic mode; the detail is drawn once, for a Checklist, in three
 * KPI-selected states. Everything type-specific behind them comes from the docs.
 *
 * ## The status set is documented, not guessed
 *
 * The webhook object carries `state: LIVE | PAUSED` plus an `isDraft` flag, and
 * the Schedule section adds a starting date (→ `scheduled`) and an expiration
 * date that "automatically pauses" the experience (→ `expired`). Those five are
 * the whole ladder.
 *
 * `POST` is the seventh member of the workspace enum — Changelog Posts — and it
 * has no skeleton, so it is deliberately absent here and its rail item stays
 * inert. Same contract `navConfig` already uses for Chat and Launcher.
 *
 * ## Two places the artboard and the docs disagree
 *
 * - The docs call the Checklist metric **Completed Checklist**; the artboard
 *   labels its tile **Completion rate** and prints **70% completion**, then
 *   hangs the docs' per-task drill-down off it. They are one metric. The docs
 *   win the SET, the artboard wins the LABEL — the same resolution `skills.ts`
 *   makes for its mode labels.
 * - The docs say **Button Actions** applies to every experience type, but the
 *   Checklist artboard draws exactly three tiles and none of them is it. Rather
 *   than drop the metric for one type (which would be arbitrary), `metricsFor`
 *   drops it when the experience has no CTA at all — and the seeded Onboarding
 *   Checklist has none, so `10:2271` reproduces tile for tile.
 *
 * ## Invented, and labelled as such
 *
 * Every figure past the ones the artboards print (`70% completion`, `21 users`,
 * `30% users`, the `24 / 12` task columns) comes from the seeded generators at
 * the bottom of this file. So do every experience name, tag, segment label,
 * step caption and goal name, and the per-hint display methods. `Poke` is NOT
 * invented — it is Jimo's own word for an experience, visible in the product's
 * own deep links (`?jimo_poke=`), which is why the detail card keeps the
 * artboard's "Poke statistics" title verbatim.
 */
import type { IconTint } from '@/components/ui/ContainedIcon/ContainedIcon';

/* ── types ────────────────────────────────────────────────────────────────── */

export type ExperienceType =
  | 'tour'
  | 'survey'
  | 'banner'
  | 'hint'
  | 'checklist'
  | 'resource-center';

/** Rail order: Engagement (tours → hints) then Content (checklists, RC). */
export const EXPERIENCE_TYPES: ExperienceType[] = [
  'tour',
  'survey',
  'banner',
  'hint',
  'checklist',
  'resource-center',
];

/** The singular, for a card's type badge and the detail header's subline. */
export const EXPERIENCE_LABEL: Record<ExperienceType, string> = {
  tour: 'Tour',
  survey: 'Survey',
  banner: 'Banner',
  hint: 'Hint',
  checklist: 'Checklist',
  'resource-center': 'Resource Center',
};

/** The page title, and the `+ New …` button's noun. `6:384` prints the plural. */
export const EXPERIENCE_PLURAL: Record<ExperienceType, string> = {
  tour: 'Tours',
  survey: 'Surveys',
  banner: 'Banners',
  hint: 'Hints',
  checklist: 'Checklists',
  'resource-center': 'Resource Centers',
};

/**
 * `PrimaryNavSidebar` marks its active item by label string, and its own label
 * for the last one is "Resource Center" — SINGULAR, where the page title is
 * plural. Keeping the two maps apart is what stops a rename on one side from
 * silently killing the rail highlight; `experiences.test.ts` asserts the join.
 */
export const EXPERIENCE_NAV_LABEL: Record<ExperienceType, string> = {
  tour: 'Tours',
  survey: 'Surveys',
  banner: 'Banners',
  hint: 'Hints',
  checklist: 'Checklists',
  'resource-center': 'Resource Center',
};

export const EXPERIENCE_ROUTE: Record<ExperienceType, string> = {
  tour: '/tours',
  survey: '/surveys',
  banner: '/banners',
  hint: '/hints',
  checklist: '/checklists',
  'resource-center': '/resource-centers',
};

/** The detail header's glyph chip. The Checklist artboard draws it yellow. */
export const EXPERIENCE_TINT: Record<ExperienceType, IconTint> = {
  tour: 'blue',
  survey: 'purple',
  banner: 'orange',
  hint: 'green',
  checklist: 'yellow',
  'resource-center': 'red',
};

/**
 * The detail page's content-strip heading. The artboard reads "Hints" above a
 * Checklist's two steps, which is the product's own word for the pieces a poke
 * is built from on the types that anchor to an element; the others name what
 * they actually contain.
 */
export const EXPERIENCE_STEPS_HEADING: Record<ExperienceType, string> = {
  tour: 'Steps',
  survey: 'Questions',
  banner: 'Content',
  hint: 'Hints',
  checklist: 'Hints',
  'resource-center': 'Blocks',
};

export type ExperienceStatus = 'live' | 'paused' | 'draft' | 'scheduled' | 'expired';

export const EXPERIENCE_STATUSES: ExperienceStatus[] = [
  'live',
  'paused',
  'draft',
  'scheduled',
  'expired',
];

export const EXPERIENCE_STATUS_LABEL: Record<ExperienceStatus, string> = {
  live: 'Live',
  paused: 'Paused',
  draft: 'Draft',
  scheduled: 'Scheduled',
  expired: 'Expired',
};

/**
 * `Badge`'s `type`, not a colour — the artboard's chip is green on Live, and
 * the rest follow the ladder Badge already defines. `expired` takes `alert`
 * rather than `negative`: an experience that ran its course did not fail.
 */
export const EXPERIENCE_STATUS_BADGE: Record<
  ExperienceStatus,
  'neutral' | 'positive' | 'negative' | 'alert' | 'brand'
> = {
  live: 'positive',
  paused: 'neutral',
  draft: 'neutral',
  scheduled: 'brand',
  expired: 'alert',
};

export function isExperienceType(value: unknown): value is ExperienceType {
  return typeof value === 'string' && (EXPERIENCE_TYPES as string[]).includes(value);
}

export function isExperienceStatus(value: unknown): value is ExperienceStatus {
  return typeof value === 'string' && (EXPERIENCE_STATUSES as string[]).includes(value);
}

/* ── metrics ──────────────────────────────────────────────────────────────── */

export type MetricKey =
  | 'users-reached'
  | 'finished-submissions'
  | 'completion-rate'
  | 'button-actions'
  | 'went-through-all-steps'
  | 'reached-goal'
  | 'total-tooltip-shown'
  | 'completed-checklist'
  | 'users-viewed'
  | 'dismissed-checklist'
  | 'users-opened'
  | 'ask-ai-messages';

/** What clicking the tile reveals. Every kind is built; none is a dead tile. */
export type DrillKind =
  | 'day-series'
  | 'task-table'
  | 'hint-table'
  | 'step-histogram'
  | 'dual-curve'
  | 'cta-table';

/**
 * How a tile prints its number. The artboard supplies three of these verbatim
 * ("70% completion", "21 users", "30% users") and the Ask AI doc supplies a
 * fourth ("50 messages"); the rest follow the same shape.
 */
export type MetricUnit =
  | 'users'
  | 'percent'
  | 'percent-users'
  | 'percent-completion'
  | 'clicks'
  | 'views'
  | 'messages';

export interface MetricDef {
  /** The tile's caption, under the number. */
  label: string;
  unit: MetricUnit;
  drill: DrillKind;
}

export const METRICS: Record<MetricKey, MetricDef> = {
  'users-reached': { label: 'Users reached', unit: 'users', drill: 'day-series' },
  'finished-submissions': { label: 'Finished submissions', unit: 'users', drill: 'day-series' },
  'completion-rate': { label: 'Completion rate', unit: 'percent', drill: 'day-series' },
  'button-actions': { label: 'Button actions', unit: 'clicks', drill: 'cta-table' },
  'went-through-all-steps': {
    label: 'Went through all steps',
    unit: 'users',
    drill: 'step-histogram',
  },
  'reached-goal': { label: 'Reached goal', unit: 'users', drill: 'dual-curve' },
  'total-tooltip-shown': { label: 'Total tooltip shown', unit: 'views', drill: 'hint-table' },
  // Artboard label, docs' drill-down. See the header.
  'completed-checklist': {
    label: 'Completion rate',
    unit: 'percent-completion',
    drill: 'task-table',
  },
  'users-viewed': { label: 'Users viewed', unit: 'users', drill: 'day-series' },
  'dismissed-checklist': {
    label: 'Dismissed checklist',
    unit: 'percent-users',
    drill: 'day-series',
  },
  'users-opened': { label: 'Users opened', unit: 'users', drill: 'day-series' },
  'ask-ai-messages': { label: 'Ask AI messages', unit: 'messages', drill: 'day-series' },
};

/**
 * The docs' per-type KPI table, verbatim, in the order the docs list them.
 *
 * "Button Actions" is named for every type — on Resource Centers the docs say
 * it is *called* "Action Clicks" but behaves identically, which is one label
 * swap rather than a second metric.
 */
export const METRICS_BY_TYPE: Record<ExperienceType, MetricKey[]> = {
  tour: ['users-reached', 'went-through-all-steps', 'reached-goal', 'button-actions'],
  survey: ['users-reached', 'finished-submissions', 'completion-rate', 'button-actions'],
  banner: ['users-reached', 'reached-goal', 'button-actions'],
  hint: ['users-reached', 'total-tooltip-shown', 'button-actions'],
  checklist: ['completed-checklist', 'users-viewed', 'dismissed-checklist', 'button-actions'],
  'resource-center': ['users-opened', 'button-actions', 'ask-ai-messages'],
};

/** The one label swap the docs call for. */
export function metricLabel(type: ExperienceType, key: MetricKey): string {
  if (type === 'resource-center' && key === 'button-actions') return 'Action clicks';
  return METRICS[key].label;
}

export function formatMetric(value: number, unit: MetricUnit): string {
  const n = value.toLocaleString('en-US');
  switch (unit) {
    case 'percent':
      return `${value}%`;
    case 'percent-users':
      return `${value}% users`;
    case 'percent-completion':
      return `${value}% completion`;
    case 'clicks':
      return `${n} clicks`;
    case 'views':
      return `${n} views`;
    case 'messages':
      return `${n} messages`;
    default:
      return `${n} users`;
  }
}

/* ── the record ───────────────────────────────────────────────────────────── */

export interface ExperienceStep {
  id: string;
  /** The caption under the strip's thumbnail — "Checklist", "Success". */
  label: string;
  /** The small pill under the caption. The artboard draws one per step. */
  badge: string;
}

export interface Experience {
  id: string;
  type: ExperienceType;
  name: string;
  status: ExperienceStatus;
  /** Epoch ms. The card reads "Created N days ago", so an absolute would age. */
  createdAt: number;
  /** Epoch ms. The detail subline reads "Edited 3 days ago". */
  editedAt: number;
  /** The reach pill's first half — "All users - 0 reached". */
  segmentLabel: string;
  reached: number;
  tags: string[];
  steps: ExperienceStep[];
  /** Named goal, or null. Gates `reached-goal`, per the docs. */
  goal: string | null;
  /** Checklist tasks. Authored content like `steps`; empty on every other type. */
  tasks: TaskRow[];
  /** CTA count. 0 drops `button-actions` — see the header. */
  ctas: number;
  metrics: Partial<Record<MetricKey, number>>;
}

/**
 * Which tiles this experience actually shows.
 *
 * Three conditionals, all from the docs: "Went Through All Steps (Tours with
 * 2+ Steps)", "Reached Goal (Tours, Banners with Goal)", and Button Actions,
 * which counts CTA clicks and therefore has nothing to count without a CTA.
 * A pure function so the tile row never branches and the rules are testable.
 */
export function metricsFor(experience: Experience): MetricKey[] {
  return METRICS_BY_TYPE[experience.type].filter((key) => {
    if (key === 'went-through-all-steps') return experience.steps.length >= 2;
    if (key === 'reached-goal') return experience.goal !== null;
    if (key === 'button-actions') return experience.ctas > 0;
    return true;
  });
}

let seq = 0;
export function makeExperienceId(type: ExperienceType): string {
  seq += 1;
  return `${type}-${seq}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ── seeded content ───────────────────────────────────────────────────────── */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * A checklist task. Authored content, like `steps`, so it lives on the record
 * rather than in a generator — the names are something a person wrote.
 *
 * The artboard prints `24 / 12` in the Clicked and Completed columns of ALL
 * FOUR rows while giving them four different completion rates, which cannot
 * both be true. Reproducing that would be copying a typo (the call
 * `formatAbsolute` already makes for the artboard's "17:12 PM"), so the rate is
 * DERIVED here and the counts vary to produce the artboard's four figures.
 */
export interface TaskRow {
  id: string;
  label: string;
  clicked: number;
  completed: number;
}

export function taskRate(task: TaskRow): number {
  if (task.clicked <= 0) return 0;
  return Math.round((task.completed / task.clicked) * 100);
}

function step(id: string, label: string, badge: string): ExperienceStep {
  return { id, label, badge };
}

/**
 * The seeded catalogue. A factory, not a constant, for the reason `DEMO_SKILLS`
 * gives: `createdAt` and `editedAt` are rendered relative, so a module-level
 * literal would drift the moment the tab is left open.
 *
 * Three rows per type, so the mosaic fills its first grid row for every page,
 * and between them they cover all five statuses, a zero-reach row (the
 * artboard's "All users - 0 reached"), a single-step tour (which drops the
 * "Went through all steps" tile) and a goal-less one (which drops "Reached
 * goal"). `checklist-onboarding` is the artboard's own experience.
 */
export function DEMO_EXPERIENCES(): Experience[] {
  const now = Date.now();

  return [
    /* ── Tours ─────────────────────────────────────────────────────────── */
    {
      id: 'tour-welcome',
      type: 'tour',
      name: 'Welcome tour',
      status: 'live',
      createdAt: now - 24 * DAY,
      editedAt: now - 2 * DAY,
      segmentLabel: 'New users',
      reached: 1840,
      tags: ['Onboarding'],
      steps: [
        step('tour-welcome-s1', 'Say hello', 'Modal'),
        step('tour-welcome-s2', 'Find the sidebar', 'Tooltip'),
        step('tour-welcome-s3', 'Create something', 'Tooltip'),
        step('tour-welcome-s4', 'You are set', 'Modal'),
      ],
      goal: 'Created first experience',
      ctas: 4,
      tasks: [],
      metrics: {
        'users-reached': 1840,
        'went-through-all-steps': 1122,
        'reached-goal': 806,
        'button-actions': 2431,
      },
    },
    {
      id: 'tour-whats-new',
      type: 'tour',
      name: "What's new in the builder",
      status: 'paused',
      createdAt: now - 61 * DAY,
      editedAt: now - 9 * DAY,
      segmentLabel: 'Power users',
      reached: 612,
      tags: ['Release'],
      steps: [
        step('tour-whats-new-s1', 'The new canvas', 'Modal'),
        step('tour-whats-new-s2', 'Where presets moved', 'Tooltip'),
      ],
      goal: null,
      ctas: 2,
      tasks: [],
      metrics: {
        'users-reached': 612,
        'went-through-all-steps': 388,
        'button-actions': 754,
      },
    },
    {
      id: 'tour-trial-nudge',
      type: 'tour',
      name: 'Trial ending nudge',
      status: 'draft',
      createdAt: now - 5 * DAY,
      editedAt: now - 5 * DAY,
      segmentLabel: 'All users',
      reached: 0,
      tags: [],
      // One step: the "Went through all steps" tile has nothing to measure.
      steps: [step('tour-trial-nudge-s1', 'Your trial ends soon', 'Modal')],
      goal: null,
      ctas: 0,
      tasks: [],
      metrics: { 'users-reached': 0 },
    },

    /* ── Surveys ───────────────────────────────────────────────────────── */
    {
      id: 'survey-nps',
      type: 'survey',
      name: 'Quarterly NPS',
      status: 'live',
      createdAt: now - 40 * DAY,
      editedAt: now - 6 * DAY,
      segmentLabel: 'Power users',
      reached: 934,
      tags: ['Voice of customer'],
      steps: [
        step('survey-nps-s1', 'How likely are you to recommend us?', 'NPS'),
        step('survey-nps-s2', 'What would you change?', 'Open'),
      ],
      goal: null,
      ctas: 2,
      tasks: [],
      metrics: {
        'users-reached': 934,
        'finished-submissions': 421,
        'completion-rate': 68,
        'button-actions': 512,
      },
    },
    {
      id: 'survey-builder-csat',
      type: 'survey',
      name: 'Builder satisfaction',
      status: 'scheduled',
      createdAt: now - 3 * DAY,
      editedAt: now - 3 * DAY,
      segmentLabel: 'Editors',
      reached: 0,
      tags: ['Builder'],
      steps: [step('survey-builder-csat-s1', 'How was the builder today?', 'Slider')],
      goal: null,
      ctas: 1,
      tasks: [],
      metrics: {
        'users-reached': 0,
        'finished-submissions': 0,
        'completion-rate': 0,
        'button-actions': 0,
      },
    },
    {
      id: 'survey-churn',
      type: 'survey',
      name: 'Why are you leaving?',
      status: 'draft',
      createdAt: now - 12 * DAY,
      editedAt: now - 11 * DAY,
      segmentLabel: 'Cancelling',
      reached: 0,
      tags: ['Retention'],
      steps: [step('survey-churn-s1', 'What made you cancel?', 'Multiple choice')],
      goal: null,
      ctas: 0,
      tasks: [],
      metrics: { 'users-reached': 0, 'finished-submissions': 0, 'completion-rate': 0 },
    },

    /* ── Banners ───────────────────────────────────────────────────────── */
    {
      id: 'banner-install',
      type: 'banner',
      name: 'Finish your installation',
      status: 'live',
      createdAt: now - 18 * DAY,
      editedAt: now - 1 * DAY,
      segmentLabel: 'Trialing',
      reached: 2104,
      tags: ['Activation'],
      steps: [step('banner-install-s1', 'Finish your installation', 'Top bar')],
      goal: 'Snippet installed',
      ctas: 1,
      tasks: [],
      metrics: { 'users-reached': 2104, 'reached-goal': 611, 'button-actions': 1288 },
    },
    {
      id: 'banner-maintenance',
      type: 'banner',
      name: 'Scheduled maintenance',
      status: 'expired',
      createdAt: now - 90 * DAY,
      editedAt: now - 74 * DAY,
      segmentLabel: 'All users',
      reached: 5310,
      tags: ['Ops'],
      steps: [step('banner-maintenance-s1', 'We are down for an hour', 'Top bar')],
      goal: null,
      ctas: 1,
      tasks: [],
      metrics: { 'users-reached': 5310, 'button-actions': 402 },
    },
    {
      id: 'banner-pricing',
      type: 'banner',
      name: 'New pricing from March',
      status: 'draft',
      createdAt: now - 5 * DAY,
      editedAt: now - 4 * DAY,
      segmentLabel: 'All users',
      reached: 0,
      tags: ['Billing'],
      steps: [step('banner-pricing-s1', 'New pricing from March', 'Inline')],
      goal: null,
      ctas: 0,
      tasks: [],
      metrics: { 'users-reached': 0 },
    },

    /* ── Hints ─────────────────────────────────────────────────────────── */
    {
      id: 'hint-dashboard',
      type: 'hint',
      name: 'Dashboard hints',
      status: 'live',
      createdAt: now - 33 * DAY,
      editedAt: now - 7 * DAY,
      segmentLabel: 'All users',
      reached: 3120,
      tags: ['Discovery'],
      steps: [
        step('hint-dashboard-s1', 'Filters live here', 'Icon'),
        step('hint-dashboard-s2', 'Save a view', 'Label'),
        step('hint-dashboard-s3', 'Export anything', 'Target'),
      ],
      goal: null,
      ctas: 2,
      tasks: [],
      metrics: { 'users-reached': 3120, 'total-tooltip-shown': 8940, 'button-actions': 1104 },
    },
    {
      id: 'hint-segments',
      type: 'hint',
      name: 'Segment builder hints',
      status: 'paused',
      createdAt: now - 47 * DAY,
      editedAt: now - 20 * DAY,
      segmentLabel: 'Editors',
      reached: 488,
      tags: [],
      steps: [
        step('hint-segments-s1', 'Groups use OR', 'Icon'),
        step('hint-segments-s2', 'Save as a segment', 'Button'),
      ],
      goal: null,
      ctas: 1,
      tasks: [],
      metrics: { 'users-reached': 488, 'total-tooltip-shown': 1206, 'button-actions': 213 },
    },
    {
      id: 'hint-billing',
      type: 'hint',
      name: 'Billing page hints',
      status: 'draft',
      createdAt: now - 2 * DAY,
      editedAt: now - 2 * DAY,
      segmentLabel: 'Admins',
      reached: 0,
      tags: ['Billing'],
      steps: [step('hint-billing-s1', 'Seats are billed monthly', 'Icon')],
      goal: null,
      ctas: 0,
      tasks: [],
      metrics: { 'users-reached': 0, 'total-tooltip-shown': 0 },
    },

    /* ── Checklists ────────────────────────────────────────────────────── */
    {
      // The detail artboard's own experience — `10:2271` and its two siblings.
      id: 'checklist-onboarding',
      type: 'checklist',
      name: 'Onboarding Checklist',
      status: 'live',
      createdAt: now - 28 * DAY,
      editedAt: now - 3 * DAY,
      segmentLabel: 'New users',
      reached: 21,
      tags: ['Onboarding'],
      steps: [
        step('checklist-onboarding-s1', 'Checklist', 'Checklists'),
        step('checklist-onboarding-s2', 'Success', 'Success'),
      ],
      goal: null,
      // No CTA, so the Button actions tile drops and the row is the artboard's
      // three tiles. See this file's header.
      ctas: 0,
      tasks: [
        { id: 'checklist-onboarding-t1', label: 'Invite team members', clicked: 24, completed: 12 },
        {
          id: 'checklist-onboarding-t2',
          label: 'Set up User Attributes',
          clicked: 30,
          completed: 6,
        },
        { id: 'checklist-onboarding-t3', label: 'Explore Templates', clicked: 20, completed: 6 },
        { id: 'checklist-onboarding-t4', label: 'Integrate with Slack', clicked: 20, completed: 14 },
      ],
      metrics: {
        'completed-checklist': 70,
        'users-viewed': 21,
        'dismissed-checklist': 30,
      },
    },
    {
      id: 'checklist-admin',
      type: 'checklist',
      name: 'Admin setup',
      status: 'paused',
      createdAt: now - 55 * DAY,
      editedAt: now - 15 * DAY,
      segmentLabel: 'Admins',
      reached: 143,
      tags: ['Setup'],
      steps: [step('checklist-admin-s1', 'Checklist', 'Checklists')],
      goal: null,
      ctas: 2,
      tasks: [
        { id: 'checklist-admin-t1', label: 'Add your domain', clicked: 96, completed: 71 },
        { id: 'checklist-admin-t2', label: 'Invite an admin', clicked: 88, completed: 40 },
        { id: 'checklist-admin-t3', label: 'Connect Slack', clicked: 64, completed: 19 },
      ],
      metrics: {
        'completed-checklist': 44,
        'users-viewed': 143,
        'dismissed-checklist': 12,
        'button-actions': 318,
      },
    },
    {
      id: 'checklist-launch',
      type: 'checklist',
      name: 'Launch readiness',
      status: 'draft',
      createdAt: now - 5 * DAY,
      editedAt: now - 5 * DAY,
      segmentLabel: 'All users',
      reached: 0,
      tags: [],
      steps: [step('checklist-launch-s1', 'Checklist', 'Checklists')],
      goal: null,
      ctas: 0,
      tasks: [
        { id: 'checklist-launch-t1', label: 'Write the announcement', clicked: 0, completed: 0 },
        { id: 'checklist-launch-t2', label: 'Pick a segment', clicked: 0, completed: 0 },
      ],
      metrics: { 'completed-checklist': 0, 'users-viewed': 0, 'dismissed-checklist': 0 },
    },

    /* ── Resource Centers ──────────────────────────────────────────────── */
    {
      id: 'rc-help',
      type: 'resource-center',
      name: 'Help hub',
      status: 'live',
      createdAt: now - 5 * DAY,
      editedAt: now - 1 * DAY,
      segmentLabel: 'All users',
      reached: 0,
      tags: ['Support'],
      steps: [
        step('rc-help-s1', 'Getting started', 'Checklist block'),
        step('rc-help-s2', 'Documentation', 'Link block'),
        step('rc-help-s3', 'Ask AI', 'Ask AI block'),
      ],
      goal: null,
      ctas: 3,
      tasks: [],
      metrics: { 'users-opened': 0, 'button-actions': 0, 'ask-ai-messages': 0 },
    },
    {
      id: 'rc-onboarding',
      type: 'resource-center',
      name: 'Onboarding hub',
      status: 'live',
      createdAt: now - 5 * DAY,
      editedAt: now - 3 * DAY,
      segmentLabel: 'New users',
      reached: 1290,
      tags: ['Onboarding'],
      steps: [
        step('rc-onboarding-s1', 'Your checklist', 'Checklist block'),
        step('rc-onboarding-s2', 'Book a call', 'Action block'),
      ],
      goal: null,
      ctas: 2,
      tasks: [],
      metrics: { 'users-opened': 1290, 'button-actions': 744, 'ask-ai-messages': 50 },
    },
    {
      id: 'rc-changelog',
      type: 'resource-center',
      name: 'Release hub',
      status: 'paused',
      createdAt: now - 70 * DAY,
      editedAt: now - 30 * DAY,
      segmentLabel: 'Power users',
      reached: 418,
      tags: ['Release'],
      steps: [step('rc-changelog-s1', "What's new", 'Post block')],
      goal: null,
      ctas: 1,
      tasks: [],
      metrics: { 'users-opened': 418, 'button-actions': 96, 'ask-ai-messages': 12 },
    },
  ];
}

/* ── Drill-downs ───────────────────────────────────────────────────────────
   Same generator idiom as `skills.ts` and `analytics.ts`: a seeded LCG, never
   `Math.random`, so every silhouette is identical on each render and a
   screenshot diff against the artboard stays meaningful. The seed mixes the
   experience id WITH the metric key, so one experience's three tiles never draw
   the same curve twice, and two experiences never share a shape.

   Duplicated rather than shared across features, for the reason `analytics.ts`
   states: changing one chart's shape must not silently reshape another's. */

function lcg(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 4294967296;
  return h;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Absolute axis labels, so the chart reads the same on any day it is opened. */
function dayLabel(index: number, total: number): string {
  const start = new Date(Date.UTC(2027, 8, 1));
  const spanDays = Math.round((index / Math.max(1, total - 1)) * 150);
  const d = new Date(start.getTime() + spanDays * DAY);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export interface MetricDay {
  index: number;
  /** "Sep 12, 2027" — the tooltip's first line on `10:2928`. */
  label: string;
  value: number;
}

export const METRIC_DAY_BUCKETS = 26;

/**
 * The `day-series` drill-down: a soft hill, which is the silhouette `10:2928`
 * and `10:3238` both draw — a rise, a peak around two thirds in, a shallow tail.
 *
 * An experience with no reach yet gets a flat zero series rather than a
 * generated one: a draft that nobody has seen must not draw a curve.
 */
export function buildMetricDays(experience: Experience, key: MetricKey): MetricDay[] {
  const peak = experience.metrics[key] ?? 0;
  const rand = lcg((hash(experience.id) ^ hash(key)) + 7919);
  const days: MetricDay[] = [];

  for (let index = 0; index < METRIC_DAY_BUCKETS; index++) {
    const t = index / (METRIC_DAY_BUCKETS - 1);
    // One hump, peaking at t = 0.62, never touching zero at the ends.
    const hill = Math.sin(Math.min(1, t / 0.62) * (Math.PI / 2)) * (1 - Math.max(0, t - 0.62) * 0.7);
    const wobble = 0.86 + rand() * 0.28;
    days.push({
      index,
      label: dayLabel(index, METRIC_DAY_BUCKETS),
      value: peak === 0 ? 0 : Math.max(1, Math.round(peak * 0.34 * hill * wobble)),
    });
  }
  return days;
}

export interface HintRow {
  id: string;
  label: string;
  /** "icon, label, target, button" — the four the docs name. */
  method: string;
  views: number;
  uniqueViewers: number;
}

/**
 * The `hint-table` drill-down. Names come from the experience's own steps —
 * a hint group's steps ARE its hints — and only the two counts are generated.
 */
export function buildHintRows(experience: Experience): HintRow[] {
  const rand = lcg(hash(experience.id) + 104729);
  const total = experience.metrics['total-tooltip-shown'] ?? 0;
  const share = experience.steps.length > 0 ? total / experience.steps.length : 0;

  return experience.steps.map((s) => {
    const views = Math.round(share * (0.7 + rand() * 0.6));
    return {
      id: s.id,
      label: s.label,
      method: s.badge,
      views,
      uniqueViewers: Math.round(views * (0.42 + rand() * 0.2)),
    };
  });
}

export interface StepBar {
  id: string;
  label: string;
  /** Percent of the users who saw step 1. The first bar is always 100. */
  pct: number;
}

/**
 * The `step-histogram` drill-down. The docs are explicit that "the first step
 * always starts at 100%" and that the last bar equals the KPI, so both ends are
 * pinned and only the middle is generated — and both are asserted in the tests.
 */
export function buildStepDropoff(experience: Experience): StepBar[] {
  const steps = experience.steps;
  if (steps.length === 0) return [];

  const reached = experience.metrics['users-reached'] ?? 0;
  const finished = experience.metrics['went-through-all-steps'] ?? 0;
  const end = reached > 0 ? Math.round((finished / reached) * 100) : 0;
  const rand = lcg(hash(experience.id) + 15485863);

  return steps.map((s, i) => {
    if (i === 0) return { id: s.id, label: s.label, pct: 100 };
    if (i === steps.length - 1) return { id: s.id, label: s.label, pct: end };
    const t = i / (steps.length - 1);
    const glide = 100 - (100 - end) * t;
    return { id: s.id, label: s.label, pct: Math.round(Math.max(end, glide - rand() * 6)) };
  });
}

export interface CtaRow {
  id: string;
  /** The button's label as users see it. */
  cta: string;
  /** The step it sits on. */
  step: string;
  action: string;
  clicks: number;
  uniqueUsers: number;
}

/** The five actions the docs say are counted, in the docs' own order. */
const COUNTED_ACTIONS = [
  'Open Post',
  'Navigate To',
  'Launch Experience',
  'Run JavaScript Code',
  'Open Calendar',
];

const CTA_LABELS = ['Get started', 'Learn more', 'Book a call', 'Take me there', 'Show me how'];

/** The `cta-table` drill-down — the docs' five columns. */
export function buildCtaRows(experience: Experience): CtaRow[] {
  const total = experience.metrics['button-actions'] ?? 0;
  if (experience.ctas === 0) return [];
  const rand = lcg(hash(experience.id) + 32452843);
  const share = total / experience.ctas;

  return Array.from({ length: experience.ctas }, (_, i) => {
    const clicks = Math.round(share * (0.6 + rand() * 0.8));
    return {
      id: `${experience.id}-cta-${i}`,
      cta: CTA_LABELS[i % CTA_LABELS.length],
      step: (experience.steps[i % Math.max(1, experience.steps.length)] ?? experience.steps[0])
        ?.label ?? '—',
      action: COUNTED_ACTIONS[i % COUNTED_ACTIONS.length],
      clicks,
      uniqueUsers: Math.round(clicks * (0.45 + rand() * 0.25)),
    };
  });
}

export interface GoalSeries {
  /** Every occurrence of the goal event, experience running or not. */
  all: MetricDay[];
  /** Only those fired while the user was in the experience. */
  during: MetricDay[];
}

/**
 * The `dual-curve` drill-down. The docs describe exactly two curves on one
 * timeline — Total Goal Events and Goal Events During Experience — so `during`
 * is generated as a fraction of `all` and can never cross above it.
 */
export function buildGoalCurves(experience: Experience): GoalSeries {
  const during = buildMetricDays(experience, 'reached-goal');
  const rand = lcg(hash(experience.id) + 49979687);
  const all = during.map((d) => ({ ...d, value: Math.round(d.value * (1.6 + rand() * 0.9)) }));
  return { all, during };
}
