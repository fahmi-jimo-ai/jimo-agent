import * as React from 'react';
import { Add } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { Section } from '@/components/ui/Section/Section';
import { Alert } from '@/components/ui/Infobox/alert';
import { Menu, MenuItem } from '@/components/app/Menu';
import { useToast } from '@/components/app/toast';
import {
  useSettings,
  setEnvironments,
  withEnvAdded,
  withEnvPatched,
  withEnvRemoved,
  type Environment,
} from '@/state/useSettings';
import { makeEnvId } from '@/data/settings';
import { cn } from '@/lib/utils';
import { SettingsShell } from '../SettingsShell';
import { EnvironmentModal } from './EnvironmentModal';
import { EnvIcon, TILE_TINT } from './ColourSwatchField';

/**
 * `/settings/environments` — INVENTED layout, docs-sourced content.
 *
 * No artboard draws this, and the artboards' sidebar does not list it. It is
 * here because help.usejimo.com/docs/settings/environments describes it as a
 * real page "in the Project settings section", and because Troubleshooting and
 * targeting both reference it.
 *
 * The docs' warning about composition is on the page rather than buried: an
 * experience's `Where` filter and its environment are ANDed, so a URL that is
 * not in the selected environment simply never shows. That is the failure this
 * page exists to prevent, and no artboard would have told anyone.
 *
 * Starts EMPTY: a domain is something the user types.
 */
export function EnvironmentsPage() {
  const { environments } = useSettings();
  const toast = useToast();
  const [formFor, setFormFor] = React.useState<Environment | 'new' | null>(null);
  const [kebabFor, setKebabFor] = React.useState<string | null>(null);

  return (
    <SettingsShell
      activeItem="Environments"
      title="Environments"
      actions={
        <Button
          size="sm"
          leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
          onClick={() => setFormFor('new')}
        >
          New environment
        </Button>
      }
    >
      <Alert
        type="neutral"
        title="Environments and Where filters compose"
        body="They are applied together: if an experience targets a URL whose domain is not in the environment you publish it to, it will not show. Keep the two in step."
      />

      <Section
        title="Your environments"
        description="Group domains so an experience can be published to staging, production, or both."
      >
        {environments.length === 0 ? (
          <div className="flex flex-col items-start gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] p-[var(--space-6)]">
            <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
              No environments yet
            </span>
            <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
              Without one, every experience publishes to all domains. Add staging and production to
              test before going live.
            </span>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
              onClick={() => setFormFor('new')}
            >
              New environment
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
            {environments.map((env) => (
              <div
                key={env.id}
                className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-[var(--space-4)]"
              >
                <div className="flex items-start justify-between gap-[var(--space-3)]">
                  <div className="flex min-w-0 items-center gap-[var(--space-3)]">
                    <span
                      className={cn(
                        'inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)]',
                        TILE_TINT[env.colour] ?? TILE_TINT.blue,
                      )}
                    >
                      <EnvIcon icon={env.icon} />
                    </span>
                    <span className="min-w-0 truncate [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
                      {env.name}
                    </span>
                  </div>
                  <Menu
                    open={kebabFor === env.id}
                    onClose={() => setKebabFor(null)}
                    align="right"
                    trigger={
                      <Button
                        variant="link"
                        size="sm"
                        aria-label={`Actions for ${env.name}`}
                        aria-haspopup="menu"
                        onClick={() => setKebabFor((k) => (k === env.id ? null : env.id))}
                      >
                        •••
                      </Button>
                    }
                  >
                    <MenuItem
                      label="Edit"
                      onClick={() => {
                        setKebabFor(null);
                        setFormFor(env);
                      }}
                    />
                    <MenuItem
                      label="Delete"
                      onClick={() => {
                        setKebabFor(null);
                        setEnvironments(withEnvRemoved(environments, env.id));
                        toast({ type: 'neutral', title: `${env.name} deleted` });
                      }}
                    />
                  </Menu>
                </div>

                <div className="flex flex-wrap gap-[var(--space-2)]">
                  {env.domains.map((d) => (
                    <Badge key={d} type="neutral" size="x-small">
                      {d}
                    </Badge>
                  ))}
                </div>

                {env.description !== '' && (
                  <span className="[font:var(--text-body-4)] text-[var(--color-text-secondary)]">
                    {env.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {formFor && (
        <EnvironmentModal
          existing={formFor === 'new' ? undefined : formFor}
          onClose={() => setFormFor(null)}
          onSave={(env) => {
            if (formFor === 'new') {
              setEnvironments(withEnvAdded(environments, { id: makeEnvId(), ...env }));
              toast({ type: 'positive', title: `${env.name} created` });
            } else {
              setEnvironments(withEnvPatched(environments, formFor.id, env));
              toast({ type: 'positive', title: `${env.name} updated` });
            }
            setFormFor(null);
          }}
          onDelete={
            formFor === 'new'
              ? undefined
              : () => {
                  setEnvironments(withEnvRemoved(environments, formFor.id));
                  setFormFor(null);
                  toast({ type: 'neutral', title: `${formFor.name} deleted` });
                }
          }
        />
      )}
    </SettingsShell>
  );
}
