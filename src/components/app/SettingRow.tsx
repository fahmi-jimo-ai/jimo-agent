import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * The settings row vocabulary: a bordered card, a title/description/control row,
 * and a ruled sub-section under one.
 *
 * MOVED here from `src/features/escalation/ConfigureModal.tsx`, where these were
 * private. `/settings` needs the identical shape on every screen, and a second
 * copy would have drifted the moment one of them grew a variant. ConfigureModal
 * now imports them; nothing about its rendering changed.
 *
 * These are local compositions, not a fork of anything vendored — Moji ships no
 * settings-row component, and `Section` is the PAGE-level card (title bar,
 * shadow, controls slot), a different thing from a row inside one.
 */

/** The bordered container. One per setting; a card may hold two sections. */
export function SettingCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border-default)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SettingRow({
  title,
  description,
  control,
  className,
}: {
  title: React.ReactNode;
  /** ReactNode rather than string so a row can embed a link or a code span. */
  description?: React.ReactNode;
  control?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-[var(--space-6)] p-[var(--space-4)]',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
        <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
          {title}
        </span>
        {description != null && (
          <span className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            {description}
          </span>
        )}
      </div>
      {control != null && <div className="shrink-0">{control}</div>}
    </div>
  );
}

/** A sub-section of a card, under its own rule. */
export function SettingExtra({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-[var(--space-3)] border-t border-[var(--color-border-default)] p-[var(--space-4)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
