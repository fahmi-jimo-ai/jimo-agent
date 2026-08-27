import * as React from 'react';
import { Like1, Dislike, MessageText1, Additem } from 'iconsax-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Chip/badge';
import { Avatar } from '@/components/app/Avatar';
import { ThinkingTrace } from './ThinkingTrace';
import type { ConversationTurn, TriggeredSkill } from '@/data/analytics';

/**
 * One transcript turn — Figma 949:7347, which redraws the turn the older
 * 934:29319 defined. Four things changed:
 *
 *  - The pane now has a ground of its own (Blue/100), so the agent bubble is
 *    WHITE rather than `--color-bg-subtle`. It is the bubble that has to lift
 *    off the surface; on the old white pane it was the other way round.
 *  - The feedback label straddles the bubble's bottom-left corner instead of
 *    sitting under it. That is one negative margin, not absolute positioning:
 *    the bubble carries the extra `--space-4` of bottom padding the label needs
 *    to overlap into, and the label is pulled up `--space-3` from a gapless
 *    wrapper, which lands its centre one pixel below the bubble's edge — the
 *    artboard says 2.8. Absolute positioning would have needed a measured
 *    height and would break the moment the label's text changed length.
 *  - Turns are `--space-8` apart, not `--space-5`.
 *  - The two hover affordances hang off USER turns only. Both artboards draw
 *    them there and only there, and they read the same way: you answer a
 *    question, and you write a custom answer FOR a question. Neither has a
 *    frame behind it, so both still raise an out-of-scope toast.
 *
 * Copy note, unchanged: 934:28534 labelled the feedback badges "Liked" /
 * "Disliked"; this frame's annotations rename them "Helpful" / "Not Helpful",
 * which is what ships — the badge describes the answer, not the reader's mood.
 *
 * `ThinkingTrace` sits ABOVE the bubble on an agent turn that carries one. The
 * order down the column is reasoning -> answer -> the reader's verdict on it,
 * which is also the order they are read in.
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

const ACTION =
  'flex cursor-pointer items-center gap-[var(--space-2)] border-0 bg-transparent p-0 [font:var(--text-body-4)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-default)]';

export function MessageBubble({
  turn,
  userName,
  onAnswerThis,
  onNewCustomAnswer,
  onSkillClick,
  traceDefaultOpen = false,
}: {
  turn: ConversationTurn;
  userName: string;
  onAnswerThis: () => void;
  onNewCustomAnswer: () => void;
  onSkillClick: (skill: TriggeredSkill) => void;
  /** Stories open the first trace so the expanded frame can be diffed. */
  traceDefaultOpen?: boolean;
}) {
  const isUser = turn.from === 'user';
  const feedback = turn.feedback ? FEEDBACK[turn.feedback] : null;

  return (
    <div className={cn('group flex', isUser ? 'justify-end pl-[25%]' : 'justify-start pr-[25%]')}>
      {/* `items-start` / `items-end`, not the default stretch: a Badge is
          inline-flex, but a stretched flex item still fills the column, which
          turned the Helpful pill into a full-width bar. */}
      <div
        className={cn(
          'flex min-w-0 flex-col gap-[var(--space-2)]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {!isUser && (
          <ThinkingTrace
            turn={turn}
            onSkillClick={onSkillClick}
            defaultOpen={traceDefaultOpen}
          />
        )}

        {/* Bubble + label share a gapless wrapper so the label can overlap the
            bubble; the column's own gap would fight the negative margin. */}
        <div className={cn('flex min-w-0 flex-col', isUser ? 'items-end' : 'items-start')}>
          <div className={cn('flex items-end gap-[var(--space-2)]', isUser && 'flex-row')}>
            <div
              className={cn(
                'min-w-0 rounded-[var(--radius-lg)] px-[var(--space-3)] pt-[var(--space-2)] [font:var(--text-body-3)]',
                feedback ? 'pb-[var(--space-4)]' : 'pb-[var(--space-2)]',
                isUser
                  ? 'bg-[var(--color-brand-default)] text-[var(--color-text-inverse)]'
                  : 'bg-[var(--color-bg-default)] text-[var(--color-text-primary)]'
              )}
            >
              {turn.text}
            </div>
            {isUser && <Avatar name={userName} size="small" />}
          </div>

          {feedback && (
            <Badge
              size="x-small"
              variant="primary"
              type={feedback.type}
              leftIcon={feedback.icon}
              className="-mt-[var(--space-3)] ml-[var(--space-2)]"
            >
              {feedback.label}
            </Badge>
          )}
        </div>

        {/* Revealed on hover, per the artboard. `focus-within` keeps them
            reachable by keyboard, where a hover-only affordance would not be. */}
        {isUser && (
          <div className="flex items-center gap-[var(--space-4)] opacity-0 [transition:opacity_var(--transition-fast)] group-hover:opacity-100 group-focus-within:opacity-100">
            <button type="button" onClick={onAnswerThis} className={ACTION}>
              <MessageText1 size={16} variant="Linear" color="currentColor" />
              Answer this..
            </button>
            <button type="button" onClick={onNewCustomAnswer} className={ACTION}>
              <Additem size={16} variant="Linear" color="currentColor" />
              New Custom Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
