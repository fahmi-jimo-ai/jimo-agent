/**
 * The pages the agent has scanned — Figma Interface-Knowledge `12987:12415`.
 *
 * The grid (`12987:13033`) supplies the card: a thumbnail, a name and an
 * "N Element • N Skills" meta line. The drawer (`12987:12416`) supplies
 * everything a page knows beyond that — its elements, grouped into the six
 * tinted buckets, each with a tag.
 *
 * Same convention as `knowledgeSources.ts`: a page is a record, not an id into
 * a fixed catalogue, because a scan creates it. It differs in one way that is
 * deliberate and documented in `knowledgeStore` — `pages` is seeded POPULATED
 * while `sources` starts empty. A page catalogue is the output of a scanner,
 * not something the user types, and the skill page-picker plus the skill
 * drawer's `Interface:` field are both empty without it.
 *
 * ## Invented, and labelled as such
 *
 * There is no scanner in this prototype, so every page below is made up, as are
 * the element labels and tags. Only the SHAPE is transcribed. The artboard's own
 * thumbnails are screenshots of a Mixpanel-ish CRM — see `PageThumb`, which
 * draws an abstract wireframe rather than baking somebody else's product in.
 *
 * ## The artboard contradicts itself on the element count
 *
 * `12987:13033`'s cards all read "48 Element", but `12987:12416`'s groups sum to
 * 33 (2 + 7 + 2 + 8 + 2 + 12). One of them is placeholder text. The count is
 * derived from `elements.length` here, so the card and the drawer can never
 * disagree with each other — which is the failure that actually matters.
 */

/**
 * Where a page is in its scan. Invented, and labelled as such: no artboard draws
 * a scanning card — `1. Scan` draws the progress IN the host app ("Scanning
 * page... → Mapping elements... → Labelling elements..."), which is where a real
 * scan happens. The dashboard still needs to say something while it waits, and
 * the three states mirror `SourceStatus` so the two grids share a vocabulary.
 */
export type ScanStatus = 'scanning' | 'ready' | 'failed';

export const SCAN_STATUSES: ScanStatus[] = ['scanning', 'ready', 'failed'];

/** The meta line's text while a card is not yet readable. */
export const SCAN_STATUS_LABEL: Record<ScanStatus, string> = {
  scanning: 'Scanning page…',
  ready: 'Ready',
  failed: 'Scan failed',
};

export function isScanStatus(value: unknown): value is ScanStatus {
  return typeof value === 'string' && (SCAN_STATUSES as string[]).includes(value);
}

export type ElementGroup =
  | 'navigation'
  | 'inputs'
  | 'controls'
  | 'data'
  | 'lists'
  | 'contents';

/** Group order down the drawer, exactly as `12987:12416` stacks them. */
export const ELEMENT_GROUPS: ElementGroup[] = [
  'navigation',
  'inputs',
  'controls',
  'data',
  'lists',
  'contents',
];

export const GROUP_LABEL: Record<ElementGroup, string> = {
  navigation: 'Navigation',
  inputs: 'Inputs & Forms',
  controls: 'Controls',
  data: 'Data Displays',
  lists: 'Lists & Tables',
  contents: 'Contents',
};

export interface PageElement {
  id: string;
  /** The row's text, e.g. "Weekly Active Users KPI". */
  label: string;
  group: ElementGroup;
  /** The trailing tag the artboard prints on each row — "Div", "Button", … */
  tag: string;
  /**
   * What the element is actually bound to — PRD-566, PRD-372.
   *
   * On the row rather than behind it. The customer who filed this was opening
   * and closing roughly a hundred element sheets per page to answer "what is
   * this one connected to", which is also what made duplicates invisible: two
   * rows that resolve to the same anchor look like two different elements until
   * you can see the anchor on both.
   *
   * Optional, because a page stored before anchors were recorded still has
   * readable elements. A row with none says so rather than pretending.
   */
  anchor?: string;
  /**
   * Excluded from what the agent reads, without being deleted.
   *
   * The ticket's complaint is that disabled was the ONLY option, so it came to
   * mean four different things at once — trash, duplicate, deliberately
   * ignored, might want later. It keeps its honest meaning here now that delete
   * exists beside it: not now, but still real.
   */
  disabled?: boolean;
}

export interface InterfacePage {
  id: string;
  /** The card's title and the drawer's, e.g. "Dashboard Page". */
  name: string;
  /**
   * The card's `URL equals:` chip. Held as the bare rule the artboard prints,
   * with no scheme, because that is what the chip shows.
   */
  urlRule: string;
  /** Epoch ms — the columns are relative times, so absolutes would age. */
  scannedAt: number;
  /** `ready` for everything the seeded catalogue holds; see ScanStatus. */
  status: ScanStatus;
  elements: PageElement[];
}

export function isElementGroup(value: unknown): value is ElementGroup {
  return typeof value === 'string' && (ELEMENT_GROUPS as string[]).includes(value);
}

/** Ids are only ever local, so a counter plus a random suffix is enough. */
let seq = 0;
export function makePageId(): string {
  seq += 1;
  return `page-${seq}-${Math.random().toString(36).slice(2, 8)}`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * A plausible selector for a label — INVENTED, like every other string in this
 * fixture, and here for one reason: an anchor column with nothing in it cannot
 * show what an anchor column is for.
 *
 * It is deterministic on the label, which is what makes two rows named the same
 * thing collide the way the real scanner's duplicates do.
 */
function anchorFor(g: ElementGroup, tag: string, label: string): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${g === 'navigation' ? 'nav' : `.${g}`} > ${tag.toLowerCase()}[data-el="${slug}"]`;
}

/** Build `count` elements in one group — the fixture is about counts, not prose. */
function group(
  pageId: string,
  g: ElementGroup,
  tag: string,
  labels: string[],
): PageElement[] {
  return labels.map((label, i) => ({
    id: `${pageId}-${g}-${i + 1}`,
    label,
    group: g,
    tag,
    anchor: anchorFor(g, tag, label),
  }));
}

function page(
  id: string,
  name: string,
  urlRule: string,
  scannedAt: number,
  spec: Partial<Record<ElementGroup, { tag: string; labels: string[] }>>,
): InterfacePage {
  return {
    id,
    name,
    urlRule,
    scannedAt,
    status: 'ready',
    elements: ELEMENT_GROUPS.flatMap((g) => {
      const s = spec[g];
      return s ? group(id, g, s.tag, s.labels) : [];
    }),
  };
}

/**
 * The seeded catalogue. A factory rather than a constant, for the reason
 * `DEMO_SOURCES` already gives: `scannedAt` is relative, so a module-level
 * literal would drift the moment the tab is left open.
 *
 * The names are this app's — a support agent's host product — rather than the
 * artboard's Mixpanel dashboards, the same resolution CLAUDE.md records for the
 * reasoning trace.
 */
export function DEMO_PAGES(): InterfacePage[] {
  const now = Date.now();

  return [
    page('page-dashboard', 'Dashboard', 'app.usejimo.com/dashboard', now - 2 * DAY, {
      navigation: { tag: 'Nav', labels: ['Primary sidebar', 'Workspace switcher'] },
      inputs: {
        tag: 'Input',
        labels: [
          'Global search',
          'Date range picker',
          'Segment filter',
          'Metric selector',
          'Compare toggle',
          'Export format select',
          'Saved view name',
        ],
      },
      /* Three of these resolve to the same anchor, which is what the scanner
         does on a page that renders one button in three places (a header, an
         empty state, a sticky footer). It is the case PRD-566 is about: without
         the anchor on the row they read as three different controls, and the
         agent is handed the same target three times. */
      controls: {
        tag: 'Button',
        labels: [
          'Create experience',
          'Create experience',
          'Create experience',
          'Share dashboard',
        ],
      },
      data: {
        tag: 'Div',
        labels: [
          'Weekly Active Users KPI',
          'Conversion Rate KPI',
          'Revenue KPI',
          'Active Deals KPI',
          'Adoption trend chart',
          'Deals by stage chart',
          'Retention cohort grid',
          'Engagement sparkline',
        ],
      },
      lists: { tag: 'Table', labels: ['Recent experiences table', 'Top segments list'] },
      contents: {
        tag: 'Text',
        labels: [
          'Page title',
          'Welcome banner',
          'KPI caption',
          'Empty-state copy',
          'Chart legend',
          'Footer note',
        ],
      },
    }),

    page('page-experiences', 'Experiences', 'app.usejimo.com/experiences', now - 5 * DAY, {
      navigation: { tag: 'Nav', labels: ['Primary sidebar', 'Experiences tab bar'] },
      inputs: {
        tag: 'Input',
        labels: ['Search experiences', 'Status filter', 'Type filter', 'Owner filter'],
      },
      controls: {
        tag: 'Button',
        labels: ['New experience', 'Duplicate', 'Publish', 'Archive'],
      },
      data: { tag: 'Div', labels: ['Views KPI', 'Completion KPI'] },
      lists: { tag: 'Table', labels: ['Experiences table'] },
      contents: { tag: 'Text', labels: ['Page title', 'Empty-state copy'] },
    }),

    page('page-billing', 'Billing & Plan', 'app.usejimo.com/settings/billing', now - 9 * DAY, {
      navigation: { tag: 'Nav', labels: ['Settings sidebar'] },
      inputs: {
        tag: 'Input',
        labels: ['Card number', 'Expiry', 'CVC', 'Billing email', 'VAT number'],
      },
      controls: { tag: 'Button', labels: ['Update payment method', 'Change plan', 'Cancel plan'] },
      data: { tag: 'Div', labels: ['Current plan card', 'Seats used meter'] },
      lists: { tag: 'Table', labels: ['Invoice history'] },
      contents: { tag: 'Text', labels: ['Plan description', 'Renewal notice'] },
    }),

    page('page-team', 'Team & Permissions', 'app.usejimo.com/settings/team', now - 12 * DAY, {
      navigation: { tag: 'Nav', labels: ['Settings sidebar'] },
      inputs: { tag: 'Input', labels: ['Invite by email', 'Role select', 'Search members'] },
      controls: { tag: 'Button', labels: ['Send invite', 'Revoke access'] },
      lists: { tag: 'Table', labels: ['Members table', 'Pending invites'] },
      contents: { tag: 'Text', labels: ['Seat limit notice'] },
    }),

    page('page-integrations', 'Integrations', 'app.usejimo.com/settings/integrations', now - 4 * HOUR, {
      navigation: { tag: 'Nav', labels: ['Settings sidebar'] },
      inputs: { tag: 'Input', labels: ['Search integrations', 'Category filter'] },
      controls: { tag: 'Button', labels: ['Connect', 'Disconnect', 'Configure'] },
      data: { tag: 'Div', labels: ['Connection status card'] },
      lists: { tag: 'Table', labels: ['Connected apps'] },
      contents: { tag: 'Text', labels: ['Integration description', 'Scope notice'] },
    }),

    page('page-onboarding', 'Onboarding Checklist', 'app.usejimo.com/onboarding', now - 30 * MINUTE, {
      navigation: { tag: 'Nav', labels: ['Checklist stepper'] },
      inputs: { tag: 'Input', labels: ['Company name', 'Team size', 'Use case select'] },
      controls: { tag: 'Button', labels: ['Continue', 'Skip for now', 'Finish setup'] },
      data: { tag: 'Div', labels: ['Progress meter'] },
      contents: { tag: 'Text', labels: ['Step title', 'Step help text', 'Completion copy'] },
    }),
  ];
}
