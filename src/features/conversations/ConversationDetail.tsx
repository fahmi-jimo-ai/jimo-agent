import * as React from 'react';
import { More2, ProfileCircle, DocumentDownload, Share } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import { Avatar } from '@/components/app/Avatar';
import { MessageBubble } from './MessageBubble';
import type { Conversation } from '@/data/analytics';

/**
 * The right pane — Figma 934:28534 / 934:29319.
 *
 * The kebab menu goes through `Menu`, which portals its panel to <body>. That
 * is load-bearing, not habit: this pane is a scroll container, so an in-tree
 * panel would be clipped by it the moment the transcript ran long. Same trap
 * `PropertyTable` hit inside `Table`'s scroll wrapper.
 */
export function ConversationDetail({
  conversation,
  onAction,
}: {
  conversation: Conversation;
  onAction: (label: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const act = (label: string) => () => {
    setOpen(false);
    onAction(label);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-[var(--space-3)] border-b border-[var(--color-border-default)] p-[var(--space-4)]">
        <Avatar name={conversation.name} seed={conversation.id} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
            {conversation.name}
          </span>
          <span className="truncate [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
            {conversation.email ?? conversation.handle}
          </span>
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
            icon={<Share size={20} variant="Linear" color="currentColor" />}
            onClick={act('Share conversation')}
          />
        </Menu>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-5)] overflow-y-auto bg-[var(--color-bg-default)] p-[var(--space-5)]">
        <p className="m-0 text-center [font:var(--text-body-4)] text-[var(--color-text-tertiary)]">
          {conversation.startedAt}
        </p>
        {conversation.transcript.map((turn, i) => (
          <MessageBubble
            key={i}
            turn={turn}
            userName={conversation.name}
            onAnswerThis={() => onAction('Answer this…')}
            onNewCustomAnswer={() => onAction('New Custom Answer')}
          />
        ))}
      </div>
    </div>
  );
}
