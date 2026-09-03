import * as React from 'react';
import { Book, Flash, Chart, Lifebuoy, MessageQuestion, Bubble } from 'iconsax-react';
import { AgentIcon } from '@/components/ui/Icon/Icon';
import type { SidebarSection } from '@/components/ui/SecondaryNavSidebar/SecondaryNavSidebar';
import {
  EXPERIENCE_NAV_LABEL,
  EXPERIENCE_ROUTE,
  EXPERIENCE_TYPES,
} from '@/data/experiences';

const S = 20;
const pair = (Ico: React.ElementType) => ({
  icon: <Ico size={S} variant="Linear" color="currentColor" />,
  iconActive: <Ico size={S} variant="Bold" color="currentColor" />,
});

/**
 * The agent sidebar. Icons follow the Figma instance names where the item
 * already existed in 43:7182:
 *   Chat       → Group 46993 (the Jimo face)  → AgentIcon
 *   Knowledge  → vuesax/linear/book           → Book
 *   Skills     → vuesax/bold/flash            → Flash
 *   Statistics → vuesax/linear/chart          → Chart
 * Escalation deliberately departs from Figma (43:7182 shows device-message):
 * Lifebuoy reads as "get help from a human", which is what the page is about.
 * Launcher and Conversations are new to the IA and have no Figma instance yet:
 * Bubble reads as the floating widget launcher, and MessageQuestion is what
 * upstream Moji's own sidebar uses for Conversations.
 */
export const AGENT_NAV_SECTIONS: SidebarSection[] = [
  {
    title: 'Customize',
    items: [
      {
        label: 'Chat',
        icon: <AgentIcon size={S} variant="Linear" />,
        iconActive: <AgentIcon size={S} variant="Bold" />,
      },
      { label: 'Launcher', ...pair(Bubble) },
    ],
  },
  {
    title: 'Train',
    items: [
      { label: 'Knowledge', ...pair(Book) },
      { label: 'Skills', ...pair(Flash) },
      { label: 'Escalation', ...pair(Lifebuoy) },
    ],
  },
  {
    title: 'Analyze',
    items: [
      { label: 'Statistics', ...pair(Chart) },
      { label: 'Conversations', ...pair(MessageQuestion) },
    ],
  },
];

/**
 * Label → route, for the items that actually have a page. Kept as a plain map
 * beside the sections rather than a `route` field on SidebarItem: that type is
 * vendored from Moji, and the local SecondaryNavSidebar fork is meant to stay
 * additive-and-minimal (the `sections` prop and the divider, nothing more).
 */
export const NAV_ROUTES: Record<string, string> = {
  Escalation: '/escalation',
  Skills: '/skills',
  Knowledge: '/knowledge',
  Statistics: '/statistics',
  Conversations: '/conversations',
};

/**
 * The PRIMARY rail's label → route map.
 *
 * `PrimaryNavSidebar` is vendored and already ships all six experience types
 * as peers of the Agent — `NAV_ITEMS_ENGAGEMENT` is Tours / Surveys / Banners /
 * Hints and `NAV_ITEMS_CONTENT` is Checklists / Agent / Resource Center /
 * Changelog Posts — so Experiences need no new nav taxonomy and neither
 * sidebar is forked. They are not a section of `AGENT_NAV_SECTIONS`: that array
 * is the Agent console's own IA (Customize / Train / Analyze), and filing Tours
 * inside it would claim Tours are part of the Agent while the rail one column
 * to the left says otherwise.
 *
 * Same "inert by omission" contract as `NAV_ROUTES`: Get Started, Changelog
 * Posts, Spaces, Success Trackers, Actions, Users & Segments and Settings have
 * no entry here and stay dead, rather than navigating to a page that does not
 * exist. `Changelog Posts` is the `POST` member of the workspace enum and has
 * no skeleton — see `experiences.ts`.
 *
 * The keys are the RAIL's own labels, which is how `PrimaryNavSidebar` marks
 * active — note "Resource Center", singular, where the page title is plural.
 * `experiences.test.ts` asserts every type resolves, so a rename on either side
 * fails a test rather than silently killing a sidebar item.
 */
export const PRIMARY_NAV_ROUTES: Record<string, string> = {
  Agent: '/escalation',
  ...EXPERIENCE_TYPES.reduce<Record<string, string>>((acc, type) => {
    acc[EXPERIENCE_NAV_LABEL[type]] = EXPERIENCE_ROUTE[type];
    return acc;
  }, {}),
};
