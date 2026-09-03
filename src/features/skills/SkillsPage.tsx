import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Add } from 'iconsax-react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { AppShell } from '@/app/AppShell';
import { Menu } from '@/components/app/Menu';
import { useToast } from '@/components/app/toast';
import { openWidget } from '@/features/escalation/openWidget';
import { useKnowledge } from '@/state/useKnowledge';
import {
  useSkills,
  addSkill,
  removeSkill,
  updateSkill,
  toggleSkill,
  duplicateSkill,
} from '@/state/useSkills';
import type { SkillModeFilter, SkillSort } from '@/state/skillsStore';
import { SKILL_MODES, SKILL_MODE_MENU, type Skill, type SkillMode } from '@/data/skills';
import type { InterfacePage } from '@/data/interfacePages';
import { skillGlyph } from './skillGlyph';
import { SkillStatsRow } from './SkillStatsRow';
import { SkillsCard } from './SkillsCard';
import { SkillPagePicker } from './SkillPagePicker';
import { SkillFormModal, type SkillDraft } from './SkillFormModal';
import { SkillDrawer, type SkillDrawerView } from './SkillDrawer';

/**
 * The Skills page — Figma section `12987:11525` ("Building Skill from Dashboard").
 *
 * Five artboards, all of them here: the list (`12987:11526`) with its Add Skill
 * menu, the page picker (`12987:11947`), and the drawer's three views —
 * Description (`12987:14597`), Usage (`12987:15826`) and a conversation opened
 * inside it (`12987:16446`).
 *
 * ## Add Skill goes through `actions`, not `buttons[]`
 *
 * Same fork Knowledge's Test Knowledge uses, for the same reason:
 * `PageHeader.buttons[]` renders every entry as a bare `<Button>`, and `Menu`
 * has to wrap its own trigger in order to measure it. The button itself is
 * unchanged from the artboard — a dark primary with a `+` glyph.
 *
 * The three menu rows are `DropdownMenuList` with `showIcon` + `showDescription`,
 * which is exactly the icon + title + two-line-helper row `12987:11928` draws.
 * Their copy is transcribed verbatim into `SKILL_MODE_MENU`.
 *
 * ## The creation flow is picker → form, and stops there
 *
 * `12544:22994` and `12197:27548` continue this flow INSIDE the widget: the
 * agent proposes flows, records steps, asks lettered A/B questions and hands
 * back a summary to save. That is a state machine on top of `escalationEngine`,
 * which today only answers support questions — a separate piece of work, not a
 * missing `if`. Here the picker hands off to `SkillFormModal`, which is the same
 * card Edit opens, so both paths produce a record the same way.
 *
 * Add and Edit are ONE `ModalCard` with steps, and Delete is a `confirm` step of
 * that same card — never a second dialog over the first.
 *
 * ## `?skill=<id>` opens the drawer
 *
 * A skill chip in a conversation's reasoning trace links here by id (see
 * `ConversationsPage`), and so does the page drawer's Skills tab on
 * `/knowledge`. The param is read ONCE into `detailId` and then stripped, so the
 * drawer is a destination rather than a mode: a reload lands on the table, and
 * the close button is not fighting a param that re-asserts itself every render.
 * Identical to `KnowledgePage`'s `?source=` / `?page=`.
 *
 * ## View state is component state, config is not
 *
 * `search`, `mode` and `sort` are deliberately NOT persisted — the same line
 * `SourcesTab` draws. A stray search term surviving a reload, or syncing across
 * tabs, is not a feature. The `initial*` props exist so a story can land
 * directly on a filtered frame.
 */
export function SkillsPage({
  initialSearch = '',
  initialMode = 'all',
  initialSort = 'default',
  initialDetailId,
  initialDetailView,
  initialAddMode,
}: {
  initialSearch?: string;
  initialMode?: SkillModeFilter;
  initialSort?: SkillSort;
  initialDetailId?: string;
  initialDetailView?: SkillDrawerView;
  /** Opens the page picker straight away — the AddSkillMenu story's next beat. */
  initialAddMode?: SkillMode;
} = {}) {
  const { skills } = useSkills();
  const { pages } = useKnowledge();
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [search, setSearch] = React.useState(initialSearch);
  const [mode, setMode] = React.useState<SkillModeFilter>(initialMode);
  const [sort, setSort] = React.useState<SkillSort>(initialSort);

  /** The picker is open on a mode; the form is open on a draft. Never both. */
  const [picking, setPicking] = React.useState<SkillMode | null>(initialAddMode ?? null);
  const [draft, setDraft] = React.useState<SkillDraft | null>(null);

  // Read the deep link ONCE. Held in state rather than read on every render so
  // that stripping the param below cannot also close the drawer it just opened.
  const [deepLinkId] = React.useState(() => params.get('skill'));
  const [detailId, setDetailId] = React.useState<string | null>(
    initialDetailId ?? deepLinkId ?? null,
  );

  React.useEffect(() => {
    if (!params.has('skill')) return;
    const next = new URLSearchParams(params);
    next.delete('skill');
    setParams(next, { replace: true });
    // `params`/`setParams` are stable enough for this one-shot; re-running on a
    // later param change is harmless because `has` gates it.
  }, [params, setParams]);

  // Read through the store rather than holding the row: the drawer has to keep
  // up as the same skill is renamed or toggled underneath it. Same reason
  // `SourcesTab` resolves its drawer's source this way.
  const detail = skills.find((s) => s.id === detailId) ?? null;
  const detailPage: InterfacePage | null =
    (detail?.pageId && pages.find((p) => p.id === detail.pageId)) || null;

  const outOfScope = (what: string) =>
    toast({
      type: 'neutral',
      title: `${what} is out of scope`,
      body: 'The artboard draws this affordance but no frame follows it.',
    });

  const startAdd = (m: SkillMode) => {
    setMenuOpen(false);
    setPicking(m);
  };

  return (
    <AppShell
      activeItem="Skills"
      header={
        <PageHeader
          title="Skills"
          showButtonGroup={false}
          showTabs={false}
          actions={
            <Menu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              align="right"
              trigger={
                <Button
                  leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  Add Skill
                </Button>
              }
            >
              {SKILL_MODES.map((m) => (
                <DropdownMenuList
                  key={m}
                  showIcon
                  icon={skillGlyph(m)}
                  showDescription
                  text={SKILL_MODE_MENU[m].title}
                  description={SKILL_MODE_MENU[m].description}
                  onClick={() => startAdd(m)}
                />
              ))}
            </Menu>
          }
        />
      }
    >
      <SkillStatsRow />

      <SkillsCard
        skills={skills}
        search={search}
        onSearch={setSearch}
        mode={mode}
        onMode={setMode}
        sort={sort}
        onSort={setSort}
        onOpen={(skill: Skill) => setDetailId(skill.id)}
        onAdd={startAdd}
      />

      {picking && (
        <SkillPagePicker
          mode={picking}
          onClose={() => setPicking(null)}
          onPick={(page) => {
            // The picker closes as the form opens — sequential, so this is not
            // a dialog over a dialog. Only one of the two is ever mounted.
            setDraft({ mode: picking, page, scope: 'page' });
            setPicking(null);
          }}
          // PRD-584: same hand-off, no page. The form is the same card either
          // way, so both routes still build the record the same way.
          onPickGlobal={() => {
            setDraft({ mode: picking, page: null, scope: 'global' });
            setPicking(null);
          }}
        />
      )}

      {draft && (
        <SkillFormModal
          draft={draft}
          onClose={() => setDraft(null)}
          onSubmit={(skill) => {
            addSkill(skill);
            setDraft(null);
            // Land the reader on what they just made, which is also the only
            // place its instructions are readable.
            setDetailId(skill.id);
            toast({
              type: 'positive',
              title: `${skill.name} created`,
              body: 'It is live for users straight away — switch it off in the drawer to hold it back.',
            });
          }}
          onUpdate={(id, patch) => {
            updateSkill(id, patch);
            setDraft(null);
            toast({ type: 'positive', title: 'Skill updated' });
          }}
          onDelete={(id) => {
            if (detailId === id) setDetailId(null);
            removeSkill(id);
            setDraft(null);
            toast({ type: 'positive', title: 'Skill deleted' });
          }}
        />
      )}

      {detail && (
        <SkillDrawer
          skill={detail}
          page={detailPage}
          initialView={initialDetailView}
          onClose={() => setDetailId(null)}
          onToggleActive={(next) => {
            toggleSkill(detail.id, next);
            toast({
              type: next ? 'positive' : 'neutral',
              title: next ? `${detail.name} is live` : `${detail.name} is paused`,
              body: next
                ? 'The agent can fire it from now on.'
                : 'The agent will not fire it until you switch it back on.',
            });
          }}
          onEdit={() => setDraft({ mode: detail.mode, page: detailPage, editing: detail })}
          onTryInChat={openWidget}
          onDuplicate={() => {
            const copy = duplicateSkill(detail.id);
            if (!copy) return;
            setDetailId(copy.id);
            toast({
              type: 'positive',
              title: `${copy.name} created`,
              body: 'The copy starts paused and with no runs, so it cannot answer anybody mid-edit.',
            });
          }}
          // Delete is a `confirm` STEP of the form card, not a dialog of its
          // own — which is why it opens the same card the Edit button opens.
          onDelete={() => setDraft({ mode: detail.mode, page: detailPage, editing: detail })}
          onOpenPage={(pageId) => navigate(`/knowledge?page=${encodeURIComponent(pageId)}`)}
          onOpenSkill={(skillId) => setDetailId(skillId)}
          onOutOfScope={outOfScope}
        />
      )}
    </AppShell>
  );
}
