import * as React from 'react';
import { Send2, TickCircle, Refresh } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { Section } from '@/components/ui/Section/Section';
import { Alert } from '@/components/ui/Infobox/alert';
import { SecondaryHorizontalMenuGroup } from '@/components/ui/SecondaryHorizontalMenuGroup/SecondaryHorizontalMenuGroup';
import { SettingCard, SettingRow } from '@/components/app/SettingRow';
import { useSettings, runInstallCheck } from '@/state/useSettings';
import { CodeBlock } from '../CodeBlock';
import { ReadOnlyRow } from '../fields';
import { GtmModal } from './GtmModal';
import { ShareInstallModal } from './ShareInstallModal';
import { hookSnippet, classSnippet, htmlSnippet, cspSnippet, CSP_DOMAINS } from './snippets';

/**
 * Figma 13:10464 / 13:10591 / 13:9732 / 13:10167 — the Install tab.
 *
 * Three things come from the docs rather than the artboards:
 *   - The CSP allow-list and its worked directive example. It is the single
 *     most-asked installation question in the Help Center and no artboard
 *     carries it.
 *   - The verification rule: `window.jimo` is `undefined` (missing), `[]`
 *     (present, not initialised) or `{}` (correct). That is the check's result
 *     copy, and it beats inventing one.
 *   - "Use the 'Share to teammate' feature", which the artboard draws as a
 *     button with no behaviour behind it.
 */
// `SecondaryHorizontalMenuGroup` names its label field `tabName`, not `label`,
// and silently falls back to "Report" — so a `label` here renders three
// identical tabs with no type error. Same class of trap as PageHeaderButton's
// `level` vs `variant`.
const FRAMEWORKS = [
  { id: 'html', tabName: 'HTML' },
  { id: 'hook', tabName: 'React (hooks)' },
  { id: 'class', tabName: 'React (class)' },
];

export function InstallTab() {
  const { project, install } = useSettings();
  const [framework, setFramework] = React.useState('html');
  const [gtmOpen, setGtmOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);

  const code =
    framework === 'hook'
      ? hookSnippet(project.projectId)
      : framework === 'class'
        ? classSnippet(project.projectId)
        : htmlSnippet(project.projectId);

  const checking = install.check.status === 'running';
  const checked = install.check.status === 'ok';

  return (
    <>
      <Section
        title="Install Jimo snippet"
        description="Paste this in the <head> tag of your website to install Jimo"
        controls={
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Send2 size={20} variant="Linear" color="currentColor" />}
            onClick={() => setShareOpen(true)}
          >
            Share to teammate
          </Button>
        }
      >
        <div className="flex flex-col gap-[var(--space-4)]">
          <SecondaryHorizontalMenuGroup
            tabs={FRAMEWORKS}
            activeItem={framework}
            onTabClick={setFramework}
          />
          <CodeBlock code={code} />
        </div>
      </Section>

      <SettingCard>
        <ReadOnlyRow
          title="Project ID"
          description="Already substituted into the snippet above."
          value={project.projectId}
        />
        <SettingRow
          className="border-t border-[var(--color-border-default)]"
          title="Install with Google Tag Manager"
          description="Alternative method for installing Jimo through connecting Google Tag Manager"
          control={
            <span className="flex items-center gap-[var(--space-3)]">
              {install.gtm.status === 'published' && (
                <Badge type="positive" size="x-small">
                  Published
                </Badge>
              )}
              <Button variant="outline" onClick={() => setGtmOpen(true)}>
                {install.gtm.status === 'published' ? 'Manage tag' : 'Create tag'}
              </Button>
            </span>
          }
        />
      </SettingCard>

      <Section
        title="Check your installation"
        description="Verify the snippet is live on your site."
        controls={
          <Button
            size="sm"
            variant="outline"
            disabled={checking}
            leftIcon={
              checked ? (
                <TickCircle size={20} variant="Linear" color="currentColor" />
              ) : (
                <Refresh size={20} variant="Linear" color="currentColor" />
              )
            }
            onClick={runInstallCheck}
          >
            {checking ? 'Checking…' : checked ? 'Check again' : 'Run check'}
          </Button>
        }
      >
        {checked ? (
          <Alert
            type="positive"
            title="Jimo is installed"
            body="The snippet responded and initialised."
          />
        ) : (
          <Alert
            type="neutral"
            title="Checking by hand"
            body="Open your site's console and type window.jimo — undefined means the script is missing, [] means it is present but not initialised, and {} means it is installed correctly."
          />
        )}
      </Section>

      <Section
        title="Content Security Policy"
        description="If your platform restricts external resources, allow these domains."
      >
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {CSP_DOMAINS.map((d) => (
              <code
                key={d}
                className="rounded-[var(--radius-md)] bg-[var(--color-bg-muted)] px-[var(--space-2)] py-[var(--space-1)] [font:var(--text-body-4)] text-[var(--color-text-secondary)]"
              >
                {d}
              </code>
            ))}
          </div>
          <CodeBlock label="Example, per directive" code={cspSnippet} />
        </div>
      </Section>

      {gtmOpen && <GtmModal onClose={() => setGtmOpen(false)} />}
      {shareOpen && (
        <ShareInstallModal projectId={project.projectId} onClose={() => setShareOpen(false)} />
      )}
    </>
  );
}
