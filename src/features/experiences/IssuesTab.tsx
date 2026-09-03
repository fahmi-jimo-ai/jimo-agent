import * as React from 'react';
import { Alert } from '@/components/ui/Infobox/alert';
import { EXPERIENCE_LABEL, type Experience } from '@/data/experiences';

/**
 * The Insights section's second tab.
 *
 * The TAB is named by the docs — "the lower portion of the dashboard provides
 * 'Insights', which splits into 'Statistics' and 'Issues'" — but its contents
 * are documented nowhere and no frame draws them. Rather than invent a taxonomy,
 * the rows are drawn from the Troubleshooting page's own list of why an
 * experience does not show: snippet not installed, targeting or segment
 * mismatch, trigger not activated, dynamic-selector drift, environment mismatch,
 * MAU limit or CSP errors.
 *
 * What IS invented is the detection, and it says so: this prototype has no
 * runtime to observe, so each check is a statement about the stored record
 * rather than about a real browser. Every row names the documented cause it
 * would be, so the copy is a real diagnosis even though the trigger is not.
 */
type Issue = {
  id: string;
  type: 'warning' | 'danger' | 'neutral';
  title: string;
  body: string;
};

export function issuesFor(experience: Experience): Issue[] {
  const issues: Issue[] = [];
  const noun = EXPERIENCE_LABEL[experience.type].toLowerCase();

  if (experience.steps.length === 0) {
    issues.push({
      id: 'no-steps',
      type: 'danger',
      title: `This ${noun} has no content`,
      body: 'There is nothing to show a user. Add at least one step in the builder before publishing.',
    });
  }

  if (experience.status === 'live' && experience.reached === 0) {
    issues.push({
      id: 'live-no-reach',
      type: 'warning',
      title: 'Live, but nobody has been reached',
      body: 'The usual causes, in the order worth checking: the snippet is not installed on the pages you targeted, the audience in Who matches nobody, the trigger never fires, or the experience is limited to a different environment than the one you are testing.',
    });
  }

  if (experience.status === 'expired') {
    issues.push({
      id: 'expired',
      type: 'warning',
      title: 'This experience has expired',
      body: 'Its expiration date has passed, so Jimo has paused it automatically. Clear or extend the end date in Target & publish to bring it back.',
    });
  }

  if (experience.ctas === 0 && experience.status !== 'draft') {
    issues.push({
      id: 'no-cta',
      type: 'neutral',
      title: 'No call to action',
      body: 'Button actions only counts clicks on Open Post, Navigate To, Launch Experience, Run JavaScript Code and Open Calendar. Without one of those, there is nothing for it to measure.',
    });
  }

  return issues;
}

export function IssuesTab({ experience }: { experience: Experience }) {
  const issues = issuesFor(experience);

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-2)] py-[var(--space-10)] text-center">
        <p className="m-0 [font:var(--text-subtitle-3)] text-[var(--color-text-primary)]">
          No issues detected
        </p>
        <p className="m-0 [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
          Nothing about this experience looks like it would stop it reaching people.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {issues.map((issue) => (
        <Alert key={issue.id} type={issue.type} title={issue.title} body={issue.body} />
      ))}
    </div>
  );
}
