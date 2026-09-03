/**
 * Fixtures for `/settings` — the Jimo PLATFORM's settings, not the agent's.
 *
 * INVENTED, and labelled as such, in the style of `DEMO_SKILLS` and
 * `DEMO_PAGES`. What is NOT invented is called out per constant: prices, seat
 * counts, role names, the integration catalogue and the webhook event
 * categories all come from the Jimo Help Center, which is the source of truth
 * for this area and supersedes the December-2023 artboards wherever the two
 * disagree. Every figure the docs do not print — member names, invoice ids,
 * MAU used, theme colours — is made up here and only here.
 */

/* ── plans ────────────────────────────────────────────────────────────────── */

export type PlanId = 'free' | 'startup' | 'growth' | 'scale';
export type BillingPeriod = 'monthly' | 'yearly';

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  /** USD per month, billed monthly. The yearly figure is DERIVED — see pricing.ts. */
  monthly: number;
  seats: number;
  mau: number;
  popular?: boolean;
  /** Bullets, in artboard order. */
  features: string[];
  /** Scale includes Hide Jimo Label, so the add-on row does not render there. */
  includesHideLabel?: boolean;
};

/**
 * Docs: /docs/settings/plan-and-billing → "Plan Details".
 * Startup $118 / 2 seats, Growth $286 / 5 seats, Scale $466 / 10 seats, -16% yearly.
 *
 * The artboards print $99 / $239 / $389, which are exactly these monthly figures
 * at -16% — so the artboard was showing yearly prices and the two sources agree
 * once that is accounted for. Prices live here as MONTHLY only; `pricing.ts`
 * derives the yearly number so there is no second table to drift.
 *
 * One doc contradicts another: /docs/settings/team-management's seat hint says
 * "Essential: 5, Growth: 10, Scale: Custom" and renames Startup to Essential.
 * plan-and-billing is the page that documents these screens, and it agrees with
 * the artboards, so it wins.
 */
export const PLANS: Plan[] = [
  {
    id: 'startup',
    name: 'Startup',
    tagline: 'Best for small teams',
    monthly: 118,
    seats: 2,
    mau: 2500,
    features: [
      '2 seats',
      'Up to 2,500 Monthly Active Users',
      'Up to 5 active experiences',
      'Product Tour, Surveys & NPS, In-app announcement, and Concept Test Design',
      'Multiple languages',
      'In-app changelog',
      'Integrations, user identification & segmentation',
      'Email & chat support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Best for growing businesses',
    monthly: 286,
    seats: 5,
    mau: 10000,
    popular: true,
    features: [
      'Everything in Startup Plan',
      '5 seats',
      'Up to 10,000 Monthly Active Users',
      'Unlimited active experiences',
      'Priority support',
      'Link sharing',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'Best for large organizations',
    monthly: 466,
    seats: 10,
    mau: 50000,
    includesHideLabel: true,
    features: [
      'Everything in Growth Plan',
      '10 seats',
      'Up to 50,000 Monthly Active Users',
      'Unlimited active experiences',
      'Dedicated CSM',
      'No Jimo branding',
    ],
  },
];

export function planById(id: PlanId): Plan | null {
  return PLANS.find((p) => p.id === id) ?? null;
}

/* ── team ─────────────────────────────────────────────────────────────────── */

/**
 * Docs: /docs/settings/team-management → "predefined roles such as Admin,
 * Editor, and Viewer". The artboards draw Admin / Designer / Only edit /
 * Only View, which is the older vocabulary; docs win.
 *
 * `MemberRole` stays a widened string because the same page says roles are
 * CUSTOMISABLE, so the three below are defaults rather than a closed set.
 */
export type MemberRole = string;
export type MemberStatus = 'active' | 'pending';

export type Role = { id: string; name: string; description: string; system: boolean };

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access, including billing, team and project deletion.',
    system: true,
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Create, edit and publish experiences. No billing or team access.',
    system: true,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only. The role Auto-Join assigns to new members.',
    system: true,
  },
];

export type Member = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
};

/** Invented. Names are the Jimo team's; the emails are all one real address. */
export const DEMO_MEMBERS = (): Member[] => [
  { id: 'm-raph', name: 'Raphäel', email: 'raph@usejimo.com', role: 'admin', status: 'active' },
  { id: 'm-fahmi', name: 'Fahmi', email: 'fahmi@usejimo.com', role: 'admin', status: 'active' },
  { id: 'm-thomas', name: 'Thomas', email: 'thomas@usejimo.com', role: 'editor', status: 'active' },
  { id: 'm-andy', name: 'Andy', email: 'andy@usejimo.com', role: 'editor', status: 'active' },
  { id: 'm-sam', name: 'Sam', email: 'sam@usejimo.com', role: 'viewer', status: 'active' },
];

/* ── integrations ─────────────────────────────────────────────────────────── */

/**
 * Docs: /docs/integrations/integration-setup splits the catalogue in two —
 * "Available Integrations in Settings" (Intercom, Segment, Zapier, HubSpot) and
 * "Other Integrations in Workflows" (Calendly, Figma, Invision, Maze). Slack,
 * Crisp and Zendesk Knowledge each document a Settings → Integrations page of
 * their own, so they belong here too; the four workflow ones do not.
 *
 * `connect` is the shape the vendor actually uses, per its own doc page. They
 * are genuinely different, so one generic Connect button for all seven would be
 * a lie about four of them.
 */
export type ConnectKind = 'oauth' | 'credentials' | 'apikey' | 'marketplace' | 'invite';

export type IntegrationDef = {
  id: string;
  name: string;
  description: string;
  connect: ConnectKind;
  /** Copy for the primary button, from the vendor's own doc page. */
  cta: string;
  docs: string;
  /** Only HubSpot has a field-mapping detail page in the artboards. */
  hasFieldMapping?: boolean;
};

export const INTEGRATION_CATALOGUE: IntegrationDef[] = [
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Connect Intercom to enable users access Jimo in the messenger',
    connect: 'oauth',
    cta: 'Connect',
    docs: 'https://help.usejimo.com/docs/integrations/intercom',
  },
  {
    id: 'segment',
    name: 'Segment',
    description: 'Enhance end-user data using Segment',
    connect: 'apikey',
    cta: 'Get API key',
    docs: 'https://help.usejimo.com/docs/integrations/old-twilio-segment',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Sync Jimo to your favorite apps using Zapier',
    connect: 'invite',
    cta: 'Enable Jimo in Zapier',
    docs: 'https://help.usejimo.com/docs/integrations/zapier',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Connect Jimo to your HubSpot workspace',
    connect: 'oauth',
    cta: 'Connect',
    docs: 'https://help.usejimo.com/docs/integrations/hubspot',
    hasFieldMapping: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive Jimo survey notifications in your Slack workspace',
    connect: 'oauth',
    cta: 'Connect',
    docs: 'https://help.usejimo.com/docs/integrations/slack',
  },
  {
    id: 'crisp',
    name: 'Crisp',
    description: 'Install the Jimo plugin from the Crisp Marketplace',
    connect: 'marketplace',
    cta: 'Open Crisp Marketplace',
    docs: 'https://help.usejimo.com/docs/integrations/crisp',
  },
  {
    id: 'zendesk',
    name: 'Zendesk Knowledge',
    description: 'Let the agent answer from your Zendesk help center',
    connect: 'credentials',
    cta: 'Add integration',
    docs: 'https://help.usejimo.com/docs/integrations/zendesk-knowledge',
  },
];

export function integrationById(id: string): IntegrationDef | null {
  return INTEGRATION_CATALOGUE.find((i) => i.id === id) ?? null;
}

/** Invented — the artboard's HubSpot detail page prints no real field names. */
export type FieldMap = { id: string; jimo: string; vendor: string };

export const DEMO_HUBSPOT_MATCHED = (): FieldMap[] => [
  { id: 'fm-1', jimo: 'Email', vendor: 'email' },
];
export const DEMO_HUBSPOT_SYNCED = (): FieldMap[] => [
  { id: 'fs-1', jimo: 'Plan', vendor: 'subscription_tier' },
  { id: 'fs-2', jimo: 'Company size', vendor: 'numberofemployees' },
];

/* ── webhooks ─────────────────────────────────────────────────────────────── */

/**
 * Docs: /docs/for-developers/for-developers/webhooks. No artboard draws this
 * screen; every string below is the docs'.
 */
export const WEBHOOK_EVENT_CATEGORIES = [
  { id: 'tours', label: 'Tours', description: 'Tour creation, updates, and user interactions' },
  { id: 'surveys', label: 'Surveys', description: 'Survey creation, responses, and status changes' },
  { id: 'checklists', label: 'Checklists', description: 'Checklist actions and progress' },
  { id: 'hints', label: 'Hints', description: 'Hint interactions and modifications' },
  { id: 'banners', label: 'Banners', description: 'Banner changes and user views' },
  { id: 'changelog', label: 'Changelog Posts', description: 'Changelog content updates' },
] as const;

/** Docs: "1 hour after first failure, 3 hours later, 1 day, 3 days, 1 week". */
export const WEBHOOK_RETRY_SCHEDULE = ['1 hour', '3 hours', '1 day', '3 days', '1 week'];

/* ── environments ─────────────────────────────────────────────────────────── */

/**
 * Docs: /docs/settings/environments. The dialog offers an icon and a colour;
 * the colour is stored as a TOKEN NAME, never a hex, so the tokens-only rule
 * survives contact with user data. See ColourSwatchField.
 */
export const ENVIRONMENT_COLOURS = ['blue', 'green', 'purple', 'orange', 'red'] as const;
export type EnvironmentColour = (typeof ENVIRONMENT_COLOURS)[number];

export const ENVIRONMENT_ICONS = ['global', 'code', 'layer', 'health', 'flash'] as const;
export type EnvironmentIcon = (typeof ENVIRONMENT_ICONS)[number];

/* ── rate limit ───────────────────────────────────────────────────────────── */

/** Docs: "1 Experience every 4 hours per default", units minute/hour/day/week. */
export type RateUnit = 'minute' | 'hour' | 'day' | 'week';
export const RATE_UNITS: RateUnit[] = ['minute', 'hour', 'day', 'week'];

/**
 * Invented — the rate-limit picker needs experiences to exclude, and this repo
 * has no experience model. Names are the artboard's own three.
 */
export const DEMO_EXPERIENCES = () => [
  { id: 'exp-sat', name: 'Builder SAT', type: 'Survey' },
  { id: 'exp-ph', name: 'Banner Product Hunt', type: 'Banner' },
  { id: 'exp-onb', name: 'Onboarding Jimo Widget', type: 'Tour' },
  { id: 'exp-nps', name: 'Quarterly NPS', type: 'Survey' },
  { id: 'exp-tour', name: 'New dashboard tour', type: 'Tour' },
];

/* ── themes ───────────────────────────────────────────────────────────────── */

export type Theme = {
  id: string;
  name: string;
  font: string;
  /** Token names, not hexes. */
  colours: string[];
  isDefault: boolean;
};

/** Docs: the Jimo Default theme ships; custom themes are the user's own. */
export const DEMO_THEMES = (): Theme[] => [
  {
    id: 'theme-default',
    name: 'Jimo Default',
    font: 'Inter, Arial',
    colours: ['--color-blue-400', '--color-blue-100', '--color-neutral-800'],
    isDefault: true,
  },
];

/* ── ids ──────────────────────────────────────────────────────────────────── */

let n = 0;
const rand = () => Math.random().toString(36).slice(2, 8);

/** UUID-shaped, matching the format the docs' installation snippet prints. */
export function makeProjectId(): string {
  const h = (len: number) =>
    Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${h(8)}-${h(4)}-${h(4)}-${h(4)}-${h(12)}`;
}

export const makeMemberId = () => `m-${(n += 1)}-${rand()}`;
export const makeThemeId = () => `theme-${(n += 1)}-${rand()}`;
export const makeEnvId = () => `env-${(n += 1)}-${rand()}`;
export const makeWebhookId = () => `wh-${(n += 1)}-${rand()}`;
export const makeInvoiceId = () => `inv-${(n += 1)}-${rand()}`;
