import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Monitor, Element4, Firstline } from 'iconsax-react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { AppShell } from '@/app/AppShell';
import { Menu, MenuItem } from '@/components/app/Menu';
import { useToast } from '@/components/app/toast';
import { openWidget } from '@/features/escalation/openWidget';
import { SourcesTab } from './sources/SourcesTab';
import { PreviewInAppModal } from './PreviewInAppModal';

/**
 * The Knowledge page — Figma Copilot-Widget, section 932:27941 ("Sources page").
 *
 * The tab bar is that section's (932:17526), minus one: **Interface ·
 * Sources**, with Sources active. It replaces the older 901:16049 bar, which
 * named User Context where Interface now sits. `UserContextSection` and its
 * files stay in the repo and keep their Storybook stories — the design
 * dropped the tab, not the work.
 *
 * **Custom Answers is a deliberate deviation from the artboard**, which draws
 * it third (932:17544). It is cut here because the prototype has nothing
 * behind it, not because the design moved — restore the entry when it does.
 *
 * Only **Sources** is designed, so only it is built, and `PageHeader` still
 * gets no `onTabClick`. Interface renders because the artboard shows it and it
 * is inert, which is the honest state of the design rather than a placeholder
 * panel nobody drew. There is no tab state here for the same reason: with one
 * live tab there is nothing to hold.
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
 * ## `?source=` opens the Content Detail drawer
 *
 * A citation in a conversation's thinking trace links here by source id (see
 * `ThinkingTrace`). The param is read once into `SourcesTab`'s existing
 * `detailId` state and then stripped, so the drawer is a destination rather
 * than a mode — a reload lands on the table, not back inside the drawer.
 */
const TABS = [
  // Figma glyphs: element-4, firstline (932:17530 / 17537).
  { id: 'interface', label: 'Interface', icon: <Element4 size={20} variant="Linear" color="currentColor" /> },
  { id: 'sources', label: 'Sources', icon: <Firstline size={20} variant="Linear" color="currentColor" /> },
];

export function KnowledgePage(props: React.ComponentProps<typeof SourcesTab>) {
  const toast = useToast();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [previewInApp, setPreviewInApp] = React.useState(false);
  const [params, setParams] = useSearchParams();

  // Read the deep link ONCE. Held in state rather than read on every render so
  // that stripping the param below cannot also close the drawer it just opened.
  const [initialDetailId] = React.useState(() => params.get('source'));
  React.useEffect(() => {
    if (!params.has('source')) return;
    const next = new URLSearchParams(params);
    next.delete('source');
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
          activeTab="sources"
        />
      }
    >
      <SourcesTab {...props} initialDetailId={props.initialDetailId ?? initialDetailId ?? undefined} />

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
