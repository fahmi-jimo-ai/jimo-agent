import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Subpage } from '@/components/ui/Subpage/Subpage';
import { PrimaryNavSidebar } from '@/components/ui/PrimaryNavSidebar/PrimaryNavSidebar';
import {
  SecondaryNavSidebar,
  type SidebarSection,
} from '@/components/ui/SecondaryNavSidebar/SecondaryNavSidebar';
import { AGENT_NAV_SECTIONS, NAV_ROUTES, PRIMARY_NAV_ROUTES } from './navConfig';

/**
 * The one shell every page renders into: the nav rails plus Subpage.
 *
 * Lives here rather than in a feature folder because the label→route map is an
 * app concern — a page should not have to know how its siblings are addressed.
 * `header`, `contentClassName` and `maxWidth` stay pass-throughs so EscalationPage
 * keeps owning its own header-less empty state (Figma 43:6580) unchanged, and
 * ConversationsPage can widen its column to the full viewport.
 *
 * ## Two additive props, both defaulting to what this file already did
 *
 * `primaryItem` and `sections` exist for the Experiences pages, which are peers
 * of the Agent in the PRIMARY rail rather than items inside the Agent's own IA.
 * Both default to the Agent console's values, so every pre-existing call site
 * renders byte-identically and neither sidebar component is forked.
 *
 * `sections={null}` renders NO secondary rail. That is omission, not a fork —
 * `Subpage` already types `secondaryNav` optional. An Experiences page has no
 * secondary nav because none is designed for one, and lending it the Agent's
 * would misstate the IA.
 *
 * `primaryCollapsed` follows from that. The Agent console collapses the primary
 * rail to 48px because its own secondary rail is already naming where you are;
 * with no second rail there is nothing left to read, so the Experiences pages
 * expand it — which is also what the product does and what the skeleton's
 * single 288px "Main Sidebar" block stands in for. Defaults to `true`, so every
 * pre-existing page is unchanged.
 */
type AppShellProps = {
  /** Matches a SidebarItem label — that is how SecondaryNavSidebar marks active. */
  activeItem: string;
  /** Matches a PrimaryNavSidebar label. Defaults to the Agent console's own. */
  primaryItem?: string;
  /** `null` renders no secondary rail at all. */
  sections?: SidebarSection[] | null;
  /** Defaults to the Agent console's collapsed rail. */
  primaryCollapsed?: boolean;
  header?: React.ReactNode;
  contentClassName?: string;
  /** Content-column cap. Defaults to the 1064 every page but Conversations uses. */
  maxWidth?: number | string;
  children?: React.ReactNode;
};

export function AppShell({
  activeItem,
  primaryItem = 'Agent',
  sections = AGENT_NAV_SECTIONS,
  primaryCollapsed = true,
  header,
  contentClassName,
  maxWidth = 1064,
  children,
}: AppShellProps) {
  const navigate = useNavigate();

  // Labels with no route (Chat, Launcher on the secondary rail; Spaces,
  // Settings and the rest on the primary one) fall through and stay inert,
  // rather than navigating to a page that is not built yet. Both sidebars are
  // honest about what exists.
  const go = (label: string) => {
    const to = NAV_ROUTES[label];
    if (to) navigate(to);
  };

  const goPrimary = (label: string) => {
    const to = PRIMARY_NAV_ROUTES[label];
    if (to) navigate(to);
  };

  return (
    <Subpage
      maxWidth={maxWidth}
      primaryNav={
        <PrimaryNavSidebar
          collapsed={primaryCollapsed}
          activeItem={primaryItem}
          onItemClick={goPrimary}
        />
      }
      secondaryNav={
        sections ? (
          <SecondaryNavSidebar
            sections={sections}
            activeItem={activeItem}
            onItemClick={go}
          />
        ) : undefined
      }
      contentClassName={contentClassName}
      header={header}
    >
      {children}
    </Subpage>
  );
}
