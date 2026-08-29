import * as React from 'react';
import { Scan } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';

/**
 * The Interface grid with nothing in it.
 *
 * ## Invented, and labelled as such
 *
 * No frame in `12987:12415` draws this. It is reachable — remove every page from
 * the kebab and you are here — so leaving it undrawn would mean an empty card
 * with a search field and no explanation.
 *
 * The shape is `ConversationsEmptyState`'s, down to the reserved illustration
 * footprint, so the two zero states in this app read as siblings and a real PNG
 * can be dropped into either without touching layout. The copy is written from
 * the card's own description, which is the one sentence about this feature the
 * artboard does supply.
 *
 * `no-results` is the reachable one in normal use, since `pages` seeds populated
 * (see `INITIAL_KNOWLEDGE`) — type into the search field and you land here.
 */
const COPY = {
  'no-data': {
    title: 'No interfaces scanned yet',
    body: 'Scan a page on your platform and the agent will read it in real time — its buttons, forms, tables and copy — whenever a user asks about it.',
  },
  'no-results': {
    title: 'No page found',
    body: 'No scanned page matched your search. Try another name, or scan the page you were looking for.',
  },
};

export function InterfaceEmptyState({
  variant,
  onScan,
  onClearSearch,
}: {
  variant: keyof typeof COPY;
  onScan: () => void;
  onClearSearch?: () => void;
}) {
  const copy = COPY[variant];

  return (
    <div className="flex flex-col items-center gap-[var(--space-5)] py-[var(--space-11)]">
      {/* The illustration's footprint, held open — see the header comment. */}
      <div aria-hidden="true" className="h-[160px] w-[284px] shrink-0" />
      <div className="flex max-w-[438px] flex-col items-center gap-[var(--space-2)] text-center">
        <p className="m-0 [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
          {copy.title}
        </p>
        <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
          {copy.body}
        </p>
      </div>
      {variant === 'no-results' && onClearSearch ? (
        <Button variant="outline" size="sm" onClick={onClearSearch}>
          Clear search
        </Button>
      ) : (
        <Button
          size="sm"
          leftIcon={<Scan size={20} variant="Linear" color="currentColor" />}
          onClick={onScan}
        >
          Scan a page
        </Button>
      )}
    </div>
  );
}
