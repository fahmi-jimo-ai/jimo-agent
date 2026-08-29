import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table/Table';
import { ContainedIcon } from '@/components/ui/ContainedIcon/ContainedIcon';
import { formatRelative } from '@/lib/formatRelative';
import { SKILL_MODE_TINT, type Skill } from '@/data/skills';
import { SKILL_GLYPH } from './skillGlyph';
import { SkillModeChip } from './SkillModeChip';
import { CompletionRateChip } from './CompletionRateChip';

/**
 * The Skills table — Figma `12987:11526` and `12987:16031`.
 *
 * `scroll={false}` inside a `Section flushBody`, per Table/CONTEXT.md and per
 * `SourceTable`: the card is not a scroll region, and flushBody's 8px card
 * gutters plus the table's own 16px cell inset land the header on the usual
 * 24px content line.
 *
 * ## The two artboards disagree about the columns, and this takes the union
 *
 * `12987:11526` draws four columns — Name / Last updated / Usage / Completion
 * rate — with the description as a second line under the name, and no Mode
 * anywhere. `12987:16031` draws a Mode chip column and drops the description
 * subline. Neither is a superset of the other, and both are the same table.
 *
 * The union wins, five columns wide, because each half is right about a
 * different thing: the description is the only place a reader learns what a
 * skill DOES without opening the drawer, and the mode is the only cell that
 * says whether the agent will act or merely answer — which is the single most
 * consequential fact about a row. Dropping either would make the table answer
 * fewer questions than the artboards together already do.
 *
 * The mode is therefore drawn TWICE, and deliberately: as a tinted
 * `ContainedIcon` in the Name cell (a scannable rail down the left edge, which
 * is what `12987:16031` uses the tint for) and as the Mode chip (the readable
 * label). Same `SKILL_MODE_TINT`, same `SKILL_GLYPH`, so they cannot disagree.
 *
 * `TableRow interactive` is Moji's own hover, and the row is the drawer's
 * trigger. No row-level action buttons: every action the artboard draws for a
 * skill lives in the drawer, so there is nothing here that needs the
 * stop-propagation guard `SourceTable` carries.
 */
export function SkillTable({
  skills,
  now = Date.now(),
  onOpen,
}: {
  skills: Skill[];
  /** One clock for every row, so two rows updated together always agree. */
  now?: number;
  onOpen: (skill: Skill) => void;
}) {
  return (
    <Table scroll={false}>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {/* `TableHead` floors every column at 180px, which is right for a
              free-text column and wrong for these four: a chip, a relative
              time, a count and a chip. Five of them add up to 1080 inside a
              984 card, so the last column falls off the edge. Shrink-to-fit
              here lets Name take the remainder — the same `w-[1%] min-w-0`
              idiom `SourceTable` already uses for its actions column.

              `TableCell` carries the SAME 180px floor, so the body cells need
              it too: shrink only the header and the column stays pinned by the
              rows underneath it. */}
          <TableHead className="w-[1%] min-w-0 whitespace-nowrap">Mode</TableHead>
          <TableHead className="w-[1%] min-w-0 whitespace-nowrap">Last updated</TableHead>
          <TableHead className="w-[1%] min-w-0 whitespace-nowrap">Usage</TableHead>
          <TableHead className="w-[1%] min-w-0 whitespace-nowrap">Completion rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {skills.map((skill) => (
          <TableRow key={skill.id} interactive onClick={() => onOpen(skill)}>
            <TableCell className="max-w-[360px]">
              <span className="flex items-center gap-[var(--space-3)]">
                <ContainedIcon
                  icon={SKILL_GLYPH[skill.mode]}
                  tint={SKILL_MODE_TINT[skill.mode]}
                  size={32}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                    {skill.name}
                  </span>
                  {skill.description !== '' && (
                    <span className="truncate [font:var(--text-body-4)] text-[var(--color-text-secondary)]">
                      {skill.description}
                    </span>
                  )}
                </span>
              </span>
            </TableCell>
            <TableCell className="w-[1%] min-w-0 whitespace-nowrap">
              <SkillModeChip mode={skill.mode} />
            </TableCell>
            <TableCell className="w-[1%] min-w-0 whitespace-nowrap">
              {formatRelative(skill.updatedAt, now)}
            </TableCell>
            <TableCell className="w-[1%] min-w-0 tabular-nums whitespace-nowrap">
              {skill.usage.toLocaleString('en-US')}
            </TableCell>
            <TableCell className="w-[1%] min-w-0 whitespace-nowrap">
              <CompletionRateChip skill={skill} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
