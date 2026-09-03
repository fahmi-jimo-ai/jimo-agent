import * as React from 'react';
import {
  Setting2,
  Brush,
  Code1,
  Timer1,
  Profile2User,
  ElementPlus,
  Radar,
  Layer,
  Health,
  DollarCircle,
  Card,
  Mouse,
  Notification,
  Book1,
  MessageQuestion,
  LogoutCurve,
  ExportSquare,
} from 'iconsax-react';
import { Avatar } from '@/components/app/Avatar';
import type { SidebarSection } from '@/components/ui/SecondaryNavSidebar/SecondaryNavSidebar';

/**
 * The `/settings` sidebar — the Jimo PLATFORM's IA, not the agent's.
 *
 * Structure is the artboards' (Figma z7EQ0w6HgJkQ80VDck0JaG, 13:27205: a Project
 * group, an Account group, then an untitled footer group). Membership is the
 * Help Center's, which supersedes the artboards for this area:
 *
 *   - Environments (help.usejimo.com/docs/settings/environments) and Troubleshoot
 *     (/docs/settings/troubleshooting) are real settings pages that no artboard
 *     draws. They sit after Integrations, where the docs place them ("in the
 *     Project settings section").
 *   - Webhooks keeps the artboard's top-level POSITION but routes to the docs'
 *     address, /settings/integrations/webhooks — the sidebar matches the design
 *     while the URL matches the product.
 *   - Events is the one item with no page. The docs put Events under
 *     Analyze → Success tracker, not settings, so there is nothing behind it
 *     here. It is inert by absence from SETTINGS_ROUTES, exactly as Chat and
 *     Launcher are in navConfig.tsx — no `disabled` flag, no special case.
 *
 * Icons follow the artboard glyphs where one exists; `Broadcast` and `Cursor`
 * (the Webhooks and Events glyphs) are not among iconsax's 993 exports, so those
 * two are the nearest reading: Radar for a broadcast, Mouse for a click event.
 */
const S = 20;
const pair = (Ico: React.ElementType) => ({
  icon: <Ico size={S} variant="Linear" color="currentColor" />,
  iconActive: <Ico size={S} variant="Bold" color="currentColor" />,
});

export const SETTINGS_NAV_SECTIONS: SidebarSection[] = [
  {
    title: 'Project',
    items: [
      { label: 'General', ...pair(Setting2) },
      { label: 'Themes', ...pair(Brush) },
      { label: 'Installation', ...pair(Code1) },
      { label: 'Rate limit', ...pair(Timer1) },
      { label: 'Team', ...pair(Profile2User) },
      { label: 'Integrations', ...pair(ElementPlus) },
      { label: 'Webhooks', ...pair(Radar) },
      { label: 'Environments', ...pair(Layer) },
      { label: 'Troubleshoot', ...pair(Health) },
      { label: 'Plan', ...pair(DollarCircle) },
      { label: 'Billing', ...pair(Card) },
      // No route — see the header. The docs do not put Events in settings.
      { label: 'Events', ...pair(Mouse) },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        // The artboard draws the user's own avatar disc here, not a glyph.
        label: 'My account',
        // Avatar's smallest is 32px and SecondaryNavItem's icon slot is 20px, so
        // it is trimmed here rather than by adding a size to Avatar for one
        // caller. `cn` is tailwind-merge, so size-5 beats the variant's size-8.
        icon: <Avatar name="Fahmi Dani" size="small" className="size-5 [font:var(--text-body-5)]" />,
        iconActive: (
          <Avatar name="Fahmi Dani" size="small" className="size-5 [font:var(--text-body-5)]" />
        ),
      },
      { label: 'Notifications', ...pair(Notification) },
    ],
  },
  {
    // Untitled footer group. Documentation leaves the app, so it is a real <a>
    // with a trailing ↗; Log out is the one red row. Both ride the additive
    // SidebarItem fork rather than any new visual code — see CONTEXT.md.
    items: [
      {
        label: 'Documentation',
        ...pair(Book1),
        href: 'https://help.usejimo.com/docs',
        trailing: <ExportSquare size={16} variant="Linear" color="currentColor" />,
      },
      { label: 'Feedback', ...pair(MessageQuestion) },
      {
        label: 'Log out',
        ...pair(LogoutCurve),
        className: 'text-[var(--color-danger-default)] hover:text-[var(--color-danger-default)]',
      },
    ],
  },
];

/**
 * Label → route. Paths follow the docs' own URLs (i.usejimo.com/settings/team,
 * /settings/billing, /settings/environments, /settings/troubleshoot,
 * /settings/integrations/webhook) so a docs link and an app link agree.
 *
 * `Events`, `Feedback` and `Log out` are deliberately absent: the first has no
 * page, and the last two are app-level actions this prototype has no backend for.
 * `Documentation` is absent too because it navigates via `href`, not the router.
 */
export const SETTINGS_ROUTES: Record<string, string> = {
  General: '/settings/general',
  Themes: '/settings/themes',
  Installation: '/settings/installation',
  'Rate limit': '/settings/rate-limit',
  Team: '/settings/team',
  Integrations: '/settings/integrations',
  Webhooks: '/settings/integrations/webhooks',
  Environments: '/settings/environments',
  Troubleshoot: '/settings/troubleshoot',
  Plan: '/settings/plan',
  Billing: '/settings/billing',
  'My account': '/settings/account',
  Notifications: '/settings/notifications',
};
