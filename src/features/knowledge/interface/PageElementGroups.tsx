import * as React from 'react';
import { ArrowDown2, Element3, Eye, EyeSlash, Trash } from 'iconsax-react';
import { Badge } from '@/components/ui/Chip/badge';
import { Button } from '@/components/ui/Button/Button';
import { cn } from '@/lib/utils';
import {
  ELEMENT_GROUPS,
  GROUP_LABEL,
  type ElementGroup,
  type InterfacePage,
  type PageElement,
} from '@/data/interfacePages';
import { GroupChip, ROW_TINT } from './GroupChip';

/**
 * The page drawer's Interface tab — Figma `12987:12416`.
 *
 * Six collapsible blocks, one per `ElementGroup`, in `ELEMENT_GROUPS` order. A
 * group with no elements is not drawn at all: the artboard's page has all six,
 * but a page this prototype scanned has none, and six empty accordions would be
 * six invitations to click on nothing.
 *
 * ## The tint is the ROW's, not the chip's
 *
 * `ROW_TINT[group]` paints the whole header row and the panel under it — that is
 * the artboard's look, and it is why `GroupChip` goes one step deeper with
 * `glyph="ink"` (see that file). The element rows are then WHITE cards floating
 * on the group's colour, which is what makes the block read as one object.
 *
 * ## The chevron transition names `rotate`
 *
 * Tailwind v4 compiles `rotate-180` to the standalone `rotate:` property, so a
 * transition naming `transform` never fires — the same trap `ThinkingTrace`,
 * `Menu` (`scale`) and `Drawer` (`translate`) each record.
 *
 * The height ease is the `grid-rows-[0fr] → [1fr]` trick `ThinkingTrace` uses,
 * for the same reason it gives: no measuring, so no ResizeObserver, so nothing
 * that stalls in a tab that is not painting.
 *
 * ## Element rows are inert, and say so
 *
 * No frame designs an element detail, so a row acknowledges the click through
 * `onOutOfScope` and stops. It is still a real `<button>`: a row that looks
 * clickable and is not reachable from the keyboard is worse than one that
 * politely declines.
 *
 * ## Invented, and labelled as such
 *
 * Two things. The row glyph (`Element3`) — the artboard draws a small mark in
 * front of each element label and the file does not name the instance, so one
 * neutral glyph serves every row rather than six near-duplicates of the group
 * chip two lines above it. And which group starts OPEN: the artboard draws one
 * group expanded and the rest collapsed, so the first group with elements opens
 * here. All-collapsed would hide the tab's whole point on arrival.
 */
/**
 * One captured element — PRD-566, PRD-372.
 *
 * The row does four things it could not do before, and all four are here rather
 * than behind a click because the complaint was the cost of the click: about a
 * hundred elements per page, each needing a sheet opened and closed to learn
 * what it was bound to.
 *
 *   - It shows its anchor, which is what an element IS.
 *   - It says when it shares that anchor with others, which is only knowable
 *     once the anchor is on the row, and offers to resolve them.
 *   - It can be excluded without being deleted.
 *   - It can be deleted, so excluded stops meaning four things.
 *
 * The label is still the out-of-scope button it was: highlighting the element on
 * the live page needs a host app to highlight it on, and that is the same gap
 * the widget's guide states record. The actions beside it are real, which is why
 * the row is a `div` holding buttons now rather than one big button — a button
 * inside a button is invalid and the browser's recovery is its own bug.
 */
function ElementRow({
  element,
  duplicates,
  onOutOfScope,
  onToggleDisabled,
  onRemove,
  onResolveDuplicates,
}: {
  element: PageElement;
  /** How many elements share this anchor, including this one. */
  duplicates: number;
  onOutOfScope: (what: string) => void;
  onToggleDisabled: () => void;
  onRemove: () => void;
  onResolveDuplicates: () => void;
}) {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-[var(--space-2)] rounded-[var(--radius-md)] bg-[var(--color-neutral-white)] px-[var(--space-3)] py-[var(--space-2)]',
        element.disabled && 'opacity-60',
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-5 shrink-0 items-center justify-center text-[var(--color-text-tertiary)]"
      >
        <Element3 size={16} variant="Linear" color="currentColor" />
      </span>

      <button
        type="button"
        onClick={() => onOutOfScope(`Highlighting ${element.label}`)}
        className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-[var(--space-1)] border-0 bg-transparent p-0 text-left"
      >
        <span className="w-full truncate [font:var(--text-body-3)] text-[var(--color-text-primary)]">
          {element.label}
        </span>
        {/* Monospaced and dimmed: it is the row's evidence, not its title. */}
        <span className="w-full truncate font-mono text-[11px] leading-[1.4] text-[var(--color-text-tertiary)]">
          {element.anchor ?? 'No anchor recorded'}
        </span>
      </button>

      {duplicates > 1 && (
        <button
          type="button"
          onClick={onResolveDuplicates}
          title={`${duplicates} elements share this anchor — keep one`}
          className="shrink-0 cursor-pointer rounded-[var(--radius-full)] border-0 bg-transparent p-0"
        >
          <Badge type="alert" variant="secondary" size="x-small">
            {duplicates} on this anchor · keep one
          </Badge>
        </button>
      )}

      {element.disabled && (
        <Badge type="neutral" variant="secondary" size="x-small">
          Excluded
        </Badge>
      )}

      <Badge type="neutral" variant="secondary" size="x-small">
        {element.tag}
      </Badge>

      <Button
        variant="outline"
        size="icon-sm"
        aria-label={
          element.disabled
            ? `Include ${element.label} again`
            : `Exclude ${element.label} from what the agent reads`
        }
        leftIcon={
          element.disabled ? (
            <Eye size={16} variant="Linear" color="currentColor" />
          ) : (
            <EyeSlash size={16} variant="Linear" color="currentColor" />
          )
        }
        onClick={onToggleDisabled}
      />
      <Button
        variant="outline"
        size="icon-sm"
        danger
        aria-label={`Delete ${element.label}`}
        leftIcon={<Trash size={16} variant="Linear" color="currentColor" />}
        onClick={onRemove}
      />
    </div>
  );
}

export function PageElementGroups({
  page,
  onOutOfScope,
  onToggleDisabled,
  onRemove,
  onResolveDuplicates,
}: {
  page: InterfacePage;
  onOutOfScope: (what: string) => void;
  onToggleDisabled: (element: PageElement) => void;
  onRemove: (element: PageElement) => void;
  onResolveDuplicates: (element: PageElement) => void;
}) {
  // One id for the component, suffixed per group. `useId` cannot be called in a
  // loop, and `ELEMENT_GROUPS` is a constant, so a suffix is the whole fix.
  const baseId = React.useId();

  const byGroup = React.useMemo(() => {
    const map = new Map<ElementGroup, PageElement[]>();
    page.elements.forEach((el) => {
      const list = map.get(el.group);
      if (list) list.push(el);
      else map.set(el.group, [el]);
    });
    return map;
  }, [page.elements]);

  const groups = ELEMENT_GROUPS.filter((g) => (byGroup.get(g)?.length ?? 0) > 0);

  // Counted across the whole page, not per group: the scanner can land the same
  // anchor in two different groups, and a duplicate the reader cannot see from
  // here is exactly the one the ticket is about.
  const byAnchor = React.useMemo(() => {
    const counts = new Map<string, number>();
    page.elements.forEach((el) => {
      if (el.anchor) counts.set(el.anchor, (counts.get(el.anchor) ?? 0) + 1);
    });
    return counts;
  }, [page.elements]);

  const [openGroups, setOpenGroups] = React.useState<ElementGroup[]>(() =>
    groups.length > 0 ? [groups[0]] : [],
  );

  // Opening a different page must not leave the previous page's group open —
  // and the first group with elements differs from page to page.
  React.useEffect(() => {
    const first = ELEMENT_GROUPS.find((g) => page.elements.some((el) => el.group === g));
    setOpenGroups(first ? [first] : []);
  }, [page.id]);

  if (page.elements.length === 0) {
    return (
      <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
        {page.status === 'scanning'
          ? 'Elements appear once the scan finishes.'
          : 'No elements were mapped on this page yet. Rescan it to try again.'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {groups.map((group) => {
        const elements = byGroup.get(group) ?? [];
        const open = openGroups.includes(group);
        const panelId = `${baseId}-${group}`;

        return (
          <div
            key={group}
            className="flex flex-col overflow-hidden rounded-[var(--radius-lg)]"
          >
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() =>
                setOpenGroups((prev) =>
                  prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
                )
              }
              className={cn(
                'flex w-full cursor-pointer items-center gap-[var(--space-3)] border-0 px-[var(--space-3)] py-[var(--space-3)] text-left',
                ROW_TINT[group],
              )}
            >
              <GroupChip group={group} />
              <span className="min-w-0 flex-1 truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                {GROUP_LABEL[group]} • {elements.length}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center text-[var(--color-text-secondary)] [transition:rotate_var(--transition-fast)]',
                  open && 'rotate-180',
                )}
              >
                <ArrowDown2 size={20} variant="Linear" color="currentColor" />
              </span>
            </button>

            <div
              id={panelId}
              className={cn(
                'grid [transition:grid-template-rows_var(--transition-base)]',
                ROW_TINT[group],
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div
                  className="flex flex-col gap-[var(--space-2)] px-[var(--space-3)] pb-[var(--space-3)]"
                  // Focus must not reach a collapsed panel, and `overflow:
                  // hidden` does not stop that on its own.
                  {...(open ? {} : { inert: '' })}
                >
                  {elements.map((el) => (
                    <ElementRow
                      key={el.id}
                      element={el}
                      duplicates={el.anchor ? (byAnchor.get(el.anchor) ?? 0) : 0}
                      onOutOfScope={onOutOfScope}
                      onToggleDisabled={() => onToggleDisabled(el)}
                      onRemove={() => onRemove(el)}
                      onResolveDuplicates={() => onResolveDuplicates(el)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
