import * as React from 'react';
import { Warning2, Danger } from 'iconsax-react';

/**
 * The three-step severity ramp used in both trigger menus (Figma 29:8108):
 * circle-! -> triangle-! -> octagon-!.
 *
 * 1 and 2 are iconsax `Warning2` / `Danger` verbatim. There is no bare
 * octagon-with-exclamation in iconsax's 993 exports, so step 3 is drawn here
 * to match the Figma rather than substituted with a glyph of the wrong shape.
 */
export function SeverityIcon({ level, size = 20 }: { level: 1 | 2 | 3; size?: number }) {
  if (level === 1) return <Warning2 size={size} variant="Linear" color="currentColor" />;
  if (level === 2) return <Danger size={size} variant="Linear" color="currentColor" />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.4 2.5h7.2l5.1 5.1v7.2l-5.1 5.1H8.4l-5.1-5.1V7.6l5.1-5.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 7.75v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11.995 15.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
