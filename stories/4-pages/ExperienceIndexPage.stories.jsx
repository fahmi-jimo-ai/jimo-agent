import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ExperienceIndexPage } from '../../src/features/experiences/ExperienceIndexPage';
import { ToastProvider } from '../../src/components/app/toast';
import { resetExperiences, setExperiences } from '../../src/state/experiencesStore';
import { DEMO_EXPERIENCES } from '../../src/data/experiences';

const FIGMA =
  'https://www.figma.com/design/z7EQ0w6HgJkQ80VDck0JaG/Agent-Designer-Sandbox?node-id=';

const meta = {
  title: 'Pages/ExperienceIndexPage',
  component: ExperienceIndexPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

/** `undefined` = the seeded catalogue; an array = exactly those rows. */
const seed = (experiences) => () => {
  resetExperiences();
  if (experiences) setExperiences(experiences);
};

const page = (seedFn, node, props, entries = ['/']) => ({
  render: () => {
    seedFn();
    return (
      <ToastProvider>
        <MemoryRouter initialEntries={entries}>
          <div style={{ height: '810px' }}>
            <ExperienceIndexPage {...props} />
          </div>
        </MemoryRouter>
      </ToastProvider>
    );
  },
  parameters: { design: { type: 'figma', url: FIGMA + node } },
});

/* The artboard itself: Resource Centers, mosaic, All. */
export const ResourceCenters = page(seed(), '6-384', { type: 'resource-center' });

/* The other five, which the artboard does not draw — same layout, other rows. */
export const Tours = page(seed(), '6-384', { type: 'tour' });
export const Surveys = page(seed(), '6-384', { type: 'survey' });
export const Banners = page(seed(), '6-384', { type: 'banner' });
export const Hints = page(seed(), '6-384', { type: 'hint' });
export const Checklists = page(seed(), '6-384', { type: 'checklist' });

/* The Live and Draft tabs. */
export const LiveTab = page(seed(), '6-384', { type: 'tour', initialTab: 'live' });
export const DraftTab = page(seed(), '6-384', { type: 'tour', initialTab: 'draft' });

/* The two display modes the docs name and no frame draws. */
export const DetailedList = page(seed(), '6-384', { type: 'tour', initialDisplay: 'list' });
export const SimplifiedList = page(seed(), '6-384', { type: 'tour', initialDisplay: 'compact' });

/* Invented — no artboard draws an empty dashboard. Reachable by deleting every
   row of a type, which is what this seeds. */
export const Empty = {
  ...page(seed(DEMO_EXPERIENCES().filter((e) => e.type !== 'tour')), '6-384', { type: 'tour' }),
  parameters: { layout: 'fullscreen' },
};

/* The toolbar stays; the body is replaced. `search` is the docs' name filter,
   which the artboard draws no box for — see ExperienceIndexPage. */
export const NoResults = {
  ...page(seed(), '6-384', { type: 'tour', initialSearch: 'nothing matches this' }),
  parameters: { layout: 'fullscreen' },
};

export const Playground = {
  ...page(seed(), '6-384', { type: 'resource-center' }),
  parameters: { layout: 'fullscreen', chromatic: { disableSnapshot: true } },
};
