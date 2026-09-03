import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ExperienceDetailPage } from '../../src/features/experiences/ExperienceDetailPage';
import { ToastProvider } from '../../src/components/app/toast';
import { resetExperiences } from '../../src/state/experiencesStore';

const FIGMA =
  'https://www.figma.com/design/z7EQ0w6HgJkQ80VDck0JaG/Agent-Designer-Sandbox?node-id=';

const meta = {
  title: 'Pages/ExperienceDetailPage',
  component: ExperienceDetailPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

/* `id` is a prop rather than a route param here, which is why this mounts under
   a bare MemoryRouter with no <Routes> and the helper stays identical to the
   other page stories'. */
const page = (node, props) => ({
  render: () => {
    resetExperiences();
    return (
      <ToastProvider>
        <MemoryRouter initialEntries={['/']}>
          <div style={{ height: '810px' }}>
            <ExperienceDetailPage {...props} />
          </div>
        </MemoryRouter>
      </ToastProvider>
    );
  },
  parameters: { design: { type: 'figma', url: FIGMA + node } },
});

const checklist = { type: 'checklist', id: 'checklist-onboarding' };

/* The three artboards: one page, one tile selected on each. */
export const CompletionRate = page('10-2271', {
  ...checklist,
  initialMetric: 'completed-checklist',
});
export const UsersViewed = page('10-2928', { ...checklist, initialMetric: 'users-viewed' });
export const UsersDismissed = page('10-3238', {
  ...checklist,
  initialMetric: 'dismissed-checklist',
});

/* The five drill-downs no frame draws, each reached from its own type. */
export const TourStepDropoff = page('10-2269', {
  type: 'tour',
  id: 'tour-welcome',
  initialMetric: 'went-through-all-steps',
});
export const TourGoalCurves = page('10-2269', {
  type: 'tour',
  id: 'tour-welcome',
  initialMetric: 'reached-goal',
});
export const TourButtonActions = page('10-2269', {
  type: 'tour',
  id: 'tour-welcome',
  initialMetric: 'button-actions',
});
export const HintBreakdown = page('10-2269', {
  type: 'hint',
  id: 'hint-dashboard',
  initialMetric: 'total-tooltip-shown',
});
export const ResourceCenterAskAi = page('10-2269', {
  type: 'resource-center',
  id: 'rc-onboarding',
  initialMetric: 'ask-ai-messages',
});

/* A live experience nobody has reached — the Issues tab has something to say. */
export const Issues = page('10-2269', { type: 'resource-center', id: 'rc-help' });

/* A stale or typo'd link. Deliberately not a redirect — see the page. */
export const NotFound = page('10-2269', { type: 'checklist', id: 'does-not-exist' });

export const Playground = {
  ...page('10-2271', checklist),
  parameters: { layout: 'fullscreen', chromatic: { disableSnapshot: true } },
};
