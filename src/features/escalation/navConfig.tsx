import * as React from 'react';
import { Book, Flash, Chart, DeviceMessage, MessageNotif, BoxSearch } from 'iconsax-react';
import { AgentIcon } from '@/components/ui/Icon/Icon';
import type { SidebarSection } from '@/components/ui/SecondaryNavSidebar/SecondaryNavSidebar';

const S = 20;
const pair = (Ico: React.ElementType) => ({
  icon: <Ico size={S} variant="Linear" color="currentColor" />,
  iconActive: <Ico size={S} variant="Bold" color="currentColor" />,
});

/**
 * The agent sidebar exactly as drawn in Figma (43:7182). Icon choices are the
 * Figma instance names, not guesses:
 *   Chat                → Group 46993 (the Jimo face)  → AgentIcon
 *   Knowledge / Trigger → vuesax/linear/book           → Book
 *   Skills              → vuesax/bold/flash            → Flash
 *   Analyze             → vuesax/linear/chart          → Chart
 *   Escalation          → vuesax/linear/device-message → DeviceMessage
 *   Contextual Triggers → vuesax/linear/message-notif  → MessageNotif
 *   Observe             → vuesax/linear/box-search     → BoxSearch
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
      { label: 'Knowledge', ...pair(Book) },
      { label: 'Skills', ...pair(Flash) },
      { label: 'Trigger', ...pair(Book) },
      { label: 'Analyze', ...pair(Chart) },
      { label: 'Escalation', ...pair(DeviceMessage) },
    ],
  },
  {
    // Not `disabled: true` on the section — that would render the title as
    // "Coming Soon (Coming Soon)". The items carry the disabled state instead.
    title: 'Coming Soon',
    items: [
      { label: 'Contextual Triggers', ...pair(MessageNotif), disabled: true },
      { label: 'Observe', ...pair(BoxSearch), disabled: true },
    ],
  },
];
