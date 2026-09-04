import * as React from 'react';
import { type SourceKind } from '@/data/knowledgeSources';
import { ChoiceCard } from './ChoiceCard';
import { kindGlyph } from './kindGlyph';

/**
 * "Sources to train" with nothing in it — Figma 899:15517.
 *
 * The artboard draws three cards (Add URLs / Upload Files / Add Texts). The
 * fourth, Video, is an extension of the artboard, for the same reason the Add
 * Content menu carries one: the file designs an Add Video Content dialog
 * (932:19936) and a sticky note explaining that the transcript is what trains,
 * but the newer frames predate it and offer no way in. Labelled here rather
 * than left to be mistaken for the artboard.
 *
 * The order is this frame's — URLs, Files, Texts — and it is deliberately NOT
 * the Add Content menu's (URL, Text, File, 899:15358). The two artboards
 * disagree, and each is right about its own frame, so each keeps its own list.
 *
 * The three connectors are a second extension, on the same footing as Video and
 * for a blunter reason: a workspace with nothing in it is exactly where someone
 * whose documentation is behind a login gives up, and the card that says "we can
 * read that" has to be visible before they conclude otherwise.
 */
const ORDER: SourceKind[] = ['url', 'file', 'text', 'video', 'gitbook', 'intercom', 'drive'];

const COPY: Record<SourceKind, { title: string; description: string }> = {
  url: { title: 'Add URLs', description: 'Pull content directly from web pages' },
  file: { title: 'Upload Files', description: 'Extract data from documents' },
  text: { title: 'Add Texts', description: 'Add custom text content' },
  // Extension — the wording follows the three above.
  video: { title: 'Add Videos', description: 'Train on a video transcript' },
  qa: { title: 'Add Q&A', description: 'Author an answer by hand' },
  // Each says what it unlocks, not what it is: the point of every one of these
  // is content the public crawler cannot reach.
  gitbook: { title: 'Connect GitBook', description: 'Train on private spaces' },
  intercom: { title: 'Connect Intercom', description: 'Train on unpublished articles' },
  drive: { title: 'Connect Drive', description: 'Train on a shared folder' },
};

export function SourcesEmptyState({ onPick }: { onPick: (kind: SourceKind) => void }) {
  return (
    <div className="flex flex-wrap gap-[var(--space-2)] px-[var(--space-4)]">
      {ORDER.map((kind) => (
        <ChoiceCard
          key={kind}
          title={COPY[kind].title}
          description={COPY[kind].description}
          icon={kindGlyph(kind)}
          onClick={() => onPick(kind)}
          className="min-w-[220px]"
        />
      ))}
    </div>
  );
}
