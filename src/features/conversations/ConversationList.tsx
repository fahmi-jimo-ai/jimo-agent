import * as React from 'react';
import { Like1, Dislike } from 'iconsax-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/app/Avatar';
import type { Conversation } from '@/data/analytics';

/**
 * The left pane of the conversations card — Figma 934:28534.
 *
 * The pane scrolls; the card does not. It clips its own children, which is
 * fine — nothing here floats outward. (The kebab menu that DOES float lives in
 * the right pane and goes through `Menu`.)
 */
export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul
      role="listbox"
      aria-label="Conversations"
      className="m-0 flex min-h-0 w-[300px] shrink-0 list-none flex-col overflow-y-auto border-r border-[var(--color-border-default)] p-0"
    >
      {conversations.map((c) => {
        const selected = c.id === selectedId;
        return (
          <li key={c.id}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(c.id)}
              className={cn(
                'flex w-full cursor-pointer items-start gap-[var(--space-3)] border-0 border-b border-solid border-[var(--color-border-default)] bg-transparent p-[var(--space-4)] text-left',
                '[transition:background-color_var(--transition-fast)]',
                selected
                  ? 'bg-[var(--color-brand-subtle)]'
                  : 'hover:bg-[var(--color-bg-subtle)]'
              )}
            >
              <Avatar name={c.name} seed={c.id} size="small" />
              <span className="flex min-w-0 flex-1 flex-col gap-[var(--space-1)]">
                <span className="flex items-baseline gap-[var(--space-2)]">
                  <span className="min-w-0 flex-1 truncate [font:var(--text-body-4)] text-[var(--color-text-secondary)]">
                    {c.name} <span className="text-[var(--color-text-tertiary)]">{c.handle}</span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
                    {c.at}
                  </span>
                </span>
                <span className="truncate [font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                  {c.title}
                </span>
                <span className="flex items-center gap-[var(--space-4)] [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
                  <span className="flex items-center gap-[var(--space-1)] tabular-nums">
                    <Like1 size={16} variant="Linear" color="currentColor" />
                    {c.up}
                  </span>
                  <span className="flex items-center gap-[var(--space-1)] tabular-nums">
                    <Dislike size={16} variant="Linear" color="currentColor" />
                    {c.down}
                  </span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
