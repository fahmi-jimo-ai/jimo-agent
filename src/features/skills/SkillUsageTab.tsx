import * as React from 'react';
import { Calendar, Messages2 } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { Badge } from '@/components/ui/Chip/badge';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { Menu, MenuItem } from '@/components/app/Menu';
import { Avatar } from '@/components/app/Avatar';
import { cn } from '@/lib/utils';
import { completionRate, conversationsForSkill, type Skill } from '@/data/skills';
import type { Conversation } from '@/data/analytics';
import { SkillUsageChart } from './SkillUsageChart';

/**
 * The skill drawer's Usage tab — Figma `12987:15826`.
 *
 * Three blocks: the Statistics card (two tiles plus the stacked chart), and the
 * conversations card underneath. The tab has NO footer in the artboard, which is
 * why `SkillDrawer` passes one only on the Description tab.
 *
 * ## The two tiles are one control's two halves
 *
 * The artboard draws `Usage` plain-bordered and `Completed` filled with a blue
 * border — the same brand-subtle / border-focus pair `DropdownSelector` uses for
 * "this one has a value". It reads as the figure the chart below is actually
 * about, so `Completed` carries the fill permanently rather than as a selection
 * the reader can move. Both figures come off the record (`usage` / `completed`)
 * and the percentage off `completionRate`, so the tiles can never disagree with
 * the table row that opened the drawer.
 *
 * `completionRate` returns `null` for a skill that has never run — the case
 * `skills.ts` deliberately does not print as `0%` — so the percentage is simply
 * omitted there rather than rendered as zero.
 *
 * ## Both pickers, and the outcome, are INVENTED
 *
 * `12987:15826` names the two triggers (`All time`, `All Responses`) and nothing
 * else: no frame draws either menu open. Three options each, and their labels,
 * are made up:
 *
 *  - The range picker RELABELS ONLY. `buildSkillUsageDays` produces one fixed
 *    14-bucket series with no date arithmetic behind it, so narrowing the range
 *    would mean inventing data as well as an option set. `HandoffsChart`'s date
 *    range has exactly the same limitation and says so.
 *  - The response filter DOES filter, because the outcome it filters on is
 *    derived from the conversation itself and so is free.
 *
 * The outcome is `c.down > 0 ? 'Dropped' : 'Completed'` — also invented. It is
 * derived rather than random for the reason every fixture in this repo is
 * seeded: a random value would flicker on every render and make a screenshot
 * diff meaningless. A thumbs-down is the nearest honest signal the transcript
 * actually carries.
 */

/** Invented — see the header. Relabels the Statistics card only. */
const RANGES = ['All time', 'Last 30 days', 'Last 7 days'] as const;
type Range = (typeof RANGES)[number];

/** Invented — see the header. `All Responses` passes everything through. */
const RESPONSES = ['All Responses', 'Completed', 'Dropped'] as const;
type Response = (typeof RESPONSES)[number];

/** Invented, and labelled as such — see the header comment. */
function outcomeOf(conversation: Conversation): 'Completed' | 'Dropped' {
  return conversation.down > 0 ? 'Dropped' : 'Completed';
}

function Tile({
  value,
  label,
  suffix,
  selected = false,
}: {
  value: number;
  label: string;
  suffix?: React.ReactNode;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-[var(--space-1)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-3)]',
        selected
          ? 'border-[var(--color-border-focus)] bg-[var(--color-brand-subtle)]'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-default)]',
      )}
    >
      <span className="[font:var(--text-heading-4)] tracking-[var(--text-heading-tracking)] tabular-nums text-[var(--color-text-primary)]">
        {value.toLocaleString('en-GB')}
      </span>
      <span className="flex items-baseline justify-between gap-[var(--space-2)]">
        <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">{label}</span>
        {suffix != null && (
          <span className="[font:var(--text-body-4)] tabular-nums text-[var(--color-text-tertiary)]">
            {suffix}
          </span>
        )}
      </span>
    </div>
  );
}

export function SkillUsageTab({
  skill,
  onOpenConversation,
}: {
  skill: Skill;
  onOpenConversation: (conversation: Conversation) => void;
}) {
  const [range, setRange] = React.useState<Range>('All time');
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [response, setResponse] = React.useState<Response>('All Responses');
  const [responseOpen, setResponseOpen] = React.useState(false);

  const all = React.useMemo(() => conversationsForSkill(skill.id), [skill.id]);
  const rows =
    response === 'All Responses' ? all : all.filter((c) => outcomeOf(c) === response);

  const rate = completionRate(skill);

  return (
    <>
      <Section
        title="Statistics"
        controls={
          <Menu
            open={rangeOpen}
            onClose={() => setRangeOpen(false)}
            align="right"
            trigger={
              <DropdownSelector
                size="small"
                text={range}
                isOpen={rangeOpen}
                hasValue={range !== 'All time'}
                withIcon
                icon={<Calendar size={20} variant="Linear" color="currentColor" />}
                onClick={() => setRangeOpen((o) => !o)}
              />
            }
          >
            {RANGES.map((value) => (
              <MenuItem
                key={value}
                label={value}
                selected={value === range}
                onClick={() => {
                  setRange(value);
                  setRangeOpen(false);
                }}
              />
            ))}
          </Menu>
        }
      >
        <div className="flex flex-col gap-[var(--space-5)]">
          <div className="grid grid-cols-2 gap-[var(--space-3)]">
            <Tile value={skill.usage} label="Usage" />
            <Tile
              value={skill.completed}
              label="Completed"
              suffix={rate == null ? undefined : `(${rate}%)`}
              selected
            />
          </div>
          <SkillUsageChart skillId={skill.id} />
        </div>
      </Section>

      <Section
        title={`${all.length} ${all.length === 1 ? 'Conversation' : 'Conversations'}`}
        controls={
          <Menu
            open={responseOpen}
            onClose={() => setResponseOpen(false)}
            align="right"
            trigger={
              <DropdownSelector
                size="small"
                text={response}
                isOpen={responseOpen}
                hasValue={response !== 'All Responses'}
                withIcon
                icon={<Messages2 size={20} variant="Linear" color="currentColor" />}
                onClick={() => setResponseOpen((o) => !o)}
              />
            }
          >
            {RESPONSES.map((value) => (
              <MenuItem
                key={value}
                label={value}
                selected={value === response}
                onClick={() => {
                  setResponse(value);
                  setResponseOpen(false);
                }}
              />
            ))}
          </Menu>
        }
      >
        {rows.length > 0 ? (
          <div className="flex flex-col gap-[var(--space-1)]">
            {rows.map((c) => {
              const outcome = outcomeOf(c);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onOpenConversation(c)}
                  className="flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border-0 bg-transparent px-[var(--space-3)] py-[var(--space-2)] text-left [transition:background-color_var(--transition-fast)] hover:bg-[var(--color-brand-subtle)]"
                >
                  <Avatar name={c.name} seed={c.id} size="medium" />
                  <span className="flex min-w-0 flex-1 flex-col gap-[var(--space-1)]">
                    <span className="flex items-center gap-[var(--space-2)]">
                      <span className="min-w-0 flex-1 truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                        {c.name}
                      </span>
                      <span className="shrink-0 [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
                        {c.at}
                      </span>
                      <Badge
                        size="xx-small"
                        type={outcome === 'Completed' ? 'positive' : 'negative'}
                      >
                        {outcome}
                      </Badge>
                    </span>
                    <span className="truncate [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
                      {c.title}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            {all.length === 0
              ? 'No conversation has triggered this skill yet.'
              : `No ${response.toLowerCase()} conversations for this skill.`}
          </p>
        )}
      </Section>
    </>
  );
}
