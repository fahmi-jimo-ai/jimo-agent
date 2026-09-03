import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Add } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { Section } from '@/components/ui/Section/Section';
import { Menu, MenuItem } from '@/components/app/Menu';
import { useToast } from '@/components/app/toast';
import {
  useSettings,
  setThemes,
  withThemeAdded,
  withThemeRemoved,
  withThemePatched,
  withDefaultTheme,
} from '@/state/useSettings';
import { makeThemeId, type Theme } from '@/data/settings';
import { SettingsShell } from '../SettingsShell';
import { CreateThemeModal } from './CreateThemeModal';
import { ThemeBuilder } from './ThemeBuilder';

/**
 * `/settings/themes` — Figma 13:11069 (the list) and 13:10825 (the builder).
 *
 * The kebab is the artboard's own annotation, and it is CONDITIONAL:
 *   13:11124 — a custom theme shows Edit / Duplicate / Make default / Delete
 *   13:11125 — with only Jimo's default present, Delete is absent
 * The docs' four menu items agree. Deleting your only theme would leave every
 * experience with nothing to render from, which is why the artboard omits it.
 *
 * `?theme=<id>` opens the builder, read ONCE and stripped — the shape
 * `?source=` / `?page=` / `?skill=` already use.
 */
export function ThemesPage({ initialThemeId }: { initialThemeId?: string } = {}) {
  const { themes } = useSettings();
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [deepLink] = React.useState(() => params.get('theme'));
  const [editing, setEditing] = React.useState<string | null>(initialThemeId ?? deepLink ?? null);
  const [creating, setCreating] = React.useState(false);
  const [kebabFor, setKebabFor] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!params.has('theme')) return;
    const next = new URLSearchParams(params);
    next.delete('theme');
    setParams(next, { replace: true });
  }, [params, setParams]);

  // Read through the store rather than holding the record, so the builder keeps
  // up with a rename made inside it.
  const open = themes.find((t) => t.id === editing) ?? null;
  if (open) {
    return (
      <ThemeBuilder
        theme={open}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          setThemes(withThemePatched(themes, open.id, patch));
          toast({ type: 'positive', title: `${patch.name ?? open.name} saved` });
          setEditing(null);
        }}
      />
    );
  }

  const add = (name: string, fromUrl: string | null) => {
    const theme: Theme = {
      id: makeThemeId(),
      name,
      font: 'Inter, Arial',
      colours: ['--color-blue-400', '--color-blue-100', '--color-neutral-800'],
      isDefault: false,
    };
    setThemes(withThemeAdded(themes, theme));
    setCreating(false);
    toast({
      type: 'positive',
      title: fromUrl ? `${name} generated from ${fromUrl}` : `${name} created`,
    });
    setEditing(theme.id);
  };

  return (
    <SettingsShell
      activeItem="Themes"
      title="Themes"
      actions={
        <Button
          size="sm"
          leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
          onClick={() => setCreating(true)}
        >
          New theme
        </Button>
      }
    >
      <Section
        title="Your themes"
        description="Save a look once and apply it to any experience."
      >
        <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2 lg:grid-cols-3">
          {themes.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-[var(--space-4)]"
            >
              <div className="flex gap-[var(--space-2)]">
                {t.colours.map((c) => (
                  <span
                    key={c}
                    className="size-8 rounded-[var(--radius-md)] border border-[var(--color-border-default)]"
                    style={{ background: `var(${c})` }}
                  />
                ))}
              </div>

              <div className="flex items-start justify-between gap-[var(--space-3)]">
                <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
                  <span className="flex items-center gap-[var(--space-2)]">
                    <span className="truncate [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
                      {t.name}
                    </span>
                    {t.isDefault && (
                      <Badge type="brand" size="x-small">
                        Default
                      </Badge>
                    )}
                  </span>
                  <span className="[font:var(--text-body-4)] text-[var(--color-text-secondary)]">
                    {t.font}
                  </span>
                </div>

                <Menu
                  open={kebabFor === t.id}
                  onClose={() => setKebabFor(null)}
                  align="right"
                  trigger={
                    <Button
                      variant="link"
                      size="sm"
                      aria-label={`Actions for ${t.name}`}
                      aria-haspopup="menu"
                      onClick={() => setKebabFor((k) => (k === t.id ? null : t.id))}
                    >
                      •••
                    </Button>
                  }
                >
                  <MenuItem
                    label="Edit"
                    onClick={() => {
                      setKebabFor(null);
                      setEditing(t.id);
                    }}
                  />
                  <MenuItem
                    label="Duplicate"
                    onClick={() => {
                      setKebabFor(null);
                      setThemes(
                        withThemeAdded(themes, {
                          ...t,
                          id: makeThemeId(),
                          name: `${t.name} copy`,
                          isDefault: false,
                        }),
                      );
                      toast({ type: 'positive', title: `${t.name} duplicated` });
                    }}
                  />
                  <MenuItem
                    label="Make default"
                    selected={t.isDefault}
                    onClick={() => {
                      setKebabFor(null);
                      setThemes(withDefaultTheme(themes, t.id));
                      toast({ type: 'positive', title: `${t.name} is now the default` });
                    }}
                  />
                  {/* Absent when this is the only theme — 13:11125. Deleting it
                      would leave every experience with nothing to render from. */}
                  {themes.length > 1 && (
                    <MenuItem
                      label="Delete"
                      onClick={() => {
                        setKebabFor(null);
                        const rest = withThemeRemoved(themes, t.id);
                        // Deleting the default promotes the first survivor, or
                        // nothing is default and new experiences have no style.
                        setThemes(
                          t.isDefault && rest.length > 0 ? withDefaultTheme(rest, rest[0].id) : rest,
                        );
                        toast({ type: 'neutral', title: `${t.name} deleted` });
                      }}
                    />
                  )}
                </Menu>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {creating && <CreateThemeModal onClose={() => setCreating(false)} onCreate={add} />}
    </SettingsShell>
  );
}
