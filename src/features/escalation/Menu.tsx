import * as React from 'react';
import { cn } from '@/lib/utils';
import { DropdownMenuGroup } from '@/components/ui/DropdownMenuGroup/DropdownMenuGroup';

/**
 * The floating-layer wrapper every menu on this page uses.
 *
 * Motion follows the Moji convention that CLAUDE.md marks mandatory:
 * scale .85 -> 1 + opacity 0 -> 1 over 150ms, transform-origin at the trigger
 * corner, and the panel stays mounted through the exit. Note the transition
 * names `scale`, NOT `transform` — Tailwind v4 compiles `scale-*` to the
 * standalone `scale:` property, so naming `transform` here would make it snap.
 */
export function Menu({
  open,
  onClose,
  trigger,
  children,
  align = 'left',
  className,
  menuClassName,
}: {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    // mousedown, not click: a click listener would fire on the same event that
    // opened a second menu and close it again immediately.
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={wrapRef} className={cn('relative inline-flex', className)}>
      {trigger}
      <div
        className={cn(
          'absolute top-[calc(100%+4px)] z-[var(--z-dropdown)]',
          align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
          '[transition:opacity_150ms_ease,scale_150ms_cubic-bezier(.16,1,.3,1)]',
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[.85] opacity-0',
          menuClassName
        )}
      >
        <DropdownMenuGroup>{children}</DropdownMenuGroup>
      </div>
    </div>
  );
}

/** One menu row. Kept local rather than using Moji's DropdownMenuList because
 *  these rows need a trailing check, a "Default" tag and a leading glyph in
 *  combinations that component does not expose. */
export function MenuItem({
  icon,
  label,
  selected,
  onClick,
  className,
}: {
  icon?: React.ReactNode;
  label: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={!!selected}
      onClick={onClick}
      className={cn(
        'flex w-full min-w-[225px] cursor-pointer items-center gap-[var(--space-2)] border-0 bg-[var(--color-neutral-white)] p-[var(--space-3)] text-left',
        '[font:var(--text-body-3)] text-[var(--color-text-primary)]',
        '[transition:background-color_var(--transition-fast),color_var(--transition-fast)]',
        'hover:bg-[var(--color-blue-100)] hover:text-[var(--color-blue-400)]',
        selected && 'text-[var(--color-blue-400)]',
        className
      )}
    >
      {icon && (
        <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {selected && (
        <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-[var(--color-blue-400)]" aria-hidden="true">
          <path
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
