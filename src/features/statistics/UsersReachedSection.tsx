import * as React from 'react';
import { Buildings, Profile2User, DocumentDownload, ArrowRight2 } from 'iconsax-react';
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
import {
  USERS_REACHED,
  TOTAL_USERS,
  TOTAL_COMPANIES,
  companiesForUsers,
  companyCompletion,
  companyReach,
} from '@/data/analytics';
import {
  GROUPING_LABEL,
  SEGMENT_LABEL,
  type ReachGrouping,
  type SegmentFilter,
} from '@/state/types';

/**
 * "Users reached" — Figma 934:27943.
 *
 * `PropertyTable` is the template: `scroll={false}` because the card is not a
 * scroll region (and its `overflow: auto` was the box that used to clip row
 * menus), plus the same flush outer edges so the table starts and ends on the
 * Section's content box rather than a second, wrong margin.
 */
const FLUSH_EDGES =
  '[&_th:first-child]:pl-0 [&_td:first-child]:pl-0 ' +
  '[&_th:last-child]:pr-0 [&_td:last-child]:pr-0';

export function UsersReachedSection({
  segment,
  onSegment,
  grouping,
  onGrouping,
  onExport,
  onSeeAll,
}: {
  segment: SegmentFilter;
  onSegment: (s: SegmentFilter) => void;
  /** PRD-587 — people or accounts. */
  grouping: ReachGrouping;
  onGrouping: (g: ReachGrouping) => void;
  onExport: () => void;
  onSeeAll: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [groupOpen, setGroupOpen] = React.useState(false);
  const rows = USERS_REACHED.filter((u) => segment === 'all' || u.segment === segment);
  /* PRD-587. Derived from the FILTERED users, not from the whole fixture, so
     the segment filter still means something after switching: Trialing plus
     By company answers "which accounts are still only trialing", which is the
     question being asked before a renewal. */
  const companies = companiesForUsers(rows);
  const byCompany = grouping === 'company';

  return (
    <Section
      title={byCompany ? 'Companies reached' : 'Users reached'}
      controls={
        <>
          {/* PROPOSAL (PRD-587). Placed before the segment filter because it
              changes what the rows ARE, and the filter only narrows them. */}
          <Menu
            open={groupOpen}
            onClose={() => setGroupOpen(false)}
            align="right"
            trigger={
              <DropdownSelector
                size="small"
                text={GROUPING_LABEL[grouping]}
                isOpen={groupOpen}
                hasValue={byCompany}
                withIcon
                icon={
                  byCompany ? (
                    <Buildings size={20} variant="Linear" color="currentColor" />
                  ) : (
                    <Profile2User size={20} variant="Linear" color="currentColor" />
                  )
                }
                onClick={() => setGroupOpen((o) => !o)}
              />
            }
          >
            {(Object.keys(GROUPING_LABEL) as ReachGrouping[]).map((value) => (
              <MenuItem
                key={value}
                label={GROUPING_LABEL[value]}
                selected={value === grouping}
                onClick={() => {
                  onGrouping(value);
                  setGroupOpen(false);
                }}
              />
            ))}
          </Menu>
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
        {byCompany ? (
          /* PROPOSAL (PRD-587). Reach is a RATE, not a count: 41 of 48 seats is
             an onboarded account and 44 of 310 is three people who tried it
             once, and the two are indistinguishable as bare numbers. That
             ratio is also why filtering the user table could never answer this
             — it tells you who, not how far through an account you are. */
          <Table scroll={false} className={FLUSH_EDGES}>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Users reached</TableHead>
                <TableHead>Completion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => {
                const completion = companyCompletion(c);
                return (
                  <TableRow key={c.id}>
                    <TableUserCell
                      avatar={<Avatar name={c.name} seed={c.id} />}
                      title={c.name}
                      subtitle={`${c.seats.toLocaleString('en-US')} seats`}
                    />
                    <TableCell>
                      {c.usersReached.toLocaleString('en-US')} · {companyReach(c)}%
                    </TableCell>
                    {/* Muted rather than 0%, the call `completionRate` already
                        makes in skills.ts: an account nobody has started is
                        not an account that is failing. */}
                    <TableCell muted={completion === null}>
                      {completion === null ? 'Not started' : `${completion}%`}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
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
        )}

        <div>
          <Button
            variant="outline"
            size="sm"
            rightIcon={<ArrowRight2 size={20} variant="Linear" color="currentColor" />}
            onClick={onSeeAll}
          >
            {byCompany
              ? `See all ${TOTAL_COMPANIES.toLocaleString('en-US')} companies`
              : `See all ${TOTAL_USERS.toLocaleString('en-US')} users`}
          </Button>
        </div>
      </div>
    </Section>
  );
}
