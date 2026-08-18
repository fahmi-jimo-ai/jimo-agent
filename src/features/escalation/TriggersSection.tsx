import * as React from 'react';
import { Personalcard, MessageRemove, EmojiSad } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { Button } from '@/components/ui/Button/Button';
import { TriggerCard } from './TriggerCard';
import { InlineTokenSelect, type TokenOption } from './InlineTokenSelect';
import { useToast } from './toast';
import { useEscalation, setState } from '@/state/useEscalation';
import type { FailedCount, FrustrationLevel, Triggers } from '@/state/types';

const COUNT_OPTIONS: TokenOption<FailedCount>[] = [
  { value: 1, label: 'Once', severity: 1 },
  { value: 2, label: 'Twice in a row', severity: 2 },
  { value: 3, label: 'Three times in a row', severity: 3 },
];
/** The pill wears a compact form of the option; the menu wears the full one. */
const COUNT_TOKEN: Record<FailedCount, string> = { 1: 'once', 2: 'twice', 3: 'three times' };

const LEVEL_OPTIONS: TokenOption<FrustrationLevel>[] = [
  { value: 'subtle', label: 'Subtle annoyance', severity: 1 },
  { value: 'slight', label: 'Slight frustration', severity: 2 },
  { value: 'furious', label: 'Furious', severity: 3 },
];
const LEVEL_TOKEN: Record<FrustrationLevel, string> = {
  subtle: 'subtle annoyance',
  slight: 'slight frustration',
  furious: 'furious',
};

const sameTriggers = (a: Triggers, b: Triggers) => JSON.stringify(a) === JSON.stringify(b);

export function TriggersSection() {
  const { triggers, draftTriggers } = useEscalation();
  const toast = useToast();
  const dirty = !sameTriggers(triggers, draftTriggers);

  const patch = (p: Partial<Triggers>) =>
    setState((s) => ({ draftTriggers: { ...s.draftTriggers, ...p } }));

  const confirm = () => {
    setState((s) => ({ triggers: s.draftTriggers }));
    toast({ type: 'positive', title: 'Escalation triggers updated successfully' });
  };

  return (
    <Section
      title="Escalation Triggers"
      description="Moments when the Agent should escalate to the support tool"
      // The Confirm button only exists while there is something to confirm —
      // Figma draws the section without it until a card is edited (29:17917).
      controls={dirty ? <Button onClick={confirm}>Confirm</Button> : undefined}
    >
      <div className="flex items-stretch gap-[var(--space-4)]">
        <TriggerCard
          tone="green"
          icon={<Personalcard size={18} variant="Bold" color="currentColor" />}
          title="On explicit request"
          description="Escalate as soon as the user asks for a person, however they word it."
          checked={draftTriggers.explicit.on}
          onCheckedChange={(on) => patch({ explicit: { on } })}
        />

        <TriggerCard
          tone="purple"
          icon={<MessageRemove size={18} variant="Bold" color="currentColor" />}
          title={
            <>
              <span>User says it didn&apos;t work</span>
              <InlineTokenSelect
                value={draftTriggers.failedAnswers.count}
                options={COUNT_OPTIONS}
                label={COUNT_TOKEN[draftTriggers.failedAnswers.count]}
                disabled={!draftTriggers.failedAnswers.on}
                onChange={(count) =>
                  patch({ failedAnswers: { ...draftTriggers.failedAnswers, count } })
                }
              />
            </>
          }
          description="Escalate after the user tells the Agent its answer missed."
          checked={draftTriggers.failedAnswers.on}
          onCheckedChange={(on) => patch({ failedAnswers: { ...draftTriggers.failedAnswers, on } })}
        />

        <TriggerCard
          tone="red"
          icon={<EmojiSad size={18} variant="Bold" color="currentColor" />}
          title={
            <>
              <span>User shows a</span>
              <InlineTokenSelect
                value={draftTriggers.frustration.level}
                options={LEVEL_OPTIONS}
                label={LEVEL_TOKEN[draftTriggers.frustration.level]}
                disabled={!draftTriggers.frustration.on}
                align="right"
                onChange={(level) => patch({ frustration: { ...draftTriggers.frustration, level } })}
              />
            </>
          }
          description="Escalate when the user tone of voice degrades negatively."
          checked={draftTriggers.frustration.on}
          onCheckedChange={(on) => patch({ frustration: { ...draftTriggers.frustration, on } })}
        />
      </div>
    </Section>
  );
}
