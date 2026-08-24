import * as React from 'react';
import noResults from '@/assets/knowledge-no-results.png';

/**
 * "No property found" — Figma 892:13280 (empty search) and 893:13761 (a filter
 * that matches nothing). One component, because the two frames are identical.
 *
 * The illustration is the Figma node 893:13710 exported at 3x, not rebuilt from
 * DOM primitives: it is a 🔍 emoji on a Blue/150 ellipse, and an emoji renders
 * differently on every platform. Exported with a transparent background, since
 * unlike the escalation hero this one sits on the white card.
 */
export function PropertyEmptyState() {
  return (
    <div className="flex flex-col items-center gap-[var(--space-5)] py-[var(--space-6)]">
      <img
        src={noResults}
        alt=""
        aria-hidden="true"
        className="h-[160px] w-[284px] select-none"
        draggable={false}
      />
      <div className="flex flex-col items-center gap-[var(--space-2)] text-center">
        <p className="m-0 [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
          No property found
        </p>
        <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
          Adjust your search to find relevant elements.
        </p>
      </div>
    </div>
  );
}
