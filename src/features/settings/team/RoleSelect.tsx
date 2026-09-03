import * as React from 'react';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { Menu, MenuItem } from '@/components/app/Menu';
import type { Role } from '@/data/settings';

/**
 * The per-member role picker.
 *
 * `DropdownSelector` rendered inside the local `Menu` floating layer — the same
 * conversion `HandoffsChart` and `ConfigureModal` already made, and the reason
 * this is not a hand-rolled button: a near-copy silently loses the hover / open
 * / disabled states and the chevron rotation.
 *
 * `Menu` matters more than usual here: this sits inside `Table`'s scroll
 * wrapper, which is exactly the ancestor Floating Layers warns clips an
 * in-tree panel. `Menu` portals to <body>, so the list escapes it.
 */
export function RoleSelect({
  value,
  roles,
  onChange,
  disabled,
}: {
  value: string;
  roles: Role[];
  onChange: (roleId: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const current = roles.find((r) => r.id === value);

  return (
    <Menu
      open={open}
      onClose={() => setOpen(false)}
      align="right"
      trigger={
        <DropdownSelector
          size="small"
          // An unrecognised role still shows its own id rather than blanking —
          // roles are customisable per the docs, so this is a real case.
          text={current?.name ?? value}
          isOpen={open}
          onClick={disabled ? undefined : () => setOpen((o) => !o)}
        />
      }
    >
      {roles.map((r) => (
        <MenuItem
          key={r.id}
          label={r.name}
          selected={r.id === value}
          onClick={() => {
            onChange(r.id);
            setOpen(false);
          }}
        />
      ))}
    </Menu>
  );
}
