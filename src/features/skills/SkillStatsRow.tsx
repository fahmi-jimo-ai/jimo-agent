import * as React from 'react';
import { ArrowDown, ArrowUp } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { Badge } from '@/components/ui/Chip/badge';
import { buildSkillUses } from '@/data/skills';
import { SkillUsesChart } from './SkillUsesChart';
import { SkillOutcomesChart } from './SkillOutcomesChart';

/**
 * The two stat cards above the Skills table — Figma `12987:11526`.
 *
 * Two `Section`s in a two-column grid, which is what the artboard measures out
 * to: equal halves of the content column with one `--space-5` gutter. The card
 * titles are `Section`'s own `title`, not a local heading, so the type ramp and
 * the header rhythm come from Moji.
 *
 * It reads its own fixtures rather than taking props. Both series are static
 * generators with no range picker and no filter behind them — passing them down
 * from `SkillsPage` would be a prop that never varies, and the moment either
 * card grows a control that control belongs in the card, not on the page.
 *
 * The delta chip's arrow follows the sign, even though the fixture is `+5` and
 * always will be: a chip reading "▲ 5%" over a negative number is the kind of
 * bug that survives a screenshot diff.
 */
export function SkillStatsRow() {
  const uses = React.useMemo(() => buildSkillUses(), []);
  const up = uses.deltaPct >= 0;

  return (
    <div className="grid grid-cols-2 gap-[var(--space-5)]">
      <Section title="Skill uses">
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <span className="[font:var(--text-heading-3)] tabular-nums text-[var(--color-text-primary)]">
              {uses.total.toLocaleString('en-US')}
            </span>
            <Badge
              size="small"
              type={up ? 'positive' : 'negative'}
              variant="secondary"
              leftIcon={
                up ? (
                  <ArrowUp size={16} variant="Bold" color="currentColor" />
                ) : (
                  <ArrowDown size={16} variant="Bold" color="currentColor" />
                )
              }
            >
              {Math.abs(uses.deltaPct)}% from last 30d
            </Badge>
          </div>
          <SkillUsesChart uses={uses} />
        </div>
      </Section>

      <Section title="Resolved vs abandoned">
        <SkillOutcomesChart />
      </Section>
    </div>
  );
}
