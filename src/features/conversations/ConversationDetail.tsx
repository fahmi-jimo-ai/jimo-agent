import * as React from 'react';
import { More2, ProfileCircle, DocumentDownload, Link2, ArrowLeft2 } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import { Avatar } from '@/components/app/Avatar';
import { MessageBubble } from './MessageBubble';
import type { Conversation, TriggeredSkill } from '@/data/analytics';

/**
 * The right pane — Figma 949:7347 (`Panel`), which redraws 934:28534 / 934:29319.
 *
 * The pane now has a ground: Blue/100 (`--color-brand-subtle`) under the
 * transcript, with a white header bar above it. That inversion is the whole
 * point of the redesign — a bubble can only look like a bubble if it sits on
 * something, and on the old white pane the agent's turns had to be tinted grey
 * to be visible at all.
 *
 * The header identity block follows the panel artboard: a 36px avatar, the name
 * in Subtitle 3 and the email in Body 4, with the kebab pushed to the far edge.
 *
 * `Share conversation` is the one row here that is NOT out of scope. The
 * artboard annotates it — "success toast saying 'Conversation Link Copied'" —
 * so it does exactly that, and `onShare` is a separate prop from `onAction` to
 * keep the dead ends dead.
 *
 * The kebab menu goes through `Menu`, which portals its panel to <body>. That
 * is load-bearing, not habit: this pane is a scroll container, so an in-tree
 * panel would be clipped by it the moment the transcript ran long. Same trap
 * `PropertyTable` hit inside `Table`'s scroll wrapper.
 *
 * ## ADDITIVE: `onBack` (Skills, `12987:16446`)
 *
 * The skill drawer opens a conversation INSIDE itself, and that artboard draws a
 * back chevron before the avatar. It is one optional prop rather than a second
 * component: everything else on `12987:16446` — the identity block, the kebab,
 * the Blue/100 ground, the bubbles and the reasoning trace — is this pane
 * already, and a near-copy of it would silently lose one of those the first time
 * either file moved. Omit `onBack` and nothing renders, so `/conversations` is
 * byte-identical.
 */
export function ConversationDetail({
  conversation,
  onAction,
  onShare,
  onSkillClick,
  onBack,
  traceDefaultOpen = false,
}: {
  conversation: Conversation;
  onAction: (label: string) => void;
  onShare: () => void;
  onSkillClick: (skill: TriggeredSkill) => void;
  /** Renders the back chevron of 12987:16446. Omit on /conversations. */
  onBack?: () => void;
  /** Stories open the first agent turn's trace so it can be diffed. */
  traceDefaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const firstAgentTurn = conversation.transcript.findIndex((t) => t.from === 'agent');

  const act = (label: string) => () => {
    setOpen(false);
    onAction(label);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-brand-subtle)]">
      <header className="flex shrink-0 items-center gap-[var(--space-8)] border-b border-[var(--color-border-default)] bg-[var(--color-bg-default)] p-[var(--space-4)]">
        <div className="flex min-w-0 flex-1 items-center gap-[var(--space-3)]">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-0 bg-transparent p-0 text-[var(--color-text-secondary)] [transition:color_var(--transition-fast),background-color_var(--transition-fast)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
            >
              <ArrowLeft2 size={20} variant="Linear" color="currentColor" />
            </button>
          )}
          <Avatar name={conversation.name} seed={conversation.id} size="medium" />
          <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-1)]">
            <span className="truncate [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
              {conversation.name}
            </span>
            <span className="truncate [font:var(--text-body-4)] text-[var(--color-neutral-600)]">
              {conversation.email ?? conversation.handle}
            </span>
          </div>
        </div>
        <Menu
          open={open}
          onClose={() => setOpen(false)}
          align="right"
          trigger={
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Actions for the conversation with ${conversation.name}`}
              leftIcon={<More2 size={16} variant="Linear" color="currentColor" />}
              onClick={() => setOpen((o) => !o)}
            />
          }
        >
          <DropdownMenuList
            text="View user profile"
            icon={<ProfileCircle size={20} variant="Linear" color="currentColor" />}
            onClick={act('View user profile')}
          />
          <DropdownMenuList
            text="Export as CSV"
            icon={<DocumentDownload size={20} variant="Linear" color="currentColor" />}
            onClick={act('Export as CSV')}
          />
          <DropdownMenuList
            text="Share conversation"
            icon={<Link2 size={20} variant="Bold" color="currentColor" />}
            onClick={() => {
              setOpen(false);
              onShare();
            }}
          />
        </Menu>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-8)] overflow-y-auto px-[var(--space-12)] py-[var(--space-6)]">
        {/* Content Divider [1.0] — rule, timestamp, rule. */}
        <div className="flex shrink-0 items-center justify-center gap-[var(--space-3)]">
          <span className="h-px flex-1 bg-[var(--color-border-default)]" />
          <p className="m-0 whitespace-nowrap text-center [font:var(--text-body-4)] text-[var(--color-text-secondary)]">
            {conversation.startedAt}
          </p>
          <span className="h-px flex-1 bg-[var(--color-border-default)]" />
        </div>
        {conversation.transcript.map((turn, i) => (
          <MessageBubble
            key={i}
            turn={turn}
            userName={conversation.name}
            onAnswerThis={() => onAction('Answer this..')}
            onNewCustomAnswer={() => onAction('New Custom Answer')}
            onSkillClick={onSkillClick}
            traceDefaultOpen={traceDefaultOpen && i === firstAgentTurn}
          />
        ))}
      </div>
    </div>
  );
}
