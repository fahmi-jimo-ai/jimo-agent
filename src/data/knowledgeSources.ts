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

export type SourceKind = 'url' | 'file' | 'text' | 'video' | 'qa';
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
  /** Only the linkable kinds carry one — `text` and `qa` have nothing to open. */
  href?: string;
  status: SourceStatus;
  /** Epoch ms. Both columns are relative times, so absolute values would age. */
  addedAt: number;
  updatedAt: number;
  /**
   * When the content the agent is answering from was last trained successfully
   * — PRD-390, PRD-268.
   *
   * Separate from `updatedAt`, and that separation is the whole fix. `updatedAt`
   * moves on every attempt, including the ones that failed; this moves only when
   * something good was actually written. A failed sync therefore leaves the row
   * saying what it is still serving, instead of the product silently replacing a
   * good index with whatever a blocked crawl returned and reporting nothing.
   *
   * Absent on a row that has never trained, which is not the same as a row whose
   * training is stale.
   */
  lastTrainedAt?: number;
  /**
   * Consecutive failed syncs since the last good one — PRD-373. Reset to 0 by a
   * success, so it reads as "how long has this been broken", not a lifetime
   * total.
   */
  failedAttempts?: number;
  /** Why the last sync failed, in the customer's terms rather than a stack
   *  trace. Cleared on success. */
  lastError?: string;
  /**
   * The source cannot currently be fetched at all — a 403, a page behind a new
   * login, a host that has gone away. Retrying while this holds fails again, and
   * that is the point: the auto-retry loop is not a way to wish a permission
   * change away. Cleared when someone retries by hand, which stands in for the
   * access having been fixed on their side.
   */
  unreachable?: boolean;
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

export const SOURCE_KINDS: SourceKind[] = ['url', 'text', 'file', 'video', 'qa'];
export const SOURCE_STATUSES: SourceStatus[] = ['trained', 'training', 'failed'];

/**
 * The "Add Content" menu's rows, in the menu's own order (899:15358 lists URL,
 * Text, File). `qa` is absent because a Q&A is authored on the Custom Answers
 * tab; `video` is the one row the newer frames omit — see SourcesEmptyState.
 */
export const ADDABLE_KINDS: SourceKind[] = ['url', 'text', 'file', 'video'];

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
    /* The PRD-390 row. It failed its last sync and it is STILL ANSWERING, from
       the training it took four days ago — which is the behaviour the ticket
       asks for and the opposite of what happened to the account that filed it,
       where a blocked crawl silently overwrote a working index with the string
       the block returned. Its tokens and chunks are therefore non-zero: content
       that is being served has to be there to serve. */
    row({
      id: 'demo-url-announcements',
      kind: 'url',
      label: 'https://usejimo.com/product/announcements',
      href: 'https://usejimo.com/product/announcements',
      status: 'failed',
      addedAt: now - 6 * DAY,
      updatedAt: now - 2 * HOUR,
      lastTrainedAt: now - 4 * DAY,
      failedAttempts: 3,
      lastError: 'The page returned 403 — it is no longer public',
      unreachable: true,
      tokens: 780,
      usedInResponses: 24,
      chunks: [
        {
          id: 'c1',
          text: 'Announcements let you tell users about a release in the product itself, with a changelog they can open from anywhere.',
        },
      ],
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
