import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Subpage } from '@/components/ui/Subpage/Subpage';
import { PrimaryNavSidebar } from '@/components/ui/PrimaryNavSidebar/PrimaryNavSidebar';
import {
  SecondaryNavSidebar,
  type SidebarSection,
} from '@/components/ui/SecondaryNavSidebar/SecondaryNavSidebar';
import { AGENT_NAV_SECTIONS, NAV_ROUTES } from './navConfig';

/**
 * The one shell every page renders into: the two nav rails plus Subpage.
 *
 * Lives here rather than in a feature folder because the label→route map is an
 * app concern — a page should not have to know how its siblings are addressed.
 * `header`, `contentClassName` and `maxWidth` stay pass-throughs so EscalationPage
 * keeps owning its own header-less empty state (Figma 43:6580) unchanged, and
 * ConversationsPage can widen its column to the full viewport.
 *
 * `sections`/`routes` default to the agent console's IA, so all five agent pages
 * are unchanged. `/settings` is a second product surface inside the same shell
 * and passes its own pair — see src/features/settings/settingsNav.tsx.
 */
/**
 * The icon rail's two live entries. `Settings` is how you actually reach
 * /settings — every settings artboard draws the gear lit — and `Agent` is the
 * way back to the console. The other twelve rail items are other Jimo products
 * that do not exist in this repo, so they stay inert.
 */
const RAIL_ROUTES: Record<string, string> = {
  Agent: '/escalation',
  Settings: '/settings/general',
};

type AppShellProps = {
  /** Matches a SidebarItem label — that is how SecondaryNavSidebar marks active. */
  activeItem: string;
  header?: React.ReactNode;
  contentClassName?: string;
  /** Content-column cap. Defaults to the 1064 every page but Conversations uses. */
  maxWidth?: number | string;
  /** Which icon-rail entry is lit. `/settings` passes "Settings". */
  railItem?: string;
  /** Sidebar IA. Defaults to the agent console's. */
  sections?: SidebarSection[];
  /** Label → route for `sections`. A label absent from it stays inert. */
  routes?: Record<string, string>;
  children?: React.ReactNode;
};

export function AppShell({
  activeItem,
  header,
  contentClassName,
  maxWidth = 1064,
  railItem = 'Agent',
  sections = AGENT_NAV_SECTIONS,
  routes = NAV_ROUTES,
  children,
}: AppShellProps) {
  const navigate = useNavigate();

  // Labels with no route (Chat, Launcher; Events under /settings) fall through
  // and stay inert, rather than navigating to a page that is not built yet.
  // The sidebar is honest about what exists — and this absence IS the mechanism,
  // so no item needs a `disabled` flag or a special case.
  const go = (label: string) => {
    const to = routes[label];
    if (to) navigate(to);
  };

  // The icon rail lists Jimo's whole product surface; this app is two of them.
  // Same honesty rule as `go` — a label with no route does nothing rather than
  // navigating somewhere that is not built.
  const goRail = (label: string) => {
    const to = RAIL_ROUTES[label];
    if (to) navigate(to);
  };

  return (
    <Subpage
      maxWidth={maxWidth}
      primaryNav={
        <PrimaryNavSidebar collapsed activeItem={railItem} onItemClick={goRail} />
      }
      secondaryNav={
        <SecondaryNavSidebar sections={sections} activeItem={activeItem} onItemClick={go} />
      }
      contentClassName={contentClassName}
      header={header}
    >
      {children}
    </Subpage>
  );
}
