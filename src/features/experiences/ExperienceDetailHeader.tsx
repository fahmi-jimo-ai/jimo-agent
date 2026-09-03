import * as React from 'react';
import { ArrowLeft2, Copy, Edit2, Link21, More, PauseCircle, PlayCircle, Setting2, Trash } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { ContainedIcon } from '@/components/ui/ContainedIcon/ContainedIcon';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import { formatRelativeLong } from '@/lib/formatRelative';
import { EXPERIENCE_PLURAL, EXPERIENCE_TINT, type Experience } from '@/data/experiences';
import { EXPERIENCE_GLYPH } from './experienceGlyph';

/**
 * The detail header — Agent Designer Sandbox `10:2269`:
 *
 *     ‹  [▣]  Onboarding Checklist            ⏵ Play   ⚙ Settings   ✎ Edit   …
 *             Checklists • Edited 3 days ago
 *
 * A thin WRAPPER over `PageHeader type="sub"`, which is the composition
 * CLAUDE.md sanctions when a Moji component is missing a capability. It already
 * draws the outline back button, the gutters, the two clusters and the h2; what
 * it could not draw is the glyph and the subline, and those arrived as one
 * additive fork (`icon` / `subtitle`) documented in `PageHeader/CONTEXT.md`.
 *
 * Nothing else needed forking: Play / Settings / Edit are three `buttons[]`
 * entries at `level: 'secondary'` — which maps to `variant="outline" size="sm"`,
 * exactly the artboard — and the kebab rides the existing `actions` prop, which
 * exists because `Menu` has to wrap its own trigger in order to measure it.
 *
 * ## Play is stateful, and the kebab's public URL is gated
 *
 * The docs say any PUBLISHED experience can be played or paused from here, so
 * the button reads Pause on a live one and does not render at all on a draft.
 * "Generate a public URL" is likewise live-only, which the docs state directly.
 *
 * The subline uses the PLURAL — the artboard prints "Checklists • Edited 3 days
 * ago", naming the dashboard the back button returns to rather than the type of
 * the thing on screen.
 */
export function ExperienceDetailHeader({
  experience,
  onBack,
  onPlay,
  onSettings,
  onEdit,
  onDuplicate,
  onPublicUrl,
  onDelete,
}: {
  experience: Experience;
  onBack: () => void;
  onPlay: () => void;
  onSettings: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublicUrl: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const published = experience.status === 'live' || experience.status === 'paused';
  const live = experience.status === 'live';

  const act = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  const buttons = [
    ...(published
      ? [
          {
            label: live ? 'Pause' : 'Play',
            level: 'secondary',
            leftIcon: live ? (
              <PauseCircle size={16} variant="Linear" color="currentColor" />
            ) : (
              <PlayCircle size={16} variant="Linear" color="currentColor" />
            ),
            onClick: onPlay,
          },
        ]
      : []),
    {
      label: 'Settings',
      level: 'secondary',
      leftIcon: <Setting2 size={16} variant="Linear" color="currentColor" />,
      onClick: onSettings,
    },
    {
      label: 'Edit',
      level: 'secondary',
      leftIcon: <Edit2 size={16} variant="Linear" color="currentColor" />,
      onClick: onEdit,
    },
  ];

  return (
    <PageHeader
      type="sub"
      title={experience.name}
      subtitle={`${EXPERIENCE_PLURAL[experience.type]} • Edited ${formatRelativeLong(
        experience.editedAt,
      )}`}
      icon={
        <ContainedIcon
          icon={EXPERIENCE_GLYPH[experience.type]}
          tint={EXPERIENCE_TINT[experience.type]}
          size={36}
        />
      }
      backIcon={<ArrowLeft2 size={16} variant="Linear" color="currentColor" />}
      onBackClick={onBack}
      buttonSize="small"
      buttons={buttons}
      showTabs={false}
      actions={
        <Menu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          align="right"
          trigger={
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`More actions for ${experience.name}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              leftIcon={<More size={16} variant="Linear" color="currentColor" />}
              onClick={() => setMenuOpen((o) => !o)}
            />
          }
        >
          <DropdownMenuList
            text="Duplicate"
            icon={<Copy size={16} variant="Linear" color="currentColor" />}
            onClick={act(onDuplicate)}
          />
          {live && (
            <DropdownMenuList
              text="Generate a public URL"
              icon={<Link21 size={16} variant="Linear" color="currentColor" />}
              onClick={act(onPublicUrl)}
            />
          )}
          <DropdownMenuList
            danger
            text="Delete"
            icon={<Trash size={16} variant="Linear" color="currentColor" />}
            onClick={act(onDelete)}
          />
        </Menu>
      }
    />
  );
}
