import * as React from 'react';
import art from '@/assets/escalation-empty-state.png';

/**
 * The empty-state illustration, exported straight from Figma node 43:6941 at
 * 3x (1526x874).
 *
 * It used to be hand-drawn in SVG + DOM. That is deliberately gone: the export
 * is the design, and rebuilding it by hand only reintroduced drift. Nothing
 * here is themed, so there is no token to lose.
 *
 * The export's own background is Blue/50 — the same `--color-blue-50` the
 * Subpage body paints — so the flat edges blend into the page instead of
 * reading as a card.
 */
const ASPECT = 1526 / 874;

export function HeroArt() {
  return (
    <img
      src={art}
      alt=""
      aria-hidden="true"
      width={1526}
      height={874}
      // Explicit aspect-ratio: the box is reserved before the PNG decodes, so
      // the centred hero does not jump on first paint.
      style={{ aspectRatio: String(ASPECT) }}
      className="h-auto w-full max-w-[508px] select-none"
    />
  );
}
