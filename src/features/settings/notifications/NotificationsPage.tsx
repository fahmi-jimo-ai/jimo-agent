import * as React from 'react';
import { Switch } from '@/components/ui/Toggle/switch';
import { SettingCard, SettingRow } from '@/components/app/SettingRow';
import { useSettings, setNotifications } from '@/state/useSettings';
import { SettingsShell } from '../SettingsShell';

/**
 * `/settings/notifications` — Figma 13:11547 (one frame), corroborated by
 * help.usejimo.com/docs/settings/notifications-and-account-settings:
 * "Notifications setup is all about getting updates from the Changelog
 * feedback" — email on a new Request, and email on new Changelog comments.
 *
 * No save bar here, on purpose. Both controls are switches, and switches commit
 * instantly across this whole area — see SaveBar.tsx's header for the rule.
 * The artboard draws no save bar on this frame either.
 */
export function NotificationsPage() {
  const { notifications } = useSettings();

  return (
    <SettingsShell activeItem="Notifications" title="Notifications">
      <SettingCard>
        <SettingRow
          title="Get email notifications for new Requests"
          description="Notify me whenever a new Request is published"
          control={
            <Switch
              checked={notifications.newRequests}
              aria-label="Email me about new Requests"
              onCheckedChange={(v) => setNotifications({ newRequests: v === true })}
            />
          }
        />
        <SettingRow
          className="border-t border-[var(--color-border-default)]"
          title="Get email notifications for new Changelog comments"
          description="Notify me whenever new Changelog comments are added"
          control={
            <Switch
              checked={notifications.newChangelogComments}
              aria-label="Email me about new Changelog comments"
              onCheckedChange={(v) => setNotifications({ newChangelogComments: v === true })}
            />
          }
        />
      </SettingCard>
    </SettingsShell>
  );
}
