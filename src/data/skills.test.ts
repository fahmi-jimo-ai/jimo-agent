import { describe, it, expect } from 'vitest';
import {
  completionRate,
  conversationsForSkill,
  isSkillMode,
  buildSkillUses,
  buildSkillOutcomes,
  buildSkillUsageDays,
  DEMO_SKILLS,
  SKILL_MODES,
  SKILL_MODE_LABEL,
  SKILL_MODE_MENU,
  SKILL_Y_MAX,
  type Skill,
} from './skills';
import { CONVERSATIONS } from './analytics';

const skill = (over: Partial<Skill> = {}): Skill => ({
  id: 'a',
  name: 'Answer from knowledge',
  description: '',
  instructions: '',
  mode: 'explain',
  scope: 'page',
  pageId: null,
  active: true,
  updatedAt: 1,
  usage: 0,
  completed: 0,
  ...over,
});

describe('completionRate', () => {
  it('is null — not 0 — when the skill has never run', () => {
    // That case has its own chip on the artboard ("No runs yet"). A skill that
    // has not been tried is not a skill that fails.
    expect(completionRate(skill({ usage: 0, completed: 0 }))).toBeNull();
  });

  it('rounds a real rate', () => {
    expect(completionRate(skill({ usage: 321, completed: 193 }))).toBe(60);
    expect(completionRate(skill({ usage: 100, completed: 44 }))).toBe(44);
    expect(completionRate(skill({ usage: 100, completed: 88 }))).toBe(88);
  });

  it('reaches both ends', () => {
    expect(completionRate(skill({ usage: 10, completed: 10 }))).toBe(100);
    expect(completionRate(skill({ usage: 10, completed: 0 }))).toBe(0);
  });
});

describe('isSkillMode', () => {
  it('accepts exactly the three modes', () => {
    SKILL_MODES.forEach((m) => expect(isSkillMode(m)).toBe(true));
    expect(isSkillMode('agent-acts')).toBe(false);
    expect(isSkillMode(undefined)).toBe(false);
  });

  it('labels and menu copy cover every mode', () => {
    SKILL_MODES.forEach((m) => {
      expect(SKILL_MODE_LABEL[m]).toBeTruthy();
      expect(SKILL_MODE_MENU[m].title).toBeTruthy();
      expect(SKILL_MODE_MENU[m].description).toBeTruthy();
    });
  });
});

describe('DEMO_SKILLS', () => {
  it('never reports more completions than runs', () => {
    DEMO_SKILLS().forEach((s) => expect(s.completed).toBeLessThanOrEqual(s.usage));
  });

  it('gives the table the three chip states the artboard draws', () => {
    const rates = DEMO_SKILLS().map(completionRate);
    expect(rates).toContain(null); // "No runs yet"
    expect(rates.some((r) => r !== null && r < 50)).toBe(true); // red
    expect(rates.some((r) => r !== null && r >= 50)).toBe(true); // green
  });

  it('includes an inactive row, so the toggle has something to show off', () => {
    expect(DEMO_SKILLS().some((s) => !s.active)).toBe(true);
  });

  it('covers all three modes', () => {
    const modes = new Set(DEMO_SKILLS().map((s) => s.mode));
    SKILL_MODES.forEach((m) => expect(modes.has(m)).toBe(true));
  });
});

describe('conversationsForSkill', () => {
  it('finds the conversations whose traces actually cite the skill', () => {
    // The whole point of reusing the ids `analytics.ts` already cites: the Usage
    // tab lists real records rather than a second, invented fixture.
    const found = conversationsForSkill('skill-answer');
    expect(found.length).toBeGreaterThan(0);
    found.forEach((c) =>
      expect(c.transcript.some((t) => t.skills?.some((s) => s.id === 'skill-answer'))).toBe(true),
    );
  });

  it('returns nothing for a skill no trace mentions', () => {
    expect(conversationsForSkill('skill-does-not-exist')).toEqual([]);
  });

  it('every seeded skill id that traces cite resolves to a real row', () => {
    const cited = new Set(
      CONVERSATIONS.flatMap((c) => c.transcript.flatMap((t) => t.skills ?? [])).map((s) => s.id),
    );
    const seeded = new Set(DEMO_SKILLS().map((s) => s.id));
    // A skill chip on /conversations deep-links to /skills?skill=<id>; if an id
    // has no row, that link opens a drawer onto nothing.
    cited.forEach((id) => expect(seeded.has(id)).toBe(true));
  });
});

describe('chart series', () => {
  it('buildSkillUses is deterministic and stays inside the axis', () => {
    const a = buildSkillUses();
    const b = buildSkillUses();
    expect(a.points).toEqual(b.points);
    expect(a.points).toHaveLength(30);
    a.points.forEach((p) => {
      expect(p.value).toBeGreaterThanOrEqual(0);
      expect(p.value).toBeLessThanOrEqual(SKILL_Y_MAX);
    });
  });

  it('buildSkillUses prints the artboard figures verbatim', () => {
    const { total, deltaPct, startLabel, endLabel } = buildSkillUses();
    expect(total).toBe(6248);
    expect(deltaPct).toBe(5);
    expect(startLabel).toBe('Jan 27');
    expect(endLabel).toBe('Feb 27');
  });

  it('buildSkillOutcomes draws the artboard six weeks, deterministically', () => {
    expect(buildSkillOutcomes()).toEqual(buildSkillOutcomes());
    expect(buildSkillOutcomes().map((w) => w.label)).toEqual([
      'W1',
      'W2',
      'W3',
      'W4',
      'W5',
      'This wk',
    ]);
  });

  it('buildSkillUsageDays is seeded per skill: stable per id, different across ids', () => {
    expect(buildSkillUsageDays('skill-answer')).toEqual(buildSkillUsageDays('skill-answer'));
    expect(buildSkillUsageDays('skill-answer')).not.toEqual(buildSkillUsageDays('skill-clarify'));
    expect(buildSkillUsageDays('skill-answer')).toHaveLength(14);
  });

  it('buildSkillUsageDays spans exactly the artboard axis, Jan 21 to Feb 27', () => {
    // These two labels are printed on 12987:15826, so they are load-bearing. A
    // fixed "+3 days per bucket" step overshoots into a Feb 30 that does not
    // exist; the generator does real day-of-year arithmetic instead.
    const days = buildSkillUsageDays('skill-answer');
    expect(days[0].label).toBe('Jan 21');
    expect(days[days.length - 1].label).toBe('Feb 27');
    days.forEach((d) => expect(d.label).toMatch(/^(Jan|Feb) ([1-9]|1\d|2\d|3[01])$/));
  });

  it('a stacked usage column never overflows the axis', () => {
    // The bars stack, so it is the SUM that has to fit, not each segment.
    buildSkillUsageDays('skill-escalate').forEach((d) => {
      expect(d.completed + d.dropped).toBeLessThanOrEqual(SKILL_Y_MAX);
    });
  });
});
