import * as React from 'react';
import { Add, Element4, Global, Refresh2, Routing2 } from 'iconsax-react';
import { Drawer } from '@/components/app/Drawer';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Chip/badge';
import { Section } from '@/components/ui/Section/Section';
import { CloseIcon } from '@/components/ui/Icon/Icon';
import { PrimaryHorizontalMenuGroup } from '@/components/ui/PrimaryHorizontalMenuGroup/PrimaryHorizontalMenuGroup';
import { useToast } from '@/components/app/toast';
import {
  rescanPage,
  removeElement,
  resolveDuplicates,
  setElementDisabled,
} from '@/state/useKnowledge';
import { formatRelative } from '@/lib/formatRelative';
import { SCAN_STATUS_LABEL, type InterfacePage, type ScanStatus } from '@/data/interfacePages';
import { PageElementGroups } from './PageElementGroups';
import { PageSkillsTab } from './PageSkillsTab';

/**
 * The scanned-page drawer — Figma `12987:12416` (Interface) and `12987:13517`
 * (Skills).
 *
 * It is `src/components/app/Drawer.tsx` at its default width, using the `header`
 * and `footer` slots that file documents as an additive fork. `header` REPLACES
 * the built-in title row, so this file owns its own close button — the same
 * arrangement `SkillDrawer` uses, and for the same reason: the title row here
 * carries a tab bar underneath it, which the built-in row has no slot for.
 *
 * ## The tab is LOCAL state
 *
 * `interface | skills | details` is held here and deliberately not persisted.
 * `KnowledgeState` is a config store, and where a reader is inside a panel is
 * not configuration — the line `ThinkingTrace`, `SourcesTab` and `SkillDrawer`
 * all already draw. It resets on `page.id` so opening a different page cannot
 * leave the panel showing the previous page's tab.
 *
 * ## The footer's LEFT button belongs to the tab
 *
 * `12987:13517` draws `+ Add Skill` where `12987:12416` draws `Rescan
 * interface`, so the left slot swaps with the tab and the right one does not.
 * Two equal buttons filling the row, exactly as both frames draw them.
 *
 * `Configure in-app` acknowledges the click and stops: nothing in this prototype
 * can inject the agent into another origin, which is the same limit
 * `PreviewInAppModal` records on the page header two levels up.
 *
 * ## The Details tab is INVENTED — no artboard draws it
 *
 * `12987:12416` and `12987:13517` design exactly two tabs. A third was asked
 * for, and nothing in the file says what belongs in it, so this is a decision
 * made here and not transcribed from anywhere: it shows the page's own record —
 * the fields `InterfacePage` actually holds — as a definition list, in the
 * `Content Detail` shape `SourceDetailDrawer` already established (932:18232).
 * That keeps the invention to a MINIMUM: no new facts, no new controls, just the
 * stored record made legible. If a frame ever lands for this tab, it replaces
 * this wholesale rather than being merged into it.
 */

export type PageDrawerTab = 'interface' | 'skills' | 'details';

/** Figma glyphs: element-4 (Interface) and routing-2 (Skills). Global is the
 *  Details tab's, chosen to match the URL-rule chip the card already prints. */
const TABS = [
  { id: 'interface', label: 'Interface', icon: <Element4 size={20} variant="Linear" color="currentColor" /> },
  { id: 'skills', label: 'Skills', icon: <Routing2 size={20} variant="Linear" color="currentColor" /> },
  { id: 'details', label: 'Details', icon: <Global size={20} variant="Linear" color="currentColor" /> },
];

/** Status colourway. A static map — never a computed chip type. */
const STATUS_TYPE: Record<ScanStatus, 'neutral' | 'positive' | 'negative'> = {
  scanning: 'neutral',
  ready: 'positive',
  failed: 'negative',
};

/**
 * The definition row. Copied from `SourceDetailDrawer`'s, deliberately and not
 * imported: that one is private to the sources drawer, and a 160px label column
 * against a free-width value is three lines of layout, not a component worth a
 * shared home. If a third drawer needs it, THAT is when it moves.
 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[var(--space-4)]">
      <span className="w-[160px] shrink-0 [font:var(--text-body-2)] text-[var(--color-neutral-600)]">
        {label}
      </span>
      <span className="min-w-0 flex-1 [font:var(--text-body-2)] text-[var(--color-text-primary)]">
        {children}
      </span>
    </div>
  );
}

export function PageDrawer({
  page,
  onClose,
  onOpenSkill,
  onAddSkill,
  initialTab = 'interface',
}: {
  page: InterfacePage;
  onClose: () => void;
  /** A skill row hands off to `/skills` — see `KnowledgePage`'s round trip. */
  onOpenSkill?: (skillId: string) => void;
  /** The Skills tab's footer button. */
  onAddSkill?: () => void;
  /** Stories land directly on a tab. */
  initialTab?: PageDrawerTab;
}) {
  const toast = useToast();
  const [tab, setTab] = React.useState<PageDrawerTab>(initialTab);

  // Swapping to another page must not strand the panel on the previous page's
  // tab — the same reset `SkillDrawer` runs on `skill.id`.
  React.useEffect(() => {
    setTab(initialTab);
  }, [page.id]);

  const outOfScope = (what: string) =>
    toast({
      type: 'neutral',
      title: `${what} is out of scope`,
      body: 'This prototype models the scanned-page catalogue, not the scanner behind it.',
    });

  const header = (
    <div className="flex shrink-0 flex-col gap-[var(--space-4)] px-[var(--space-2)] pt-[var(--space-2)]">
      <div className="flex items-center gap-[var(--space-3)]">
        <p className="m-0 min-w-0 flex-1 truncate [font:var(--text-subtitle-2)] text-[var(--color-text-primary)]">
          {page.name} knowledge
        </p>
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
        activeItem={tab}
        onTabClick={(id) => setTab(id as PageDrawerTab)}
        showIcon
      />
    </div>
  );

  const footer = (
    <div className="flex items-center gap-[var(--space-3)] [&>*]:flex-1">
      {tab === 'skills' ? (
        <Button
          variant="outline"
          leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
          onClick={onAddSkill}
        >
          Add Skill
        </Button>
      ) : (
        <Button
          variant="outline"
          leftIcon={<Refresh2 size={20} variant="Linear" color="currentColor" />}
          onClick={() => {
            rescanPage(page.id);
            toast({ type: 'neutral', title: `Rescanning ${page.name}` });
          }}
        >
          Rescan interface
        </Button>
      )}
      <Button
        leftIcon={<Global size={20} variant="Linear" color="currentColor" />}
        onClick={() => outOfScope(`Configuring ${page.name} in-app`)}
      >
        Configure in-app
      </Button>
    </div>
  );

  return (
    <Drawer title={`${page.name} knowledge`} onClose={onClose} header={header} footer={footer}>
      {tab === 'interface' && (
        <PageElementGroups
          page={page}
          onOutOfScope={outOfScope}
          onToggleDisabled={(el) => {
            setElementDisabled(page.id, el.id, !el.disabled);
            toast({
              type: 'positive',
              title: el.disabled ? `${el.label} is back in` : `${el.label} excluded`,
              body: el.disabled
                ? 'The agent can read it again.'
                : 'The agent stops reading it. It stays here, so you can put it back.',
            });
          }}
          onRemove={(el) => {
            removeElement(page.id, el.id);
            toast({ type: 'positive', title: `${el.label} deleted` });
          }}
          onResolveDuplicates={(el) => {
            if (!el.anchor) return;
            resolveDuplicates(page.id, el.anchor);
            toast({
              type: 'positive',
              title: 'Duplicates resolved',
              body: 'One element kept on that anchor. The others pointed at the same thing.',
            });
          }}
        />
      )}

      {tab === 'skills' && <PageSkillsTab page={page} onOpenSkill={onOpenSkill} />}

      {tab === 'details' && (
        <Section>
          <div className="flex flex-col gap-[var(--space-6)]">
            <Row label="Name">{page.name}</Row>
            <Row label="URL rule">
              {page.urlRule !== '' ? (
                <span className="block truncate">{page.urlRule}</span>
              ) : (
                <span className="text-[var(--color-text-tertiary)]">Not set</span>
              )}
            </Row>
            <Row label="Elements">
              {page.elements.length} {page.elements.length === 1 ? 'element' : 'elements'}
            </Row>
            <Row label="Status">
              <Badge type={STATUS_TYPE[page.status]} size="small">
                {SCAN_STATUS_LABEL[page.status]}
              </Badge>
            </Row>
            <Row label="Last scanned">{formatRelative(page.scannedAt)}</Row>
          </div>
        </Section>
      )}
    </Drawer>
  );
}
