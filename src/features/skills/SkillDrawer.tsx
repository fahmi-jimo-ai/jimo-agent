import * as React from 'react';
import { More2, Copy, Trash, Edit2, DocumentText, Chart21, Messages2 } from 'iconsax-react';
import { Drawer } from '@/components/app/Drawer';
import { Menu } from '@/components/app/Menu';
import { useToast } from '@/components/app/toast';
import { Button } from '@/components/ui/Button/Button';
import { Switch } from '@/components/ui/Toggle/switch';
import { Badge } from '@/components/ui/Chip/badge';
import { CloseIcon } from '@/components/ui/Icon/Icon';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { PrimaryHorizontalMenuGroup } from '@/components/ui/PrimaryHorizontalMenuGroup/PrimaryHorizontalMenuGroup';
import { cn } from '@/lib/utils';
import { ConversationDetail } from '@/features/conversations/ConversationDetail';
import type { Skill } from '@/data/skills';
import type { InterfacePage } from '@/data/interfacePages';
import type { Conversation } from '@/data/analytics';
import { SkillDescriptionTab } from './SkillDescriptionTab';
import { SkillUsageTab } from './SkillUsageTab';

/**
 * The skill drawer — Figma `12987:14597` (Description), `12987:15826` (Usage)
 * and `12987:16446` (a conversation, opened from Usage).
 *
 * It is `src/components/app/Drawer.tsx` at `width={600}`, using the `header` and
 * `footer` slots that drawer documents as an additive fork. `header` REPLACES
 * the built-in title row, so this file owns its own close button.
 *
 * ## Three views, one panel, and the state is LOCAL
 *
 * `description | usage | conversation` is held in this component and is
 * deliberately not persisted — the same rule `ThinkingTrace` records for its
 * open state: `AnalyticsState` and `SkillsState` are config stores, and where a
 * reader is inside a panel is not configuration. It resets on `skill.id` for the
 * same reason: opening a different skill must not leave the panel showing the
 * previous skill's conversation.
 *
 * ## The conversation view is `ConversationDetail`, not a copy of it
 *
 * `12987:16446` is the `/conversations` right pane with a back chevron in front
 * of the avatar. That is one optional `onBack` prop on the existing component
 * (see its header), so this view renders it whole: it brings its own header, its
 * own kebab and its own `--color-brand-subtle` ground. Hence NO `header`, NO
 * `footer` and `className="p-0"` here — `cn` is tailwind-merge, so `p-0` beats
 * the panel's `p-[var(--space-4)]` and the pane goes edge to edge.
 *
 * Its skill chips route back through `onOpenSkill`: a skill chip seen from
 * inside a skill has no other non-circular reading, and swapping the drawer is
 * cheaper than stacking a second one.
 *
 * ## Two artboard notes, neither silent
 *
 *  - `12987:15136` draws a back chevron on the DESCRIPTION tab as well. The
 *    Description tab is this drawer's root — it is what opening a row shows —
 *    so there is nothing behind it to go back to, and a chevron that closes the
 *    drawer would duplicate the ✕ two elements away. It renders only in the
 *    conversation view, which is the one view that was pushed onto something.
 *  - The kebab is drawn on every frame, but no frame draws it open. `Duplicate`
 *    and a destructive `Delete` are INVENTED — they are the two actions the list
 *    page's own row menu already carries, so the drawer and the table agree.
 */

export type SkillDrawerView = 'description' | 'usage' | 'conversation';

/** Description → a document glyph, Usage → a chart glyph (`12987:15826`). */
const TABS = [
  { id: 'description', label: 'Description', icon: <DocumentText size={20} variant="Linear" color="currentColor" /> },
  { id: 'usage', label: 'Usage', icon: <Chart21 size={20} variant="Linear" color="currentColor" /> },
];

export function SkillDrawer({
  skill,
  page,
  onClose,
  onToggleActive,
  onEdit,
  onTryInChat,
  onDuplicate,
  onDelete,
  onOpenPage,
  onOpenSkill,
  onOutOfScope,
  initialView = 'description',
}: {
  skill: Skill;
  /** The skill's host page, or `null` when unset or removed since. */
  page: InterfacePage | null;
  onClose: () => void;
  onToggleActive: (next: boolean) => void;
  onEdit: () => void;
  onTryInChat: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** The Description tab's `Interface:` link. */
  onOpenPage: (pageId: string) => void;
  /** A skill chip inside a conversation swaps the drawer to that skill. */
  onOpenSkill: (skillId: string) => void;
  /** Acknowledges a dead-end control — the conversation kebab's other rows. */
  onOutOfScope: (what: string) => void;
  /** Stories open straight onto a tab. */
  initialView?: SkillDrawerView;
}) {
  const toast = useToast();
  const [view, setView] = React.useState<SkillDrawerView>(initialView);
  const [conversation, setConversation] = React.useState<Conversation | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Swapping to another skill must not strand the panel on the previous
  // skill's conversation, so the view resets with the record it is drawing.
  React.useEffect(() => {
    setView('description');
    setConversation(null);
    setMenuOpen(false);
  }, [skill.id]);

  if (view === 'conversation' && conversation) {
    return (
      // `header={null}`, not omitted: ConversationDetail draws its own identity
      // bar (back chevron, avatar, name, email, kebab), so the drawer's title
      // row would be a second header stacked above it.
      <Drawer
        title={conversation.name}
        header={null}
        onClose={onClose}
        width={600}
        className="p-0"
      >
        <ConversationDetail
          conversation={conversation}
          onBack={() => setView('usage')}
          onAction={onOutOfScope}
          onShare={() =>
            // 949:7292 annotates this row, and it is the one kebab row that is
            // not a dead end.
            toast({ type: 'positive', title: 'Conversation Link Copied' })
          }
          onSkillClick={(triggered) => onOpenSkill(triggered.id)}
        />
      </Drawer>
    );
  }

  const header = (
    <div className="flex shrink-0 flex-col gap-[var(--space-4)] px-[var(--space-2)] pt-[var(--space-2)]">
      <div className="flex items-center gap-[var(--space-3)]">
        <p className="m-0 min-w-0 flex-1 truncate [font:var(--text-subtitle-2)] text-[var(--color-text-primary)]">
          {skill.name}
        </p>

        {/* The pill and the Switch are one control in two parts, exactly as the
            artboard draws them: the pill SAYS the state, the Switch changes it.
            The pill is Moji's `Badge` — its `positive` / `neutral` secondary
            fills already are the artboard's two colourways — and the status dot
            rides in the `leftIcon` slot rather than becoming a local fork of the
            chip, which is what CLAUDE.md's "use it 1:1" rule asks for. */}
        <span className="flex shrink-0 items-center gap-[var(--space-2)]">
          <Badge
            size="small"
            type={skill.active ? 'positive' : 'neutral'}
            leftIcon={
              <span
                aria-hidden="true"
                className={cn(
                  'size-2 rounded-[var(--radius-full)]',
                  skill.active ? 'bg-[var(--color-green-400)]' : 'bg-[var(--color-neutral-400)]',
                )}
              />
            }
          >
            {skill.active ? 'Active' : 'Inactive'}
          </Badge>
          <Switch
            checked={skill.active}
            onCheckedChange={onToggleActive}
            aria-label={`${skill.active ? 'Deactivate' : 'Activate'} ${skill.name}`}
          />
        </span>

        <Menu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          align="right"
          trigger={
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Actions for ${skill.name}`}
              leftIcon={<More2 size={16} variant="Linear" color="currentColor" />}
              onClick={() => setMenuOpen((o) => !o)}
            />
          }
        >
          {/* INVENTED: the kebab is drawn on every frame, none of them open. */}
          <DropdownMenuList
            text="Duplicate"
            icon={<Copy size={20} variant="Linear" color="currentColor" />}
            onClick={() => {
              setMenuOpen(false);
              onDuplicate();
            }}
          />
          <DropdownMenuList
            text="Delete"
            danger
            icon={<Trash size={20} variant="Linear" color="currentColor" />}
            onClick={() => {
              setMenuOpen(false);
              onDelete();
            }}
          />
        </Menu>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-0 bg-transparent p-0 text-[var(--color-text-secondary)] [transition:color_var(--transition-fast)] hover:text-[var(--color-text-primary)]"
        >
          <CloseIcon size={24} color="currentColor" />
        </button>
      </div>

      <PrimaryHorizontalMenuGroup
        tabs={TABS}
        activeItem={view}
        onTabClick={(id) => setView(id as SkillDrawerView)}
        showIcon
      />
    </div>
  );

  const footer =
    view === 'description' ? (
      // Two buttons filling the row. The Usage tab has no footer in the
      // artboard, which is why this is conditional rather than always passed.
      <div className="flex items-center gap-[var(--space-3)] [&>*]:flex-1">
        <Button
          variant="outline"
          leftIcon={<Edit2 size={20} variant="Linear" color="currentColor" />}
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          leftIcon={<Messages2 size={20} variant="Linear" color="currentColor" />}
          onClick={onTryInChat}
        >
          Try in Chat
        </Button>
      </div>
    ) : undefined;

  return (
    <Drawer title={skill.name} onClose={onClose} width={600} header={header} footer={footer}>
      {view === 'description' ? (
        <SkillDescriptionTab skill={skill} page={page} onOpenPage={onOpenPage} />
      ) : (
        <SkillUsageTab
          skill={skill}
          onOpenConversation={(c) => {
            setConversation(c);
            setView('conversation');
          }}
        />
      )}
    </Drawer>
  );
}
