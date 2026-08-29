import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Monitor, Element4, Firstline } from 'iconsax-react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { AppShell } from '@/app/AppShell';
import { Menu, MenuItem } from '@/components/app/Menu';
import { useToast } from '@/components/app/toast';
import { openWidget } from '@/features/escalation/openWidget';
import { SourcesTab } from './sources/SourcesTab';
import { InterfaceTab } from './interface/InterfaceTab';
import type { PageDrawerTab } from './interface/PageDrawer';
import { PreviewInAppModal } from './PreviewInAppModal';

/**
 * The Knowledge page — Figma Copilot-Widget, section 932:27941 ("Sources page"),
 * and Interface-Knowledge `12987:12415` for the Interface tab.
 *
 * The tab bar is that section's (932:17526), minus one: **Interface ·
 * Sources**, with Sources active by default. It replaces the older 901:16049
 * bar, which named User Context where Interface now sits. `UserContextSection`
 * and its files stay in the repo and keep their Storybook stories — the design
 * dropped the tab, not the work.
 *
 * **Custom Answers is a deliberate deviation from the artboard**, which draws
 * it third (932:17544). It is cut here because the prototype has nothing
 * behind it, not because the design moved — restore the entry when it does.
 *
 * ## Interface is live now, so the tab bar finally switches
 *
 * This page used to pass no `onTabClick`: only Sources was designed, so a tab
 * bar that switched would have switched to nothing. `12987:12415` designs
 * Interface — the scanned-page grid and its three-tab drawer — so the bar is
 * now a real control and `activeTab` is component state.
 *
 * Which tab you are on is deliberately NOT persisted. It is where a reader is
 * inside a page, not configuration — the same line `ThinkingTrace` draws for its
 * open state and `SourcesTab` draws for its filters.
 *
 * ## Test Knowledge opens a menu, and that is why `buttons[]` is empty
 *
 * The artboard draws Test Knowledge as a plain 36px secondary button with a
 * play glyph, and it stays exactly that — the label does not change. What
 * changed is what it does: it now opens **Preview here** / **Preview in-app**
 * instead of a toast. `PageHeader.buttons[]` renders each entry as a bare
 * `<Button>` and `Menu` must wrap its own trigger to measure it, so the trigger
 * goes through the `actions` fork instead. `buttonSize="small"` is gone with
 * the array; the trigger sets `size="sm"` itself, which is the same 36px.
 *
 * The menu goes through `Menu` rather than a locally-positioned panel for the
 * usual reason: the panel portals to <body>, so the page header's own stacking
 * context cannot clip it.
 *
 * ## Two deep links, one shape
 *
 * `?source=` opens the Content Detail drawer on Sources — a citation in a
 * conversation's thinking trace links here by source id (see `ThinkingTrace`).
 * `?page=` opens the page drawer on Interface, which is where a skill's
 * `Interface: Dashboard ↗` field lands.
 *
 * Both are read ONCE into the tab's `initial*` prop and then stripped, so a
 * drawer is a destination rather than a mode: a reload lands on the grid, not
 * back inside the drawer, and the close button is not fighting a param that
 * re-asserts itself on every render.
 */
const TABS = [
  // Figma glyphs: element-4, firstline (932:17530 / 17537).
  { id: 'interface', label: 'Interface', icon: <Element4 size={20} variant="Linear" color="currentColor" /> },
  { id: 'sources', label: 'Sources', icon: <Firstline size={20} variant="Linear" color="currentColor" /> },
];

export function KnowledgePage({
  initialTab,
  initialPageId: initialPageIdProp,
  initialDrawerTab,
  ...props
}: React.ComponentProps<typeof SourcesTab> & {
  /** Stories land directly on a tab; the app opens on Sources. */
  initialTab?: 'interface' | 'sources';
  /** Stories open the page drawer without a URL. */
  initialPageId?: string;
  /** …and land it on one of its three tabs. */
  initialDrawerTab?: PageDrawerTab;
} = {}) {
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [previewInApp, setPreviewInApp] = React.useState(false);
  const [params, setParams] = useSearchParams();

  // Read both deep links ONCE. Held in state rather than read on every render so
  // that stripping the params below cannot also close the drawer one just opened.
  const [deepLink] = React.useState(() => ({
    source: params.get('source'),
    page: params.get('page'),
  }));

  // A `?page=` link is also a request to be on the Interface tab — arriving on
  // Sources with an invisible drawer open would be the worst of both.
  const [tab, setTab] = React.useState<string>(
    initialTab ?? (deepLink.page ? 'interface' : 'sources'),
  );

  React.useEffect(() => {
    if (!params.has('source') && !params.has('page')) return;
    const next = new URLSearchParams(params);
    next.delete('source');
    next.delete('page');
    setParams(next, { replace: true });
    // `params`/`setParams` are stable enough for this one-shot; re-running on a
    // later param change is harmless because `has` gates it.
  }, [params, setParams]);

  const previewHere = () => {
    setMenuOpen(false);
    openWidget();
  };

  const previewInAppStart = () => {
    setMenuOpen(false);
    setPreviewInApp(true);
  };

  return (
    <AppShell
      activeItem="Knowledge"
      header={
        <PageHeader
          title="Knowledge"
          showButtonGroup={false}
          actions={
            <Menu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              align="right"
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Play size={20} variant="Linear" color="currentColor" />}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  Test Knowledge
                </Button>
              }
            >
              <MenuItem
                icon={<Play size={20} variant="Linear" color="currentColor" />}
                label="Preview here"
                onClick={previewHere}
              />
              <MenuItem
                icon={<Monitor size={20} variant="Linear" color="currentColor" />}
                label="Preview in-app"
                onClick={previewInAppStart}
              />
            </Menu>
          }
          showTabs
          tabs={TABS}
          activeTab={tab}
          onTabClick={setTab}
        />
      }
    >
      {tab === 'interface' ? (
        <InterfaceTab
          initialPageId={initialPageIdProp ?? deepLink.page ?? undefined}
          initialDrawerTab={initialDrawerTab}
          // The page drawer's Skills tab is the other half of the round trip the
          // skill drawer's `Interface:` field starts.
          onOpenSkill={(skillId) => navigate(`/skills?skill=${encodeURIComponent(skillId)}`)}
          onAddSkill={() => navigate('/skills')}
        />
      ) : (
        <SourcesTab
          {...props}
          initialDetailId={props.initialDetailId ?? deepLink.source ?? undefined}
        />
      )}

      {previewInApp && (
        <PreviewInAppModal
          onClose={() => setPreviewInApp(false)}
          onOpen={(url) => {
            setPreviewInApp(false);
            // Invented, and labelled as such: nothing injects the agent into a
            // third-party page from this prototype, so the honest outcome is
            // the page itself plus a toast that says what did not happen.
            window.open(url, '_blank', 'noopener');
            toast({
              type: 'neutral',
              title: 'Opened without the agent',
              body: 'Injecting the agent into another origin is out of scope for this prototype.',
            });
          }}
        />
      )}
    </AppShell>
  );
}
