import * as React from 'react';
import { PageCard } from './PageCard';
import type { InterfacePage } from '@/data/interfacePages';

/**
 * The card grid — Figma `12987:13033`.
 *
 * Four columns at `--space-5`: 4 × 223 + 3 × 20 = 952, which is exactly the
 * content width inside a `Section` at this page's 1064 max. The columns are
 * declared with `grid-cols-4` rather than an auto-fill minmax, because the
 * artboard's 223 is a consequence of that arithmetic, not a minimum anyone
 * chose — an auto-fill grid would silently re-flow to 3 or 5 at other widths and
 * stop matching the board.
 */
export function PageGrid({
  pages,
  skillCounts,
  onOpen,
  onRescan,
  onConfigure,
  onRemove,
}: {
  pages: InterfacePage[];
  skillCounts: Record<string, number>;
  onOpen: (page: InterfacePage) => void;
  onRescan: (page: InterfacePage) => void;
  onConfigure: (page: InterfacePage) => void;
  onRemove: (page: InterfacePage) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-x-[var(--space-5)] gap-y-[var(--space-6)]">
      {pages.map((page) => (
        <PageCard
          key={page.id}
          page={page}
          skillCount={skillCounts[page.id] ?? 0}
          onOpen={() => onOpen(page)}
          onRescan={() => onRescan(page)}
          onConfigure={() => onConfigure(page)}
          onRemove={() => onRemove(page)}
        />
      ))}
    </div>
  );
}
