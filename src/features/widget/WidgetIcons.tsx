import * as React from 'react';

/**
 * The SVG symbol sprite the widget markup references by id, carried over from
 * the reference prototype's <defs> block. Only the symbols this build actually
 * uses are included — which is why the list grew when `AgentWidget` caught up
 * with `trigger-demo/builder/src/prototype/prototype.html`: the pill, the run
 * log and the question navigation reference five more.
 *
 * Every path below is VERBATIM from that <defs>. If one looks wrong, diff it
 * against the prototype rather than redrawing it — these are the same glyphs
 * the reference renders, and a hand-corrected path is drift.
 */
export const Ico = ({ id }: { id: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <use href={`#${id}`} />
  </svg>
);

export function WidgetIcons() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        <symbol id="i-arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V6M6 11l6-6 6 6" />
        </symbol>
        <symbol id="i-stop-round" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="7" width="10" height="10" rx="2.5" />
        </symbol>
        <symbol id="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </symbol>
        <symbol id="i-grip" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="7" r="1.4" /><circle cx="15" cy="7" r="1.4" />
          <circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" />
          <circle cx="9" cy="17" r="1.4" /><circle cx="15" cy="17" r="1.4" />
        </symbol>
        <symbol id="i-like" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
          <path d="M7 10l4-7a2.5 2.5 0 0 1 2.4 3.2L12.5 9h5.5a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 16.6 20H7" />
        </symbol>
        <symbol id="i-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
          <path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
        </symbol>
        <symbol id="i-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
          <circle cx="12" cy="12" r="3" />
        </symbol>
        <symbol id="i-columns" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="5" height="16" rx="1.5" />
          <rect x="9.5" y="4" width="5" height="16" rx="1.5" />
          <rect x="16" y="4" width="5" height="16" rx="1.5" />
        </symbol>
        <symbol id="i-routing-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M5.47 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16.97 15h3c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2h-3c-1.1 0-2-.9-2-2v-3c0-1.1.9-2 2-2Z" strokeWidth="1.5" />
          <path d="M12 5h2.68c1.85 0 2.71 2.29 1.32 3.51L8.01 15.5C6.62 16.71 7.48 19 9.32 19H12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-message-question" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 18.43h-4l-4.45 2.96A.997.997 0 0 1 7 20.56v-2.13c-3 0-5-2-5-5v-6c0-3 2-5 5-5h10c3 0 5 2 5 5v6c0 3-2 5-5 5Z" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 11.36v-.21c0-.68.42-1.04.84-1.33.41-.28.82-.64.82-1.3 0-.92-.74-1.66-1.66-1.66-.92 0-1.66.74-1.66 1.66M11.995 13.75h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-mouse-square" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22 12V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7h3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m20.96 17.84-1.63.55c-.45.15-.81.5-.96.96l-.55 1.63c-.47 1.41-2.45 1.38-2.89-.03L13.08 15c-.36-1.18.73-2.28 1.9-1.91l5.96 1.85c1.4.44 1.42 2.43.02 2.9Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 3a9 9 0 1 0 9 9" opacity="1" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </symbol>
        <symbol id="i-chevron-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6l-6 6 6 6" />
        </symbol>
        <symbol id="i-chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </symbol>
        {/* Invented, and labelled as such: the reference prototype's <defs> has no
            new-conversation glyph, because it never resets one. PRD-611 adds that
            control, so this one path is NOT a trace of the reference — a plain
            plus, drawn on the same 24x24/stroke-2/round-cap grammar as
            i-arrow-up and i-stop-round above it. */}
        <symbol id="i-new-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </symbol>
      </defs>
    </svg>
  );
}
