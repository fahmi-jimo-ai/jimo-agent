import * as React from 'react';
import { Global, More, Refresh2, Trash } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import { SCAN_STATUS_LABEL, type InterfacePage } from '@/data/interfacePages';
import { PageThumb } from './PageThumb';

/**
 * One card in the Interface grid — Figma `12987:13033`, with the kebab and the
 * URL chip as drawn on the same cards in `12987:13517`.
 *
 * Three stacked parts, exactly the artboard's order: the thumbnail, the name,
 * and a meta line reading "48 Element • 2 Skills". Both numbers are DERIVED —
 * `elements.length` and `skillsForPage(...).length` — for the reason
 * `interfacePages.ts` records: the artboard's own card (48) and its own drawer
 * (33) disagree, so the only guarantee worth having is that the card and the
 * drawer can never disagree with EACH OTHER.
 *
 * The singular/plural is the artboard's, not English's: it prints "48 Element"
 * and "2 Skills" on the same line. `Element` is left uncountable exactly as
 * drawn; `Skill`/`Skills` pluralises, because the artboard only ever shows the
 * plural and a card with one skill reading "1 Skills" is a bug the artboard
 * simply never had to have an opinion about.
 *
 * ## The kebab must not open the drawer
 *
 * The whole card is the drawer's trigger, so the kebab's wrapper stops the
 * click — the same guard `SourceTable` puts on its row action buttons. The
 * menu's own panel needs no guard: `Menu` portals it to `<body>`, so a click
 * inside it was never a descendant of this card to begin with.
 *
 * ## Scan status
 *
 * `ScanStatus` post-dates the artboards (see `interfacePages.ts`), so the meta
 * line takes it over the counts while a scan is in flight: a card that says
 * "48 Element" while it is being re-read is stating something it does not know.
 * A `ready` card is the drawn one, byte for byte.
 */
export function PageCard({
  page,
  skillCount,
  onOpen,
  onRescan,
  onConfigure,
  onRemove,
}: {
  page: InterfacePage;
  skillCount: number;
  onOpen: () => void;
  onRescan: () => void;
  onConfigure: () => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const scanning = page.status === 'scanning';
  const meta =
    page.status === 'ready'
      ? `${page.elements.length} Element • ${skillCount} ${skillCount === 1 ? 'Skill' : 'Skills'}`
      : SCAN_STATUS_LABEL[page.status];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${page.name}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onOpen();
      }}
      className="group/card flex cursor-pointer flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-400)]"
    >
      <div className="relative">
        <div
          className={cnThumb(scanning)}
        >
          <PageThumb pageId={page.id} />
        </div>

        {/* The kebab is hover-revealed on the artboard, and focus-revealed here
            as well — a control that only exists under a pointer is unreachable
            from the keyboard otherwise. */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[var(--space-2)] right-[var(--space-2)] opacity-0 [transition:opacity_var(--transition-fast)] group-hover/card:opacity-100 focus-within:opacity-100"
        >
          <Menu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            align="right"
            trigger={
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Actions for ${page.name}`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                leftIcon={<More size={16} variant="Linear" color="currentColor" />}
                onClick={() => setMenuOpen((o) => !o)}
              />
            }
          >
            <DropdownMenuList
              text="Rescan interface"
              icon={<Refresh2 size={16} variant="Linear" color="currentColor" />}
              onClick={() => {
                setMenuOpen(false);
                onRescan();
              }}
            />
            <DropdownMenuList
              text="Configure in-app"
              icon={<Global size={16} variant="Linear" color="currentColor" />}
              onClick={() => {
                setMenuOpen(false);
                onConfigure();
              }}
            />
            <DropdownMenuList
              danger
              text="Remove page"
              icon={<Trash size={16} variant="Linear" color="currentColor" />}
              onClick={() => {
                setMenuOpen(false);
                onRemove();
              }}
            />
          </Menu>
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-start gap-[var(--space-1)]">
        <p className="m-0 w-full truncate [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
          {page.name}
        </p>
        <p className="m-0 w-full truncate [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
          {meta}
        </p>
        {page.urlRule !== '' && (
          // Truncated by CSS, not by slicing the string: the artboard's
          // "mixpanel.com/profile/dashbo…" is one column width, and a character
          // count would re-cut wrongly the moment the grid changes width.
          <Badge
            type="neutral"
            variant="secondary"
            size="xx-small"
            leftIcon={<Global size={16} variant="Linear" color="currentColor" />}
            className="max-w-full [&>[data-slot=badge-label]]:min-w-0 [&>[data-slot=badge-label]]:truncate"
          >
            URL equals: {page.urlRule}
          </Badge>
        )}
      </div>
    </div>
  );
}

/** The thumbnail frame. Split out only so the scanning branch stays readable. */
function cnThumb(scanning: boolean) {
  return [
    'aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)]',
    'border border-[var(--color-border-default)]',
    '[transition:border-color_var(--transition-fast),opacity_var(--transition-fast)]',
    'group-hover/card:border-[var(--color-border-strong)]',
    // Invented alongside ScanStatus: a card mid-scan reads as not-yet-settled.
    scanning ? 'opacity-50' : 'opacity-100',
  ].join(' ');
}
