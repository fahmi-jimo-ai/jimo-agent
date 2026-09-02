import * as React from 'react';
import { DocumentCopy, DocumentUpload, Global, Link2, Trash } from 'iconsax-react';
import { ModalCard } from '@/components/app/ModalCard';
import { Menu } from '@/components/app/Menu';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Alert } from '@/components/ui/Infobox/alert';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import {
  CURRENT_AUTHOR,
  makeSourceId,
  SOURCE_KIND_LABEL,
  type KnowledgeSource,
  type SourceKind,
} from '@/data/knowledgeSources';
import { ChoiceCard } from './ChoiceCard';
import { UrlRuleRows, makeRule, type UrlRule } from './UrlRuleRows';

/**
 * "Add … Content" — Figma 932:20126 (URL), 932:20329 / 932:20753 (URL by
 * domain), 932:21800 (Text), 932:19936 (Video). File is not designed; see below.
 *
 * ## One card, one step per kind
 *
 * CLAUDE.md forbids a dialog over a dialog, so this is ONE `ModalCard` whose
 * `step` is the kind being added. Changing kind cross-slides the interior and
 * eases the height, which is the whole reason `step` exists.
 *
 * ## Cancel, not Back
 *
 * Every artboard's footer reads **Back / Train**, which implies a type-picker
 * step ahead of the form. The newer design picks the type in the Add Content
 * menu (899:15358) and from the empty-state cards, so there is nothing behind
 * this card to go back to — a menu that picks the kind followed by a card that
 * asks it again is worse than either. The button is therefore **Cancel**, and
 * this note is why the artboard and the build disagree.
 *
 * ## Kinds the artboards do not connect
 *
 * `video` has a designed dialog but no way in from the new frames; it is
 * reachable here because the Add Content menu carries a fourth row. `file` has
 * no design at all — the artboard in its place (932:21990) is a pasted
 * screenshot — so the dropzone below is invented, built from the same border
 * and radius tokens `ChoiceCard` uses so it reads as part of the same dialog.
 */

export type AddSourceDraft = {
  kind: SourceKind;
  /** Set when the card was opened by a row's edit button. */
  editing?: KnowledgeSource;
};

type UrlMode = 'domain' | 'individual';
type Retrieve = 'all' | 'specific';

const RETRIEVE_LABEL: Record<Retrieve, string> = {
  all: 'All pages in this domain',
  specific: 'Only pages matching a rule',
};

const TITLE: Record<SourceKind, string> = {
  url: 'Add URL Content',
  text: 'Add Text Content',
  file: 'Add File Content',
  video: 'Add Video Content',
  qa: 'Add Q&A Content',
  // Not "Add Article Content": the other five ADD something that exists
  // elsewhere, this one WRITES it. The verb is the difference PRD-590 is about.
  hosted: 'Write an article',
};

/** 932:19941 — the three hosts the supportive line names. */
const VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'loom.com', 'vimeo.com'];

function isVideoUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  return VIDEO_HOSTS.some((host) => v.includes(host));
}

/** `https://` is implied by the field, so a bare host is still a URL. */
function normalizeUrl(value: string): string {
  const v = value.trim();
  if (!v) return v;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function baseSource(kind: SourceKind, label: string, href?: string): KnowledgeSource {
  const now = Date.now();
  return {
    id: makeSourceId(kind),
    kind,
    label,
    href,
    status: 'training',
    addedAt: now,
    updatedAt: now,
    addedBy: CURRENT_AUTHOR,
    // Invented, and labelled as such: a plausible token cost, since nothing
    // upstream defines one. Roughly a token per four characters, floored so a
    // one-line source is never free.
    tokens: Math.max(40, Math.round(label.length / 4) * 10),
    usedInResponses: 0,
    chunks: [{ id: 'c1', text: label }],
  };
}

export function AddSourceModal({
  draft,
  onClose,
  onSubmit,
  onUpdate,
}: {
  draft: AddSourceDraft;
  onClose: () => void;
  onSubmit: (sources: KnowledgeSource[]) => void;
  onUpdate: (id: string, patch: Partial<KnowledgeSource>) => void;
}) {
  const { kind, editing } = draft;

  const [name, setName] = React.useState('');
  const [urlMode, setUrlMode] = React.useState<UrlMode>('individual');
  const [urlList, setUrlList] = React.useState('');
  const [domain, setDomain] = React.useState('');
  const [retrieve, setRetrieve] = React.useState<Retrieve>('all');
  const [retrieveOpen, setRetrieveOpen] = React.useState(false);
  const [rules, setRules] = React.useState<UrlRule[]>([makeRule()]);
  const [text, setText] = React.useState(editing?.label ?? '');
  // `hosted` is the one kind with a title AND a body, so it cannot reuse
  // `text`'s single field: the title is what a reader picks from a list, the
  // body is what they then read.
  const [articleTitle, setArticleTitle] = React.useState(editing?.label ?? '');
  const [articleBody, setArticleBody] = React.useState(editing?.body ?? '');
  const [video, setVideo] = React.useState('');
  const [files, setFiles] = React.useState<{ id: string; name: string; size: number }[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const urlLines = urlList
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const videoInvalid = video.trim().length > 0 && !isVideoUrl(video);

  const canTrain = (() => {
    switch (kind) {
      case 'url':
        return urlMode === 'individual' ? urlLines.length > 0 : domain.trim().length > 0;
      case 'text':
      case 'qa':
        return text.trim().length > 0;
      case 'video':
        return video.trim().length > 0 && !videoInvalid;
      case 'file':
        return files.length > 0;
      case 'hosted':
        return articleTitle.trim().length > 0 && articleBody.trim().length > 0;
    }
  })();

  const submit = () => {
    if (!canTrain) return;

    if (editing) {
      // An article edits both halves; every other editable kind is one field.
      if (kind === 'hosted') {
        onUpdate(editing.id, {
          label: articleTitle.trim(),
          body: articleBody.trim(),
          status: 'training',
          updatedAt: Date.now(),
          chunks: [{ id: 'c1', text: articleBody.trim() }],
        });
        return;
      }
      onUpdate(editing.id, {
        label: text.trim(),
        status: 'training',
        updatedAt: Date.now(),
        chunks: [{ id: 'c1', text: text.trim() }],
      });
      return;
    }

    const label = name.trim();
    switch (kind) {
      case 'url': {
        if (urlMode === 'individual') {
          // One source per line — the supportive text promises exactly that.
          onSubmit(
            urlLines.map((line) => {
              const href = normalizeUrl(line);
              return baseSource('url', label && urlLines.length === 1 ? label : href, href);
            }),
          );
        } else {
          const href = normalizeUrl(domain);
          const matched = retrieve === 'specific' ? rules.filter((r) => r.value.trim()) : [];
          const suffix = matched.length ? ` (${matched.length} rule${matched.length > 1 ? 's' : ''})` : '';
          onSubmit([baseSource('url', (label || href) + suffix, href)]);
        }
        break;
      }
      case 'text':
      case 'qa':
        onSubmit([baseSource(kind, label || text.trim())]);
        break;
      case 'video': {
        const href = normalizeUrl(video);
        onSubmit([baseSource('video', label || href, href)]);
        break;
      }
      case 'file':
        onSubmit(files.map((f) => baseSource('file', f.name, '#')));
        break;
      case 'hosted': {
        // No href — see SourceKind. The body is both what end users read and
        // what the agent trains on, which is the point of the kind: one record,
        // two consumers.
        const article = baseSource('hosted', articleTitle.trim());
        onSubmit([{ ...article, body: articleBody.trim(), chunks: [{ id: 'c1', text: articleBody.trim() }] }]);
        break;
      }
    }
  };

  const takeFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((cur) => [
      ...cur,
      ...Array.from(list).map((f, i) => ({
        id: `${f.name}-${cur.length + i}`,
        name: f.name,
        size: f.size,
      })),
    ]);
  };

  const nameField = (
    <Input
      label="Name (Optional)"
      placeholder="Landing Page Data"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );

  const body = (() => {
    switch (kind) {
      case 'url':
        return (
          <div className="flex flex-col gap-[var(--space-4)]">
            {nameField}
            <div className="flex flex-col gap-[var(--space-2)]">
              <span className="[font:var(--text-body-3)] text-[var(--color-text-primary)]">Type</span>
              <div className="flex gap-[var(--space-3)]">
                <ChoiceCard
                  title="Domain"
                  description="Add URLs from a domain"
                  icon={<Global size={20} variant="Linear" color="currentColor" />}
                  selected={urlMode === 'domain'}
                  onClick={() => setUrlMode('domain')}
                />
                <ChoiceCard
                  title="Individual URLs"
                  description="Add multiple URLs manually"
                  icon={<Link2 size={20} variant="Bold" color="currentColor" />}
                  selected={urlMode === 'individual'}
                  onClick={() => setUrlMode('individual')}
                />
              </div>
            </div>

            {urlMode === 'individual' ? (
              <Input
                inputType="textarea"
                label="List of URLs"
                supportiveText="Enter one URL per line."
                placeholder={'usejimo.com/pricing\nusejimo.com/product-tours'}
                className="[&_textarea]:min-h-[110px]"
                value={urlList}
                onChange={(e) => setUrlList(e.target.value)}
              />
            ) : (
              <>
                <Input
                  label="Domain"
                  placeholder="https://"
                  leftIcon={<Global size={24} variant="Linear" color="currentColor" />}
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
                <Menu
                  className="w-full"
                  open={retrieveOpen}
                  onClose={() => setRetrieveOpen(false)}
                  menuClassName="min-w-[280px]"
                  trigger={
                    <Input
                      inputType="dropdown"
                      label="Retrieve page"
                      readOnly
                      className="w-full cursor-pointer [&_input]:cursor-pointer"
                      leftIcon={<DocumentCopy size={24} variant="Linear" color="currentColor" />}
                      value={RETRIEVE_LABEL[retrieve]}
                      onClick={() => setRetrieveOpen((o) => !o)}
                    />
                  }
                >
                  {(Object.keys(RETRIEVE_LABEL) as Retrieve[]).map((value) => (
                    <DropdownMenuList
                      key={value}
                      text={RETRIEVE_LABEL[value]}
                      state={retrieve === value ? 'selected' : 'default'}
                      onClick={() => {
                        setRetrieve(value);
                        setRetrieveOpen(false);
                      }}
                    />
                  ))}
                </Menu>
                {retrieve === 'specific' && <UrlRuleRows rules={rules} onChange={setRules} />}
              </>
            )}
          </div>
        );

      case 'text':
      case 'qa':
        return (
          <div className="flex flex-col gap-[var(--space-4)]">
            {!editing && nameField}
            <Input
              inputType="textarea"
              label={kind === 'qa' ? 'Answer' : 'Text'}
              supportiveText="Type an information that will be a good knowledge to train the AI"
              placeholder="Tours in Jimo focused on action-based onboarding"
              className="[&_textarea]:min-h-[110px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        );

      case 'hosted':
        return (
          <div className="flex flex-col gap-[var(--space-4)]">
            <Input
              label="Title"
              placeholder="How billing works"
              supportiveText="What end users see in the list before they open it."
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
            />
            <Input
              inputType="textarea"
              label="Article"
              supportiveText="Written here, stored here. The agent trains on it and your end users read it — the same text, never a public page."
              placeholder={
                'Invoices are issued on the first working day of each month.\n\nPayment is due within 30 days.'
              }
              className="[&_textarea]:min-h-[180px]"
              value={articleBody}
              onChange={(e) => setArticleBody(e.target.value)}
            />
            {/* The reassurance IS the feature. Gojob's blocker was never
                authoring — it was that every route to a reading surface went
                through a public URL or somebody else's tool. */}
            <Alert
              type="neutral"
              title="Private by construction"
              body="An article has no public address. It is served inside your product, to users you have already signed in — so there is nothing for a search engine or a competitor to crawl."
            />
          </div>
        );

      case 'video':
        return (
          <Input
            label="URL"
            placeholder="https://youtube.com/yourvideo"
            // The supportive line is the same either way — it is the rule, and
            // `status` is what turns it red once the rule is broken.
            supportiveText="Only support links from Youtube, Loom, and Vimeo."
            status={videoInvalid ? 'negative' : 'none'}
            leftIcon={<Link2 size={24} variant="Bold" color="currentColor" />}
            value={video}
            onChange={(e) => setVideo(e.target.value)}
          />
        );

      case 'file':
        return (
          <div className="flex flex-col gap-[var(--space-3)]">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                takeFiles(e.dataTransfer.files);
              }}
              className={
                'flex flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-md)] ' +
                'border border-dashed px-[var(--space-4)] py-[var(--space-8)] ' +
                '[transition:background-color_var(--transition-fast),border-color_var(--transition-fast)] ' +
                (dragging
                  ? 'border-[var(--color-blue-400)] bg-[var(--color-blue-100)]'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-default)] hover:bg-[var(--color-bg-muted)]')
              }
            >
              <DocumentUpload size={32} variant="Linear" color="currentColor" />
              <span className="[font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
                Drop files, or click to browse
              </span>
              <span className="[font:var(--text-body-3)] text-[var(--color-neutral-700)]">
                PDF, DOCX, TXT and Markdown.
              </span>
            </button>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              className="sr-only"
              onChange={(e) => takeFiles(e.target.files)}
            />
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-[var(--space-4)] py-[var(--space-3)]"
              >
                <span className="min-w-0 flex-1 truncate [font:var(--text-body-3)] text-[var(--color-text-primary)]">
                  {file.name}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  danger
                  aria-label={`Remove ${file.name}`}
                  leftIcon={<Trash size={16} variant="Linear" color="currentColor" />}
                  onClick={() => setFiles((cur) => cur.filter((f) => f.id !== file.id))}
                />
              </div>
            ))}
          </div>
        );
    }
  })();

  return (
    <ModalCard
      title={editing ? `Edit ${SOURCE_KIND_LABEL[kind]} Content` : TITLE[kind]}
      onClose={onClose}
      step={`${kind}${urlMode}${retrieve}`}
      footer={
        <div className="flex items-center justify-end gap-[var(--space-3)]">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!canTrain} onClick={submit}>
            Train
          </Button>
        </div>
      }
    >
      {body}
    </ModalCard>
  );
}
