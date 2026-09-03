import * as React from 'react';
import { Category, Grid3, HambergerMenu, Profile2User, RowVertical, Tag, TickCircle } from 'iconsax-react';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import {
  EXPERIENCE_PLURAL,
  EXPERIENCE_STATUSES,
  EXPERIENCE_STATUS_LABEL,
  EXPERIENCE_TYPES,
  type ExperienceStatus,
  type ExperienceType,
} from '@/data/experiences';
import {
  EXPERIENCE_DISPLAYS,
  EXPERIENCE_DISPLAY_LABEL,
  type ExperienceDisplay,
} from '@/state/experiencesStore';
import { experienceGlyph } from './experienceGlyph';

/**
 * The filter row — Agent Designer Sandbox `6:384`.
 *
 * Four multi-select pills, a hairline rule, then the three display modes. The
 * pill idiom is the one `SkillsToolbar` and `SourceToolbar` already use: a
 * `DropdownSelector` as the TRIGGER of a portaled `Menu`, rows are
 * `DropdownMenuList` (here in its `multiSelect` form, which swaps the icon slot
 * for a checkbox), and the open flag lives here because the selectors are
 * stateless triggers by design.
 *
 * ## `Contexts` is experience TYPE
 *
 * That reading came from Fahmi, not from a source: the pill is drawn on `6:384`
 * and appears in no Jimo doc, where the documented dashboard filters are Status,
 * Segments and Tags. On a per-type page it is seeded to that page's own type, so
 * it does work only once widened — and widening it makes the cards grow a type
 * badge, which is the rule the Spaces doc states for a multi-type view.
 *
 * The last selected context cannot be deselected. A list filtered to no types
 * is a blank page whose only route back is the control that emptied it, and
 * every other pill can be cleared to mean "no constraint" instead.
 *
 * ## Invented: the pill labels when something IS selected
 *
 * The artboard only ever draws the pills at rest, printing the bare dimension
 * name. What a pill reads once you pick something is not drawn anywhere, so it
 * follows the shape `SkillsToolbar` uses: the single value's own label, or
 * "N selected" past one. `hasValue` keys off "is this narrower than everything",
 * which is why Contexts lights up only past one type.
 */
const DISPLAY_ICON: Record<ExperienceDisplay, React.ReactNode> = {
  compact: <HambergerMenu size={20} variant="Linear" color="currentColor" />,
  mosaic: <Grid3 size={20} variant="Linear" color="currentColor" />,
  list: <RowVertical size={20} variant="Linear" color="currentColor" />,
};

/**
 * A pill reads its DIMENSION name until it is actually narrowing something —
 * which is what the artboard draws, and what keeps `Contexts` from reading
 * "Resource Centers" on the Resource Centers page, where its own type is the
 * baseline rather than a filter.
 */
function summarise(
  selected: string[],
  narrowed: boolean,
  label: string,
  one: (value: string) => string,
): string {
  if (!narrowed) return label;
  if (selected.length === 1) return one(selected[0]);
  return `${selected.length} selected`;
}

/** One pill: a trigger, a portaled menu, and a set of checkbox rows. */
function FilterPill<T extends string>({
  label,
  icon,
  options,
  selected,
  optionLabel,
  optionIcon,
  narrowed,
  onToggle,
}: {
  label: string;
  icon: React.ReactNode;
  options: T[];
  selected: T[];
  optionLabel: (value: T) => string;
  optionIcon?: (value: T) => React.ReactNode;
  narrowed: boolean;
  onToggle: (value: T) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Menu
      open={open}
      onClose={() => setOpen(false)}
      trigger={
        <DropdownSelector
          text={summarise(selected as string[], narrowed, label, (v) => optionLabel(v as T))}
          withIcon
          icon={icon}
          isOpen={open}
          hasValue={narrowed}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        />
      }
    >
      {options.map((value) => (
        <DropdownMenuList
          key={value}
          multiSelect
          showIcon={optionIcon != null}
          icon={optionIcon?.(value)}
          text={optionLabel(value)}
          state={selected.includes(value) ? 'selected' : 'default'}
          onClick={() => onToggle(value)}
        />
      ))}
    </Menu>
  );
}

export function ExperiencesToolbar({
  type,
  contexts,
  statuses,
  segments,
  tags,
  display,
  segmentOptions,
  tagOptions,
  onContexts,
  onStatuses,
  onSegments,
  onTags,
  onDisplay,
}: {
  type: ExperienceType;
  contexts: ExperienceType[];
  statuses: ExperienceStatus[];
  segments: string[];
  tags: string[];
  display: ExperienceDisplay;
  segmentOptions: string[];
  tagOptions: string[];
  onContexts: (next: ExperienceType[]) => void;
  onStatuses: (next: ExperienceStatus[]) => void;
  onSegments: (next: string[]) => void;
  onTags: (next: string[]) => void;
  onDisplay: (next: ExperienceDisplay) => void;
}) {
  function toggle<T extends string>(list: T[], value: T, allowEmpty: boolean): T[] {
    if (!list.includes(value)) return [...list, value];
    const next = list.filter((v) => v !== value);
    return next.length === 0 && !allowEmpty ? list : next;
  }

  return (
    <div className="flex flex-wrap items-center gap-[var(--space-4)]">
      <FilterPill
        label="Contexts"
        icon={<Category size={20} variant="Linear" color="currentColor" />}
        options={EXPERIENCE_TYPES}
        selected={contexts}
        optionLabel={(t) => EXPERIENCE_PLURAL[t]}
        optionIcon={(t) => experienceGlyph(t, 16)}
        // Its own type alone is the page's baseline, not a filter.
        narrowed={contexts.length > 1 || contexts[0] !== type}
        onToggle={(value) => onContexts(toggle(contexts, value, false))}
      />
      <FilterPill
        label="Status"
        icon={<TickCircle size={20} variant="Linear" color="currentColor" />}
        options={EXPERIENCE_STATUSES}
        selected={statuses}
        optionLabel={(s) => EXPERIENCE_STATUS_LABEL[s]}
        narrowed={statuses.length > 0}
        onToggle={(value) => onStatuses(toggle(statuses, value, true))}
      />
      <FilterPill
        label="Segments"
        icon={<Profile2User size={20} variant="Linear" color="currentColor" />}
        options={segmentOptions}
        selected={segments}
        optionLabel={(s) => s}
        narrowed={segments.length > 0}
        onToggle={(value) => onSegments(toggle(segments, value, true))}
      />
      <FilterPill
        label="Tags"
        icon={<Tag size={20} variant="Linear" color="currentColor" />}
        options={tagOptions}
        selected={tags}
        optionLabel={(t) => t}
        narrowed={tags.length > 0}
        onToggle={(value) => onTags(toggle(tags, value, true))}
      />

      {/* The artboard's hairline between the filters and the display modes. */}
      <span
        aria-hidden="true"
        className="h-[var(--space-4)] w-px shrink-0 bg-[var(--color-border-default)]"
      />

      {/* Three icon-only DropdownSelectors, which is what `6:384` instances —
          NOT a SecondaryHorizontalMenuGroup, whose items are `flex-1` and would
          stretch this cluster across the rest of the row. */}
      <div role="radiogroup" aria-label="Display" className="flex shrink-0 items-center gap-[var(--space-2)]">
        {EXPERIENCE_DISPLAYS.map((mode) => (
          <DropdownSelector
            key={mode}
            size="small"
            withText={false}
            withIcon
            icon={DISPLAY_ICON[mode]}
            role="radio"
            aria-checked={display === mode}
            aria-label={EXPERIENCE_DISPLAY_LABEL[mode]}
            // DropdownSelector hardcodes listbox semantics for its normal job.
            // These three are toggles, not triggers, so the popup semantics are
            // cleared rather than left to describe a menu that never opens.
            aria-haspopup={undefined}
            aria-expanded={undefined}
            hasValue={display === mode}
            onClick={() => onDisplay(mode)}
          />
        ))}
      </div>
    </div>
  );
}
