import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown2,
  Edit2,
  Eye,
  Flash,
  Global,
  Lifebuoy,
  Routing2,
  SearchNormal1,
  ExportSquare,
} from 'iconsax-react';
import { cn } from '@/lib/utils';
import {
  citationText,
  reviewSummary,
  splitCitations,
  withheldReason,
  type WithheldReason,
} from '@/lib/citations';
import { Badge } from '@/components/ui/Chip/badge';
import { kindGlyph } from '@/features/knowledge/sources/kindGlyph';
import { SOURCE_KIND_LABEL } from '@/data/knowledgeSources';
import { useKnowledge } from '@/state/useKnowledge';
import type {
  CitedSource,
  ConversationTurn,
  ThinkingStep,
  ThinkingStepKind,
  TriggeredSkill,
} from '@/data/analytics';

/**
 * What the agent did before it answered — Figma `12983:8096`
 * (Interface-Knowledge), made collapsible.
 *
 * ## The frame draws the EXPANDED half only
 *
 * `12983:8096` is a white card — 1px `#e5e5e5`, radius 8, 8px padding — holding
 * two columns: a 16px icon rail with a 1px `#cccccc` connector between glyphs,
 * and a column of Body/Body 4 labels in `#4d637b`. Every one of those values is
 * on the ramp exactly (`--color-border-default` IS `#e5e5e5`, `--radius-md` IS
 * 8px, `--text-body-4` IS `500 12px/1.5 Inter`), so nothing here is a
 * substitution.
 *
 * Two things the frame does not draw, and how they are resolved:
 *
 *   - **Collapsed.** Fahmi's call: one line showing the LAST step plus a
 *     chevron. It is the step that explains the answer sitting underneath it,
 *     where a step count would only say how much there is to read.
 *   - **Skills and sources.** The frame is a browser agent filling a CRM form,
 *     so it cites nothing. These sit under the rail, inside the same card,
 *     because they are part of the same answer — a second card beside this one
 *     would read as a second event.
 *
 * ## The rail is drawn by layout, not by the fixture
 *
 * Figma builds the rail as a rigid second column of 16px glyphs and 14.3px
 * connectors, whose pitch happens to match the label column's. That desyncs the
 * moment a label wraps, which these labels do at this width. So each step is
 * ONE row here: the rail cell stretches to whatever the label needs, the icon
 * takes the first line's 18px and the connector is `flex-1` through the rest.
 * No magic 14.3, and a two-line step still lands on its own glyph.
 *
 * ## Open state is local, and deliberately not persisted
 *
 * `AnalyticsState` is a config store — range, metric, filters, the selected
 * row. Whether a reader has a particular trace open is not configuration, it is
 * where they are in a page, so it resets on reload like a scroll position.
 *
 * ## `rotate`, not `transform`
 *
 * Tailwind v4 compiles `rotate-180` to the standalone `rotate:` property, so a
 * transition naming `transform` never fires and the chevron snaps. Same trap
 * `Menu` documents for `scale` and `Drawer` for `translate` — and the same one
 * upstream `DropdownSelector` is still living with.
 */

/** One glyph per step kind. All verified against iconsax-react's exports.
 *  Figma's rail uses vuesax/linear eye · global · mouse-square · keyboard for a
 *  browser agent; the four that survive into a support answer keep their frame
 *  glyph (eye → read, global → navigate) and the rest are named for what a
 *  support turn actually does. */
const STEP_GLYPH: Record<ThinkingStepKind, React.ElementType> = {
  read: Eye,
  navigate: Global,
  search: SearchNormal1,
  compare: Routing2,
  draft: Edit2,
  escalate: Lifebuoy,
};

function StepRail({ steps }: { steps: ThinkingStep[] }) {
  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const Glyph = STEP_GLYPH[step.kind];
        const last = i === steps.length - 1;
        return (
          <div key={i} className="flex items-stretch gap-[var(--space-2)]">
            <div aria-hidden="true" className="flex w-4 shrink-0 flex-col items-center">
              {/* 18px is one --text-body-4 line, so the glyph centres on the
                  label's FIRST line rather than on the whole wrapped block. */}
              <span className="flex h-[18px] w-4 items-center justify-center text-[var(--color-neutral-700)]">
                <Glyph size={16} variant="Linear" color="currentColor" />
              </span>
              {!last && (
                <span className="my-[var(--space-1)] w-px flex-1 rounded-[var(--radius-full)] bg-[var(--color-neutral-400)]" />
              )}
            </div>
            <p
              className={cn(
                'm-0 [font:var(--text-body-4)] text-[var(--color-neutral-700)]',
                !last && 'pb-[var(--space-4)]'
              )}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SkillChips({
  skills,
  onSkillClick,
}: {
  skills: TriggeredSkill[];
  onSkillClick: (skill: TriggeredSkill) => void;
}) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className="[font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
        Skills triggered
      </span>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {skills.map((skill) => (
          <button
            key={skill.id}
            type="button"
            onClick={() => onSkillClick(skill)}
            className="cursor-pointer rounded-[var(--radius-full)] border-0 bg-transparent p-0 text-left"
          >
            {/* Moji's Badge with props — not a hand-rolled pill. The button is
                a wrapper around it so the chip keeps its own type ramp and
                icon sizing while gaining a hit target. */}
            <Badge
              type="brand"
              variant="secondary"
              size="x-small"
              leftIcon={<Flash size={16} variant="Bold" color="currentColor" />}
            >
              {skill.name}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Why a citation the answer used was not named to the end user. One reason
 *  today, and it reads as configuration rather than as a fault: a team source is
 *  working exactly as it was set up to. */
const WITHHELD_LABEL: Record<WithheldReason, string> = {
  'team-only': 'Not shown · team only',
};

/**
 * One citation. It has up to two destinations and they are not the same thing:
 *
 *   - **In Knowledge** — the Content Detail drawer, which is where you go to
 *     see what the agent actually indexed: the chunks, the token cost, how many
 *     answers used it. Only reachable while the store still holds that id.
 *   - **The resource itself** — the page or file the source was made from,
 *     which is where you go to check whether the source is still true.
 *
 * The row prefers the drawer and falls back to the resource, because a source
 * that is still in Knowledge is the more useful of the two and the trailing
 * icon keeps the other one one click away. When neither exists — a Q&A or Text
 * source that has since been deleted — the row greys out rather than
 * disappearing: the answer did use it, and a record that quietly drops its
 * sources is worse than one that admits it lost them.
 *
 * The store is empty until a source is added (or the Demo data switch is on),
 * so the fallback is the NORMAL path here, not an edge case.
 */
function SourceRow({ source }: { source: CitedSource }) {
  const navigate = useNavigate();
  const { sources } = useKnowledge();
  const withheld = withheldReason(source);
  // Resolved ONLY to decide where the row goes. The row's own text comes from
  // the citation — see `CitedSource` in analytics.ts for why a historical
  // record must not depend on a live row.
  const live = sources.some((s) => s.id === source.sourceId);

  const label = (
    <>
      <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
        {kindGlyph(source.kind, 16)}
      </span>
      <span className="min-w-0 flex-1 truncate">{citationText(source)}</span>
    </>
  );

  const shared =
    'flex min-w-0 flex-1 items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] border-0 bg-transparent p-[var(--space-1)] text-left [font:var(--text-body-4)]';
  const active =
    'cursor-pointer text-[var(--color-blue-400)] [transition:background-color_var(--transition-fast)] hover:bg-[var(--color-blue-100)]';

  return (
    <li className="flex items-center gap-[var(--space-1)]">
      {live ? (
        <button
          type="button"
          onClick={() => navigate(`/knowledge?source=${encodeURIComponent(source.sourceId)}`)}
          title={`Open this ${SOURCE_KIND_LABEL[source.kind]} in Knowledge`}
          className={cn(shared, active)}
        >
          {label}
        </button>
      ) : source.href ? (
        <a
          href={source.href}
          target="_blank"
          rel="noreferrer"
          title="Open the source"
          className={cn(shared, 'no-underline', active)}
        >
          {label}
        </a>
      ) : (
        <span
          className={cn(shared, 'text-[var(--color-text-tertiary)]')}
          title="No longer in Knowledge"
        >
          {label}
        </span>
      )}

      {/* Review's own column: what the READER got, which is not what the answer
          used. Sits before the open-in-a-new-tab affordance because a builder
          scanning this list is asking "did they see it", not "where does it
          go". */}
      {withheld && (
        <Badge type="neutral" variant="secondary" size="xx-small">
          {WITHHELD_LABEL[withheld]}
        </Badge>
      )}

      {source.href && (
        <a
          href={source.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${source.label} in a new tab`}
          title="Open the source"
          className="flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] [transition:background-color_var(--transition-fast),color_var(--transition-fast)] hover:bg-[var(--color-blue-100)] hover:text-[var(--color-blue-400)]"
        >
          <ExportSquare size={16} variant="Linear" color="currentColor" />
        </a>
      )}
    </li>
  );
}

/**
 * Review lists every citation the answer used, including the ones the end user
 * was never shown — PRD-582's builder half. The count beside the heading is the
 * thing that makes the difference legible without opening a row: an answer that
 * leaned on four sources and could only name one is a knowledge-coverage
 * problem, and it reads as an answer-quality problem everywhere else.
 */
function SourceList({ sources }: { sources: CitedSource[] }) {
  const split = splitCitations(sources);
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className="flex flex-wrap items-center gap-[var(--space-2)] [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
        Knowledge used
        {split.withheld.length > 0 && (
          <span className="text-[var(--color-text-secondary)]">{reviewSummary(split)}</span>
        )}
      </span>
      <ul className="m-0 flex list-none flex-col gap-[var(--space-1)] p-0">
        {sources.map((source) => (
          <SourceRow key={source.sourceId} source={source} />
        ))}
      </ul>
    </div>
  );
}

export function hasTrace(turn: ConversationTurn): boolean {
  return (
    (turn.steps?.length ?? 0) > 0 ||
    (turn.skills?.length ?? 0) > 0 ||
    (turn.sources?.length ?? 0) > 0
  );
}

export function ThinkingTrace({
  turn,
  onSkillClick,
  defaultOpen = false,
}: {
  turn: ConversationTurn;
  onSkillClick: (skill: TriggeredSkill) => void;
  /** Stories open one trace so the expanded frame can be diffed. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const bodyId = React.useId();

  const steps = turn.steps ?? [];
  const skills = turn.skills ?? [];
  const sources = turn.sources ?? [];
  if (steps.length === 0 && skills.length === 0 && sources.length === 0) return null;

  // The collapsed line. Falls back down the list because a turn may carry
  // skills or citations with no step list at all.
  const summary =
    steps[steps.length - 1]?.label ??
    (skills.length > 0 ? `${skills.length} skill${skills.length === 1 ? '' : 's'} triggered` : null) ??
    `${sources.length} source${sources.length === 1 ? '' : 's'} used`;

  return (
    <div className="flex w-full flex-col rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-neutral-white)] p-[var(--space-2)]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center gap-[var(--space-2)] border-0 bg-transparent p-0 text-left [font:var(--text-body-4)] text-[var(--color-text-tertiary)] hover:text-[var(--color-neutral-700)]"
      >
        <span className="min-w-0 flex-1 truncate">{summary}</span>
        <span
          aria-hidden="true"
          className={cn(
            'flex size-4 shrink-0 items-center justify-center [transition:rotate_var(--transition-fast)]',
            open && 'rotate-180'
          )}
        >
          <ArrowDown2 size={16} variant="Linear" color="currentColor" />
        </span>
      </button>

      {/* grid-rows 0fr → 1fr eases the height without measuring it, so there is
          no ResizeObserver here — and no observer means no stalling in a tab
          that is not painting, the trap `ModalCard`'s AutoHeight documents. */}
      <div
        id={bodyId}
        className={cn(
          'grid [transition:grid-template-rows_var(--transition-base)]',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div
            className="flex flex-col gap-[var(--space-4)] pt-[var(--space-3)]"
            // Focus must not reach a collapsed trace, and `overflow: hidden`
            // does not stop that on its own.
            {...(open ? {} : { inert: '' })}
          >
            {steps.length > 0 && <StepRail steps={steps} />}
            {skills.length > 0 && <SkillChips skills={skills} onSkillClick={onSkillClick} />}
            {sources.length > 0 && <SourceList sources={sources} />}
          </div>
        </div>
      </div>
    </div>
  );
}
