import * as React from 'react';
import { Copy, Edit2, More, PauseCircle, PlayCircle, Setting2, Trash } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import type { Experience } from '@/data/experiences';

export type ExperienceActions = {
  onEdit: () => void;
  onSettings: () => void;
  onToggleStatus: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

/**
 * The per-experience kebab, shared by the mosaic card and both list rows.
 *
 * The rows are the docs' hover actions verbatim — Edit, Settings, Duplicate,
 * Delete — plus the play/pause the docs describe separately ("any published
 * experience can be Played/Paused directly from the dashboard list"). Which is
 * why it appears only on a published one: there is nothing to pause about a
 * draft, and a row that offers it would be lying.
 *
 * One component rather than one per surface, because the three surfaces differ only
 * in where the trigger sits. A near-copy is how the mosaic and the list would
 * quietly stop offering the same actions.
 */
export function ExperienceRowMenu({
  experience,
  actions,
}: {
  experience: Experience;
  actions: ExperienceActions;
}) {
  const [open, setOpen] = React.useState(false);

  const published = experience.status === 'live' || experience.status === 'paused';
  const live = experience.status === 'live';

  const act = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <Menu
      open={open}
      onClose={() => setOpen(false)}
      align="right"
      trigger={
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={`Actions for ${experience.name}`}
          aria-haspopup="menu"
          aria-expanded={open}
          leftIcon={<More size={16} variant="Linear" color="currentColor" />}
          onClick={() => setOpen((o) => !o)}
        />
      }
    >
      {published && (
        <DropdownMenuList
          text={live ? 'Pause' : 'Set live'}
          icon={
            live ? (
              <PauseCircle size={16} variant="Linear" color="currentColor" />
            ) : (
              <PlayCircle size={16} variant="Linear" color="currentColor" />
            )
          }
          onClick={act(actions.onToggleStatus)}
        />
      )}
      <DropdownMenuList
        text="Edit"
        icon={<Edit2 size={16} variant="Linear" color="currentColor" />}
        onClick={act(actions.onEdit)}
      />
      <DropdownMenuList
        text="Settings"
        icon={<Setting2 size={16} variant="Linear" color="currentColor" />}
        onClick={act(actions.onSettings)}
      />
      <DropdownMenuList
        text="Duplicate"
        icon={<Copy size={16} variant="Linear" color="currentColor" />}
        onClick={act(actions.onDuplicate)}
      />
      <DropdownMenuList
        danger
        text="Delete"
        icon={<Trash size={16} variant="Linear" color="currentColor" />}
        onClick={act(actions.onDelete)}
      />
    </Menu>
  );
}
