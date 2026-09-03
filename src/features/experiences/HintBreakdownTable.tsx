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
import type { HintRow } from '@/data/experiences';

/**
 * The `hint-table` drill-down. No frame draws it; the columns are the docs'
 * own list for "Total Tooltip Shown", verbatim: "Hint Name", "Type and Display
 * Method", "Total Views", "Unique Viewers".
 *
 * The display method renders as a chip rather than plain text because it is one
 * of a closed set (icon, label, target, button) — the same reason a status is a
 * chip and a date is not.
 */
const NARROW = 'w-[1%] min-w-0 whitespace-nowrap text-right';

export function HintBreakdownTable({ hints }: { hints: HintRow[] }) {
  return (
    <Table scroll={false}>
      <TableHeader>
        <TableRow>
          <TableHead>Hint</TableHead>
          <TableHead className="w-[1%] min-w-0 whitespace-nowrap">Display method</TableHead>
          <TableHead className={NARROW}>Total views</TableHead>
          <TableHead className={NARROW}>Unique viewers</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {hints.map((hint) => (
          <TableRow key={hint.id}>
            <TableCell className="max-w-[360px]">
              <span className="truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                {hint.label}
              </span>
            </TableCell>
            <TableCell className="w-[1%] min-w-0 whitespace-nowrap">
              <Badge type="neutral" variant="secondary" size="small">
                {hint.method}
              </Badge>
            </TableCell>
            <TableCell className={`${NARROW} tabular-nums`}>
              {hint.views.toLocaleString('en-US')}
            </TableCell>
            <TableCell className={`${NARROW} tabular-nums`}>
              {hint.uniqueViewers.toLocaleString('en-US')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
