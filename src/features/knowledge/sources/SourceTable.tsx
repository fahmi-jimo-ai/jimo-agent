import * as React from 'react';
import { Edit2, Refresh2, Trash } from 'iconsax-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table/Table';
import { Button } from '@/components/ui/Button/Button';
import { formatRelative } from '@/lib/formatRelative';
import type { KnowledgeSource } from '@/data/knowledgeSources';
import { SourceKindPill, SourceStatusPill } from './SourcePills';

/**
 * The Sources table — Figma 899:15214 / 899:15264.
 *
 * `scroll={false}` and a `Section flushBody` around it, per Table/CONTEXT.md:
 * the card is not a scroll region, and the artboard measures out to exactly the
 * flushBody rhythm (984 of table inside a 1000 card = 8px card gutters, header
 * inset 16 → the usual 24px content line). `PropertyTable`'s FLUSH_EDGES trick
 * is the other way to get there and is NOT used here — it exists because that
 * card has a search row on the content box, not on the table's cell inset.
 *
 * `TableRow interactive` is already the artboard's hovered first row
 * (--color-neutral-100, --radius-lg), so the highlight is Moji's, not local.
 *
 * ## The Added column
 *
 * The artboard's header (899:15258) puts FIVE labels — Content, Type, Status,
 * Updated, Added — over rows that hold four values and then the action buttons,
 * so "Added" sits above the buttons and no row has an Added value. Both halves
 * cannot be right. Since a source knows both when it was added and when it was
 * last trained, the resolution is a real Added column plus a sixth, unlabelled
 * actions column — the same shape PropertyTable already uses for its actions.
 *
 * ## Row actions
 *
 * Straight off the artboard: `failed` gets retry + delete (899:15320/15321),
 * text and Q&A get edit + delete (899:15332/15333), everything else gets delete
 * alone (899:15275). Delete is immediate, matching how UserContextSection
 * removes a property — no confirm dialog is drawn anywhere in the file.
 *
 * **Additive fork, PRD-619:** `url` now gets Edit too. No artboard draws this —
 * the artboard predates the ticket — but the row's own `editable` condition
 * already covers exactly one thing per kind, and a source whose URL list is
 * frozen the moment it's created (delete-and-rebuild is the only fix today)
 * is the same shape of gap text/qa already had. See `AddSourceModal`'s header
 * comment for how editing a `url` row differs from editing text/qa.
 */
export function SourceTable({
  sources,
  now = Date.now(),
  onOpen,
  onEdit,
  onRetry,
  onRemove,
}: {
  sources: KnowledgeSource[];
  /** One clock for every row, so two rows added together always agree. */
  now?: number;
  onOpen: (source: KnowledgeSource) => void;
  onEdit: (source: KnowledgeSource) => void;
  onRetry: (source: KnowledgeSource) => void;
  onRemove: (source: KnowledgeSource) => void;
}) {
  // The row is the drawer's trigger, so an action button inside it has to stop
  // the click before it bubbles or every delete would also open the panel.
  const act = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <Table scroll={false}>
      <TableHeader>
        <TableRow>
          <TableHead>Content</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Added</TableHead>
          {/* Buttons, not a 180px data column — see the header comment. */}
          <TableHead className="w-[1%] min-w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sources.map((source) => {
          const linkable = source.href != null && source.kind !== 'text' && source.kind !== 'qa';
          const editable = source.kind === 'text' || source.kind === 'qa' || source.kind === 'url';

          return (
            <TableRow key={source.id} interactive onClick={() => onOpen(source)}>
              <TableCell className="max-w-[240px]">
                {linkable ? (
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block truncate text-[var(--color-blue-400)] underline"
                  >
                    {source.label}
                  </a>
                ) : (
                  <span className="block truncate text-[var(--color-text-primary)]">
                    {source.label}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <SourceKindPill kind={source.kind} />
              </TableCell>
              <TableCell>
                <SourceStatusPill status={source.status} />
              </TableCell>
              <TableCell>{formatRelative(source.updatedAt, now)}</TableCell>
              <TableCell>{formatRelative(source.addedAt, now)}</TableCell>
              <TableCell className="w-[1%] min-w-0">
                <span className="flex items-center justify-end gap-[var(--space-2)]">
                  {source.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Retry training ${source.label}`}
                      leftIcon={<Refresh2 size={16} variant="Linear" color="currentColor" />}
                      onClick={act(() => onRetry(source))}
                    />
                  )}
                  {editable && (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Edit ${source.label}`}
                      leftIcon={<Edit2 size={16} variant="Linear" color="currentColor" />}
                      onClick={act(() => onEdit(source))}
                    />
                  )}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    danger
                    aria-label={`Delete ${source.label}`}
                    leftIcon={<Trash size={16} variant="Linear" color="currentColor" />}
                    onClick={act(() => onRemove(source))}
                  />
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
