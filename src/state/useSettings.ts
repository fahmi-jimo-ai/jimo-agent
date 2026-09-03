import { useSyncExternalStore } from 'react';
import { getSettings, subscribeSettings } from './settingsStore';
import type { SettingsState } from './settingsStore';

export function useSettings(): SettingsState {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings);
}

export {
  setSettings,
  resetSettings,
  setProject,
  setAccount,
  setNotifications,
  setTeam,
  setRateLimit,
  setInstall,
  setTroubleshoot,
  setThemes,
  setEnvironments,
  setWebhooks,
  setSubscription,
  connectIntegration,
  disconnectIntegration,
  resumeIntegrations,
  publishGtmTag,
  runInstallCheck,
  resumeInstall,
  parseSettings,
  parseDomains,
  withMemberAdded,
  withMemberRemoved,
  withMemberPatched,
  withThemeAdded,
  withThemeRemoved,
  withThemePatched,
  withDefaultTheme,
  withEnvAdded,
  withEnvRemoved,
  withEnvPatched,
  withWebhookAdded,
  withWebhookRemoved,
  withWebhookPatched,
  withExclusionAdded,
  withExclusionRemoved,
  INITIAL_SETTINGS,
} from './settingsStore';
export type {
  SettingsState,
  Webhook,
  Environment,
  Invoice,
  IntegrationState,
  SubscriptionStatus,
} from './settingsStore';
