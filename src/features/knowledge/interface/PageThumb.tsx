import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * The page card's thumbnail — Figma Interface-Knowledge `12987:13033`.
 *
 * ## Invented, and labelled as such
 *
 * The artboard's eight cards all carry the SAME screenshot: a Mixpanel-ish CRM
 * dashboard, exported as a raster (`image 1899` / `image 1900` in the file).
 * Nothing here bakes it in, for two reasons that both matter — it is somebody
 * else's product, and there is no scanner in this prototype, so a photograph of
 * a real page would be a claim the app cannot back up.
 *
 * What it draws instead is an abstract wireframe out of tokens: a top bar, a
 * left rail, some card blocks and some line rows. It has to read as "a page"
 * and NOT as any particular product, which is the whole point — the card's job
 * is to say "this row is a screen", and the name underneath says which one.
 *
 * ## Deterministic, never random
 *
 * The layout variant is a sum-of-char-codes hash of the page id, the same
 * seeded-not-random discipline `analytics.ts` and `skills.ts` use for their
 * charts: a `Math.random()` here would reshuffle every thumbnail on every
 * render, so no screenshot diff against the artboard would ever mean anything.
 *
 * ## Two shapes, one file
 *
 * `strip` is the same wireframe idea at row scale — the faint decorative panel
 * on the right of each skill row in `12987:13517`. It is one component rather
 * than two because they are the same object at two sizes; splitting them is how
 * the two drift. The artboard tints that strip per skill mode, and the tint
 * arrives as `blockClass`: a LITERAL class string from the caller's static map,
 * never a computed `bg-${mode}` — Tailwind cannot see those.
 */

/** Three layouts, so a grid of six cards does not read as one image repeated. */
type Layout = 0 | 1 | 2;

function layoutFor(id: string): Layout {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return (h % 3) as Layout;
}

/** One wireframe block. Every surface in here is a token, never a hex. */
function Block({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block rounded-[var(--radius-sm)] bg-[var(--color-neutral-100)]', className)}
    />
  );
}

export function PageThumb({
  pageId,
  strip = false,
  blockClass,
  className,
}: {
  pageId: string;
  /** Row-scale variant — the skill row's decorative panel. */
  strip?: boolean;
  /** Literal Tailwind class for the strip's blocks. Never computed. */
  blockClass?: string;
  className?: string;
}) {
  const layout = layoutFor(pageId);

  if (strip) {
    // A 6x3 field of blocks, thinning towards the left edge so it reads as
    // decoration fading into the row rather than as a cropped screenshot.
    return (
      <span
        aria-hidden="true"
        className={cn('grid grid-cols-6 grid-rows-3 gap-[var(--space-1)]', className)}
      >
        {Array.from({ length: 18 }, (_, i) => (
          <Block
            key={i}
            className={cn(
              'h-full w-full',
              blockClass ?? 'bg-[var(--color-neutral-100)]',
              // Column 0 is barely there, column 5 is full — a left-to-right ramp.
              ['opacity-20', 'opacity-35', 'opacity-50', 'opacity-65', 'opacity-80', 'opacity-100'][
                i % 6
              ],
            )}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn('flex h-full w-full bg-[var(--color-bg-subtle)]', className)}
    >
      {/* Left rail — the sidebar every one of the artboard's screenshots has. */}
      <span className="flex w-[18%] shrink-0 flex-col gap-[var(--space-1)] border-r border-[var(--color-neutral-200)] bg-[var(--color-bg-default)] p-[var(--space-1)]">
        <Block className="h-[6px] w-[70%] bg-[var(--color-blue-100)]" />
        <Block className="h-[4px] w-[85%]" />
        <Block className="h-[4px] w-[60%]" />
        <Block className="h-[4px] w-[75%]" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        {/* Top bar. */}
        <span className="flex items-center justify-between gap-[var(--space-1)] border-b border-[var(--color-neutral-200)] bg-[var(--color-bg-default)] px-[var(--space-2)] py-[var(--space-1)]">
          <Block className="h-[5px] w-[28%] bg-[var(--color-neutral-200)]" />
          <Block className="h-[5px] w-[14%] bg-[var(--color-blue-100)]" />
        </span>

        <span className="flex min-h-0 flex-1 flex-col gap-[var(--space-1)] p-[var(--space-2)]">
          {layout === 0 && (
            <>
              {/* KPI row over one wide chart — the dashboard shape. */}
              <span className="flex gap-[var(--space-1)]">
                <Block className="h-[14%] min-h-[10px] flex-1 bg-[var(--color-blue-100)]" />
                <Block className="h-[14%] min-h-[10px] flex-1 bg-[var(--color-blue-100)]" />
                <Block className="h-[14%] min-h-[10px] flex-1 bg-[var(--color-blue-100)]" />
              </span>
              <Block className="min-h-0 flex-1 bg-[var(--color-neutral-100)]" />
            </>
          )}

          {layout === 1 && (
            <>
              {/* Toolbar over line rows — the table shape. */}
              <span className="flex gap-[var(--space-1)]">
                <Block className="h-[8px] w-[35%] bg-[var(--color-neutral-200)]" />
                <Block className="h-[8px] w-[18%] bg-[var(--color-blue-100)]" />
              </span>
              {/* Literal width classes, one per row — Tailwind cannot see a
                  computed `w-[${n}%]`, so the ramp is written out. */}
              <Block className="h-[6px] w-[92%]" />
              <Block className="h-[6px] w-[78%]" />
              <Block className="h-[6px] w-[86%]" />
              <Block className="h-[6px] w-[70%]" />
              <Block className="h-[6px] w-[82%]" />
            </>
          )}

          {layout === 2 && (
            <>
              {/* Two panels over a short list — the settings/form shape. */}
              <span className="flex min-h-0 flex-1 gap-[var(--space-1)]">
                <Block className="h-full w-[55%] bg-[var(--color-blue-100)]" />
                <Block className="h-full flex-1" />
              </span>
              <Block className="h-[6px] w-[70%]" />
              <Block className="h-[6px] w-[50%]" />
            </>
          )}
        </span>
      </span>
    </span>
  );
}
