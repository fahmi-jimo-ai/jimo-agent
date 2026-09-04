import * as React from 'react';
import { Book1, DocumentDownload } from 'iconsax-react';
import { Drawer } from '@/components/app/Drawer';
import { Button } from '@/components/ui/Button/Button';
import { Section } from '@/components/ui/Section/Section';
import { formatAbsolute } from '@/lib/formatRelative';
import { SOURCE_KIND_LABEL, type KnowledgeSource } from '@/data/knowledgeSources';
import { MAX_AUTO_RETRIES } from '@/state/trainingTimers';
import { SourceKindPill, SourceStatusPill } from './SourcePills';

/**
 * "Content Detail" — Figma 932:18232.
 *
 * Two `Section` cards inside a `Drawer`: the definition list, then Data Chunks.
 * The list is plain rows rather than a `Table` — a 160px label column against a
 * free-width value is not a table's shape, and `TableHead`'s 180px minimum
 * would fight it.
 *
 * Two controls the artboard draws with nothing behind them, so both acknowledge
 * the click and stop, the way `Test Knowledge` already does on this page:
 * "Learning AI Knowledge Content" (932:18270) and the chunk export button
 * (932:18278).
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

export function SourceDetailDrawer({
  source,
  onClose,
  onOutOfScope,
}: {
  source: KnowledgeSource;
  onClose: () => void;
  onOutOfScope: (what: string) => void;
}) {
  const linkable = source.href != null && source.kind !== 'text' && source.kind !== 'qa';

  return (
    <Drawer title="Content Detail" onClose={onClose}>
      <Section className="gap-[var(--space-6)]">
        <div className="flex flex-col gap-[var(--space-6)]">
          <Row label="Type">
            <SourceKindPill kind={source.kind} />
          </Row>
          <Row label={linkable ? SOURCE_KIND_LABEL[source.kind] : 'Content'}>
            {linkable ? (
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-[var(--color-blue-400)] underline"
              >
                {source.label}
              </a>
            ) : (
              source.label
            )}
          </Row>
          <Row label="Status">
            <SourceStatusPill status={source.status} />
          </Row>
          {/* PRD-390: the drawer is where someone lands after the banner, so it
              is where the two facts a failure raises have to be answerable —
              why it broke, and what is being served meanwhile. Both are absent
              on a healthy row rather than rendered empty. */}
          {source.lastError && <Row label="Last sync">{source.lastError}</Row>}
          {source.status === 'failed' && (source.failedAttempts ?? 0) > 0 && (
            <Row label="Failed attempts">
              {source.failedAttempts}
              {(source.failedAttempts ?? 0) >= MAX_AUTO_RETRIES && ' — retries stopped'}
            </Row>
          )}
          {source.lastTrainedAt != null && (
            <Row label="Answering from">{formatAbsolute(source.lastTrainedAt)}</Row>
          )}
          <Row label="Added at">{formatAbsolute(source.addedAt)}</Row>
          <Row label="Added by">
            <span className="flex items-center gap-[var(--space-2)]">
              {/* The artboard has a photo; a token-coloured initial is the
                  honest stand-in rather than shipping someone's headshot. */}
              <span
                aria-hidden="true"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-blue-100)] [font:var(--text-body-4)] text-[var(--color-blue-400)]"
              >
                {source.addedBy.slice(0, 1) || '?'}
              </span>
              {source.addedBy}
            </span>
          </Row>
          <Row label="Used in responses">
            {source.usedInResponses} {source.usedInResponses === 1 ? 'time' : 'times'}
          </Row>
          <Row label="Token used">{source.tokens.toLocaleString('en-GB')}</Row>
        </div>

        <div className="flex justify-center">
          <Button
            variant="link"
            leftIcon={<Book1 size={20} variant="Linear" color="currentColor" />}
            onClick={() => onOutOfScope('Learning AI Knowledge Content')}
          >
            Learning AI Knowledge Content
          </Button>
        </div>
      </Section>

      <Section
        title="Data Chunks"
        controls={
          <Button
            variant="outline"
            size="icon"
            aria-label="Export data chunks"
            leftIcon={<DocumentDownload size={24} variant="Linear" color="currentColor" />}
            onClick={() => onOutOfScope('Exporting data chunks')}
          />
        }
      >
        {source.chunks.length > 0 ? (
          <div className="flex flex-col gap-[var(--space-3)]">
            {source.chunks.map((chunk) => (
              <p
                key={chunk.id}
                className="m-0 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] px-[var(--space-4)] py-[var(--space-3)] [font:var(--text-body-2)] text-[var(--color-text-primary)]"
              >
                {chunk.text}
              </p>
            ))}
          </div>
        ) : (
          <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            {source.status === 'failed'
              ? 'Training failed, so nothing was extracted. Retry it from the table.'
              : 'Chunks appear once training finishes.'}
          </p>
        )}
      </Section>
    </Drawer>
  );
}
