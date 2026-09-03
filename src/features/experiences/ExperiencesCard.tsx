import * as React from 'react';
import { Section } from '@/components/ui/Section/Section';
import { PropertyEmptyState } from '@/features/knowledge/PropertyEmptyState';
import { EXPERIENCE_PLURAL, type Experience, type ExperienceType } from '@/data/experiences';
import type { ExperienceDisplay } from '@/state/experiencesStore';
import { ExperienceMosaic } from './ExperienceMosaic';
import { ExperienceTable } from './ExperienceTable';
import { ExperiencesEmptyState } from './ExperiencesEmptyState';
import type { ExperienceActions } from './ExperienceRowMenu';

/**
 * The list body — three states, the same three `SkillsCard` draws.
 *
 * Nothing at all → the entry point (and no toolbar, because there is nothing to
 * filter); rows → the mosaic or one of the two lists; filtered to zero → the
 * toolbar stays and the body is replaced. `hasAny` is measured against the
 * page's OWN type rather than the filtered set, so widening `Contexts` on an
 * empty Tours page still shows the Tours empty state and not a table of surveys.
 *
 * The mosaic sits on the page ground rather than inside a `Section` — `6:384`
 * draws the cards with their own borders on the page, not stacked inside one
 * card. The two lists DO take a `Section flushBody`, which is what every other
 * table in this app sits in.
 */
export function ExperiencesCard({
  type,
  ofType,
  shown,
  display,
  showType,
  now,
  onOpen,
  onCreate,
  actionsFor,
}: {
  type: ExperienceType;
  /** Every experience of this page's type, before filtering. */
  ofType: Experience[];
  /** What the filters left. */
  shown: Experience[];
  display: ExperienceDisplay;
  showType: boolean;
  now?: number;
  onOpen: (experience: Experience) => void;
  onCreate: () => void;
  actionsFor: (experience: Experience) => ExperienceActions;
}) {
  if (ofType.length === 0) {
    return (
      <Section>
        <ExperiencesEmptyState type={type} onCreate={onCreate} />
      </Section>
    );
  }

  if (shown.length === 0) {
    return (
      <Section>
        <PropertyEmptyState
          title={`No ${EXPERIENCE_PLURAL[type].toLowerCase()} found`}
          body="Adjust the filters to find what you are looking for."
        />
      </Section>
    );
  }

  if (display === 'mosaic') {
    return (
      <ExperienceMosaic
        experiences={shown}
        showType={showType}
        now={now}
        onOpen={onOpen}
        actionsFor={actionsFor}
      />
    );
  }

  return (
    <Section flushBody>
      <ExperienceTable
        experiences={shown}
        dense={display === 'compact'}
        showType={showType}
        now={now}
        onOpen={onOpen}
        actionsFor={actionsFor}
      />
    </Section>
  );
}
