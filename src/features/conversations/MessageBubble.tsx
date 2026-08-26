import * as React from 'react';
import { Like1, Dislike, MessageEdit, Additem } from 'iconsax-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Chip/badge';
import { Avatar } from '@/components/app/Avatar';
import type { ConversationTurn } from '@/data/analytics';

/**
 * One transcript turn — Figma 934:29319.
 *
 * Copy note: 934:28534 labels the feedback badges "Liked" / "Disliked" and
 * 934:29319 labels them "Helpful" / "Not Helpful". The latter ships — the badge
 * describes the answer, not the reader's mood — while the four-filter toolbar
 * from the former ships alongside it.
 *
 * The two hover affordances are drawn on the artboard with no frame behind
 * them, so they raise an out-of-scope toast like every other dead end here.
 */
const FEEDBACK = {
  helpful: {
    label: 'Helpful',
    type: 'positive' as const,
    icon: <Like1 size={16} variant="Bold" color="currentColor" />,
  },
  'not-helpful': {
    label: 'Not Helpful',
    type: 'negative' as const,
    icon: <Dislike size={16} variant="Bold" color="currentColor" />,
  },
};

export function MessageBubble({
  turn,
  userName,
  onAnswerThis,
  onNewCustomAnswer,
}: {
  turn: ConversationTurn;
  userName: string;
  onAnswerThis: () => void;
  onNewCustomAnswer: () => void;
}) {
  const isUser = turn.from === 'user';
  const feedback = turn.feedback ? FEEDBACK[turn.feedback] : null;

  return (
    <div className={cn('group flex gap-[var(--space-2)]', isUser ? 'justify-end' : 'justify-start')}>
      {/* `items-start` / `items-end`, not the default stretch: a Badge is
          inline-flex, but a stretched flex item still fills the column, which
          turned the Helpful pill into a full-width bar. */}
      <div
        className={cn(
          'flex max-w-[75%] flex-col gap-[var(--space-2)]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] [font:var(--text-body-3)]',
            isUser
              ? 'bg-[var(--color-brand-default)] text-[var(--color-text-inverse)]'
              : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]'
          )}
        >
          {turn.text}
        </div>

        {feedback && (
          <Badge size="x-small" variant="primary" type={feedback.type} leftIcon={feedback.icon}>
            {feedback.label}
          </Badge>
        )}

        {/* Revealed on hover, per the artboard. `focus-within` keeps them
            reachable by keyboard, where a hover-only affordance would not be. */}
        <div className="flex items-center gap-[var(--space-3)] opacity-0 [transition:opacity_var(--transition-fast)] group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={onAnswerThis}
            className="flex cursor-pointer items-center gap-[var(--space-1)] border-0 bg-transparent p-0 [font:var(--text-body-4)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-default)]"
          >
            <MessageEdit size={16} variant="Linear" color="currentColor" />
            Answer this…
          </button>
          <button
            type="button"
            onClick={onNewCustomAnswer}
            className="flex cursor-pointer items-center gap-[var(--space-1)] border-0 bg-transparent p-0 [font:var(--text-body-4)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-default)]"
          >
            <Additem size={16} variant="Linear" color="currentColor" />
            New Custom Answer
          </button>
        </div>
      </div>

      {isUser && <Avatar name={userName} size="small" className="mt-[var(--space-1)]" />}
    </div>
  );
}
