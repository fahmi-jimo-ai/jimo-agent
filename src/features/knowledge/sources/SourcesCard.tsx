import * as React from 'react';
import { Add } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { Button } from '@/components/ui/Button/Button';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import { Menu } from '@/components/app/Menu';
import { PropertyEmptyState } from '../PropertyEmptyState';
import { SourceTable } from './SourceTable';
import { SourceToolbar, type KindFilter, type StatusFilter } from './SourceToolbar';
import { SourcesEmptyState } from './SourcesEmptyState';
import { kindGlyph } from './kindGlyph';
import {
  ADDABLE_KINDS,
  SOURCE_KIND_LABEL,
  type KnowledgeSource,
  type SourceKind,
} from '@/data/knowledgeSources';

/**
 * "Sources to train" — Figma 899:14870 (empty) and 899:15243 (populated).
 *
 * Three body states, the same shape UserContextSection already uses:
 *   - nothing added: the entry cards, no toolbar. There is nothing to search.
 *   - added: toolbar, then the table.
 *   - nothing matches: the toolbar stays and the table is replaced.
 *
 * `flushBody` because the body is a `Table` (Table/CONTEXT.md), which is why
 * the toolbar and the entry cards carry their own --space-4 inset: it puts them
 * on the table's first cell rather than on the card's 8px edge.
 *
 * The Add Content menu is Figma 899:15358 — three rows there, four here, since
 * Video has a designed dialog and no other way in. Marked as an extension in
 * SourcesEmptyState, which carries the matching fourth card.
 */
export function SourcesCard({
  sources,
  search,
  onSearch,
  kind,
  onKind,
  status,
  onStatus,
  onAdd,
  onOpen,
  onEdit,
  onRetry,
  onRemove,
}: {
  sources: KnowledgeSource[];
  search: string;
  onSearch: (value: string) => void;
  kind: KindFilter;
  onKind: (value: KindFilter) => void;
  status: StatusFilter;
  onStatus: (value: StatusFilter) => void;
  onAdd: (kind: SourceKind) => void;
  onOpen: (source: KnowledgeSource) => void;
  onEdit: (source: KnowledgeSource) => void;
  onRetry: (source: KnowledgeSource) => void;
  onRemove: (source: KnowledgeSource) => void;
}) {
  const [addOpen, setAddOpen] = React.useState(false);

  const q = search.trim().toLowerCase();
  const shown = sources.filter((s) => {
    const byKind = kind === 'all' || s.kind === kind;
    const byStatus = status === 'all' || s.status === status;
    const byQuery = !q || s.label.toLowerCase().includes(q);
    return byKind && byStatus && byQuery;
  });

  const hasAny = sources.length > 0;

  return (
    <Section
      flushBody
      title="Sources to train"
      description="Resources to train the AIs knowledge for accurate summarization."
      controls={
        <Menu
          open={addOpen}
          onClose={() => setAddOpen(false)}
          align="right"
          trigger={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
              onClick={() => setAddOpen((o) => !o)}
            >
              Add Content
            </Button>
          }
        >
          {ADDABLE_KINDS.map((value) => (
            <DropdownMenuList
              key={value}
              text={SOURCE_KIND_LABEL[value]}
              icon={kindGlyph(value)}
              onClick={() => {
                setAddOpen(false);
                onAdd(value);
              }}
            />
          ))}
        </Menu>
      }
    >
      {hasAny ? (
        <div className="flex flex-col gap-[var(--space-4)]">
          <SourceToolbar
            search={search}
            onSearch={onSearch}
            kind={kind}
            onKind={onKind}
            status={status}
            onStatus={onStatus}
          />
          {shown.length > 0 ? (
            <SourceTable
              sources={shown}
              onOpen={onOpen}
              onEdit={onEdit}
              onRetry={onRetry}
              onRemove={onRemove}
            />
          ) : (
            <PropertyEmptyState title="No content found" />
          )}
        </div>
      ) : (
        <SourcesEmptyState onPick={onAdd} />
      )}
    </Section>
  );
}
