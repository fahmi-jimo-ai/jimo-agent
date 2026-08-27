import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * A round initials avatar.
 *
 * Invented, and labelled as such: Figma 934:27942 draws photographic avatars,
 * and Moji ships no avatar component (Table's `avatar` slot is deliberately
 * consumer-supplied). Shipping stock portraits for fictional users would put
 * real faces in a prototype, so this renders the initial on a tinted disc
 * instead. The tint is picked from the seed, not at random, so the same user
 * keeps the same colour across renders and screenshot diffs.
 */
const TINTS = [
  'bg-[var(--color-blue-100)] text-[var(--color-blue-500)]',
  'bg-[var(--color-green-100)] text-[var(--color-green-500)]',
  'bg-[var(--color-purple-100)] text-[var(--color-purple-500)]',
  'bg-[var(--color-orange-100)] text-[var(--color-orange-500)]',
  'bg-[var(--color-red-100)] text-[var(--color-red-500)]',
];

// `medium` (36) and `large` (48) exist because the conversations artboards ask
// for both: Figma 949:7218 draws a 36px disc in the panel header, and 949:7163
// a 48px one in the list row.
const SIZES = {
  small: 'size-8 [font:var(--text-body-4)]',
  regular: 'size-10 [font:var(--text-body-3)]',
  medium: 'size-9 [font:var(--text-body-3)]',
  large: 'size-12 [font:var(--text-body-2)]',
} as const;

export function Avatar({
  name,
  seed,
  size = 'regular',
  className,
}: {
  name: string;
  /** Defaults to `name`; pass an id when several rows share a display name. */
  seed?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const key = seed ?? name;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-[var(--radius-full)] font-medium',
        SIZES[size],
        TINTS[hash % TINTS.length],
        className
      )}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}
