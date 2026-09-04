import * as React from 'react';
import {
  Book1,
  Document,
  FolderCloud,
  Global,
  MessageQuestion,
  Messages2,
  TextalignJustifyleft,
  VideoPlay,
} from 'iconsax-react';
import type { SourceKind } from '@/data/knowledgeSources';

/**
 * One glyph per source kind, so the Type pill, the Add Content menu, the empty
 * state cards and the drawer cannot drift from each other.
 *
 * Figma names → iconsax, all verified against the package's exports:
 *   global → Global · document → Document · textalign-justifyleft →
 *   TextalignJustifyleft · video-play → VideoPlay · question-circle →
 *   MessageQuestion.
 *
 * One artboard slip corrected: the empty state's "Add Texts" card (899:15536)
 * reuses the globe, which is the URL glyph. Every other frame in the file draws
 * Text with textalign-justifyleft, so that is what wins here.
 */
export function kindGlyph(kind: SourceKind, size = 20): React.ReactNode {
  const props = { size, variant: 'Linear' as const, color: 'currentColor' };
  switch (kind) {
    case 'url':
      return <Global {...props} />;
    case 'file':
      return <Document {...props} />;
    case 'text':
      return <TextalignJustifyleft {...props} />;
    case 'video':
      return <VideoPlay {...props} />;
    case 'qa':
      return <MessageQuestion {...props} />;
    // The three connectors get a glyph for what the tool IS rather than a brand
    // mark: this file has no logo assets, and a wrong-shaped logo drawn from
    // memory is worse than an honest generic. Book for a docs site, a chat
    // bubble for a help desk, a cloud folder for a drive.
    case 'gitbook':
      return <Book1 {...props} />;
    case 'intercom':
      return <Messages2 {...props} />;
    case 'drive':
      return <FolderCloud {...props} />;
  }
}
