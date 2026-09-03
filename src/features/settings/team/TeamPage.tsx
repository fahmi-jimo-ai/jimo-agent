import * as React from 'react';
import { SettingsShell } from '../SettingsShell';
import { MembersTab } from './MembersTab';
import { RolesTab } from './RolesTab';

/**
 * `/settings/team` — Figma 13:4842, plus the Roles tab the docs describe.
 *
 * The two tabs are COMPONENT STATE, not routes, matching Knowledge exactly:
 * a sidebar item is an address, but which tab you are on inside a page is
 * where a reader is, not configuration.
 */
const TABS = [
  { id: 'members', label: 'Members' },
  { id: 'roles', label: 'Roles' },
];

export function TeamPage({ initialTab = 'members' }: { initialTab?: string } = {}) {
  const [tab, setTab] = React.useState(initialTab);

  return (
    <SettingsShell
      activeItem="Team"
      title="Team"
      tabs={TABS}
      activeTab={tab}
      onTabClick={setTab}
    >
      {tab === 'members' ? <MembersTab /> : <RolesTab />}
    </SettingsShell>
  );
}
