import * as React from 'react';
import { Sms } from 'iconsax-react';
import type { Vendor } from '@/state/types';

/**
 * Vendor brand marks, drawn inline.
 *
 * These are the three logos the Figma places in the enable menu, the configure
 * select and the hero illustration. They are simple geometric marks, so they
 * are drawn rather than shipped as raster assets — no network fetch, no
 * base64 payload, and they stay crisp at any size.
 */
export function VendorMark({ vendor, size = 20 }: { vendor: Vendor; size?: number }) {
  if (vendor === 'email') {
    return <Sms size={size} variant="Linear" color="currentColor" />;
  }

  if (vendor === 'intercom') {
    // Intercom: dark rounded square, five rounded bars of varying height.
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#1F2937" />
        <g fill="#fff">
          <rect x="4"    y="6"   width="1.7" height="9"    rx=".85" />
          <rect x="7.4"  y="4.6" width="1.7" height="11.4" rx=".85" />
          <rect x="10.9" y="4.2" width="1.7" height="12.2" rx=".85" />
          <rect x="14.4" y="4.6" width="1.7" height="11.4" rx=".85" />
          <rect x="17.8" y="6"   width="1.7" height="9"    rx=".85" />
        </g>
        <path
          d="M4.6 17.2c2.2 1.5 4.7 2.2 7.4 2.2s5.2-.7 7.4-2.2"
          fill="none"
          stroke="#fff"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (vendor === 'zendesk') {
    // Zendesk: two solid triangles — the wordmark's "Z" glyph pair.
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#03363D" />
        {/* The Zendesk mark: two mirrored right triangles reading as a "Z". */}
        <path d="M11 5.5v13H4z" fill="#fff" />
        <path d="M13 18.5v-13h7z" fill="#fff" />
      </svg>
    );
  }

  // Crisp: blue rounded square with a white speech bubble.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#1972F5" />
      <path
        d="M6 8.2c0-.66.54-1.2 1.2-1.2h9.6c.66 0 1.2.54 1.2 1.2v6.1c0 .66-.54 1.2-1.2 1.2h-5.3L8 18.2v-2.7h-.8c-.66 0-1.2-.54-1.2-1.2V8.2Z"
        fill="#fff"
      />
    </svg>
  );
}
