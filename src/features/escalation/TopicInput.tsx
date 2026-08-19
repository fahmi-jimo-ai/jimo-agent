import * as React from 'react';
import { Smallcaps, MessageText, MessageQuestion } from 'iconsax-react';
import { CloseIcon } from '@/components/ui/Icon/Icon';
import { classifyChip, type TopicCategory } from '@/lib/classifyChip';

const CATEGORY_ICON: Record<TopicCategory, React.ElementType> = {
  keyword: Smallcaps,
  topic: MessageText,
  question: MessageQuestion,
};

const PLACEHOLDER = 'Type a topic…';

/**
 * The inline pill-shaped field that "+ Add topic" opens (Figma 34:2453), and
 * that a committed pill re-opens when its label is clicked.
 *
 * The leading glyph re-classifies on EVERY keystroke — that live feedback is
 * the point of the interaction, and it is visible in the artboard: mid-typing
 * "How to" already wears the question icon.
 */
export function TopicInput({
  initialValue = '',
  onCommit,
  onCancel,
}: {
  initialValue?: string;
  onCommit: (label: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = React.useState(initialValue);
  const ref = React.useRef<HTMLInputElement>(null);
  const Ico = CATEGORY_ICON[classifyChip(value)];

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    // Editing an existing topic: park the caret after the text, not over it.
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const commit = () => {
    const v = value.trim();
    if (v) onCommit(v);
    else onCancel();
  };

  return (
    <span className="inline-flex items-stretch overflow-hidden rounded-[var(--radius-full)] border border-[var(--color-blue-400)] bg-[var(--color-neutral-white)]">
      <span className="flex items-center gap-[var(--space-2)] py-[var(--space-2)] pl-[var(--space-3)] pr-[var(--space-2)] [font:var(--text-body-3)] text-[var(--color-text-primary)]">
        <span aria-hidden="true" className="flex shrink-0 items-center text-[var(--color-text-secondary)]">
          <Ico size={16} variant="Linear" color="currentColor" />
        </span>

        {/* Quote and text sit flush — the quote is punctuation, not a sibling. */}
        <span className="flex items-center">
          {/* The opening quote only earns its place once there is something to quote. */}
          {value !== '' && <span aria-hidden="true">&ldquo;</span>}

          {/* Invisible mirror sizes the field exactly: `size` in chars was
              rounding the proportional font down and clipping the placeholder. */}
          <span className="inline-grid items-center pr-px">
            <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-pre">
              {value || PLACEHOLDER}
            </span>
            <input
              ref={ref}
              value={value}
              aria-label="New topic"
              placeholder={PLACEHOLDER}
              // size=1 so the input's own intrinsic width (20ch by default)
              // does not win the grid column — the mirror above must set it.
              size={1}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commit();
                } else if (e.key === 'Escape') {
                  onCancel();
                }
              }}
              onBlur={commit}
              className="col-start-1 row-start-1 w-full min-w-0 border-0 bg-transparent p-0 [font:var(--text-body-3)] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
          </span>
        </span>
      </span>

      <span aria-hidden="true" className="w-px shrink-0 self-stretch bg-[var(--color-border-default)]" />

      <button
        type="button"
        aria-label="Cancel new topic"
        // mousedown, not click: the input's blur would commit before a click lands.
        onMouseDown={(e) => {
          e.preventDefault();
          onCancel();
        }}
        className="flex w-9 shrink-0 cursor-pointer items-center justify-center self-stretch border-0 bg-transparent text-[var(--color-blue-400)] [transition:background-color_var(--transition-fast)] hover:bg-[var(--color-bg-muted)]"
      >
        <CloseIcon size={16} color="currentColor" />
      </button>
    </span>
  );
}
