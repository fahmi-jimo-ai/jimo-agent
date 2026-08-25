import * as React from 'react';
import { Add, SearchNormal1, ProfileCircle, DocumentCode } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import { JimoMarkBoxed } from '@/components/brand/JimoMark';
import { useToast } from '@/components/app/toast';
import { PropertyTable } from './PropertyTable';
import { PropertyEmptyState } from './PropertyEmptyState';
import { AddPropertyModal } from './AddPropertyModal';
import { USER_PROPERTIES, type PropertySource } from '@/data/userProperties';
import { useKnowledge, addProperties, removeProperty } from '@/state/useKnowledge';

type Filter = 'all' | PropertySource;

const FILTER_LABEL: Record<Filter, string> = {
  all: 'All types',
  jimo: 'Jimo SDK',
  custom: 'Custom Attributes',
};

/**
 * "User Property for Agent Context" — the one card on the Knowledge page.
 *
 * Three body states, all from Figma 901:16049:
 *   - nothing added yet (892:12055): header only. No search row, no table —
 *     there is nothing to search.
 *   - added (887:10867): search + source filter, then the table.
 *   - nothing matches (892:13280 by search, 893:13761 by filter): the search
 *     row stays and the table is replaced. One path, two ways in.
 *
 * `search` and `filter` are component state on purpose. They are view state,
 * not config — persisting them would make a stray search term survive a reload
 * and sync across tabs. The two initial* props exist so a story can land
 * directly on the no-results frames.
 */
export function UserContextSection({
  initialSearch = '',
  initialFilter = 'all',
  initialModalOpen = false,
}: {
  initialSearch?: string;
  initialFilter?: Filter;
  initialModalOpen?: boolean;
}) {
  const { addedIds } = useKnowledge();
  const toast = useToast();

  const [search, setSearch] = React.useState(initialSearch);
  const [filter, setFilter] = React.useState<Filter>(initialFilter);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [adding, setAdding] = React.useState(initialModalOpen);

  // Catalogue order, NOT `addedIds` order: the table has to read the same way
  // as the modal the rows were picked in. Ordering by when each was added
  // makes the list reshuffle for reasons the user cannot see.
  const added = USER_PROPERTIES.filter((p) => addedIds.includes(p.id));

  const q = search.trim().toLowerCase();
  const shown = added.filter((p) => {
    const bySource = filter === 'all' || p.source === filter;
    const byQuery = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return bySource && byQuery;
  });

  const hasAny = added.length > 0;

  return (
    <>
      <Section
        title="User Property for Agent Context"
        description="Add user properties to share with the LLM Model so it tailors guidance, while you keep privacy in check."
        controls={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
            onClick={() => setAdding(true)}
          >
            Add property
          </Button>
        }
      >
        {/* `? :` and not `&&`: `hasAny && …` hands Section the value `false`,
            and `false != null`, so Section renders an empty content div AND the
            --space-6 gap above it — the phantom strip under the header on the
            nothing-added frame (892:12055). `null` is the only falsy value
            Section treats as "no body". */}
        {hasAny ? (
          <div className="flex flex-col gap-[var(--space-4)]">
            <div className="flex items-center gap-[var(--space-4)]">
              <Input
                className="flex-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search property"
                aria-label="Search property"
                size="small"
                leftIcon={<SearchNormal1 size={20} variant="Linear" color="currentColor" />}
              />
              <Menu
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                align="right"
                trigger={
                  <DropdownSelector
                    size="small"
                    text={FILTER_LABEL[filter]}
                    withIcon
                    icon={<ProfileCircle size={20} variant="Linear" color="currentColor" />}
                    isOpen={filterOpen}
                    hasValue={filter !== 'all'}
                    onClick={() => setFilterOpen((o) => !o)}
                  />
                }
              >
                {(['all', 'jimo', 'custom'] as Filter[]).map((value) => (
                  <DropdownMenuList
                    key={value}
                    text={FILTER_LABEL[value]}
                    state={filter === value ? 'selected' : 'default'}
                    icon={
                      value === 'all' ? (
                        <ProfileCircle size={20} variant="Linear" color="currentColor" />
                      ) : value === 'jimo' ? (
                        // 887:11711 — the mark inside a rounded-square outline,
                        // so it reads as a sibling of the two iconsax glyphs
                        // rather than a bare wordmark floating in the slot.
                        <JimoMarkBoxed size={20} />
                      ) : (
                        // Figma names this glyph vuesax/linear/document-code.
                        // iconsax-react 0.0.8 DOES export it (verified against
                        // the 993 names) — an earlier note here claiming
                        // otherwise was wrong, and `Data` was standing in.
                        <DocumentCode size={20} variant="Linear" color="currentColor" />
                      )
                    }
                    onClick={() => {
                      setFilter(value);
                      setFilterOpen(false);
                    }}
                  />
                ))}
              </Menu>
            </div>

            {shown.length > 0 ? (
              <PropertyTable
                properties={shown}
                // Invented, and labelled as such: no Figma frame follows either
                // of these, so the prototype acknowledges the click and stops.
                onEdit={(p) =>
                  toast({
                    type: 'neutral',
                    title: `Editing ${p.name} is out of scope`,
                    body: 'Attribute editing lives in the workspace schema, which this prototype does not model.',
                  })
                }
                onRemove={(p) => {
                  removeProperty(p.id);
                  toast({ type: 'positive', title: `${p.name} removed from Agent Context` });
                }}
              />
            ) : (
              <PropertyEmptyState />
            )}
          </div>
        ) : null}
      </Section>

      {adding && (
        <AddPropertyModal
          addedIds={addedIds}
          onClose={() => setAdding(false)}
          onAdd={(ids) => {
            addProperties(ids);
            setAdding(false);
            toast({
              type: 'positive',
              title: `${ids.length} ${ids.length === 1 ? 'property' : 'properties'} added to Agent Context`,
            });
          }}
        />
      )}
    </>
  );
}
