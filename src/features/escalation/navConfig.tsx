import * as React from 'react';
import { Book, Flash, Chart, DeviceMessage, MessageQuestion, Bubble } from 'iconsax-react';
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
 *   Escalation → vuesax/linear/device-message → DeviceMessage
 *   Statistics → vuesax/linear/chart          → Chart
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
      { label: 'Escalation', ...pair(DeviceMessage) },
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
