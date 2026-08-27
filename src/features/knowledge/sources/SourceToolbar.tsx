import * as React from 'react';
import { Layer, SearchNormal1, TickCircle } from 'iconsax-react';
import { Input } from '@/components/ui/Input/Input';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import {
  SOURCE_KINDS,
  SOURCE_KIND_LABEL,
  SOURCE_STATUSES,
  SOURCE_STATUS_LABEL,
  type SourceKind,
  type SourceStatus,
} from '@/data/knowledgeSources';
import { kindGlyph } from './kindGlyph';

export type KindFilter = 'all' | SourceKind;
export type StatusFilter = 'all' | SourceStatus;

/**
 * Search + the Type and Status filters — Figma 899:15251.
 *
 * Straight reuse of the UserContextSection pattern: a `DropdownSelector` as the
 * `trigger` of a portaled `Menu`, rows are `DropdownMenuList`. The selectors
 * are stateless triggers by design, so the open flag lives here.
 *
 * The artboard's triggers read the bare column name ("Type", "Status") with no
 * value, which is the unfiltered state; picking a value swaps the label and
 * sets `hasValue`, the same way the property filter does.
 */
export function SourceToolbar({
  search,
  onSearch,
  kind,
  onKind,
  status,
  onStatus,
}: {
  search: string;
  onSearch: (value: string) => void;
  kind: KindFilter;
  onKind: (value: KindFilter) => void;
  status: StatusFilter;
  onStatus: (value: StatusFilter) => void;
}) {
  const [kindOpen, setKindOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);

  return (
    <div className="flex flex-wrap items-center gap-[var(--space-4)] px-[var(--space-4)]">
      <Input
        className="w-[240px]"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search content"
        aria-label="Search content"
        size="small"
        leftIcon={<SearchNormal1 size={20} variant="Linear" color="currentColor" />}
      />

      <Menu
        open={kindOpen}
        onClose={() => setKindOpen(false)}
        trigger={
          <DropdownSelector
            size="small"
            text={kind === 'all' ? 'Type' : SOURCE_KIND_LABEL[kind]}
            withIcon
            icon={<Layer size={20} variant="Linear" color="currentColor" />}
            isOpen={kindOpen}
            hasValue={kind !== 'all'}
            onClick={() => setKindOpen((o) => !o)}
          />
        }
      >
        <DropdownMenuList
          text="All types"
          state={kind === 'all' ? 'selected' : 'default'}
          icon={<Layer size={20} variant="Linear" color="currentColor" />}
          onClick={() => {
            onKind('all');
            setKindOpen(false);
          }}
        />
        {SOURCE_KINDS.map((value) => (
          <DropdownMenuList
            key={value}
            text={SOURCE_KIND_LABEL[value]}
            state={kind === value ? 'selected' : 'default'}
            icon={kindGlyph(value)}
            onClick={() => {
              onKind(value);
              setKindOpen(false);
            }}
          />
        ))}
      </Menu>

      <Menu
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        trigger={
          <DropdownSelector
            size="small"
            text={status === 'all' ? 'Status' : SOURCE_STATUS_LABEL[status]}
            withIcon
            icon={<TickCircle size={20} variant="Linear" color="currentColor" />}
            isOpen={statusOpen}
            hasValue={status !== 'all'}
            onClick={() => setStatusOpen((o) => !o)}
          />
        }
      >
        <DropdownMenuList
          text="All statuses"
          state={status === 'all' ? 'selected' : 'default'}
          icon={<TickCircle size={20} variant="Linear" color="currentColor" />}
          onClick={() => {
            onStatus('all');
            setStatusOpen(false);
          }}
        />
        {SOURCE_STATUSES.map((value) => (
          <DropdownMenuList
            key={value}
            text={SOURCE_STATUS_LABEL[value]}
            state={status === value ? 'selected' : 'default'}
            icon={<TickCircle size={20} variant="Linear" color="currentColor" />}
            onClick={() => {
              onStatus(value);
              setStatusOpen(false);
            }}
          />
        ))}
      </Menu>
    </div>
  );
}
