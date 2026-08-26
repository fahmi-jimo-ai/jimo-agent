import * as React from 'react';
import { Section } from '@/components/ui/Section/Section';
import { SecondaryHorizontalMenuGroup } from '@/components/ui/SecondaryHorizontalMenuGroup/SecondaryHorizontalMenuGroup';
import type { RetrainFrequency } from '@/state/knowledgeStore';

/**
 * "Auto retraining frequency" — Figma 899:14864 / 899:14869.
 *
 * The picker the artboard names DesignPicker/SingleChoicePicker IS Moji's
 * `SecondaryHorizontalMenuGroup`: a grey --color-neutral-100 track with a
 * sliding white pill at --radius-md, measured from the DOM. Passing it three
 * tabs is the whole binding.
 *
 * One difference, left alone per CLAUDE.md: the artboard draws hairline
 * dividers between the segments and Moji's group does not. Matching Moji beats
 * a local improvement, and forking the group for one rule would put a divider
 * everywhere the segmented control is used.
 */
const TABS: { id: RetrainFrequency; tabName: string }[] = [
  { id: 'never', tabName: 'Never' },
  { id: 'daily', tabName: 'Daily' },
  { id: 'weekly', tabName: 'Weekly' },
];

export function RetrainFrequencyCard({
  value,
  onChange,
}: {
  value: RetrainFrequency;
  onChange: (value: RetrainFrequency) => void;
}) {
  return (
    <Section
      title="Auto retraining frequency"
      description="How often you want Jimo to automatically retrain your content"
      controls={
        <SecondaryHorizontalMenuGroup
          className="w-[320px] max-w-[440px]"
          tabs={TABS}
          activeItem={value}
          onTabClick={(id) => onChange(id as RetrainFrequency)}
        />
      }
    >
      {/* `null`, never `false`: Section renders its content wrapper — and the
          --space-6 gap above it — for anything that is not null. */}
      {null}
    </Section>
  );
}
