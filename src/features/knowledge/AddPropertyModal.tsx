import * as React from 'react';
import { SearchNormal1 } from 'iconsax-react';
import { ModalCard } from '@/components/app/ModalCard';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { PropertyTypeTile } from './PropertyTypeTile';
import {
  USER_PROPERTIES,
  DATA_TYPE_LABEL,
  SOURCE_GROUP_LABEL,
  type PropertySource,
  type UserProperty,
} from '@/data/userProperties';

/** The group order in the modal — Figma 901:15549 lists Jimo's own first. */
const GROUPS: PropertySource[] = ['jimo', 'custom'];

/**
 * "Add user property" — Figma 901:15549.
 *
 * Selection is local and only commits on "Add properties", so backing out of
 * the dialog leaves Agent Context untouched. Already-added properties are shown
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

  return (
    <ModalCard
      title="Add user property"
      width={600}
      onClose={onClose}
      footer={
        <div className="flex w-full items-center justify-between gap-[var(--space-4)]">
          <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
            {picked.length} {picked.length === 1 ? 'property' : 'properties'} selected
          </span>
          <Button size="sm" disabled={picked.length === 0} onClick={() => onAdd(picked)}>
            Add properties
          </Button>
        </div>
      }
    >
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search user property..."
        aria-label="Search user property"
        leftIcon={<SearchNormal1 size={20} variant="Linear" color="currentColor" />}
      />

      {/* Fixed height, not max-height: the list scrolls inside a dialog whose
          own height must not jump between "Aa" and a one-result search. */}
      <div className="flex h-[360px] flex-col gap-[var(--space-4)] overflow-y-auto">
        {groups.length === 0 ? (
          <p className="m-0 py-[var(--space-6)] text-center [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            No property found
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.source} className="flex flex-col gap-[var(--space-1)]">
              <p className="m-0 [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
                {SOURCE_GROUP_LABEL[group.source]}
              </p>
              {group.items.map((property) => {
                const already = addedIds.includes(property.id);
                return (
                  <label
                    key={property.id}
                    className="flex cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[var(--space-2)] [transition:background-color_var(--transition-fast)] hover:bg-[var(--color-bg-subtle)] has-[:disabled]:cursor-default has-[:disabled]:hover:bg-transparent"
                  >
                    <PropertyTypeTile dataType={property.dataType} source={property.source} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                        {property.name}
                      </span>
                      <span className="[font:var(--text-body-3)] text-[var(--color-text-tertiary)]">
                        {DATA_TYPE_LABEL[property.dataType]} • {property.description}
                      </span>
                    </span>
                    <Checkbox
                      checked={already || picked.includes(property.id)}
                      disabled={already}
                      onCheckedChange={() => toggle(property.id)}
                      aria-label={property.name}
                    />
                  </label>
                );
              })}
            </div>
          ))
        )}
      </div>
    </ModalCard>
  );
}
