import * as React from 'react';
import { Magicpen, Refresh2, ArrowDown, ArrowUp } from 'iconsax-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button/Button';
import { TopicPill } from './TopicPill';
import type { Topic } from '@/state/types';

/**
 * The blue suggestions panel under the topics header.
 * Figma: generating 29:18613 · ready 29:19103 · staged 29:19716 · collapsed 34:3082.
 *
 * Icons are the Figma instance names: magicpen (bold), refresh-2, arrow-down.
 */
export function SuggestionsPanel({
  status,
  items,
  selectedIds,
  collapsed,
  onToggleSelect,
  onToggleCollapse,
  onRefresh,
  onAddSelected,
}: {
  status: 'idle' | 'generating' | 'ready';
  items: Topic[];
  selectedIds: string[];
  collapsed: boolean;
  onToggleSelect: (id: string) => void;
  onToggleCollapse: () => void;
  onRefresh: () => void;
  onAddSelected: () => void;
}) {
  if (status === 'idle') return null;

  const generating = status === 'generating';
  const n = selectedIds.length;

  return (
    <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] bg-[var(--color-blue-50)] p-[var(--space-4)]">
      <div className="flex items-center gap-[var(--space-2)]">
        <span aria-hidden="true" className="flex shrink-0 items-center text-[var(--color-blue-400)]">
          <Magicpen size={18} variant="Bold" color="currentColor" />
        </span>
        <span
          key={generating ? 'generating' : 'ready'}
          data-slot="suggestion-appear"
          className="flex-1 [animation:suggest-appear_260ms_cubic-bezier(.16,1,.3,1)_both] [font:var(--text-body-3)] text-[var(--color-blue-400)]"
        >
          {generating
            ? 'Generating Topic Recommendations...'
            : `${items.length} Suggested topics to escalate directly`}
        </span>

        {!generating && (
          <>
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Regenerate suggestions"
              className="flex size-6 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border-0 bg-transparent text-[var(--color-text-secondary)] [transition:background-color_var(--transition-fast)] hover:bg-[var(--color-blue-100)]"
            >
              <Refresh2 size={16} variant="Linear" color="currentColor" />
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Show suggestions' : 'Hide suggestions'}
              className="flex size-6 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border-0 bg-transparent text-[var(--color-text-secondary)] [transition:background-color_var(--transition-fast)] hover:bg-[var(--color-blue-100)]"
            >
              {collapsed ? (
                <ArrowDown size={16} variant="Linear" color="currentColor" />
              ) : (
                <ArrowUp size={16} variant="Linear" color="currentColor" />
              )}
            </button>
          </>
        )}
      </div>

      {generating && <SkeletonRows />}

      {!generating && !collapsed && (
        <>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {items.map((t, i) => (
              // The appear wave: this block only mounts once generating ends,
              // so the animation fires exactly on that transition. Capped at
              // 10 steps so a long list does not trail off.
              <span
                key={t.id}
                data-slot="suggestion-appear"
                style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}
                className="inline-flex [animation:suggest-appear_260ms_cubic-bezier(.16,1,.3,1)_both]"
              >
                <TopicPill
                  label={t.label}
                  category={t.category}
                  action="add"
                  selected={selectedIds.includes(t.id)}
                  onAction={() => onToggleSelect(t.id)}
                />
              </span>
            ))}
          </div>

          {n > 0 && (
            <div className="flex items-center justify-end border-t border-[var(--color-blue-200)] pt-[var(--space-4)]">
              <Button onClick={onAddSelected}>{`Add ${n} topic${n === 1 ? '' : 's'}`}</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Two rows of pill-shaped placeholders, widths varied so it reads as text. */
function SkeletonRows() {
  const widths = [[64, 58, 116, 138, 132, 128, 56, 66], [128, 66, 132, 56, 60, 128, 128, 132]];
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {widths.map((row, i) => (
        <div key={i} className="flex flex-wrap gap-[var(--space-2)]">
          {row.map((w, j) => (
            <span
              key={j}
              style={{ width: w }}
              className={cn(
                'h-[18px] rounded-[var(--radius-full)] bg-[var(--color-blue-200)]',
                'animate-[skel-pulse_1.4s_ease-in-out_infinite]'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
