import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Subpage } from '@/components/ui/Subpage/Subpage';
import { PrimaryNavSidebar } from '@/components/ui/PrimaryNavSidebar/PrimaryNavSidebar';
import { SecondaryNavSidebar } from '@/components/ui/SecondaryNavSidebar/SecondaryNavSidebar';
import { AGENT_NAV_SECTIONS, NAV_ROUTES } from './navConfig';

/**
 * The one shell every page renders into: the two nav rails plus Subpage.
 *
 * Lives here rather than in a feature folder because the label→route map is an
 * app concern — a page should not have to know how its siblings are addressed.
 * `header` and `contentClassName` stay pass-throughs so EscalationPage keeps
 * owning its own header-less empty state (Figma 43:6580) unchanged.
 */
type AppShellProps = {
  /** Matches a SidebarItem label — that is how SecondaryNavSidebar marks active. */
  activeItem: string;
  header?: React.ReactNode;
  contentClassName?: string;
  children?: React.ReactNode;
};

export function AppShell({ activeItem, header, contentClassName, children }: AppShellProps) {
  const navigate = useNavigate();

  // Labels with no route (Chat, Launcher, Skills, Statistics, Conversations)
  // fall through and stay inert, rather than navigating to a page that is not
  // built yet. The sidebar is honest about what exists.
  const go = (label: string) => {
    const to = NAV_ROUTES[label];
    if (to) navigate(to);
  };

  return (
    <Subpage
      maxWidth={1064}
      primaryNav={<PrimaryNavSidebar collapsed activeItem="Agent" />}
      secondaryNav={
        <SecondaryNavSidebar
          sections={AGENT_NAV_SECTIONS}
          activeItem={activeItem}
          onItemClick={go}
        />
      }
      contentClassName={contentClassName}
      header={header}
    >
      {children}
    </Subpage>
  );
}
