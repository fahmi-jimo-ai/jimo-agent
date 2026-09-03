/**
 * `/settings` — the Jimo PLATFORM's persisted configuration.
 *
 * Same shape as knowledgeStore, deliberately: a tiny external store persisted
 * to localStorage, with the whole READ PATH extracted as a pure
 * `parseSettings(raw)` so the vitest suite can run it in node with no DOM. The
 * pure list helpers at the bottom exist for the same reason.
 *
 * This store has nothing to do with the AGENT's configuration, which stays in
 * escalationStore behind Escalation's Configure modal. Two products, one shell.
 *
 * The key never changes as sections are added: `parseSettings` merges over
 * `INITIAL_SETTINGS`, so a payload written before `webhooks` or `environments`
 * existed reads forward with the defaults and no migration step.
 *
 * Per-record parsers COERCE unknown enum values to a default rather than
 * dropping the record, matching `parseSource`/`parseSkill` — an unknown role
 * renders an odd chip, which is better than a member silently vanishing from
 * the team list.
 */
import {
  DEFAULT_ROLES,
  DEMO_MEMBERS,
  DEMO_THEMES,
  INTEGRATION_CATALOGUE,
  makeProjectId,
  planById,
  type BillingPeriod,
  type FieldMap,
  type Member,
  type MemberStatus,
  type PlanId,
  type RateUnit,
  type Role,
  type Theme,
} from '@/data/settings';
import { armTraining, disarmTraining } from './trainingTimers';

const KEY = 'jimo.agent.settings.v1';

/* ── faked async, quarantined in trainingTimers like training and scanning ── */

/**
 * Invented durations, and labelled as such. Nothing upstream says how long any
 * of these take; each is long enough to read the spinner and short enough that
 * nobody waits. They arm ids in the SAME registry `armTraining` already owns,
 * because that module is an id→timeout map with the replace-don't-stack and
 * resume-on-mount properties already reasoned about — a parallel module would
 * need both proved again. Id namespaces cannot collide: these are prefixed.
 */
export const CONNECT_MS = 1600;
export const GTM_PUBLISH_MS = 2500;
export const INSTALL_CHECK_MS = 2000;
export const SMART_THEME_MS = 3000;
export const PAYMENT_MS = 1800;

/* ── types ────────────────────────────────────────────────────────────────── */

export type SubscriptionStatus = 'none' | 'trialing' | 'active' | 'cancelled';
export type GtmStatus = 'idle' | 'connecting' | 'connected' | 'publishing' | 'published';
export type CheckStatus = 'idle' | 'running' | 'ok' | 'failed';

export type IntegrationState = {
  connected: boolean;
  /** 'connecting' is the faked-async beat; it resumes on mount. */
  connecting: boolean;
  connectedAt: number | null;
  matched: FieldMap[];
  synced: FieldMap[];
};

export type Webhook = {
  id: string;
  endpoint: string;
  events: string[];
  active: boolean;
  deliveries: { at: number; status: number; ok: boolean }[];
};

export type Environment = {
  id: string;
  name: string;
  icon: string;
  /** A token NAME, never a hex — see ColourSwatchField. */
  colour: string;
  domains: string[];
  description: string;
};

export type Invoice = {
  id: string;
  date: string;
  amount: string;
  plan: string;
};

export type SettingsState = {
  project: { name: string; logo: string | null; projectId: string; hideJimoLabel: boolean };
  account: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };
  notifications: { newRequests: boolean; newChangelogComments: boolean };
  team: { autoJoinDomain: boolean; members: Member[]; roles: Role[] };
  rateLimit: {
    enabled: boolean;
    count: number;
    every: number;
    unit: RateUnit;
    /** Experience ids from DEMO_EXPERIENCES. */
    excluded: string[];
  };
  install: {
    gtm: { status: GtmStatus; account: string | null; container: string | null };
    check: { status: CheckStatus; at: number | null };
    forceIdentify: boolean;
    identityVerification: boolean;
  };
  integrations: Record<string, IntegrationState>;
  webhooks: Webhook[];
  environments: Environment[];
  troubleshoot: { shortcutEnabled: boolean; lastUrl: string };
  themes: Theme[];
  subscription: {
    status: SubscriptionStatus;
    plan: PlanId;
    period: BillingPeriod;
    seats: number;
    hideJimoLabelAddon: boolean;
    coupon: string | null;
    trialEndsAt: number | null;
    renewsAt: number | null;
    mauUsed: number;
    card: { brand: string; last4: string; exp: string } | null;
    invoices: Invoice[];
  };
};

/* ── initial state ────────────────────────────────────────────────────────── */

const emptyIntegrations = (): Record<string, IntegrationState> =>
  Object.fromEntries(
    INTEGRATION_CATALOGUE.map((i) => [
      i.id,
      { connected: false, connecting: false, connectedAt: null, matched: [], synced: [] },
    ]),
  );

/**
 * Seeded populated vs empty follows this repo's own rule: what the user types
 * starts empty, what a system produces starts populated.
 *
 *   project / account        populated — identity exists the moment a workspace does
 *   team.members             populated — you are always a member of your own project
 *   team.roles               populated — the docs' three predefined roles
 *   rateLimit                populated defaults, empty exclusions (docs: 1 every 4 hours)
 *   integrations             the CATALOGUE is Jimo's; every row starts disconnected
 *   webhooks / environments  EMPTY — both are endpoints and domains the user types
 *   themes                   Jimo Default only; custom themes are the user's
 *   subscription             'none' / free / no invoices
 *
 * That last one matters: it means Billing's own "No history yet" artboard
 * (13:13269) is where a fresh workspace lands, and every paid Billing state is
 * reachable only by actually running checkout. This is the OPPOSITE of
 * skillsStore seeding populated, for the reason that store's comment gives in
 * reverse — a workspace claiming invoices it never bought is a false statement,
 * whereas a demo skill list is not.
 */
export const INITIAL_SETTINGS: SettingsState = {
  project: {
    name: 'fahmi_dani',
    logo: null,
    projectId: 'a1de56b1-43f5-4a4e-94a3-e6d644509a47',
    hideJimoLabel: false,
  },
  account: {
    username: 'fahmi_dani',
    firstName: 'Fahmi',
    lastName: 'Dani',
    email: 'fahmi@usejimo.com',
    avatar: null,
  },
  notifications: { newRequests: false, newChangelogComments: false },
  team: { autoJoinDomain: true, members: DEMO_MEMBERS(), roles: DEFAULT_ROLES },
  rateLimit: { enabled: true, count: 1, every: 4, unit: 'hour', excluded: [] },
  install: {
    gtm: { status: 'idle', account: null, container: null },
    check: { status: 'idle', at: null },
    forceIdentify: false,
    identityVerification: false,
  },
  integrations: emptyIntegrations(),
  webhooks: [],
  environments: [],
  troubleshoot: { shortcutEnabled: false, lastUrl: '' },
  themes: DEMO_THEMES(),
  subscription: {
    status: 'none',
    plan: 'free',
    period: 'monthly',
    seats: 1,
    hideJimoLabelAddon: false,
    coupon: null,
    trialEndsAt: null,
    renewsAt: null,
    mauUsed: 2300,
    card: null,
    invoices: [],
  },
};

/* ── coercion helpers ─────────────────────────────────────────────────────── */

const str = (v: unknown, fallback: string): string => (typeof v === 'string' ? v : fallback);
const bool = (v: unknown, fallback = false): boolean => (typeof v === 'boolean' ? v : fallback);
const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

const RATE_UNITS: RateUnit[] = ['minute', 'hour', 'day', 'week'];
const SUB_STATUSES: SubscriptionStatus[] = ['none', 'trialing', 'active', 'cancelled'];
const GTM_STATUSES: GtmStatus[] = ['idle', 'connecting', 'connected', 'publishing', 'published'];
const CHECK_STATUSES: CheckStatus[] = ['idle', 'running', 'ok', 'failed'];
const MEMBER_STATUSES: MemberStatus[] = ['active', 'pending'];

const oneOf = <T extends string>(v: unknown, allowed: T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;

/** Drops a member with no id or name; coerces anything else. */
function parseMember(raw: unknown): Member | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const m = raw as Record<string, unknown>;
  if (typeof m.id !== 'string' || typeof m.name !== 'string') return null;
  return {
    id: m.id,
    name: m.name,
    email: str(m.email, ''),
    // Roles are customisable per the docs, so any string is legitimate here.
    role: str(m.role, 'viewer'),
    status: oneOf(m.status, MEMBER_STATUSES, 'active'),
  };
}

function parseTheme(raw: unknown): Theme | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const t = raw as Record<string, unknown>;
  if (typeof t.id !== 'string' || typeof t.name !== 'string') return null;
  return {
    id: t.id,
    name: t.name,
    font: str(t.font, 'Inter, Arial'),
    colours: Array.isArray(t.colours) ? t.colours.filter((c): c is string => typeof c === 'string') : [],
    isDefault: bool(t.isDefault),
  };
}

function parseEnvironment(raw: unknown): Environment | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.id !== 'string' || typeof e.name !== 'string') return null;
  return {
    id: e.id,
    name: e.name,
    icon: str(e.icon, 'global'),
    colour: str(e.colour, 'blue'),
    domains: Array.isArray(e.domains) ? e.domains.filter((d): d is string => typeof d === 'string') : [],
    description: str(e.description, ''),
  };
}

function parseWebhook(raw: unknown): Webhook | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const w = raw as Record<string, unknown>;
  if (typeof w.id !== 'string' || typeof w.endpoint !== 'string') return null;
  return {
    id: w.id,
    endpoint: w.endpoint,
    events: Array.isArray(w.events) ? w.events.filter((e): e is string => typeof e === 'string') : [],
    active: bool(w.active, true),
    deliveries: Array.isArray(w.deliveries)
      ? (w.deliveries as unknown[]).flatMap((d) => {
          if (typeof d !== 'object' || d === null) return [];
          const r = d as Record<string, unknown>;
          const status = num(r.status, 200);
          // Docs: a delivery failed if the endpoint returned 400 or above.
          return [{ at: num(r.at, 0), status, ok: status < 400 }];
        })
      : [],
  };
}

/** The whole read path, as a pure function of the stored string. */
export function parseSettings(raw: string | null): SettingsState {
  if (!raw) return INITIAL_SETTINGS;
  let s: Partial<SettingsState>;
  try {
    s = { ...INITIAL_SETTINGS, ...(JSON.parse(raw) as Partial<SettingsState>) };
  } catch {
    return INITIAL_SETTINGS;
  }

  const I = INITIAL_SETTINGS;
  const project = { ...I.project, ...(s.project ?? {}) };
  const account = { ...I.account, ...(s.account ?? {}) };
  const notifications = { ...I.notifications, ...(s.notifications ?? {}) };
  const team = { ...I.team, ...(s.team ?? {}) };
  const rate = { ...I.rateLimit, ...(s.rateLimit ?? {}) };
  const install = { ...I.install, ...(s.install ?? {}) };
  const gtm = { ...I.install.gtm, ...(install.gtm ?? {}) };
  const check = { ...I.install.check, ...(install.check ?? {}) };
  const sub = { ...I.subscription, ...(s.subscription ?? {}) };
  const trouble = { ...I.troubleshoot, ...(s.troubleshoot ?? {}) };

  const members = (Array.isArray(team.members) ? team.members : [])
    .map(parseMember)
    .filter((m): m is Member => m !== null);

  // Merge the stored per-integration state over the CURRENT catalogue, so a
  // vendor added to the catalogue later appears disconnected rather than
  // undefined, and one removed from it stops being read.
  const storedIntegrations = (s.integrations ?? {}) as Record<string, Partial<IntegrationState>>;
  const integrations = Object.fromEntries(
    INTEGRATION_CATALOGUE.map((def) => {
      const stored = storedIntegrations[def.id] ?? {};
      return [
        def.id,
        {
          connected: bool(stored.connected),
          // A reload mid-connect would otherwise rehydrate `connecting` with no
          // timeout alive to resolve it. `resumeIntegrations()` re-arms it on
          // mount; keeping the flag here is what gives it something to resume.
          connecting: bool(stored.connecting),
          connectedAt: typeof stored.connectedAt === 'number' ? stored.connectedAt : null,
          matched: Array.isArray(stored.matched) ? (stored.matched as FieldMap[]) : [],
          synced: Array.isArray(stored.synced) ? (stored.synced as FieldMap[]) : [],
        },
      ];
    }),
  ) as Record<string, IntegrationState>;

  return {
    project: {
      name: str(project.name, I.project.name),
      logo: typeof project.logo === 'string' ? project.logo : null,
      // Never regenerated: the docs call it "a unique, uneditable identifier".
      projectId: str(project.projectId, I.project.projectId),
      hideJimoLabel: bool(project.hideJimoLabel),
    },
    account: {
      username: str(account.username, I.account.username),
      firstName: str(account.firstName, I.account.firstName),
      lastName: str(account.lastName, I.account.lastName),
      email: str(account.email, I.account.email),
      avatar: typeof account.avatar === 'string' ? account.avatar : null,
    },
    notifications: {
      newRequests: bool(notifications.newRequests),
      newChangelogComments: bool(notifications.newChangelogComments),
    },
    team: {
      autoJoinDomain: bool(team.autoJoinDomain, I.team.autoJoinDomain),
      members,
      roles: Array.isArray(team.roles) && team.roles.length > 0 ? team.roles : I.team.roles,
    },
    rateLimit: {
      enabled: bool(rate.enabled, true),
      count: Math.max(1, num(rate.count, 1)),
      every: Math.max(1, num(rate.every, 4)),
      unit: oneOf(rate.unit, RATE_UNITS, 'hour'),
      excluded: Array.isArray(rate.excluded)
        ? rate.excluded.filter((e): e is string => typeof e === 'string')
        : [],
    },
    install: {
      gtm: {
        // 'connecting'/'publishing' are in-flight beats with no timer alive after
        // a reload. resumeInstall() re-arms them; the status persists so it can.
        status: oneOf(gtm.status, GTM_STATUSES, 'idle'),
        account: typeof gtm.account === 'string' ? gtm.account : null,
        container: typeof gtm.container === 'string' ? gtm.container : null,
      },
      check: {
        status: oneOf(check.status, CHECK_STATUSES, 'idle'),
        at: typeof check.at === 'number' ? check.at : null,
      },
      forceIdentify: bool(install.forceIdentify),
      identityVerification: bool(install.identityVerification),
    },
    integrations,
    webhooks: (Array.isArray(s.webhooks) ? s.webhooks : [])
      .map(parseWebhook)
      .filter((w): w is Webhook => w !== null),
    environments: (Array.isArray(s.environments) ? s.environments : [])
      .map(parseEnvironment)
      .filter((e): e is Environment => e !== null),
    troubleshoot: {
      shortcutEnabled: bool(trouble.shortcutEnabled),
      lastUrl: str(trouble.lastUrl, ''),
    },
    themes: (() => {
      const parsed = (Array.isArray(s.themes) ? s.themes : [])
        .map(parseTheme)
        .filter((t): t is Theme => t !== null);
      // Jimo Default always ships. An empty list means a payload from before
      // themes existed, not a workspace that deleted its default.
      return parsed.length > 0 ? parsed : I.themes;
    })(),
    subscription: {
      status: oneOf(sub.status, SUB_STATUSES, 'none'),
      // An unknown plan id would render an empty Billing card; 'free' is the
      // honest fallback because it is also the no-subscription state.
      plan: planById(sub.plan as PlanId) !== null || sub.plan === 'free' ? (sub.plan as PlanId) : 'free',
      period: sub.period === 'yearly' ? 'yearly' : 'monthly',
      seats: Math.max(1, num(sub.seats, 1)),
      hideJimoLabelAddon: bool(sub.hideJimoLabelAddon),
      coupon: typeof sub.coupon === 'string' ? sub.coupon : null,
      trialEndsAt: typeof sub.trialEndsAt === 'number' ? sub.trialEndsAt : null,
      renewsAt: typeof sub.renewsAt === 'number' ? sub.renewsAt : null,
      mauUsed: num(sub.mauUsed, 0),
      card:
        typeof sub.card === 'object' && sub.card !== null
          ? {
              brand: str((sub.card as Record<string, unknown>).brand, 'Visa'),
              last4: str((sub.card as Record<string, unknown>).last4, '0000'),
              exp: str((sub.card as Record<string, unknown>).exp, '01/30'),
            }
          : null,
      invoices: Array.isArray(sub.invoices) ? (sub.invoices as Invoice[]) : [],
    },
  };
}

/* ── pure list helpers, so the tests never need a DOM ─────────────────────── */

export function withMemberAdded(members: Member[], member: Member): Member[] {
  return [...members, member];
}
export function withMemberRemoved(members: Member[], id: string): Member[] {
  return members.filter((m) => m.id !== id);
}
export function withMemberPatched(members: Member[], id: string, patch: Partial<Member>): Member[] {
  return members.map((m) => (m.id === id ? { ...m, ...patch } : m));
}

export function withThemeAdded(themes: Theme[], theme: Theme): Theme[] {
  return [...themes, theme];
}
export function withThemeRemoved(themes: Theme[], id: string): Theme[] {
  return themes.filter((t) => t.id !== id);
}
export function withThemePatched(themes: Theme[], id: string, patch: Partial<Theme>): Theme[] {
  return themes.map((t) => (t.id === id ? { ...t, ...patch } : t));
}
/** Exactly one theme is default; making one default clears the others. */
export function withDefaultTheme(themes: Theme[], id: string): Theme[] {
  return themes.map((t) => ({ ...t, isDefault: t.id === id }));
}

export function withEnvAdded(envs: Environment[], env: Environment): Environment[] {
  return [...envs, env];
}
export function withEnvRemoved(envs: Environment[], id: string): Environment[] {
  return envs.filter((e) => e.id !== id);
}
export function withEnvPatched(
  envs: Environment[],
  id: string,
  patch: Partial<Environment>,
): Environment[] {
  return envs.map((e) => (e.id === id ? { ...e, ...patch } : e));
}

export function withWebhookAdded(hooks: Webhook[], hook: Webhook): Webhook[] {
  return [...hooks, hook];
}
export function withWebhookRemoved(hooks: Webhook[], id: string): Webhook[] {
  return hooks.filter((h) => h.id !== id);
}
export function withWebhookPatched(
  hooks: Webhook[],
  id: string,
  patch: Partial<Webhook>,
): Webhook[] {
  return hooks.map((h) => (h.id === id ? { ...h, ...patch } : h));
}

/** Exclusions are a set — excluding an already-excluded experience is a no-op. */
export function withExclusionAdded(excluded: string[], id: string): string[] {
  return excluded.includes(id) ? excluded : [...excluded, id];
}
export function withExclusionRemoved(excluded: string[], id: string): string[] {
  return excluded.filter((e) => e !== id);
}

/**
 * Domains are entered space- or Enter-separated per the docs, and may be
 * regexes (`\.bar.com$`). Splitting on whitespace is therefore the whole rule —
 * a comma is not a separator, because it can appear inside a pattern.
 */
export function parseDomains(input: string): string[] {
  return input.split(/\s+/).map((d) => d.trim()).filter(Boolean);
}

/* ── the store ────────────────────────────────────────────────────────────── */

let state: SettingsState = hydrate();
const listeners = new Set<() => void>();

function hydrate(): SettingsState {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    return parseSettings(window.localStorage.getItem(KEY));
  } catch {
    return INITIAL_SETTINGS;
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — the page still works, it just won't survive a reload */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function getSettings(): SettingsState {
  return state;
}

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSettings(
  patch: Partial<SettingsState> | ((s: SettingsState) => Partial<SettingsState>),
) {
  const next = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...next };
  persist();
  emit();
}

export function resetSettings() {
  state = INITIAL_SETTINGS;
  persist();
  emit();
}

/* ── section mutators ─────────────────────────────────────────────────────── */

export const setProject = (patch: Partial<SettingsState['project']>) =>
  setSettings((s) => ({ project: { ...s.project, ...patch } }));

export const setAccount = (patch: Partial<SettingsState['account']>) =>
  setSettings((s) => ({ account: { ...s.account, ...patch } }));

export const setNotifications = (patch: Partial<SettingsState['notifications']>) =>
  setSettings((s) => ({ notifications: { ...s.notifications, ...patch } }));

export const setTeam = (patch: Partial<SettingsState['team']>) =>
  setSettings((s) => ({ team: { ...s.team, ...patch } }));

export const setRateLimit = (patch: Partial<SettingsState['rateLimit']>) =>
  setSettings((s) => ({ rateLimit: { ...s.rateLimit, ...patch } }));

export const setInstall = (patch: Partial<SettingsState['install']>) =>
  setSettings((s) => ({ install: { ...s.install, ...patch } }));

export const setTroubleshoot = (patch: Partial<SettingsState['troubleshoot']>) =>
  setSettings((s) => ({ troubleshoot: { ...s.troubleshoot, ...patch } }));

export const setThemes = (themes: Theme[]) => setSettings({ themes });
export const setEnvironments = (environments: Environment[]) => setSettings({ environments });
export const setWebhooks = (webhooks: Webhook[]) => setSettings({ webhooks });

export const setSubscription = (patch: Partial<SettingsState['subscription']>) =>
  setSettings((s) => ({ subscription: { ...s.subscription, ...patch } }));

/* ── faked async: integrations ────────────────────────────────────────────── */

function patchIntegration(id: string, patch: Partial<IntegrationState>) {
  setSettings((s) => ({
    integrations: { ...s.integrations, [id]: { ...s.integrations[id], ...patch } },
  }));
}

export function connectIntegration(id: string) {
  patchIntegration(id, { connecting: true });
  armTraining(`int-${id}`, () => finishConnect(id), CONNECT_MS);
}

function finishConnect(id: string) {
  patchIntegration(id, { connecting: false, connected: true, connectedAt: Date.now() });
}

export function disconnectIntegration(id: string) {
  disarmTraining(`int-${id}`);
  patchIntegration(id, {
    connecting: false,
    connected: false,
    connectedAt: null,
    matched: [],
    synced: [],
  });
}

/**
 * `connecting` is persisted but its timer id is not, so a row left mid-connect
 * when the tab closed would spin forever without this. Idempotent for the same
 * reason `resumeTraining` is: arming an id REPLACES its timer.
 */
export function resumeIntegrations() {
  Object.entries(state.integrations).forEach(([id, i]) => {
    if (i.connecting) armTraining(`int-${id}`, () => finishConnect(id), CONNECT_MS);
  });
}

/* ── faked async: installation ────────────────────────────────────────────── */

export function publishGtmTag(account: string, container: string) {
  setSettings((s) => ({
    install: { ...s.install, gtm: { status: 'publishing', account, container } },
  }));
  armTraining('gtm', finishGtm, GTM_PUBLISH_MS);
}

function finishGtm() {
  setSettings((s) => ({ install: { ...s.install, gtm: { ...s.install.gtm, status: 'published' } } }));
}

export function runInstallCheck() {
  setSettings((s) => ({ install: { ...s.install, check: { status: 'running', at: null } } }));
  armTraining('install-check', finishCheck, INSTALL_CHECK_MS);
}

function finishCheck() {
  setSettings((s) => ({ install: { ...s.install, check: { status: 'ok', at: Date.now() } } }));
}

/** The install twin of `resumeIntegrations` — same pairing, same reason. */
export function resumeInstall() {
  if (state.install.gtm.status === 'publishing') armTraining('gtm', finishGtm, GTM_PUBLISH_MS);
  if (state.install.check.status === 'running') {
    armTraining('install-check', finishCheck, INSTALL_CHECK_MS);
  }
}

/* ── cross-tab ────────────────────────────────────────────────────────────── */

// `storage` only fires in OTHER tabs, which is the semantics we want — the
// writing tab has already been notified synchronously by emit().
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    state = hydrate();
    emit();
  });
}

/** Exported for tests and for a future "reset workspace" affordance. */
export { KEY as SETTINGS_KEY, makeProjectId };
