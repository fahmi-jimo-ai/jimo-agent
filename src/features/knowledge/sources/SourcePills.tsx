import * as React from 'react';
import { InfoCircle, Refresh2, TickCircle } from 'iconsax-react';
import { Badge } from '@/components/ui/Chip/badge';
import {
  SOURCE_KIND_LABEL,
  SOURCE_STATUS_LABEL,
  type SourceKind,
  type SourceStatus,
} from '@/data/knowledgeSources';
import { kindGlyph } from './kindGlyph';

/**
 * The Type and Status columns — Figma 899:15270 / 899:15272 and siblings.
 *
 * Both are Moji's `Badge` with props, not a hand-rolled span: the artboard's
 * pill IS a Chip/Label, and re-drawing it would silently lose the icon sizing
 * and the type ramp. Three places Moji's own values differ from the artboard,
 * all resolved in Moji's favour per CLAUDE.md:
 *
 *   - every `secondary` badge carries a 1px tinted border the artboard omits;
 *   - `brand` reads --color-blue-500 where the artboard uses --color-blue-400;
 *   - `size="regular"` is the only size on the --text-body-3 ramp the artboard
 *     uses, and it runs ~6px taller than the artboard's 29px. Same call
 *     PropertyTable already made about its row height.
 */

export function SourceKindPill({ kind }: { kind: SourceKind }) {
  return (
    <Badge type="neutral" variant="secondary" size="regular" leftIcon={kindGlyph(kind)}>
      {SOURCE_KIND_LABEL[kind]}
    </Badge>
  );
}

const STATUS_TYPE: Record<SourceStatus, 'positive' | 'brand' | 'negative'> = {
  trained: 'positive',
  training: 'brand',
  failed: 'negative',
};

function statusGlyph(status: SourceStatus): React.ReactNode {
  const props = { size: 20, variant: 'Linear' as const, color: 'currentColor' };
  switch (status) {
    case 'trained':
      return <TickCircle {...props} />;
    case 'training':
      // Spun, because a static refresh glyph next to the word "Training…" reads
      // as a retry button rather than as work in progress.
      return <Refresh2 {...props} className="animate-spin [animation-duration:1.4s]" />;
    case 'failed':
      return <InfoCircle {...props} />;
  }
}

export function SourceStatusPill({ status }: { status: SourceStatus }) {
  return (
    <Badge
      type={STATUS_TYPE[status]}
      variant="secondary"
      size="regular"
      leftIcon={statusGlyph(status)}
    >
      {SOURCE_STATUS_LABEL[status]}
    </Badge>
  );
}
