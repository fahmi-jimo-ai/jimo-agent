import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table/Table';
import { taskRate, type TaskRow } from '@/data/experiences';

/**
 * The `task-table` drill-down — Agent Designer Sandbox `10:2271`.
 *
 * Four columns: the task, then Clicked, Completed and Completion rate. The
 * docs name the same set for "Completed Checklist" ("task name, times
 * triggered, times skipped, times completed, individual completion rate"); the
 * artboard prints four of those five and skips "times skipped", so this does
 * too — a column the drawn table does not have is not a column.
 *
 * ## The bar is not a chart, and its width cannot be a Tailwind class
 *
 * The task name sits INSIDE a pale rounded bar whose width encodes the rate.
 * That width is per-row data, so it goes through an inline `style` — Tailwind
 * cannot see `w-[${n}%]`, the trap `PageThumb`'s header already records.
 *
 * Two things about that width. It is EXACTLY the rate the row prints: the
 * artboard's four bars each run some 8 percentage points wider than their own
 * figure, which is a drawing, not a rule, and a bar that disagrees with the
 * number beside it is worse than one that matches it.
 *
 * And it has a floor of `max-content`, not a percentage: a 3% task would
 * otherwise render as a sliver with its label spilling out of it, and clamping
 * to a fixed percentage only moves the width at which that happens. Sizing the
 * floor to the label means the bar encodes the rate everywhere it can and never
 * truncates the one thing it exists to name.
 *
 * ## The rate is derived, not stored
 *
 * The artboard prints `24 / 12` in every row's Clicked and Completed while
 * giving those rows four different rates, which cannot both be true.
 * Reproducing that would be copying a typo — the call `formatAbsolute` already
 * makes about the artboard's "17:12 PM" — so `taskRate` computes it and the
 * seeded counts vary to land on the artboard's four figures.
 */
const NARROW = 'w-[1%] min-w-0 whitespace-nowrap text-right';

export function TaskCompletionTable({ tasks }: { tasks: TaskRow[] }) {
  return (
    <Table scroll={false}>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead className={NARROW}>Clicked</TableHead>
          <TableHead className={NARROW}>Completed</TableHead>
          <TableHead className={NARROW}>Completion rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const rate = taskRate(task);
          return (
            <TableRow key={task.id}>
              <TableCell>
                <span
                  className="inline-flex max-w-full items-center rounded-[var(--radius-md)] bg-[var(--color-brand-subtle)] px-[var(--space-3)] py-[var(--space-2)]"
                  style={{ width: `${rate}%`, minWidth: 'max-content' }}
                >
                  <span className="[font:var(--text-subtitle-4)] whitespace-nowrap text-[var(--color-text-primary)]">
                    {task.label}
                  </span>
                </span>
              </TableCell>
              <TableCell className={`${NARROW} tabular-nums`}>{task.clicked}</TableCell>
              <TableCell className={`${NARROW} tabular-nums`}>{task.completed}</TableCell>
              <TableCell className={`${NARROW} tabular-nums`}>{rate}%</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
