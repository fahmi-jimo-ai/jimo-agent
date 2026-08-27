import * as React from 'react';
import { Book, Flash, Chart, Lifebuoy, MessageQuestion, Bubble } from 'iconsax-react';
import { AgentIcon } from '@/components/ui/Icon/Icon';
import type { SidebarSection } from '@/components/ui/SecondaryNavSidebar/SecondaryNavSidebar';

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
  Knowledge: '/knowledge',
  Statistics: '/statistics',
  Conversations: '/conversations',
};
