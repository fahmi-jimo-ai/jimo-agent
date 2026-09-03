import * as React from 'react';
import { ExportSquare } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/Chip/badge';
import { Switch } from '@/components/ui/Toggle/switch';
import { Section } from '@/components/ui/Section/Section';
import { Alert } from '@/components/ui/Infobox/alert';
import { SettingCard, SettingRow } from '@/components/app/SettingRow';
import { useToast } from '@/components/app/toast';
import { useSettings, setTroubleshoot } from '@/state/useSettings';
import { normalisePreviewUrl } from '@/features/knowledge/PreviewInAppModal';
import { SettingsShell } from '../SettingsShell';

/**
 * `/settings/troubleshoot` — INVENTED layout, docs-sourced content.
 *
 * No artboard draws this and the artboards' sidebar does not list it. The docs
 * do (help.usejimo.com/docs/settings/troubleshooting, BETA), and the settings
 * page itself is genuinely small: a URL that opens the tool over your site, and
 * a switch for the keyboard shortcut.
 *
 * THE TOOL ITSELF IS OUT OF SCOPE. It is a draggable in-app widget with a user
 * panel, an experience list and per-experience trigger diagnostics — a whole
 * surface that needs a host app to inspect, which this repo does not have. Same
 * shape of gap as the widget's five undrawn states. Do not grow it here.
 *
 * The URL goes through `normalisePreviewUrl`, reused rather than re-written:
 * the value reaches `window.open`, and `new URL()` accepts `javascript:` and
 * `mailto:` just as happily as `https:`. That function is already unit-tested.
 */
export function TroubleshootPage() {
  const { troubleshoot } = useSettings();
  const toast = useToast();
  const [url, setUrl] = React.useState(troubleshoot.lastUrl);

  const target = normalisePreviewUrl(url);
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? '');

  const open = () => {
    if (!target) return;
    setTroubleshoot({ lastUrl: url.trim() });
    window.open(target, '_blank', 'noopener,noreferrer');
    toast({ type: 'neutral', title: 'Opening your site' });
  };

  return (
    <SettingsShell
      activeItem="Troubleshoot"
      title={
        <span className="flex items-center gap-[var(--space-3)]">
          Troubleshoot
          <Badge type="alert" variant="secondary" size="x-small">
            Beta
          </Badge>
        </span>
      }
    >
      <Alert
        type="neutral"
        title="What the tool shows"
        body="It opens over your site and lists every published experience for that page as Shown, Seen, Waiting or Ineligible, with the conditions that matched and the ones that did not — plus the current user's segments and attributes."
      />

      <Section
        title="Open the tool"
        description="Enter a URL where the Jimo snippet is installed. It opens in a new tab with the tool on top."
      >
        <div className="flex items-end gap-[var(--space-3)]">
          <Input
            className="flex-1"
            label="Your app's URL"
            placeholder="https://app.yourcompany.com"
            value={url}
            status={url.trim() !== '' && !target ? 'negative' : 'none'}
            supportiveText={
              url.trim() !== '' && !target ? 'Enter an http:// or https:// address.' : undefined
            }
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') open();
            }}
          />
          <Button
            className="shrink-0"
            disabled={!target}
            rightIcon={<ExportSquare size={20} variant="Linear" color="currentColor" />}
            onClick={open}
          >
            Open
          </Button>
        </div>
      </Section>

      <SettingCard>
        <SettingRow
          title="Keyboard shortcut"
          description={
            <>
              Open the tool on any page of your app with{' '}
              <kbd className="rounded-[var(--radius-sm)] bg-[var(--color-bg-muted)] px-[var(--space-2)] py-[2px] [font:var(--text-body-4)]">
                {isMac ? '⌘ ⇧ L' : 'Ctrl ⇧ L'}
              </kbd>
              .
            </>
          }
          control={
            <Switch
              checked={troubleshoot.shortcutEnabled}
              aria-label="Troubleshoot keyboard shortcut"
              onCheckedChange={(v) => setTroubleshoot({ shortcutEnabled: v === true })}
            />
          }
        />
      </SettingCard>

      <Alert
        type="warning"
        title="The tool needs a working snippet"
        body="If the snippet is missing or broken the tool cannot open at all. Check window.jimo in the console first — undefined means the script is missing."
      />
    </SettingsShell>
  );
}
