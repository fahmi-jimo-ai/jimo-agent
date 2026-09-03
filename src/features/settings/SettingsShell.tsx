import * as React from 'react';
import { AppShell } from '@/app/AppShell';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { SETTINGS_NAV_SECTIONS, SETTINGS_ROUTES } from './settingsNav';

/**
 * The shell every `/settings/*` page renders into.
 *
 * It is the SAME AppShell the agent console uses — same icon rail, same Subpage
 * column — with the secondary sidebar swapped for the settings IA. That is the
 * whole difference, and it is why `sections`/`routes` are AppShell props rather
 * than a second shell component.
 *
 * `activeItem` is the sidebar LABEL, which is how SecondaryNavSidebar marks the
 * active row; `title` is the page's own <h1>. They are usually the same string
 * but not always ("My account" vs "My Account", per the artboards).
 */
export function SettingsShell({
  activeItem,
  title,
  tabs,
  activeTab,
  onTabClick,
  actions,
  meta,
  children,
}: {
  activeItem: string;
  title: React.ReactNode;
  /** Sub-tabs WITHIN a settings page (Team, Installation) — component state, not routes. */
  tabs?: { id: string; label?: React.ReactNode; icon?: React.ReactNode }[];
  activeTab?: string;
  onTabClick?: (id: string) => void;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <AppShell
      activeItem={activeItem}
      railItem="Settings"
      sections={SETTINGS_NAV_SECTIONS}
      routes={SETTINGS_ROUTES}
      header={
        <PageHeader
          title={title}
          showButtonGroup={false}
          showTabs={tabs != null && tabs.length > 0}
          tabs={tabs ?? []}
          activeTab={activeTab}
          onTabClick={onTabClick}
          actions={actions}
          meta={meta}
        />
      }
    >
      {children}
    </AppShell>
  );
}
