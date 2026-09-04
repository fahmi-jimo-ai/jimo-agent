import * as React from 'react';
import { ArrowSwapVertical, ScanBarcode, SearchNormal1 } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { Menu, MenuItem } from '@/components/app/Menu';
import { useToast } from '@/components/app/toast';
import {
  useKnowledge,
  addPage,
  removePage,
  rescanPage,
  resumeScanning,
} from '@/state/useKnowledge';
import { useSkills, skillsForPage } from '@/state/useSkills';
import { makePageId } from '@/data/interfacePages';
import { PageGrid } from './PageGrid';
import { PageDrawer, type PageDrawerTab } from './PageDrawer';
import { InterfaceEmptyState } from './InterfaceEmptyState';
import { ScanPageModal, toPageName, toUrlRule } from './ScanPageModal';

/**
 * How the catalogue is ordered — PRD-568.
 *
 * Two options, not a sort menu with six. The ticket asks for "even a simple
 * alphabetical sort", and names why: with a stable order a builder can impose
 * their own hierarchy through naming prefixes, which is a structure the product
 * does not have to model. Creation order is kept as the other one because it
 * answers the only question A-to-Z cannot — what did the last scan add.
 *
 * Like `search`, this is view state and not persisted: it is where a reader is
 * in a page, not configuration.
 */
export type PageSort = 'name' | 'recent';

const PAGE_SORT_LABEL: Record<PageSort, string> = {
  name: 'A to Z',
  recent: 'Recently scanned',
};

/**
 * The Interface tab — Figma Interface-Knowledge `12987:13033`, inside section
 * `12987:12415`.
 *
 * One `Section` holding a search field over the card grid, exactly the shape
 * `SourcesCard` gives the Sources tab: the card's own header carries the title,
 * the one-line description and the primary action, and the body switches
 * between the grid and an empty state.
 *
 * ## What is component state, and why
 *
 * `search` is view state, not config — the same line `SourcesTab` draws for its
 * filters. Persisting it would make a stray search term survive a reload and
 * sync across tabs, which is a bug wearing a feature's clothes.
 *
 * `openId` is seeded from `initialPageId` and then owned here. It carries the
 * `?page=` deep link a skill's `Interface: Dashboard ↗` field arrives on (see
 * `KnowledgePage`). SEEDED, never controlled: a controlled prop would re-open
 * the drawer on every render and fight the close button — `SourcesTab`'s
 * `initialDetailId` records the same trap.
 *
 * The open page is resolved THROUGH the store rather than held as a record, so
 * the drawer keeps up as the same page goes Scanning… → ready underneath it.
 *
 * ## `onConfigure` is the card kebab's "Configure in-app"
 *
 * The kebab row that points at the host app. Nothing in this prototype can
 * inject the agent into another origin — the same limit `PreviewInAppModal`
 * records on the page header two levels up — so it acknowledges the click and
 * stops, which is what the drawer's own `Configure in-app` button does too.
 */
export function InterfaceTab({
  initialSearch = '',
  initialPageId,
  initialDrawerTab,
  onOpenSkill,
  onAddSkill,
}: {
  initialSearch?: string;
  /** Seeds the drawer — see the header. Never controls it. */
  initialPageId?: string;
  /** Stories land the drawer on a tab (`PageDrawerSkills`). Passthrough only. */
  initialDrawerTab?: PageDrawerTab;
  /** The drawer's Skills tab hands a row back to `/skills`. */
  onOpenSkill?: (skillId: string) => void;
  /** The Skills tab's `+ Add Skill` footer button. */
  onAddSkill?: () => void;
}) {
  const { pages } = useKnowledge();
  const { skills } = useSkills();
  const toast = useToast();

  const [search, setSearch] = React.useState(initialSearch);
  const [sort, setSort] = React.useState<PageSort>('name');
  const [sortOpen, setSortOpen] = React.useState(false);
  const [scanOpen, setScanOpen] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(initialPageId ?? null);

  // `status` is persisted but its timer id is not, so a card left mid-scan when
  // the tab closed would say "Scanning page…" forever without this. Exactly what
  // `SourcesTab` does with `resumeTraining`, and idempotent for the same reason:
  // arming an id replaces its timer rather than stacking a second one.
  React.useEffect(() => {
    resumeScanning();
  }, []);

  // Read through the store, not off a held record — the drawer has to keep up
  // as the page it is drawing finishes scanning.
  const open = pages.find((p) => p.id === openId) ?? null;

  const skillCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    pages.forEach((p) => {
      counts[p.id] = skillsForPage(skills, p.id).length;
    });
    return counts;
  }, [pages, skills]);

  const q = search.trim().toLowerCase();
  // The URL rule is searched as well as the name: the card prints both, and
  // "billing" is as likely to be typed at the rule as at the title.
  const filtered = q
    ? pages.filter(
        (p) => p.name.toLowerCase().includes(q) || p.urlRule.toLowerCase().includes(q),
      )
    : pages;

  // A copy, never the store's array: sorting in place would reorder the
  // persisted catalogue as a side effect of looking at it.
  const shown = React.useMemo(() => {
    const list = [...filtered];
    if (sort === 'name') {
      // `localeCompare` rather than `<`, so a prefix scheme survives accents and
      // case — the whole point of sorting for the customer who asked.
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => b.scannedAt - a.scannedAt);
    }
    return list;
  }, [filtered, sort]);

  const outOfScope = (what: string) =>
    toast({
      type: 'neutral',
      title: `${what} is out of scope`,
      body: 'This prototype models the scanned-page catalogue, not the scanner behind it.',
    });

  return (
    <>
      <Section
        title="Interface knowledge for agent"
        description="Scan any page on your platform and your Jimo agent will read it in real time whenever users ask about it."
        controls={
          <Button
            size="sm"
            leftIcon={<ScanBarcode size={20} variant="Linear" color="currentColor" />}
            onClick={() => setScanOpen(true)}
          >
            Scan a page
          </Button>
        }
      >
        <div className="flex flex-col gap-[var(--space-5)]">
          {/* The field stays up while a search matches nothing — the same three
              body states `SourcesCard` documents. It goes away only when there
              is nothing at all to search. */}
          {pages.length > 0 && (
            <div className="flex items-center gap-[var(--space-3)]">
              <Input
                className="w-[240px]"
                value={search}
                onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
                placeholder="Search a page"
                aria-label="Search a page"
                size="small"
                leftIcon={<SearchNormal1 size={20} variant="Linear" color="currentColor" />}
              />
              {/* PRD-568. Alphabetical is the option the customer asked for by
                  name, and the reason he gave is the reason it is the default
                  here: a stable order is what lets someone impose their own
                  structure with naming prefixes. Creation order stays available
                  because it is the only way to see what a recent scan added. */}
              <Menu
                open={sortOpen}
                onClose={() => setSortOpen(false)}
                trigger={
                  <DropdownSelector
                    size="small"
                    text={PAGE_SORT_LABEL[sort]}
                    isOpen={sortOpen}
                    hasValue={sort !== 'name'}
                    withIcon
                    icon={<ArrowSwapVertical size={20} variant="Linear" color="currentColor" />}
                    onClick={() => setSortOpen((o) => !o)}
                  />
                }
              >
                {(Object.keys(PAGE_SORT_LABEL) as PageSort[]).map((value) => (
                  <MenuItem
                    key={value}
                    label={PAGE_SORT_LABEL[value]}
                    selected={value === sort}
                    onClick={() => {
                      setSort(value);
                      setSortOpen(false);
                    }}
                  />
                ))}
              </Menu>
            </div>
          )}

          {pages.length === 0 ? (
            <InterfaceEmptyState variant="no-data" onScan={() => setScanOpen(true)} />
          ) : shown.length === 0 ? (
            <InterfaceEmptyState
              variant="no-results"
              onScan={() => setScanOpen(true)}
              onClearSearch={() => setSearch('')}
            />
          ) : (
            <PageGrid
              pages={shown}
              skillCounts={skillCounts}
              onOpen={(page) => setOpenId(page.id)}
              onRescan={(page) => {
                rescanPage(page.id);
                toast({ type: 'neutral', title: `Rescanning ${page.name}` });
              }}
              onConfigure={(page) => outOfScope(`Configuring ${page.name} in-app`)}
              onRemove={(page) => {
                if (openId === page.id) setOpenId(null);
                removePage(page.id);
                toast({ type: 'positive', title: 'Page removed' });
              }}
            />
          )}
        </div>
      </Section>

      {scanOpen && (
        <ScanPageModal
          onClose={() => setScanOpen(false)}
          onScan={(url) => {
            const page = {
              id: makePageId(),
              name: toPageName(url),
              urlRule: toUrlRule(url),
              scannedAt: Date.now(),
              status: 'scanning' as const,
              // INVENTED, and honest about it: a real scan is what fills
              // `elements`, and there is no scanner here. The card lands empty
              // and its drawer says so in one line rather than inventing a
              // wireframe of a page nobody read.
              elements: [],
            };
            // `addPage` arms the fake-scan timer itself when the record says
            // `scanning` — that pairing lives in `knowledgeStore`, not here.
            addPage(page);
            setScanOpen(false);
            toast({
              type: 'positive',
              title: `Scanning ${page.name}`,
              body: 'The card updates when the scan finishes.',
            });
          }}
        />
      )}

      {open && (
        <PageDrawer
          page={open}
          onClose={() => setOpenId(null)}
          initialTab={initialDrawerTab}
          onOpenSkill={onOpenSkill}
          onAddSkill={onAddSkill}
        />
      )}
    </>
  );
}
