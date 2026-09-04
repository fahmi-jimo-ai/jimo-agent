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
 * A connected documentation tool — PRD-549, PRD-571, PRD-234.
 *
 * These are source kinds rather than a separate concept, which is the shape
 * chosen for them: each one ships on its own, beside Zendesk, the way Zendesk
 * already works. No shared connector abstraction sits under them, so none of
 * them waits on the others.
 *
 * What they have in common is the only thing that matters to the customer: the
 * documentation is behind a login, so the public crawler cannot see it, and a
 * token can. That is the whole reason this list exists — every account asking
 * for one had already been told to make their knowledge base public, and said
 * no.
 */
export type ConnectorKind = 'gitbook' | 'intercom' | 'drive';

export type SourceKind = 'url' | 'file' | 'text' | 'video' | 'qa' | ConnectorKind;

export const CONNECTOR_KINDS: ConnectorKind[] = ['gitbook', 'intercom', 'drive'];

export function isConnectorKind(value: unknown): value is ConnectorKind {
  return typeof value === 'string' && (CONNECTOR_KINDS as string[]).includes(value);
}

/**
 * What each connector asks for. Two fields, because two is what the vendor's
 * own API needs: something to authenticate with, and something to say how much
 * of the workspace to read.
 *
 * The scope field is per-vendor on purpose and speaks each one's own words. A
 * GitBook space, an Intercom collection and a Drive folder are not the same
 * object, and one generic "scope" box would misrepresent at least two of them
 * to the person filling it in.
 */
export const CONNECTOR_SPEC: Record<
  ConnectorKind,
  {
    label: string;
    /** The dialog's title, e.g. "Connect GitBook". */
    title: string;
    tokenLabel: string;
    tokenPlaceholder: string;
    /** Where the customer finds that token, in their words not ours. */
    tokenHint: string;
    scopeLabel: string;
    scopePlaceholder: string;
    scopeHint: string;
  }
> = {
  gitbook: {
    label: 'GitBook',
    title: 'Connect GitBook',
    tokenLabel: 'API token',
    tokenPlaceholder: 'gb_api_…',
    tokenHint: 'GitBook → Account settings → Developer → API tokens.',
    scopeLabel: 'Spaces to train on',
    scopePlaceholder: 'Ops handbook, Onboarding',
    scopeHint: 'Leave empty to read every space this token can reach.',
  },
  intercom: {
    label: 'Intercom',
    title: 'Connect Intercom',
    tokenLabel: 'Access token',
    tokenPlaceholder: 'dG9r…',
    tokenHint: 'Intercom → Settings → Developers → your app → Access token.',
    scopeLabel: 'Collections to train on',
    scopePlaceholder: 'Getting started, Billing',
    scopeHint: 'Leave empty to read every article, including the unpublished ones.',
  },
  drive: {
    label: 'Google Drive',
    title: 'Connect Google Drive',
    tokenLabel: 'Service account key',
    tokenPlaceholder: 'Paste the JSON key',
    tokenHint: 'Share the folder with the service account, then paste its key.',
    scopeLabel: 'Folder link',
    scopePlaceholder: 'https://drive.google.com/drive/folders/…',
    scopeHint: 'Everything in the folder, including subfolders.',
  },
};
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
  gitbook: 'GitBook',
  intercom: 'Intercom',
  drive: 'Drive',
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

export const SOURCE_KINDS: SourceKind[] = [
  'url',
  'text',
  'file',
  'video',
  'qa',
  ...CONNECTOR_KINDS,
];
export const SOURCE_STATUSES: SourceStatus[] = ['trained', 'training', 'failed'];

/**
 * The "Add Content" menu's rows, in the menu's own order (899:15358 lists URL,
 * Text, File). `qa` is absent because a Q&A is authored on the Custom Answers
 * tab; `video` is the one row the newer frames omit — see SourcesEmptyState.
 */
export const ADDABLE_KINDS: SourceKind[] = ['url', 'text', 'file', 'video', ...CONNECTOR_KINDS];

/**
 * What the file dropzone accepts — PRD-391.
 *
 * Slides and image-rich PDFs are here because that is where a lot of training
 * content actually lives: the account that raised it authors in slides, embeds
 * them, and updates the slides rather than maintaining a parallel text copy.
 * Asking them to flatten it into text is asking them to keep two versions of
 * everything.
 *
 * Note what this does NOT claim. Accepting a deck is not the same as reading
 * one, and the extraction that turns a slide or a scanned page into text is
 * pipeline work no prototype can stand in for. `AddSourceModal` says so on the
 * dropzone rather than letting the file list imply it.
 */
export const ACCEPTED_FILE_TYPES =
  '.pdf,.doc,.docx,.ppt,.pptx,.key,.txt,.md,.csv,.png,.jpg,.jpeg';

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
    /* One connected source in the demo set, so the table shows what a connector
       row looks like beside the crawled ones: same columns, same statuses, no
       special treatment. Its label names the spaces rather than the token,
       which is the rule the form follows — a credential is not a row title. */
    row({
      id: 'demo-gitbook-handbook',
      kind: 'gitbook',
      label: 'GitBook · Ops handbook, Onboarding',
      status: 'trained',
      addedAt: now - 3 * DAY,
      updatedAt: now - 5 * HOUR,
      tokens: 2140,
      usedInResponses: 61,
      chunks: [
        {
          id: 'c1',
          text: 'Ops handbook — how to raise a shift change, who approves it, and what happens if it is rejected.',
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
