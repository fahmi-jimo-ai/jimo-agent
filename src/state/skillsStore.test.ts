import { describe, it, expect } from 'vitest';
import {
  parseSkills,
  parseSkill,
  withSkillAdded,
  withSkillPatched,
  withSkillRemoved,
  filterSkills,
  skillsForPage,
  INITIAL_SKILLS,
} from './skillsStore';
import type { Skill } from '@/data/skills';

/**
 * The suite runs in vitest's default node environment — there is no jsdom, so
 * `localStorage` is out of reach. Everything the store decides is therefore a
 * pure function of the stored string or of a list, and those are what is tested
 * here. The DOM half is covered by the Storybook stories.
 */

const skill = (over: Partial<Skill> = {}): Skill => ({
  id: 'a',
  name: 'Answer from knowledge',
  description: 'Answers a product question in text.',
  instructions: 'Your goal is to answer.',
  mode: 'explain',
  pageId: null,
  active: true,
  updatedAt: 1,
  usage: 100,
  completed: 50,
  ...over,
});

describe('parseSkills', () => {
  it('returns the seeded state for nothing and for junk', () => {
    expect(parseSkills(null)).toEqual(INITIAL_SKILLS);
    expect(parseSkills('not json')).toEqual(INITIAL_SKILLS);
  });

  it('seeds populated, unlike knowledgeStore', () => {
    // The pairing this store documents: no empty state is designed for the
    // Skills page, so a first visit must not land on a blank table.
    expect(INITIAL_SKILLS.skills.length).toBeGreaterThan(0);
  });

  it('reads a stored list back, replacing the seed', () => {
    const raw = JSON.stringify({ skills: [skill({ id: 'x', name: 'Mine' })] });
    expect(parseSkills(raw).skills).toHaveLength(1);
    expect(parseSkills(raw).skills[0].name).toBe('Mine');
  });

  it('drops a row with no id or no name rather than rendering a blank one', () => {
    const raw = JSON.stringify({ skills: [{ name: 'no id' }, { id: 'no-name' }, skill()] });
    expect(parseSkills(raw).skills).toHaveLength(1);
  });

  it('treats a non-array skills field as empty', () => {
    expect(parseSkills(JSON.stringify({ skills: 'nope' })).skills).toEqual([]);
  });
});

describe('parseSkill', () => {
  it('coerces an unknown mode rather than failing', () => {
    expect(parseSkill({ ...skill(), mode: 'telepathy' })?.mode).toBe('explain');
  });

  it('reads a missing active flag as active', () => {
    // A row whose flag was lost should still answer users; the switch shows the
    // truth either way.
    const { active, ...withoutFlag } = skill();
    expect(parseSkill(withoutFlag)?.active).toBe(true);
    expect(parseSkill({ ...skill(), active: false })?.active).toBe(false);
  });

  it('clamps completed to usage, so no chip can read over 100%', () => {
    expect(parseSkill({ ...skill(), usage: 10, completed: 99 })?.completed).toBe(10);
    expect(parseSkill({ ...skill(), usage: 10, completed: -5 })?.completed).toBe(0);
  });

  it('rejects a non-object', () => {
    expect(parseSkill(null)).toBeNull();
    expect(parseSkill('a skill')).toBeNull();
  });
});

describe('list helpers', () => {
  it('adds, patches and removes without mutating', () => {
    const list = [skill({ id: 'a' }), skill({ id: 'b' })];
    expect(withSkillAdded(list, skill({ id: 'c' }))).toHaveLength(3);
    expect(withSkillRemoved(list, 'a')).toEqual([list[1]]);
    expect(withSkillPatched(list, 'b', { name: 'Renamed' })[1].name).toBe('Renamed');
    expect(list).toHaveLength(2);
    expect(list[1].name).toBe('Answer from knowledge');
  });
});

describe('filterSkills', () => {
  const rows = [
    skill({ id: 'a', name: 'Escalate', mode: 'execute', usage: 300, completed: 30, updatedAt: 3 }),
    skill({ id: 'b', name: 'Answer', mode: 'explain', usage: 100, completed: 90, updatedAt: 1 }),
    skill({ id: 'c', name: 'Guide me', mode: 'guide', usage: 0, completed: 0, updatedAt: 2 }),
  ];
  const base = { search: '', mode: 'all', sort: 'default' } as const;

  it('matches the search against name AND description, case-insensitively', () => {
    expect(filterSkills(rows, { ...base, search: 'esc' }).map((s) => s.id)).toEqual(['a']);
    // Every fixture row shares a description, so a description hit returns all
    // three — which is what proves the description is searched at all.
    expect(filterSkills(rows, { ...base, search: 'product question' })).toHaveLength(3);
    expect(filterSkills(rows, { ...base, search: 'PRODUCT Question' })).toHaveLength(3);
    expect(filterSkills(rows, { ...base, search: '   ' })).toHaveLength(3);
    expect(filterSkills(rows, { ...base, search: 'nothing matches this' })).toHaveLength(0);
  });

  it('filters by mode', () => {
    expect(filterSkills(rows, { ...base, mode: 'guide' }).map((s) => s.id)).toEqual(['c']);
    expect(filterSkills(rows, { ...base, mode: 'all' })).toHaveLength(3);
  });

  it('defaults to most recently updated first', () => {
    expect(filterSkills(rows, base).map((s) => s.id)).toEqual(['a', 'c', 'b']);
  });

  it('sorts by name, then usage', () => {
    expect(filterSkills(rows, { ...base, sort: 'name' }).map((s) => s.id)).toEqual(['b', 'a', 'c']);
    expect(filterSkills(rows, { ...base, sort: 'usage' }).map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts a never-run skill LAST by completion, not as 0%', () => {
    // It has not failed, it has not been tried. Burying it under genuine
    // failures is the one ordering that would mislead.
    expect(filterSkills(rows, { ...base, sort: 'completion' }).map((s) => s.id)).toEqual([
      'b',
      'a',
      'c',
    ]);
  });

  it('does not mutate the input list while sorting', () => {
    const input = [...rows];
    filterSkills(input, { ...base, sort: 'name' });
    expect(input.map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('skillsForPage', () => {
  it('counts only the skills hosted on that page', () => {
    const rows = [
      skill({ id: 'a', pageId: 'page-dashboard' }),
      skill({ id: 'b', pageId: 'page-billing' }),
      skill({ id: 'c', pageId: null }),
    ];
    expect(skillsForPage(rows, 'page-dashboard').map((s) => s.id)).toEqual(['a']);
    expect(skillsForPage(rows, 'page-nothing')).toEqual([]);
  });
});
