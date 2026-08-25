import * as React from 'react';

/**
 * The Jimo "J" mark, exported from Copilot-Widget node 887:11760 and inlined.
 *
 * Nothing in the vendored Moji set carries it — `Icon.tsx`'s `AgentIcon` is the
 * smiley face, not the wordmark glyph. Unlike `VendorMark` (third-party brand
 * colours, which have no token), this glyph is monochrome in every frame it
 * appears in, so it takes `currentColor` and inherits from its container.
 *
 * ## Why the viewBox is tight, not `0 0 24 24`
 *
 * The source path is 10.67 × 15.35 and the export centred it in a 24-square, so
 * at `size={20}` the drawn glyph came out 12.8px tall — visibly smaller than
 * every iconsax icon sharing the same 20px slot. GLYPH_FILL rescales it to the
 * share of the box those icons actually cover, so `size` now means the same
 * thing here as it does for `<Calendar size={20} />`.
 */

/** Glyph bounds inside the original 24-square export. */
const GLYPH = { x: 6.6667, y: 4.3624, w: 10.6667, h: 15.3496 };
/**
 * Share of its box the glyph covers. 0.75 is measured, not guessed: the four
 * iconsax glyphs this mark sits beside on the type tiles draw 17–18.5px of ink
 * on a 24px canvas (0.71–0.77), and 0.75 lands the J at 18 — inside that band
 * rather than towering over it, which 0.83 did.
 */
const GLYPH_FILL = 0.75;

const BOX = GLYPH.h / GLYPH_FILL;
const VIEW_BOX = [
  GLYPH.x + GLYPH.w / 2 - BOX / 2,
  GLYPH.y + GLYPH.h / 2 - BOX / 2,
  BOX,
  BOX,
]
  .map((n) => n.toFixed(3))
  .join(' ');

const PATHS = (
  <g transform="translate(6.6667 4.3624)">
    <path
      d="M10.6667 1.02983C10.6667 1.59859 10.2056 2.05967 9.63686 2.05967C9.0681 2.05967 8.60703 1.59859 8.60703 1.02983C8.60703 0.461072 9.0681 0 9.63686 0C10.2056 0 10.6667 0.461072 10.6667 1.02983Z"
      fill="currentColor"
    />
    <path
      d="M0.760094 12.4551C1.18602 12.5101 1.47353 12.9433 1.73126 13.2868C1.81548 13.3991 1.92474 13.4982 2.05795 13.5752C2.31071 13.721 2.58493 13.7528 2.82919 13.6959C3.24729 13.5986 3.74203 13.4259 4.11382 13.6405C4.48582 13.8552 4.61972 14.3444 4.30058 14.6319C3.49333 15.359 2.26696 15.4904 1.2806 14.9209C0.59028 14.5222 0.14167 13.8553 0.00945937 13.1274C-0.0672083 12.7052 0.33473 12.399 0.760094 12.4551ZM6.94662 8.75049C6.94662 8.7513 6.94596 8.75195 6.94515 8.75195C6.94434 8.75195 6.94369 8.75262 6.94368 8.75343C6.93847 10.1703 5.75367 11.2705 4.35287 11.2705C3.55571 11.2704 2.83396 10.917 2.35558 10.3526C2.07812 10.0253 2.27293 9.559 2.66927 9.39453C3.06564 9.22951 3.53094 9.46106 3.92585 9.62953C4.05487 9.68457 4.19904 9.71578 4.35287 9.71582C4.95141 9.71581 5.3881 9.25509 5.389 8.74561C5.389 8.7448 5.38966 8.74414 5.39046 8.74414C5.39127 8.74414 5.39193 8.74348 5.39193 8.74268V3.93359C5.39193 3.50428 5.73996 3.15625 6.16927 3.15625C6.59859 3.15625 6.94662 3.50428 6.94662 3.93359V8.75049Z"
      fill="currentColor"
    />
  </g>
);

export function JimoMark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={VIEW_BOX}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {PATHS}
    </svg>
  );
}

/** Mark height inside the boxed variant's 24-square, measured off 887:11711. */
const BOXED_GLYPH_H = 10.4;

/**
 * The mark inside a rounded-square outline — Figma 887:11711, the "Jimo SDK"
 * row of the source filter menu (887:11169).
 *
 * A separate component rather than a `boxed` prop on JimoMark, because this is a
 * different glyph and not a decorated one: it sits in a 20px icon slot beside
 * `ProfileCircle` and `DocumentCode` and has to read as their sibling. So the
 * *outline* carries iconsax's 1.5 stroke on iconsax's 24 grid, and the mark
 * shrinks to sit inside it. Everything is `currentColor`, so a row's hover blue
 * reaches the whole glyph exactly as it does for a real iconsax icon.
 */
export function JimoMarkBoxed({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const scale = BOXED_GLYPH_H / GLYPH.h;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* 20 of the 24-unit canvas, matching the 0.83 fill the iconsax glyphs
          beside it draw (ProfileCircle and DocumentCode both measure 16.5 of a
          20px slot). rx 6 is iconsax's own corner on square-ish glyphs. */}
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <g
        transform={
          `translate(12 12) scale(${scale.toFixed(4)}) ` +
          `translate(${-(GLYPH.x + GLYPH.w / 2)} ${-(GLYPH.y + GLYPH.h / 2)})`
        }
      >
        {PATHS}
      </g>
    </svg>
  );
}
