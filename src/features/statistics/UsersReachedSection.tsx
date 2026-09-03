import * as React from 'react';
import { Profile2User, DocumentDownload, ArrowRight2 } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { Button } from '@/components/ui/Button/Button';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { Menu, MenuItem } from '@/components/app/Menu';
import { Avatar } from '@/components/app/Avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableUserCell,
} from '@/components/ui/Table/Table';
import { USERS_REACHED, TOTAL_USERS } from '@/data/analytics';
import { SEGMENT_LABEL, type SegmentFilter } from '@/state/types';

/**
 * "Users reached" — Figma 934:27943.
 *
 * `PropertyTable` is the template: `scroll={false}` because the card is not a
 * scroll region (and its `overflow: auto` was the box that used to clip row
 * menus), plus the same flush outer edges so the table starts and ends on the
 * Section's content box rather than a second, wrong margin.
 *
 * ## Two additive props, for the Experiences detail page
 *
 * That artboard (Agent Designer Sandbox `10:2271`) draws THE SAME CARD — same
 * three columns, same "Anonymous / #Jimer23123 / No email" rows, same
 * "See all 2312 users ›" footer, which is `TOTAL_USERS` and `USERS_REACHED`
 * verbatim — but its two selectors are a step scope and a date range rather
 * than this page's segment picker. A sibling component is how the two would
 * drift, so instead:
 *
 *  - `segment` / `onSegment` became OPTIONAL. Omit them and the segment
 *    selector does not render, and every row shows.
 *  - `controls` prepends caller-owned controls to the same cluster.
 *
 * Both default to exactly what this file did before, so `/statistics` renders
 * byte-identically.
 */
const FLUSH_EDGES =
  '[&_th:first-child]:pl-0 [&_td:first-child]:pl-0 ' +
  '[&_th:last-child]:pr-0 [&_td:last-child]:pr-0';

export function UsersReachedSection({
  segment,
  onSegment,
  controls,
  onExport,
  onSeeAll,
}: {
  /** Omit to render no segment selector — see the header comment. */
  segment?: SegmentFilter;
  onSegment?: (s: SegmentFilter) => void;
  /** ADDITIVE — caller-owned controls, prepended to the same cluster. */
  controls?: React.ReactNode;
  onExport: () => void;
  onSeeAll: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const rows = USERS_REACHED.filter(
    (u) => segment === undefined || segment === 'all' || u.segment === segment,
  );

  return (
    <Section
      title="Users reached"
      controls={
        <>
          {controls}
          {segment !== undefined && onSegment && (
          <Menu
            open={open}
            onClose={() => setOpen(false)}
            align="right"
            trigger={
              <DropdownSelector
                size="small"
                text={SEGMENT_LABEL[segment]}
                isOpen={open}
                hasValue={segment !== 'all'}
                withIcon
                icon={<Profile2User size={20} variant="Linear" color="currentColor" />}
                onClick={() => setOpen((o) => !o)}
              />
            }
          >
            {(Object.keys(SEGMENT_LABEL) as SegmentFilter[]).map((value) => (
              <MenuItem
                key={value}
                label={SEGMENT_LABEL[value]}
                selected={value === segment}
                onClick={() => {
                  onSegment(value);
                  setOpen(false);
                }}
              />
            ))}
          </Menu>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<DocumentDownload size={20} variant="Linear" color="currentColor" />}
            onClick={onExport}
          >
            Export as CSV
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-[var(--space-4)]">
        <Table scroll={false} className={FLUSH_EDGES}>
          <TableHeader>
            <TableRow>
              <TableHead>Users</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last reached</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableUserCell
                  avatar={<Avatar name={u.name} seed={u.id} />}
                  title={u.name}
                  subtitle={u.handle}
                />
                <TableCell muted={!u.email}>{u.email ?? 'No email'}</TableCell>
                <TableCell>{u.lastReached}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div>
          <Button
            variant="outline"
            size="sm"
            rightIcon={<ArrowRight2 size={20} variant="Linear" color="currentColor" />}
            onClick={onSeeAll}
          >
            See all {TOTAL_USERS.toLocaleString('en-US')} users
          </Button>
        </div>
      </div>
    </Section>
  );
}
