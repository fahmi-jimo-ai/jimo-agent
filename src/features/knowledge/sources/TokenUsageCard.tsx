import * as React from 'react';
import { Section } from '@/components/ui/Section/Section';
import { Meter } from '@/components/app/Meter';
import { TOKEN_QUOTA, type KnowledgeSource } from '@/data/knowledgeSources';

/**
 * "Token Usage" — Figma 932:18221.
 *
 * The artboard contradicts itself: the caption reads "320,000 / 100,000
 * Tokens" — over quota — while the bar is filled to roughly 15%. Only one half
 * can survive, and the quota is the half stated as a rule in the body copy
 * ("You have maximum of 100,000 Tokens…"), so it stays at 100,000 and the used
 * figure is summed from the real rows instead. `Meter` clamps its fill, so a
 * workspace that does go over reads "142,000 / 100,000" against a full bar
 * rather than a bar that overflows its own track.
 */
export function TokenUsageCard({ sources }: { sources: KnowledgeSource[] }) {
  const used = sources.reduce((sum, s) => sum + s.tokens, 0);

  return (
    <Section
      title="Token Usage"
      description="You have maximum of 100,000 Tokens to train your content based on your current plan"
    >
      <div className="flex flex-col gap-[var(--space-2)]">
        <Meter value={used} max={TOKEN_QUOTA} />
        <p className="m-0 [font:var(--text-body-3)] text-[var(--color-neutral-700)]">
          {used.toLocaleString('en-GB')} / {TOKEN_QUOTA.toLocaleString('en-GB')} Tokens
        </p>
      </div>
    </Section>
  );
}
