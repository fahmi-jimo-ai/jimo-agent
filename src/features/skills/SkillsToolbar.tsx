import * as React from 'react';
import { ArrangeVertical, Filter, SearchNormal1 } from 'iconsax-react';
import { Input } from '@/components/ui/Input/Input';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import { SKILL_MODES, SKILL_MODE_LABEL } from '@/data/skills';
import type { SkillModeFilter, SkillSort } from '@/state/skillsStore';
import { skillGlyph } from './skillGlyph';

/** Re-exported, never redeclared — the store owns both unions. */
export type { SkillModeFilter, SkillSort };

/**
 * Search + the Sort and Mode filters — Figma `12987:11526`.
 *
 * Structurally identical to `SourceToolbar`, and that is the point: a
 * `DropdownSelector` as the `trigger` of a portaled `Menu`, rows are
 * `DropdownMenuList`, and the open flag lives here because the selectors are
 * stateless triggers by design.
 *
 * Two departures from that file, both from the artboard:
 *  - The search field is `flex-1` rather than a fixed 240, because this toolbar
 *    is a full-width row ABOVE the table card rather than an inset inside it.
 *    That is also what pushes the two selectors to the right edge.
 *  - Both triggers always print a value ("Default", "All Skills") instead of
 *    the bare column name, which is how `12987:11526` draws them. `hasValue`
 *    therefore keys off "is this the unfiltered option", not "is there a label".
 *
 * ## Invented: the option SETS
 *
 * The artboard names the two TRIGGERS and never opens either menu, so no frame
 * defines what is inside them. The sort list is the four orderings the table's
 * own columns can express (`filterSkills` implements exactly these); the mode
 * list is `All Skills` plus one row per `SKILL_MODES`. Invented, and labelled.
 *
 * The mode rows use the SHORT `SKILL_MODE_LABEL` ("Execute"), not
 * `SKILL_MODE_MENU[m].title` ("Execute a flow"). The long titles are the Add
 * Skill menu's register — they describe an action you are about to take. A
 * filter row names the value it filters to, and has to match the Mode chip in
 * the table below it word for word.
 */
const SORT_LABEL: Record<SkillSort, string> = {
  default: 'Default',
  name: 'Name',
  usage: 'Most used',
  completion: 'Completion rate',
};

const SORTS: SkillSort[] = ['default', 'name', 'usage', 'completion'];

export function SkillsToolbar({
  search,
  onSearch,
  mode,
  onMode,
  sort,
  onSort,
}: {
  search: string;
  onSearch: (value: string) => void;
  mode: SkillModeFilter;
  onMode: (value: SkillModeFilter) => void;
  sort: SkillSort;
  onSort: (value: SkillSort) => void;
}) {
  const [sortOpen, setSortOpen] = React.useState(false);
  const [modeOpen, setModeOpen] = React.useState(false);

  const sortIcon = <ArrangeVertical size={20} variant="Linear" color="currentColor" />;
  const modeIcon = <Filter size={20} variant="Linear" color="currentColor" />;

  return (
    <div className="flex flex-wrap items-center gap-[var(--space-3)]">
      <Input
        className="min-w-[200px] flex-1"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search skills..."
        aria-label="Search skills"
        size="small"
        leftIcon={<SearchNormal1 size={20} variant="Linear" color="currentColor" />}
      />

      <Menu
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        align="right"
        trigger={
          <DropdownSelector
            size="small"
            text={SORT_LABEL[sort]}
            withIcon
            icon={sortIcon}
            isOpen={sortOpen}
            hasValue={sort !== 'default'}
            onClick={() => setSortOpen((o) => !o)}
          />
        }
      >
        {SORTS.map((value) => (
          <DropdownMenuList
            key={value}
            text={SORT_LABEL[value]}
            state={sort === value ? 'selected' : 'default'}
            icon={sortIcon}
            onClick={() => {
              onSort(value);
              setSortOpen(false);
            }}
          />
        ))}
      </Menu>

      <Menu
        open={modeOpen}
        onClose={() => setModeOpen(false)}
        align="right"
        trigger={
          <DropdownSelector
            size="small"
            text={mode === 'all' ? 'All Skills' : SKILL_MODE_LABEL[mode]}
            withIcon
            icon={modeIcon}
            isOpen={modeOpen}
            hasValue={mode !== 'all'}
            onClick={() => setModeOpen((o) => !o)}
          />
        }
      >
        <DropdownMenuList
          text="All Skills"
          state={mode === 'all' ? 'selected' : 'default'}
          icon={modeIcon}
          onClick={() => {
            onMode('all');
            setModeOpen(false);
          }}
        />
        {SKILL_MODES.map((value) => (
          <DropdownMenuList
            key={value}
            text={SKILL_MODE_LABEL[value]}
            state={mode === value ? 'selected' : 'default'}
            icon={skillGlyph(value)}
            onClick={() => {
              onMode(value);
              setModeOpen(false);
            }}
          />
        ))}
      </Menu>
    </div>
  );
}
