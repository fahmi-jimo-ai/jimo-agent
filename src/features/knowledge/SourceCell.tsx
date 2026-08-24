import * as React from 'react';
import { JimoMark } from '@/components/brand/JimoMark';
import { SOURCE_LABEL, type PropertySource } from '@/data/userProperties';

/**
 * The Source column. A Jimo-sourced property gets the mark in a bordered
 * 24-square before the label (Figma 887:11759); a custom attribute is the bare
 * word, with no mark — there is no vendor to badge.
 */
export function SourceCell({ source }: { source: PropertySource }) {
  return (
    <span className="inline-flex items-center gap-[var(--space-2)]">
      {source === 'jimo' && (
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-neutral-white)] text-[var(--color-text-primary)]">
          <JimoMark size={16} />
        </span>
      )}
      {SOURCE_LABEL[source]}
    </span>
  );
}
