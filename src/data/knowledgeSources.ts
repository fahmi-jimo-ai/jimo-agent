/**
 * The knowledge sources the Sources tab trains on.
 *
 * Transcribed from Figma Copilot-Widget section `932:27941` ("Sources page").
 * The populated table (899:15214) supplies the columns, the kinds and the three
 * statuses; the Content Detail drawer (932:18232) supplies everything a row
 * knows beyond its table cells — author, token cost, usage count and chunks.
 *
 * Unlike `userProperties`, this catalogue is NOT fixed: a source is created by
 * the user, so the whole record is persisted rather than an id into a fixture.
 * `DEMO_SOURCES()` exists only for the Demo data switch.
 */

/**
 * `hosted` is PRD-590, and it is the one kind that is not an INPUT.
 *
 * Every other kind points at knowledge that already exists somewhere else — a
 * page to crawl, a file to parse, a paragraph typed to fill a gap — and all of
 * it is consumed by the agent alone. A hosted page is authored in Jimo and read
 * BY END USERS, in the customer's own product, through the widget. Jimo is the
 * host and the reading surface, not just the trainer.
 *
 * That is the whole ask: Gojob needs a FAQ their clients can read but search
 * engines cannot index. A public URL fails the second half, and Notion or
 * GitBook only solve training — the reading surface would still be somebody
 * else's private page shared with their customers.
 *
 * There is no `href` for a hosted page ON PURPOSE. A URL is exactly the thing
 * that would make it indexable; it is served inside the product, to a user the
 * product has already authenticated, or not at all.
 */
export type SourceKind = 'url' | 'file' | 'text' | 'video' | 'qa' | 'hosted';
export type SourceStatus = 'trained' | 'training' | 'failed';

export type SourceChunk = {
  id: string;
  text: string;
};

export type KnowledgeSource = {
  id: string;
  kind: SourceKind;
  /**
   * The Content column and the drawer's title: a URL for `url`/`video`, a
   * filename for `file`, the body for `text`, the question for `qa`.
   */
  label: string;
  /** Only the linkable kinds carry one — `text` and `qa` have nothing to open,
   *  and `hosted` deliberately has nowhere public to point (see SourceKind). */
  href?: string;
  /**
   * The article itself. `hosted` only — it is the one kind whose content is
   * authored here rather than fetched, so it is the one kind that has to store
   * the prose it renders to end users. `label` stays the title.
   */
  body?: string;
  status: SourceStatus;
  /** Epoch ms. Both columns are relative times, so absolute values would age. */
  addedAt: number;
  updatedAt: number;
  addedBy: string;
  tokens: number;
  usedInResponses: number;
  chunks: SourceChunk[];
};

/** The Type pill's text — 899:15270 and its siblings. */
export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  url: 'URL',
  file: 'File',
  text: 'Text',
  video: 'Video',
  qa: 'Q&A',
  // Named for what it is to the reader, not for where it is stored. "Hosted"
  // alone would say nothing about the half that matters — that end users read
  // it.
  hosted: 'Article',
};

/** The Status pill's text. The ellipsis on Training is the artboard's. */
export const SOURCE_STATUS_LABEL: Record<SourceStatus, string> = {
  trained: 'Trained',
  training: 'Training…',
  failed: 'Failed',
};

/** Filter menu copy — the "no filter" row each dropdown opens on. */
export const KIND_FILTER_LABEL = 'Type';
export const STATUS_FILTER_LABEL = 'Status';

/**
 * Token Usage (932:18221). The artboard's caption reads "320,000 / 100,000" —
 * over quota — against a bar filled to about 15%, which cannot both be true.
 * The quota is the half that is stated as a rule ("You have maximum of 100,000
 * Tokens…"), so it is what survives; the used figure is summed from the real
 * rows instead and the bar is clamped. See TokenUsageCard.
 */
export const TOKEN_QUOTA = 100_000;

/** The one author the artboards name (932:18260). */
export const CURRENT_AUTHOR = 'Fahmi (You)';

export const SOURCE_KINDS: SourceKind[] = ['url', 'text', 'file', 'video', 'qa', 'hosted'];
export const SOURCE_STATUSES: SourceStatus[] = ['trained', 'training', 'failed'];

/**
 * The "Add Content" menu's rows, in the menu's own order (899:15358 lists URL,
 * Text, File). `qa` is absent because a Q&A is authored on the Custom Answers
 * tab; `video` is the one row the newer frames omit — see SourcesEmptyState.
 */
export const ADDABLE_KINDS: SourceKind[] = ['url', 'text', 'file', 'video', 'hosted'];

export function isSourceKind(value: unknown): value is SourceKind {
  return typeof value === 'string' && (SOURCE_KINDS as string[]).includes(value);
}

export function isSourceStatus(value: unknown): value is SourceStatus {
  return typeof value === 'string' && (SOURCE_STATUSES as string[]).includes(value);
}

/** Ids are only ever local, so a counter plus the kind is enough. */
let seq = 0;
export function makeSourceId(kind: SourceKind): string {
  seq += 1;
  return `${kind}-${seq}-${Math.random().toString(36).slice(2, 8)}`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The artboard's rows (899:15214), as a factory rather than a constant: both
 * time columns are relative, so a module-level literal would drift to "3 days
 * ago" the moment the tab is left open.
 *
 * One row is `failed` on purpose — it is the only way the retry action and the
 * Status filter have anything to act on. The Training… row from the artboard is
 * deliberately NOT seeded: `SourcesTab` arms a real timer for every `training`
 * row it mounts, so a seeded one would settle two seconds into the demo and
 * never come back. Adding a source is how you see that state.
 */
export function DEMO_SOURCES(): KnowledgeSource[] {
  const now = Date.now();
  const row = (
    partial: Omit<KnowledgeSource, 'addedAt' | 'updatedAt' | 'addedBy' | 'chunks'> &
      Partial<Pick<KnowledgeSource, 'addedAt' | 'updatedAt' | 'addedBy' | 'chunks'>>,
  ): KnowledgeSource => ({
    addedAt: now,
    updatedAt: now,
    addedBy: CURRENT_AUTHOR,
    chunks: [],
    ...partial,
  });

  return [
    row({
      id: 'demo-url-home',
      kind: 'url',
      label: 'https://usejimo.com',
      href: 'https://usejimo.com',
      status: 'trained',
      addedAt: now - 3 * DAY,
      updatedAt: now - 2 * MINUTE,
      tokens: 200,
      usedInResponses: 0,
      // 932:18284 onward — the four chunks the drawer shows for this row.
      chunks: [
        {
          id: 'c1',
          text: 'Onboard users smarter, Scale faster. Jimo is the only digital adoption platform offering personalized onboarding and assistance to boost conversion, increase retention, and reduce support tickets.',
        },
        {
          id: 'c2',
          text: 'Product Tours Action based onboarding Checklists Key onboarding steps Surveys Collect user insights Announcements Keep users informed Hints Smart Tips & Stickers Changelog Widget Post product updates',
        },
        {
          id: 'c3',
          text: 'Build engaging and smart nudges Design and deploy contextual nudges that guide users to discover & adopt features, achieve success and reduce friction. All without leaving your brand identity behind.',
        },
        {
          id: 'c4',
          text: 'Create in seconds without any code. Personalize experiences with dynamic variables Customize design for a native look and feel',
        },
      ],
    }),
    row({
      id: 'demo-url-pricing',
      kind: 'url',
      label: 'https://usejimo.com/pricing',
      href: 'https://usejimo.com/pricing',
      status: 'trained',
      addedAt: now - 3 * DAY,
      updatedAt: now - 5 * MINUTE,
      tokens: 1_450,
      usedInResponses: 12,
      chunks: [
        {
          id: 'c1',
          text: 'Plans start free and scale with monthly active users. Growth adds unlimited experiences, the AI agent and priority support; Enterprise adds SSO, DPA and a dedicated success manager.',
        },
      ],
    }),
    row({
      id: 'demo-file-pricing',
      kind: 'file',
      label: 'Jimo Pricing.pdf',
      href: '#',
      status: 'trained',
      addedAt: now - 2 * DAY,
      updatedAt: now - 2 * DAY,
      tokens: 8_900,
      usedInResponses: 4,
      chunks: [
        {
          id: 'c1',
          text: 'Pricing is billed per monthly active user, annually or monthly. Annual billing is discounted by two months.',
        },
      ],
    }),
    row({
      id: 'demo-url-tours',
      kind: 'url',
      label: 'https://usejimo.com/product/product-tours',
      href: 'https://usejimo.com/product/product-tours',
      status: 'trained',
      addedAt: now - 2 * DAY,
      updatedAt: now - 1 * HOUR,
      tokens: 2_310,
      usedInResponses: 31,
      chunks: [
        {
          id: 'c1',
          text: 'Product Tours guide users through a sequence of steps anchored to real elements in your app, so onboarding happens in context rather than in a video.',
        },
      ],
    }),
    row({
      id: 'demo-url-announcements',
      kind: 'url',
      label: 'https://usejimo.com/product/announcements',
      href: 'https://usejimo.com/product/announcements',
      status: 'failed',
      addedAt: now - 1 * DAY,
      updatedAt: now - 1 * DAY,
      tokens: 0,
      usedInResponses: 0,
      chunks: [],
    }),
    row({
      id: 'demo-text-positioning',
      kind: 'text',
      label:
        'Jimo is the only digital adoption platform offering personalized onboarding and assistance to boost conversion, increase retention, and reduce support tickets.',
      status: 'trained',
      addedAt: now - 6 * HOUR,
      updatedAt: now - 6 * HOUR,
      tokens: 60,
      usedInResponses: 8,
      chunks: [
        {
          id: 'c1',
          text: 'Jimo is the only digital adoption platform offering personalized onboarding and assistance to boost conversion, increase retention, and reduce support tickets.',
        },
      ],
    }),
    row({
      id: 'demo-video-tour',
      kind: 'video',
      label: 'https://youtube.com/watch?v=jimo-product-tour',
      href: 'https://youtube.com/watch?v=jimo-product-tour',
      status: 'trained',
      addedAt: now - 4 * HOUR,
      updatedAt: now - 4 * HOUR,
      tokens: 3_120,
      usedInResponses: 2,
      chunks: [
        {
          id: 'c1',
          text: 'Transcript — "In this walkthrough we build a product tour from scratch: pick the element, write the step, then publish to a segment."',
        },
      ],
    }),
    // PRD-590. The demo needs at least one, because the hosted kind is the only
    // one whose payoff is visible in the WIDGET rather than in this table — an
    // empty knowledge base renders no reader to look at.
    row({
      id: 'demo-hosted-billing',
      kind: 'hosted',
      label: 'How billing works on Connect',
      status: 'trained',
      addedAt: now - 5 * HOUR,
      updatedAt: now - 5 * HOUR,
      tokens: 640,
      usedInResponses: 27,
      body: 'Invoices are issued on the first working day of each month and cover the month just finished.\n\nEach line is one mission, priced at the rate agreed on the assignment. Overtime appears as a separate line at the agreed multiplier, never folded into the base rate.\n\nPayment is due within 30 days. You can download every invoice as a PDF from Billing → History, and a monthly summary is emailed to the address on the account.',
      chunks: [
        {
          id: 'c1',
          text: 'Invoices are issued on the first working day of each month and cover the month just finished. Each line is one mission, priced at the rate agreed on the assignment.',
        },
        {
          id: 'c2',
          text: 'Payment is due within 30 days. Invoices download as PDF from Billing → History.',
        },
      ],
    }),
    row({
      id: 'demo-qa-what-is-jimo',
      kind: 'qa',
      label: 'What is Jimo?',
      status: 'trained',
      addedAt: now - 30 * MINUTE,
      updatedAt: now - 30 * MINUTE,
      tokens: 45,
      usedInResponses: 19,
      chunks: [
        {
          id: 'c1',
          text: 'Jimo is a digital adoption platform for product teams — tours, checklists, surveys, announcements and an AI agent, all installed with one SDK snippet.',
        },
      ],
    }),
  ];
}
