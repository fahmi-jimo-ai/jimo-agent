import * as React from 'react';
import { SearchNormal1, Calendar, Messages2, Profile2User, DocumentDownload } from 'iconsax-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { Menu, MenuItem } from '@/components/app/Menu';
import {
  RANGE_LABEL,
  RESPONSE_LABEL,
  SEGMENT_LABEL,
  type AnalyticsRange,
  type ResponseFilter,
  type SegmentFilter,
} from '@/state/types';

/**
 * The conversations toolbar — Figma 934:28534.
 *
 * Four filters, not three: 934:29319 draws the same row without "All Segments"
 * and 934:28534 draws it with. The four-filter row ships. (The badge copy goes
 * the other way — see MessageBubble.)
 *
 * Hidden entirely on the "No conversations yet" frame (934:30359): there is
 * nothing to filter. It stays on the no-results frame (934:30109), because that
 * is how you get back out.
 */
function FilterMenu<T extends string>({
  value,
  labels,
  icon,
  onChange,
}: {
  value: T;
  labels: Record<T, string>;
  icon: React.ReactNode;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const keys = Object.keys(labels) as T[];
  return (
    <Menu
      open={open}
      onClose={() => setOpen(false)}
      trigger={
        <DropdownSelector
          size="big"
          text={labels[value]}
          isOpen={open}
          hasValue={value !== keys[0]}
          withIcon
          icon={icon}
          onClick={() => setOpen((o) => !o)}
        />
      }
    >
      {keys.map((k) => (
        <MenuItem
          key={k}
          label={labels[k]}
          selected={k === value}
          onClick={() => {
            onChange(k);
            setOpen(false);
          }}
        />
      ))}
    </Menu>
  );
}

export function ConversationsToolbar({
  search,
  range,
  response,
  segment,
  onSearch,
  onRange,
  onResponse,
  onSegment,
  onExport,
}: {
  search: string;
  range: AnalyticsRange;
  response: ResponseFilter;
  segment: SegmentFilter;
  onSearch: (v: string) => void;
  onRange: (v: AnalyticsRange) => void;
  onResponse: (v: ResponseFilter) => void;
  onSegment: (v: SegmentFilter) => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-[var(--space-3)]">
      <Input
        className="w-[260px] shrink-0"
        size="small"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by keywords..."
        aria-label="Search conversations by keyword"
        leftIcon={<SearchNormal1 size={20} variant="Linear" color="currentColor" />}
      />
      <FilterMenu
        value={range}
        labels={RANGE_LABEL}
        icon={<Calendar size={20} variant="Linear" color="currentColor" />}
        onChange={onRange}
      />
      <FilterMenu
        value={response}
        labels={RESPONSE_LABEL}
        icon={<Messages2 size={20} variant="Linear" color="currentColor" />}
        onChange={onResponse}
      />
      <FilterMenu
        value={segment}
        labels={SEGMENT_LABEL}
        icon={<Profile2User size={20} variant="Linear" color="currentColor" />}
        onChange={onSegment}
      />
      <Button
        className="ml-auto"
        variant="outline"
        size="sm"
        leftIcon={<DocumentDownload size={20} variant="Linear" color="currentColor" />}
        onClick={onExport}
      >
        Export as CSV
      </Button>
    </div>
  );
}
