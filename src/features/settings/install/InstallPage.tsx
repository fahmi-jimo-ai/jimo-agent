import * as React from 'react';
import { useSettings, resumeInstall } from '@/state/useSettings';
import { SettingsShell } from '../SettingsShell';
import { InstallTab } from './InstallTab';
import { IdentifyTab } from './IdentifyTab';

/**
 * `/settings/installation` — Figma 13:9731, split into the two tabs the docs
 * describe: Install and Identification (i.usejimo.com/settings/install/identify).
 *
 * Tabs are component state, not routes — same rule as Team and Knowledge.
 */
const TABS = [
  { id: 'install', label: 'Install' },
  { id: 'identify', label: 'Identification' },
];

export function InstallPage({ initialTab = 'install' }: { initialTab?: string } = {}) {
  const [tab, setTab] = React.useState(initialTab);
  const { install } = useSettings();

  // The GTM publish and the installation check both persist their status but
  // not their timer id, so either could strand mid-flight across a reload.
  React.useEffect(() => {
    resumeInstall();
  }, []);

  return (
    <SettingsShell
      activeItem="Installation"
      title="Installation"
      tabs={TABS}
      activeTab={tab}
      onTabClick={setTab}
      meta={
        install.check.status === 'ok' ? <span>Snippet verified</span> : undefined
      }
    >
      {tab === 'install' ? <InstallTab /> : <IdentifyTab />}
    </SettingsShell>
  );
}
