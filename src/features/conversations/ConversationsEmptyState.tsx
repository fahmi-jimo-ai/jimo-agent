import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';

/**
 * "No conversations yet" (934:30359) and "No conversations found" (934:30109).
 * One component, because the two frames differ only in copy and the presence of
 * the Clear Filters button.
 *
 * ## The illustration is missing, and that is not a design decision
 *
 * Both frames put a 3D chat-bubble illustration above the copy — Figma node
 * `934:30585`, to be exported at 3x as `src/assets/conversations-empty-state.png`
 * alongside `escalation-empty-state.png` and `knowledge-no-results.png`.
 *
 * It could not be fetched: this workspace's egress policy blocks figma.com, so
 * every asset URL the Figma MCP hands back returns 403 at the proxy. Rebuilding
 * it from SVG/DOM primitives is exactly what CLAUDE.md forbids (it is what
 * `HeroArt.tsx` used to do, and it drifted), so it is left out rather than
 * approximated.
 *
 * To finish it, from a machine that can reach figma.com:
 *
 *   1. Export node 934:30585 from file 42KccejbNYeHc3EP5P8vHd at 3x, PNG,
 *      transparent background — it sits on the Subpage's blue-50 body, not on a
 *      white card, and the pale blue blob is baked into the node.
 *   2. Save it to src/assets/conversations-empty-state.png
 *   3. Uncomment the import and the <img> below.
 *
 * Note: the node contains a child instance still named "Open Mailbox With
 * Lowered Flag". That is a stale layer name, not the wrong node — check the
 * export renders chat bubbles before committing it.
 */
// import illustration from '@/assets/conversations-empty-state.png';

const COPY = {
  'no-data': {
    title: 'No conversations yet',
    body: "Once users start asking questions, you'll see real conversations appear here to help you uncover patterns and improve their experience.",
  },
  'no-results': {
    title: 'No conversations found',
    body: 'No conversations matched your search. Adjust your criteria to find insights or explore other topics.',
  },
};

export function ConversationsEmptyState({
  variant,
  onClearFilters,
}: {
  variant: keyof typeof COPY;
  onClearFilters?: () => void;
}) {
  const copy = COPY[variant];

  return (
    <div className="flex flex-col items-center gap-[var(--space-5)] py-[var(--space-12)]">
      {/* The illustration's exact footprint, held open so the layout is already
          correct and dropping the PNG in is a pure swap for this box. */}
      <div aria-hidden="true" className="h-[160px] w-[284px] shrink-0" />
      {/* <img
        src={illustration}
        alt=""
        aria-hidden="true"
        className="h-[160px] w-[284px] select-none"
        draggable={false}
      /> */}
      <div className="flex max-w-[438px] flex-col items-center gap-[var(--space-2)] text-center">
        <p className="m-0 [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
          {copy.title}
        </p>
        <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
          {copy.body}
        </p>
      </div>
      {variant === 'no-results' && onClearFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
