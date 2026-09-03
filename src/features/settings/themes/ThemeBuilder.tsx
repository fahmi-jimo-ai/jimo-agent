import * as React from 'react';
import { ArrowLeft2, ArrowDown2, Monitor, Mobile } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Alert } from '@/components/ui/Infobox/alert';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { Menu, MenuItem } from '@/components/app/Menu';
import { AppShell } from '@/app/AppShell';
import { SETTINGS_NAV_SECTIONS, SETTINGS_ROUTES } from '../settingsNav';
import { ColourSwatchField } from '../environments/ColourSwatchField';
import { cn } from '@/lib/utils';
import type { Theme } from '@/data/settings';

/**
 * The theme builder — Figma 13:10825.
 *
 * ## What this is, and what it deliberately is not
 *
 * The artboard draws a full second application: a navigator of 18 accordion
 * groups, and a live preview that renders whichever Jimo experience you are
 * styling. This file builds the SHELL of that — header, navigator, preview
 * chrome, device toggle, experience picker — and stops there, for two reasons
 * that are not going to be fixed by another hour of work:
 *
 *   1. Every accordion in the artboard is drawn COLLAPSED. Not one group's
 *      interior is designed, so there is nothing to build them from. The panel
 *      below is a generic style form, and it is invented.
 *   2. The preview needs a renderer for Jimo tours, surveys, NPS, checklists
 *      and changelogs. This repo has none and is not adjacent to one. The NPS
 *      card below is the single artefact the artboard actually draws, rendered
 *      from the theme's own tokens.
 *
 * That is the same shape of gap CLAUDE.md already records for the widget's five
 * undrawn states and the skill recorder: a separate project, not a missing
 * `if`. If this file starts growing a preview renderer, stop and go read that.
 *
 * The docs (build/theme, Theme Builder A–F) corroborate the anatomy exactly,
 * including **Save AND Cancel** — the artboard draws only Save, and the docs'
 * "Cancel discards any unsaved adjustments" is why both are here.
 *
 * The docs also say "each change made will be automatically repeated on
 * experiences using the same theme". This app has no experiences to propagate
 * to; recorded, not faked.
 */

/** The artboard's own group names, in its own order. */
const GROUPS: { title: string; items: string[] }[] = [
  {
    title: 'Experience Elements',
    items: ['Heading', 'Paragraph', 'Label', 'Image/Video', 'Primary CTA', 'Secondary CTA', 'Stepper'],
  },
  { title: 'Experience General', items: ['Step', 'Hotspot'] },
  {
    title: 'Surveys',
    items: [
      'Multiple choice',
      'Emoji slider',
      'NPS',
      'Opinion scale',
      'Open question',
      'Concept Test',
      'Interview',
    ],
  },
  { title: 'Changelog', items: ['General', 'Cards', 'Text', 'Call to action', 'Tags'] },
];

/**
 * Which preview each group shows. The artboard annotates (13:11126): selecting
 * a dropdown that is NOT a child of the Elements group switches the preview to
 * that content. Only NPS is drawn, so everything else falls back to it and says
 * so rather than pretending.
 */
const PREVIEWS = ['NPS', 'Multiple choice', 'Step', 'Changelog'];

export function ThemeBuilder({
  theme,
  onClose,
  onSave,
}: {
  theme: Theme;
  onClose: () => void;
  onSave: (patch: Partial<Theme>) => void;
}) {
  const [name, setName] = React.useState(theme.name);
  const [colours, setColours] = React.useState(theme.colours);
  const [openGroup, setOpenGroup] = React.useState<string | null>('Heading');
  const [preview, setPreview] = React.useState('NPS');
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [device, setDevice] = React.useState<'desktop' | 'mobile'>('desktop');

  const accent = colours[0] ?? '--color-blue-400';

  return (
    <AppShell
      activeItem="Themes"
      railItem="Settings"
      sections={SETTINGS_NAV_SECTIONS}
      routes={SETTINGS_ROUTES}
      maxWidth="100%"
    >
      <div className="flex gap-[var(--space-6)]">
        {/* Navigator */}
        <div className="flex w-[320px] shrink-0 flex-col gap-[var(--space-4)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <Button
              variant="link"
              size="sm"
              aria-label="Back to themes"
              onClick={onClose}
              leftIcon={<ArrowLeft2 size={20} variant="Linear" color="currentColor" />}
            />
            <Input
              className="flex-1"
              aria-label="Theme name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex gap-[var(--space-3)]">
            {/* Docs: Save commits, Cancel discards. The artboard draws only Save. */}
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => onSave({ name: name.trim(), colours })}>
              Save theme
            </Button>
          </div>

          <Alert
            type="neutral"
            title="Element styling is not designed"
            body="Every group in the artboard is drawn collapsed, so the panel below is a generic stand-in. Colours here do drive the preview."
          />

          {GROUPS.map((g) => (
            <div key={g.title} className="flex flex-col gap-[var(--space-2)]">
              <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-tertiary)]">
                {g.title}
              </span>
              {g.items.map((item) => {
                const open = openGroup === item;
                return (
                  <div
                    key={item}
                    className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)]"
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-[var(--space-3)] p-[var(--space-3)] text-left [font:var(--text-body-3)] text-[var(--color-text-primary)]"
                      onClick={() => {
                        setOpenGroup(open ? null : item);
                        // 13:11126 — a non-Elements group switches the preview.
                        if (!open && g.title !== 'Experience Elements') {
                          setPreview(PREVIEWS.includes(item) ? item : 'NPS');
                        }
                      }}
                    >
                      {item}
                      <span
                        className={cn(
                          'shrink-0 [transition:rotate_var(--transition-fast)]',
                          // `rotate`, not `transform`: Tailwind v4 compiles
                          // rotate-180 to the standalone rotate property, so a
                          // transition naming `transform` never fires. Same trap
                          // Menu documents for `scale` and Drawer for `translate`.
                          open && 'rotate-180',
                        )}
                      >
                        <ArrowDown2 size={16} variant="Linear" color="currentColor" />
                      </span>
                    </button>
                    {open && (
                      <div className="flex flex-col gap-[var(--space-3)] border-t border-[var(--color-border-default)] p-[var(--space-3)]">
                        <ColourSwatchField
                          value={swatchNameOf(accent)}
                          onChange={(c) => setColours([tokenOf(c), ...colours.slice(1)])}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-4)]">
          <div className="flex items-center justify-between gap-[var(--space-4)]">
            <span className="flex items-center gap-[var(--space-3)]">
              <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
                Preview
              </span>
              <Menu
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                trigger={
                  <DropdownSelector
                    size="small"
                    text={preview}
                    isOpen={previewOpen}
                    onClick={() => setPreviewOpen((o) => !o)}
                  />
                }
              >
                {PREVIEWS.map((v) => (
                  <MenuItem
                    key={v}
                    label={v}
                    selected={v === preview}
                    onClick={() => {
                      setPreview(v);
                      setPreviewOpen(false);
                    }}
                  />
                ))}
              </Menu>
            </span>

            <span className="flex items-center gap-[var(--space-2)]">
              {(['desktop', 'mobile'] as const).map((d) => (
                <Button
                  key={d}
                  variant={device === d ? 'default' : 'outline'}
                  size="sm"
                  aria-label={d}
                  aria-pressed={device === d}
                  onClick={() => setDevice(d)}
                  leftIcon={
                    d === 'desktop' ? (
                      <Monitor size={20} variant="Linear" color="currentColor" />
                    ) : (
                      <Mobile size={20} variant="Linear" color="currentColor" />
                    )
                  }
                />
              ))}
            </span>
          </div>

          <div className="flex items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-neutral-600)] p-[var(--space-10)]">
            <div
              className={cn(
                'rounded-[var(--radius-lg)] bg-[var(--color-neutral-white)] p-[var(--space-5)] shadow-[var(--shadow-elevation-03)]',
                device === 'mobile' ? 'w-[320px]' : 'w-[460px]',
              )}
            >
              {preview === 'NPS' ? (
                <NpsPreview accent={accent} />
              ) : (
                <span className="[font:var(--text-body-3)] text-[var(--color-text-tertiary)]">
                  No artboard draws the {preview} preview, so there is nothing to render it from
                  yet.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/** The one artefact 13:10825 actually draws, rendered from the theme's tokens. */
function NpsPreview({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
        How satisfied are you with your dashboard?
      </span>
      <div className="flex flex-wrap gap-[var(--space-1)]">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className="inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] border [font:var(--text-body-4)]"
            style={{ borderColor: `var(${accent})`, color: `var(${accent})` }}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

/* The builder edits one accent colour, so these map between the swatch palette
   and the token list a Theme stores. Both directions fall back to blue. */
const SWATCHES = ['blue', 'green', 'purple', 'orange', 'red'] as const;
const tokenOf = (c: string) =>
  c === 'orange' ? '--color-orange-500' : `--color-${c}-400`;
const swatchNameOf = (token: string) =>
  SWATCHES.find((c) => token.includes(`-${c}-`)) ?? 'blue';
