import * as React from 'react';
import { SearchNormal1 } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { Badge } from '@/components/ui/Chip/badge';
import {
  PickerDialog,
  PickerGroup,
  PickerRow,
  PickerCount,
  PickerEmpty,
} from '@/components/app/PickerDialog';
import { DEMO_EXPERIENCES } from '@/data/settings';

/**
 * Figma 13:11322 — "Choose your in-app experience".
 *
 * A `PickerDialog`, not a `ModalCard` step: it is opened on its own and
 * dismissed on its own, never as a beat of a flow, which is the line CLAUDE.md
 * draws between the two. So it owns its overlay.
 *
 * Docs call the affordance "+ Exclude experience", and use "experience"
 * throughout — the artboards' "Poke" is the retired name.
 */
export function ExcludeExperienceDialog({
  excluded,
  onClose,
  onConfirm,
}: {
  excluded: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const all = React.useMemo(() => DEMO_EXPERIENCES(), []);
  const [search, setSearch] = React.useState('');
  const [picked, setPicked] = React.useState<string[]>([]);

  // Already-excluded experiences are not offered again — the artboard's list is
  // "what you can still add", and the page below already lists the rest.
  const available = all.filter((e) => !excluded.includes(e.id));
  const shown = available.filter((e) => e.name.toLowerCase().includes(search.trim().toLowerCase()));

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <PickerDialog
      title="Choose your in-app experience"
      onClose={onClose}
      search={
        <Input
          size="small"
          value={search}
          placeholder="Search an experience"
          aria-label="Search an experience"
          leftIcon={<SearchNormal1 size={20} variant="Linear" color="currentColor" />}
          onChange={(e) => setSearch(e.target.value)}
        />
      }
      footer={
        <>
          <PickerCount>
            {picked.length} experience{picked.length === 1 ? '' : 's'} selected
          </PickerCount>
          <Button
            disabled={picked.length === 0}
            onClick={() => {
              onConfirm(picked);
              onClose();
            }}
          >
            Exclude
          </Button>
        </>
      }
    >
      {available.length === 0 ? (
        // Figma 13:11209's empty state, with the docs' noun.
        <PickerEmpty>
          <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
            No Active In-App Experiences
          </span>
          <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            No experiences are currently live or paused to be excluded from display rate limiting.
          </span>
        </PickerEmpty>
      ) : shown.length === 0 ? (
        <PickerEmpty>
          <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            Nothing matches “{search}”.
          </span>
        </PickerEmpty>
      ) : (
        <PickerGroup>
          {shown.map((e) => (
            <PickerRow
              key={e.id}
              as="button"
              title={e.name}
              icon={<Checkbox checked={picked.includes(e.id)} aria-hidden tabIndex={-1} />}
              trailing={
                <Badge type="neutral" size="x-small">
                  {e.type}
                </Badge>
              }
              onClick={() => toggle(e.id)}
            />
          ))}
        </PickerGroup>
      )}
    </PickerDialog>
  );
}
