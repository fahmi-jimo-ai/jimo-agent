import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SkillsPage } from '../../src/features/skills/SkillsPage';
import { ToastProvider } from '../../src/components/app/toast';
import { resetSkills, setSkills } from '../../src/state/skillsStore';
import { DEMO_SKILLS } from '../../src/data/skills';

const FIGMA = 'https://www.figma.com/design/ZapclwcQZLBxoeYxfo1ms0/Interface-Knowledge?node-id=';

/**
 * One story per Figma frame in section 12987:11525 ("Building Skill from
 * Dashboard"), each seeding the skills store then rendering the real page — so
 * a story can be diffed straight against the board it names.
 *
 * Note the seed direction is the opposite of `KnowledgePage`'s. That store
 * starts EMPTY and its stories add rows; this one starts POPULATED (no empty
 * state is designed for the Skills page), so `resetSkills()` is the *full*
 * state and `Empty` is the story that has to do work.
 */
const meta = {
  title: 'Pages/SkillsPage',
  component: SkillsPage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

/** `undefined` = the seeded catalogue; an array = exactly those rows. */
const seed = (skills) => () => {
  resetSkills();
  if (skills) setSkills(skills);
};

const page = (seedFn, node, props = {}, entries = ['/skills']) => ({
  render: () => {
    seedFn();
    return (
      <ToastProvider>
        <MemoryRouter initialEntries={entries}>
          <div style={{ height: '810px' }}>
            <SkillsPage {...props} />
          </div>
        </MemoryRouter>
      </ToastProvider>
    );
  },
  parameters: { design: { type: 'figma', url: FIGMA + node } },
});

const full = () => DEMO_SKILLS();

/* ── the list page ────────────────────────────────────────────────────────── */

export const List = page(seed(), '12987-11526');

/* The same frame, which draws the Add Skill menu already open. The menu itself
   is not a prop — it opens on click — so this story lands on the beat AFTER it:
   the page picker the first row opens. */
export const AddSkillMenu = page(seed(), '12987-11526', { initialAddMode: 'execute' });

export const PagePicker = page(seed(), '12987-11947', { initialAddMode: 'guide' });

/* ── the drawer's three views ─────────────────────────────────────────────── */

/* `skill-answer` is the row the Usage artboard's figures belong to: 321 uses,
   193 completed (82%), and traces in `analytics.ts` that actually cite it, so
   the conversation list underneath is real records rather than a fixture. */
export const DrawerDescription = page(seed(), '12987-14597', {
  initialDetailId: 'skill-answer',
  initialDetailView: 'description',
});

export const DrawerUsage = page(seed(), '12987-15826', {
  initialDetailId: 'skill-answer',
  initialDetailView: 'usage',
});

/* Reached from the Usage tab's conversation list; the drawer owns the view, so
   the story lands on Usage and the frame is one click away. Named for the
   artboard it belongs to so the diff target is unambiguous. */
export const DrawerConversation = page(seed(), '12987-16446', {
  initialDetailId: 'skill-answer',
  initialDetailView: 'usage',
});

/* ── the deep link ────────────────────────────────────────────────────────── */

/* No Figma node: `?skill=` is the wiring behind a skill chip in a conversation's
   reasoning trace, not a frame. It is storied because the param is read ONCE and
   then stripped, and that is exactly the kind of behaviour a screenshot cannot
   assert — open it and the URL should read `/skills`, with the drawer open. */
export const DeepLink = {
  ...page(seed(), '12987-14597', {}, ['/skills?skill=skill-escalate']),
  parameters: { layout: 'fullscreen' },
};

/* ── the states the store does not open on ────────────────────────────────── */

/* No Figma node: no empty state is drawn for this page. `SkillsEmptyState` is
   invented — see its header comment — and this is the only way to see it, since
   the store seeds populated. */
export const Empty = {
  ...page(seed([]), '12987-11526'),
  parameters: { layout: 'fullscreen' },
};

/* No Figma node: the filtered-to-zero state reuses `PropertyEmptyState`, which
   the Sources tab already storied against its own frame. */
export const NoResults = {
  ...page(seed(), '12987-11526', { initialSearch: 'nothing matches this' }),
  parameters: { layout: 'fullscreen' },
};

export const FilteredToExecute = page(seed(), '12987-11526', { initialMode: 'execute' });

export const Playground = {
  ...page(seed(), '12987-11526'),
  parameters: { layout: 'fullscreen', chromatic: { disableSnapshot: true } },
};
