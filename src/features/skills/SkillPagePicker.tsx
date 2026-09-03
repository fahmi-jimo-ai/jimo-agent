import * as React from 'react';
import { Global, Scan, SearchNormal1 } from 'iconsax-react';
import { PickerDialog, PickerEmpty } from '@/components/app/PickerDialog';
import { Input } from '@/components/ui/Input/Input';
import { useToast } from '@/components/app/toast';
import { useKnowledge } from '@/state/useKnowledge';
import { useSkills, skillsForPage } from '@/state/useSkills';
import { SKILL_MODE_LABEL, type SkillMode } from '@/data/skills';
import type { InterfacePage } from '@/data/interfacePages';
import { PageThumb } from '@/features/knowledge/interface/PageThumb';

/**
 * "Where should we create the skill?" — Figma `12987:11947`.
 *
 * `PickerDialog` at 848×528, which is the frame's own box. It is the picker and
 * not `ModalCard` for the reason `PickerDialog`'s header gives: it is opened on
 * its own — from the Add Skill menu — and never shares a flow with the form
 * card, so it owns its overlay and the one-card rule does not reach it. Picking
 * a page CLOSES this dialog and opens `SkillFormModal`; the two are never on
 * screen together.
 *
 * The artboard has NO footer — there is nothing to confirm, because a tile IS
 * the commit — so `footer` is omitted rather than filled with a disabled button.
 *
 * ## The first tile has nothing behind it
 *
 * "Scan a new page" is drawn dashed, ahead of the catalogue. There is no scanner
 * in this prototype (`interfacePages.ts` says so, and its whole catalogue is
 * seeded), so the tile acknowledges the click and stops, the way `Test
 * Knowledge` and the Content Detail export button already do on Knowledge.
 * `mode` is what lets that message name the thing the reader was mid-way
 * through creating instead of apologising in the abstract.
 *
 * ## Thumbnails come from `PageThumb`, and so does the box around them
 *
 * `PageThumb` is the abstract token wireframe the Interface grid already draws
 * (its own header explains why it is not a screenshot). It renders `h-full
 * w-full` and leaves the frame to the caller, so the tile below repeats
 * `PageCard`'s wrapper — `aspect-[16/10]`, `overflow-hidden`, a hairline and
 * `--radius-lg` — rather than inventing a second footprint for the same object.
 * The dashed Scan tile takes the same aspect for the same reason: a first tile
 * that is a different height makes the grid's top edge ragged.
 */
export function SkillPagePicker({
  mode,
  onClose,
  onPick,
  onPickGlobal,
}: {
  /** The mode chosen in the Add Skill menu; carried into the form card next. */
  mode: SkillMode;
  onClose: () => void;
  onPick: (page: InterfacePage) => void;
  /** PRD-584 — the skill is not about a screen. Skips straight to the form. */
  onPickGlobal: () => void;
}) {
  const toast = useToast();
  const { pages } = useKnowledge();
  const { skills } = useSkills();
  const [query, setQuery] = React.useState('');

  const q = query.trim().toLowerCase();
  const matches = q
    ? pages.filter((p) => p.name.toLowerCase().includes(q) || p.urlRule.toLowerCase().includes(q))
    : pages;

  return (
    <PickerDialog
      title="Where should we create the skill?"
      onClose={onClose}
      width={848}
      height={528}
      search={
        <Input
          placeholder="Search Page"
          leftIcon={<SearchNormal1 size={24} variant="Linear" color="currentColor" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      }
    >
      <div className="grid grid-cols-3 gap-[var(--space-4)] px-[var(--space-2)] pb-[var(--space-4)]">
        {/* PROPOSAL (PRD-584). First, and out of the search filter, for the
            same reason the Scan tile is: it is an action rather than a result.
            It is FIRST because this dialog's question — "where should we create
            the skill?" — has been unanswerable for a whole class of skill, and
            the answer being missing is what sends builders to the homepage.
            Gojob's HR and legal questions have no screen. */}
        <button
          type="button"
          onClick={onPickGlobal}
          className="flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-default)] p-[var(--space-4)] text-center [transition:background-color_var(--transition-fast),border-color_var(--transition-fast)] hover:border-[var(--color-blue-400)] hover:bg-[var(--color-brand-subtle)]"
        >
          <span aria-hidden="true" className="flex items-center text-[var(--color-brand-default)]">
            <Global size={24} variant="Linear" color="currentColor" />
          </span>
          <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
            Not about a page
          </span>
          <span className="[font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
            Available everywhere
          </span>
        </button>

        {/* Dead end, acknowledged — see the header comment. It stays first in
            the grid (and out of the search filter) because it is an action, not
            a result. */}
        <button
          type="button"
          onClick={() =>
            toast({
              type: 'neutral',
              title: 'Scanning a new page is out of scope',
              body: `This prototype ships a seeded page catalogue, so an ${SKILL_MODE_LABEL[mode]} skill has to start from a page that was already scanned.`,
            })
          }
          className="flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-default)] p-[var(--space-4)] text-center [transition:background-color_var(--transition-fast),border-color_var(--transition-fast)] hover:border-[var(--color-blue-400)] hover:bg-[var(--color-brand-subtle)]"
        >
          <span aria-hidden="true" className="flex items-center text-[var(--color-brand-default)]">
            <Scan size={24} variant="Linear" color="currentColor" />
          </span>
          <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
            Scan a new page
          </span>
        </button>

        {matches.map((page) => {
          const skillCount = skillsForPage(skills, page.id).length;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onPick(page)}
              className="group/tile flex cursor-pointer flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] border-0 bg-transparent p-0 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-400)]"
            >
              <span className="aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-default)] [transition:border-color_var(--transition-fast)] group-hover/tile:border-[var(--color-border-strong)]">
                <PageThumb pageId={page.id} />
              </span>
              <span className="truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                {page.name}
              </span>
              {/* Copy verbatim from 12987:13033, singular "Element" and plural
                  "Skills" included — the same reading `PageCard` records. */}
              <span className="truncate [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
                {page.elements.length} Element • {skillCount} Skills
              </span>
            </button>
          );
        })}
      </div>

      {matches.length === 0 && <PickerEmpty>No page matches “{query}”.</PickerEmpty>}
    </PickerDialog>
  );
}
