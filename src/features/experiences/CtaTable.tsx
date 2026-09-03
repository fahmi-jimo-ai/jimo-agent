import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table/Table';
import { Badge } from '@/components/ui/Chip/badge';
import type { CtaRow } from '@/data/experiences';

/**
 * The `cta-table` drill-down. No frame draws it; the five columns are the docs'
 * own list for "Button Actions", verbatim: "CTA Label", "Step", "Action",
 * "Total Clicks", "Unique Users".
 *
 * On a Resource Center the docs rename the metric to "Action Clicks" and say
 * the behaviour is identical, so the tile's label swaps (`metricLabel`) and this
 * table does not.
 */
const NARROW = 'w-[1%] min-w-0 whitespace-nowrap text-right';

export function CtaTable({ rows }: { rows: CtaRow[] }) {
  return (
    <Table scroll={false}>
      <TableHeader>
        <TableRow>
          <TableHead>CTA</TableHead>
          <TableHead className="w-[1%] min-w-0 whitespace-nowrap">Step</TableHead>
          <TableHead className="w-[1%] min-w-0 whitespace-nowrap">Action</TableHead>
          <TableHead className={NARROW}>Total clicks</TableHead>
          <TableHead className={NARROW}>Unique users</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="max-w-[280px]">
              <span className="truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                {row.cta}
              </span>
            </TableCell>
            <TableCell className="w-[1%] min-w-0 whitespace-nowrap" muted>
              {row.step}
            </TableCell>
            <TableCell className="w-[1%] min-w-0 whitespace-nowrap">
              <Badge type="neutral" variant="secondary" size="small">
                {row.action}
              </Badge>
            </TableCell>
            <TableCell className={`${NARROW} tabular-nums`}>
              {row.clicks.toLocaleString('en-US')}
            </TableCell>
            <TableCell className={`${NARROW} tabular-nums`}>
              {row.uniqueUsers.toLocaleString('en-US')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
