import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../../src/components/app/toast';
import { resetSettings, setSettings } from '../../src/state/settingsStore';
import { DEMO_MEMBERS, DEMO_THEMES, DEFAULT_ROLES, makeInvoiceId } from '../../src/data/settings';

import { GeneralPage } from '../../src/features/settings/general/GeneralPage';
import { AccountPage } from '../../src/features/settings/account/AccountPage';
import { NotificationsPage } from '../../src/features/settings/notifications/NotificationsPage';
import { TeamPage } from '../../src/features/settings/team/TeamPage';
import { RateLimitPage } from '../../src/features/settings/rate-limit/RateLimitPage';
import { InstallPage } from '../../src/features/settings/install/InstallPage';
import { IntegrationsPage } from '../../src/features/settings/integrations/IntegrationsPage';
import { WebhooksPage } from '../../src/features/settings/integrations/WebhooksPage';
import { EnvironmentsPage } from '../../src/features/settings/environments/EnvironmentsPage';
import { TroubleshootPage } from '../../src/features/settings/troubleshoot/TroubleshootPage';
import { ThemesPage } from '../../src/features/settings/themes/ThemesPage';
import { PlanPage } from '../../src/features/settings/plan/PlanPage';
import { BillingPage } from '../../src/features/settings/billing/BillingPage';

/**
 * One story per artboard state in Figma section 13:27205, each seeding the
 * settings store then rendering the real page — so a story can be diffed
 * straight against the frame it names.
 *
 * Four pages have NO artboard and therefore no `design` parameter: Roles,
 * Webhooks, Environments and Troubleshoot. They are built from the Help
 * Center, which supersedes the artboards for this area, and each says so in
 * its own header comment. Their stories exist so the invented layouts are at
 * least reviewable side by side with the designed ones.
 */
const FIGMA = 'https://www.figma.com/design/z7EQ0w6HgJkQ80VDck0JaG/Agent-Designer-Sandbox?node-id=';

const meta = {
  title: 'Pages/SettingsPages',
  parameters: { layout: 'fullscreen' },
};
export default meta;

const DAY = 86_400_000;

/** Seed helpers — each returns a function so the reset happens at render time. */
const seed = (patch) => () => {
  resetSettings();
  if (patch) setSettings(patch);
};

const page = (Page, path, seedFn, node, props = {}) => ({
  render: () => {
    seedFn();
    return (
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <div style={{ height: '900px' }}>
            <Routes>
              <Route path={path} element={<Page {...props} />} />
            </Routes>
          </div>
        </MemoryRouter>
      </ToastProvider>
    );
  },
  ...(node ? { parameters: { design: { type: 'figma', url: FIGMA + node } } } : {}),
});

/* ── General (13:9257) — the two Hide-Jimo-label variants ─────────────────── */

export const GeneralTrialAvailable = page(GeneralPage, '/settings/general', seed(), '13-9258');

export const GeneralTrialSpent = page(
  GeneralPage,
  '/settings/general',
  seed({ subscription: { ...emptySub(), trialEndsAt: Date.now() - DAY } }),
  '13-9303',
);

/* ── My Account (13:14165) ────────────────────────────────────────────────── */

export const Account = page(AccountPage, '/settings/account', seed(), '13-14221');

/* ── Notifications (13:11547) ─────────────────────────────────────────────── */

export const Notifications = page(
  NotificationsPage,
  '/settings/notifications',
  seed(),
  '13-11548',
);

/* ── Team (13:4842) — under the seat limit, and at it ─────────────────────── */

export const TeamUnderLimit = page(TeamPage, '/settings/team', seed(), '13-4843');

export const TeamAtSeatLimit = page(
  TeamPage,
  '/settings/team',
  seed({
    team: {
      autoJoinDomain: true,
      members: [
        ...DEMO_MEMBERS(),
        { id: 'm-x1', name: 'Andy', email: 'andy@usejimo.com', role: 'viewer', status: 'active' },
        { id: 'm-x2', name: 'Sam', email: 'sam@usejimo.com', role: 'viewer', status: 'pending' },
      ],
      roles: DEFAULT_ROLES,
    },
  }),
  '13-4969',
);

/* No artboard — see RolesTab's header. */
export const TeamRoles = page(TeamPage, '/settings/team', seed(), null, { initialTab: 'roles' });

/* ── Rate limit (13:11148) ────────────────────────────────────────────────── */

export const RateLimitEmpty = page(RateLimitPage, '/settings/rate-limit', seed(), '13-11209');

export const RateLimitWithExclusions = page(
  RateLimitPage,
  '/settings/rate-limit',
  seed({
    rateLimit: { enabled: true, count: 1, every: 4, unit: 'hour', excluded: ['exp-sat', 'exp-ph'] },
  }),
  '13-11149',
);

/* ── Installation (13:9731) ───────────────────────────────────────────────── */

export const InstallSnippet = page(InstallPage, '/settings/installation', seed(), '13-10464');

export const InstallGtmPublished = page(
  InstallPage,
  '/settings/installation',
  seed({
    install: {
      gtm: { status: 'published', account: 'Acme Inc.', container: 'GTM-ABC1234' },
      check: { status: 'ok', at: Date.now() },
      forceIdentify: false,
      identityVerification: false,
    },
  }),
  '13-10167',
);

/* The Identification tab is the docs' split; 13:10701 draws its content as
   part of one long page. */
export const InstallIdentification = page(
  InstallPage,
  '/settings/installation',
  seed({
    install: {
      gtm: { status: 'idle', account: null, container: null },
      check: { status: 'idle', at: null },
      forceIdentify: true,
      identityVerification: true,
    },
  }),
  '13-10701',
  { initialTab: 'identify' },
);

/* ── Integrations (13:9349) ───────────────────────────────────────────────── */

export const IntegrationsCatalogue = page(
  IntegrationsPage,
  '/settings/integrations',
  seed(),
  '13-9350',
);

export const IntegrationsHubSpotDetail = page(
  IntegrationsPage,
  '/settings/integrations',
  seed({
    integrations: {
      hubspot: {
        connected: true,
        connecting: false,
        connectedAt: Date.now() - 8 * DAY,
        matched: [{ id: 'fm-1', jimo: 'Email', vendor: 'email' }],
        synced: [{ id: 'fs-1', jimo: 'Plan', vendor: 'subscription_tier' }],
      },
    },
  }),
  '13-9423',
  { initialDetailId: 'hubspot' },
);

/* No artboard — docs-sourced. See WebhooksPage's header. */
export const WebhooksEmpty = page(WebhooksPage, '/settings/integrations/webhooks', seed(), null);

export const WebhooksWithFailures = page(
  WebhooksPage,
  '/settings/integrations/webhooks',
  seed({
    webhooks: [
      {
        id: 'wh-1',
        endpoint: 'https://api.acme.test/jimo/webhook',
        events: ['tours', 'surveys'],
        active: true,
        deliveries: [
          { at: Date.now() - 3600_000, status: 200, ok: true },
          { at: Date.now() - 1800_000, status: 503, ok: false },
        ],
      },
    ],
  }),
  null,
);

/* ── Environments and Troubleshoot — no artboards, docs-sourced ───────────── */

export const EnvironmentsEmpty = page(EnvironmentsPage, '/settings/environments', seed(), null);

export const EnvironmentsPopulated = page(
  EnvironmentsPage,
  '/settings/environments',
  seed({
    environments: [
      {
        id: 'env-prod',
        name: 'Production',
        icon: 'global',
        colour: 'green',
        domains: ['app.acme.com'],
        description: 'Live customers.',
      },
      {
        id: 'env-stg',
        name: 'Staging',
        icon: 'code',
        colour: 'orange',
        domains: ['staging.acme.com', '\\.*acme.dev$'],
        description: '',
      },
    ],
  }),
  null,
);

export const Troubleshoot = page(TroubleshootPage, '/settings/troubleshoot', seed(), null);

/* ── Themes (13:10824) ────────────────────────────────────────────────────── */

/* Default only — the kebab omits Delete here (13:11125). */
export const ThemesDefaultOnly = page(ThemesPage, '/settings/themes', seed(), '13-11069');

/* With a custom theme, the kebab gains Delete (13:11124). */
export const ThemesWithCustom = page(
  ThemesPage,
  '/settings/themes',
  seed({
    themes: [
      ...DEMO_THEMES(),
      {
        id: 'theme-brand',
        name: 'Brand 2026',
        font: 'Inter, Arial',
        colours: ['--color-purple-400', '--color-blue-100', '--color-neutral-800'],
        isDefault: false,
      },
    ],
  }),
  '13-11124',
);

/* The builder SHELL — see ThemeBuilder's header for what is deliberately absent. */
export const ThemeBuilderShell = page(
  ThemesPage,
  '/settings/themes',
  seed(),
  '13-10825',
  { initialThemeId: 'theme-default' },
);

/* ── Plan (13:7852) ───────────────────────────────────────────────────────── */

export const PlanTrialEligible = page(PlanPage, '/settings/plan', seed(), '13-7853');

export const PlanTrialSpent = page(
  PlanPage,
  '/settings/plan',
  seed({ subscription: { ...emptySub(), status: 'active', plan: 'growth', period: 'yearly', trialEndsAt: Date.now() - 30 * DAY } }),
  '13-8060',
);

/* ── Billing (13:11570) — the four states ─────────────────────────────────── */

/* Where a fresh workspace actually lands. */
export const BillingFree = page(BillingPage, '/settings/billing', seed(), '13-13269');

export const BillingTrialing = page(
  BillingPage,
  '/settings/billing',
  seed({
    subscription: {
      ...emptySub(),
      status: 'trialing',
      plan: 'growth',
      period: 'yearly',
      seats: 5,
      trialEndsAt: Date.now() + 14 * DAY,
      renewsAt: Date.now() + 14 * DAY,
      invoices: [
        { id: makeInvoiceId(), date: 'December 1st, 2023', amount: '$0 USD', plan: 'Growth Free Trial' },
      ],
    },
  }),
  '13-12764',
);

export const BillingActive = page(
  BillingPage,
  '/settings/billing',
  seed({
    subscription: {
      ...emptySub(),
      status: 'active',
      plan: 'growth',
      period: 'yearly',
      seats: 5,
      hideJimoLabelAddon: true,
      renewsAt: Date.now() + 200 * DAY,
      card: { brand: 'Visa', last4: '1234', exp: '05/22' },
      invoices: [
        { id: makeInvoiceId(), date: 'December 4th, 2023', amount: '$2,868 USD', plan: 'Growth Yearly Plan' },
        { id: makeInvoiceId(), date: 'December 1st, 2023', amount: '$0 USD', plan: 'Growth Free Trial' },
      ],
    },
  }),
  '13-11842',
);

export const BillingCancelled = page(
  BillingPage,
  '/settings/billing',
  seed({
    subscription: {
      ...emptySub(),
      status: 'cancelled',
      plan: 'growth',
      trialEndsAt: Date.now() - 60 * DAY,
      card: { brand: 'Visa', last4: '1234', exp: '05/22' },
      invoices: [
        { id: makeInvoiceId(), date: 'December 4th, 2023', amount: '$99 USD', plan: 'Growth Yearly Plan' },
      ],
    },
  }),
  '13-12409',
);

/** The store's own default subscription, for stories that vary one field. */
function emptySub() {
  return {
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
  };
}
