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
 */
const ORDER: SourceKind[] = ['url', 'file', 'text', 'video', 'hosted'];

const COPY: Record<SourceKind, { title: string; description: string }> = {
  url: { title: 'Add URLs', description: 'Pull content directly from web pages' },
  file: { title: 'Upload Files', description: 'Extract data from documents' },
  text: { title: 'Add Texts', description: 'Add custom text content' },
  // Extension — the wording follows the three above.
  video: { title: 'Add Videos', description: 'Train on a video transcript' },
  qa: { title: 'Add Q&A', description: 'Author an answer by hand' },
  // Second extension (PRD-590), and the one card here that is not about
  // ingesting something you already have — which is why an empty workspace is
  // exactly where it belongs.
  hosted: { title: 'Write Articles', description: 'Private pages your users can read' },
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
