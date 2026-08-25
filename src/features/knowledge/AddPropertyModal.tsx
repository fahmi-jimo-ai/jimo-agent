import * as React from 'react';
import { SearchNormal1 } from 'iconsax-react';
import {
  PickerDialog,
  PickerGroup,
  PickerRow,
  PickerCount,
  PickerEmpty,
} from '@/components/app/PickerDialog';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { PropertyTypeTile } from './PropertyTypeTile';
import {
  USER_PROPERTIES,
  SOURCE_GROUP_LABEL,
  type PropertySource,
  type UserProperty,
} from '@/data/userProperties';

/** The group order in the modal — Figma 921:17353 lists Jimo's own first. */
const GROUPS: PropertySource[] = ['jimo', 'custom'];

/**
 * "Add user property" — Figma 921:17353.
 *
 * All of the layout lives in `PickerDialog`; this file is only the binding —
 * which catalogue, which groups, what a row shows and what committing does.
 * If it starts growing structure again, that structure belongs in PickerDialog
 * so the next picker inherits it.
 *
 * Selection is local and only commits on "Add propert(y|ies)", so backing out
 * of the dialog leaves Agent Context untouched. Already-added properties show
 * checked and disabled rather than hidden: the list is the workspace's whole
 * schema, and silently dropping rows would read as data missing.
 */
export function AddPropertyModal({
  addedIds,
  onClose,
  onAdd,
}: {
  addedIds: string[];
  onClose: () => void;
  onAdd: (ids: string[]) => void;
}) {
  const [query, setQuery] = React.useState('');
  const [picked, setPicked] = React.useState<string[]>([]);

  const q = query.trim().toLowerCase();
  const matches = (p: UserProperty) =>
    !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);

  const groups = GROUPS.map((source) => ({
    source,
    items: USER_PROPERTIES.filter((p) => p.source === source && matches(p)),
  })).filter((g) => g.items.length > 0);

  const toggle = (id: string) =>
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const noun = (n: number) => (n === 1 ? 'property' : 'properties');

  return (
    <PickerDialog
      title="Add user property"
      onClose={onClose}
      search={
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search user property..."
          aria-label="Search user property"
          size="small"
          leftIcon={<SearchNormal1 size={20} variant="Linear" color="currentColor" />}
        />
      }
      footer={
        <>
          <PickerCount>
            {picked.length} {noun(picked.length)} selected
          </PickerCount>
          {/* The label counts what is actually staged, so a single checked row
              never gets promised "properties". */}
          <Button size="sm" disabled={picked.length === 0} onClick={() => onAdd(picked)}>
            Add {noun(picked.length)}
          </Button>
        </>
      }
    >
      {groups.length === 0 ? (
        <PickerEmpty>No property found</PickerEmpty>
      ) : (
        groups.map((group) => (
          <PickerGroup key={group.source} label={SOURCE_GROUP_LABEL[group.source]}>
            {group.items.map((property) => {
              const already = addedIds.includes(property.id);
              return (
                <PickerRow
                  key={property.id}
                  disabled={already}
                  onClick={() => toggle(property.id)}
                  icon={
                    <PropertyTypeTile dataType={property.dataType} source={property.source} />
                  }
                  title={property.name}
                  // Description only. The data type is already the tile's whole
                  // job, and repeating it made every row open with the word its
                  // icon had just said.
                  description={property.description}
                  trailing={
                    <Checkbox
                      checked={already || picked.includes(property.id)}
                      disabled={already}
                      onCheckedChange={() => toggle(property.id)}
                      aria-label={property.name}
                    />
                  }
                />
              );
            })}
          </PickerGroup>
        ))
      )}
    </PickerDialog>
  );
}
