import { describe, it, expect } from 'vitest';
import {
  EXPERIENCE_DISPLAYS,
  INITIAL_EXPERIENCES,
  filterExperiences,
  experiencesOfType,
  parseExperience,
  parseExperiences,
  segmentOptions,
  tagOptions,
  withExperienceAdded,
  withExperiencePatched,
  withExperienceRemoved,
  type ExperienceFilters,
} from './experiencesStore';
import { EXPERIENCE_TYPES, type Experience } from '@/data/experiences';

const row = (over: Partial<Experience> = {}): Experience => ({
  id: 'a',
  type: 'tour',
  name: 'Welcome tour',
  status: 'live',
  createdAt: 10,
  editedAt: 10,
  segmentLabel: 'All users',
  reached: 5,
  tags: [],
  steps: [],
  goal: null,
  tasks: [],
  ctas: 0,
  metrics: {},
  ...over,
});

const filters = (over: Partial<ExperienceFilters> = {}): ExperienceFilters => ({
  search: '',
  tab: 'all',
  contexts: ['tour'],
  statuses: [],
  segments: [],
  tags: [],
  display: 'mosaic',
  ...over,
});

describe('parseExperiences', () => {
  it('falls back to the seeded catalogue on a missing or broken payload', () => {
    expect(parseExperiences(null)).toBe(INITIAL_EXPERIENCES);
    expect(parseExperiences('{not json')).toBe(INITIAL_EXPERIENCES);
  });

  it('merges over INITIAL, so a payload written before `views` reads forward', () => {
    // The property that makes adding a key free — no migration step.
    const state = parseExperiences(JSON.stringify({ experiences: [row()] }));
    EXPERIENCE_TYPES.forEach((type) => {
      expect(state.views[type].tab).toBe('all');
      expect(state.views[type].contexts).toEqual([type]);
      expect(state.views[type].display).toBe('mosaic');
    });
  });

  it('drops a row whose type is unknown rather than guessing one', () => {
    // The type decides which dashboard the row belongs to and which KPIs it
    // has, so a coerced guess would file it under the wrong page.
    expect(parseExperience({ id: 'a', name: 'x', type: 'post' })).toBeNull();
    expect(parseExperience({ id: 'a', name: 'x', type: 'tour' })).not.toBeNull();
  });

  it('coerces an unknown status to draft — the one nobody sees', () => {
    expect(parseExperience({ id: 'a', name: 'x', type: 'tour', status: 'archived' })?.status).toBe(
      'draft',
    );
  });

  it('clamps a task that claims more completions than clicks', () => {
    const parsed = parseExperience({
      id: 'a',
      name: 'x',
      type: 'checklist',
      tasks: [{ id: 't', label: 'l', clicked: 10, completed: 40 }],
    });
    expect(parsed?.tasks[0].completed).toBe(10);
  });

  it('keeps only numeric metric values', () => {
    const parsed = parseExperience({
      id: 'a',
      name: 'x',
      type: 'tour',
      metrics: { 'users-reached': 12, 'reached-goal': 'lots' },
    });
    expect(parsed?.metrics).toEqual({ 'users-reached': 12 });
  });

  it('never lets a stored view lose its last context', () => {
    // A page filtered to no types is blank with no control that brings it back.
    const state = parseExperiences(
      JSON.stringify({ experiences: [], views: { tour: { contexts: [] } } }),
    );
    expect(state.views.tour.contexts).toEqual(['tour']);
  });

  it('falls back on an unknown display mode', () => {
    const state = parseExperiences(
      JSON.stringify({ experiences: [], views: { tour: { display: 'kanban' } } }),
    );
    expect(EXPERIENCE_DISPLAYS).toContain(state.views.tour.display);
  });
});

describe('the list helpers', () => {
  it('adds, removes and patches without mutating', () => {
    const list = [row()];
    expect(withExperienceAdded(list, row({ id: 'b' }))).toHaveLength(2);
    expect(withExperienceRemoved(list, 'a')).toHaveLength(0);
    expect(withExperiencePatched(list, 'a', { name: 'Renamed' })[0].name).toBe('Renamed');
    expect(list[0].name).toBe('Welcome tour');
  });

  it('lists the segments and tags the data actually contains', () => {
    const list = [
      row({ id: 'a', segmentLabel: 'New users', tags: ['Onboarding'] }),
      row({ id: 'b', segmentLabel: 'New users', tags: ['Onboarding', 'Release'] }),
    ];
    expect(segmentOptions(list)).toEqual(['New users']);
    expect(tagOptions(list)).toEqual(['Onboarding', 'Release']);
  });

  it('counts a type before any filtering', () => {
    const list = [row({ id: 'a' }), row({ id: 'b', type: 'survey' })];
    expect(experiencesOfType(list, 'tour')).toHaveLength(1);
  });
});

describe('filterExperiences', () => {
  const list = [
    row({ id: 'a', name: 'Welcome tour', status: 'live', createdAt: 30, tags: ['Onboarding'] }),
    row({ id: 'b', name: 'Trial nudge', status: 'draft', createdAt: 20, segmentLabel: 'Trialing' }),
    row({ id: 'c', name: 'Feature survey', type: 'survey', status: 'live', createdAt: 10 }),
  ];

  it('sorts newest-created first', () => {
    const shown = filterExperiences(list, filters({ contexts: ['tour', 'survey'] }));
    expect(shown.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('narrows by context, which is the page’s own type by default', () => {
    expect(filterExperiences(list, filters()).map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('matches the search against the name', () => {
    expect(filterExperiences(list, filters({ search: 'welcome' })).map((e) => e.id)).toEqual(['a']);
  });

  it('composes the tab with the Status pill rather than overriding it', () => {
    // `Live` + Status `Draft` is legitimately empty; pretending otherwise would
    // make one of the two controls a lie.
    expect(filterExperiences(list, filters({ tab: 'live', statuses: ['draft'] }))).toHaveLength(0);
    expect(filterExperiences(list, filters({ tab: 'live' })).map((e) => e.id)).toEqual(['a']);
    expect(filterExperiences(list, filters({ tab: 'draft' })).map((e) => e.id)).toEqual(['b']);
  });

  it('treats an empty pill as no constraint, not as nothing', () => {
    expect(filterExperiences(list, filters({ statuses: [], tags: [], segments: [] }))).toHaveLength(
      2,
    );
  });

  it('narrows by segment and by tag', () => {
    expect(filterExperiences(list, filters({ segments: ['Trialing'] })).map((e) => e.id)).toEqual([
      'b',
    ]);
    expect(filterExperiences(list, filters({ tags: ['Onboarding'] })).map((e) => e.id)).toEqual([
      'a',
    ]);
  });

  it('intersects every control at once', () => {
    const shown = filterExperiences(
      list,
      filters({ contexts: ['tour', 'survey'], tab: 'live', tags: ['Onboarding'], search: 'tour' }),
    );
    expect(shown.map((e) => e.id)).toEqual(['a']);
  });
});
