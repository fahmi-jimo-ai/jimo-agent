import { describe, it, expect } from 'vitest';
import {
  buildCtaRows,
  buildGoalCurves,
  buildHintRows,
  buildMetricDays,
  buildStepDropoff,
  DEMO_EXPERIENCES,
  EXPERIENCE_LABEL,
  EXPERIENCE_NAV_LABEL,
  EXPERIENCE_PLURAL,
  EXPERIENCE_ROUTE,
  EXPERIENCE_STATUSES,
  EXPERIENCE_STATUS_BADGE,
  EXPERIENCE_STATUS_LABEL,
  EXPERIENCE_STEPS_HEADING,
  EXPERIENCE_TINT,
  EXPERIENCE_TYPES,
  formatMetric,
  isExperienceStatus,
  isExperienceType,
  METRICS,
  METRICS_BY_TYPE,
  metricLabel,
  metricsFor,
  taskRate,
  type Experience,
  type MetricKey,
} from './experiences';
import { PRIMARY_NAV_ROUTES } from '@/app/navConfig';

const base = (over: Partial<Experience> = {}): Experience => ({
  id: 'x',
  type: 'tour',
  name: 'A tour',
  status: 'live',
  createdAt: 1,
  editedAt: 1,
  segmentLabel: 'All users',
  reached: 100,
  tags: [],
  steps: [],
  goal: null,
  tasks: [],
  ctas: 0,
  metrics: {},
  ...over,
});

describe('enum coverage', () => {
  it('gives every type a label, plural, nav label, route, tint and steps heading', () => {
    EXPERIENCE_TYPES.forEach((type) => {
      expect(EXPERIENCE_LABEL[type]).toBeTruthy();
      expect(EXPERIENCE_PLURAL[type]).toBeTruthy();
      expect(EXPERIENCE_NAV_LABEL[type]).toBeTruthy();
      expect(EXPERIENCE_ROUTE[type]).toMatch(/^\/[a-z-]+$/);
      expect(EXPERIENCE_TINT[type]).toBeTruthy();
      expect(EXPERIENCE_STEPS_HEADING[type]).toBeTruthy();
    });
  });

  it('gives every status a label and a Badge type', () => {
    EXPERIENCE_STATUSES.forEach((status) => {
      expect(EXPERIENCE_STATUS_LABEL[status]).toBeTruthy();
      expect(EXPERIENCE_STATUS_BADGE[status]).toBeTruthy();
    });
  });

  it('gives every metric key a label, a unit and a drill kind', () => {
    (Object.keys(METRICS) as MetricKey[]).forEach((key) => {
      expect(METRICS[key].label).toBeTruthy();
      expect(METRICS[key].unit).toBeTruthy();
      expect(METRICS[key].drill).toBeTruthy();
    });
  });

  it('only puts known metric keys in METRICS_BY_TYPE', () => {
    EXPERIENCE_TYPES.forEach((type) => {
      expect(METRICS_BY_TYPE[type].length).toBeGreaterThan(0);
      METRICS_BY_TYPE[type].forEach((key) => expect(METRICS[key]).toBeDefined());
    });
  });

  it('renames Button actions to Action clicks on a Resource Center, and nowhere else', () => {
    // The one label swap the docs call for — the behaviour is identical.
    expect(metricLabel('resource-center', 'button-actions')).toBe('Action clicks');
    expect(metricLabel('tour', 'button-actions')).toBe('Button actions');
  });

  it('guards coerce nothing they should not', () => {
    expect(isExperienceType('tour')).toBe(true);
    expect(isExperienceType('post')).toBe(false);
    expect(isExperienceStatus('expired')).toBe(true);
    expect(isExperienceStatus('archived')).toBe(false);
  });
});

describe('the primary rail join', () => {
  it('routes every experience type from its own rail label', () => {
    // The rail marks active by label string and says "Resource Center",
    // singular, where the page title is plural. A rename on either side has to
    // fail here rather than silently kill a sidebar item.
    EXPERIENCE_TYPES.forEach((type) => {
      expect(PRIMARY_NAV_ROUTES[EXPERIENCE_NAV_LABEL[type]]).toBe(EXPERIENCE_ROUTE[type]);
    });
  });

  it('keeps the Agent reachable from the same rail', () => {
    expect(PRIMARY_NAV_ROUTES.Agent).toBe('/escalation');
  });

  it('leaves Changelog Posts inert', () => {
    // POST is the seventh member of the workspace enum and has no skeleton.
    expect(PRIMARY_NAV_ROUTES['Changelog Posts']).toBeUndefined();
  });
});

describe('formatMetric', () => {
  it('prints the artboard’s three tiles verbatim', () => {
    expect(formatMetric(70, 'percent-completion')).toBe('70% completion');
    expect(formatMetric(21, 'users')).toBe('21 users');
    expect(formatMetric(30, 'percent-users')).toBe('30% users');
  });

  it('prints the Ask AI doc’s wording', () => {
    expect(formatMetric(50, 'messages')).toBe('50 messages');
  });
});

describe('metricsFor', () => {
  it('drops "went through all steps" below two steps', () => {
    const one = base({ steps: [{ id: 's1', label: 'a', badge: 'Modal' }] });
    expect(metricsFor(one)).not.toContain('went-through-all-steps');

    const two = base({
      steps: [
        { id: 's1', label: 'a', badge: 'Modal' },
        { id: 's2', label: 'b', badge: 'Modal' },
      ],
    });
    expect(metricsFor(two)).toContain('went-through-all-steps');
  });

  it('drops "reached goal" without a goal', () => {
    expect(metricsFor(base({ goal: null }))).not.toContain('reached-goal');
    expect(metricsFor(base({ goal: 'Signed up' }))).toContain('reached-goal');
  });

  it('drops "button actions" with no CTA', () => {
    // The docs list it for every type; the Checklist artboard draws three tiles
    // and none of them is it. Nothing to count without a CTA.
    expect(metricsFor(base({ ctas: 0 }))).not.toContain('button-actions');
    expect(metricsFor(base({ ctas: 2 }))).toContain('button-actions');
  });
});

describe('the seeded catalogue', () => {
  const all = DEMO_EXPERIENCES();

  it('covers every type', () => {
    EXPERIENCE_TYPES.forEach((type) => {
      expect(all.some((e) => e.type === type)).toBe(true);
    });
  });

  it('covers every status, so the chip ladder is all reachable', () => {
    EXPERIENCE_STATUSES.forEach((status) => {
      expect(all.some((e) => e.status === status)).toBe(true);
    });
  });

  it('includes a zero-reach row, which is what the artboard’s pill prints', () => {
    expect(all.some((e) => e.reached === 0)).toBe(true);
  });

  it('gives every type at least three rows, so a mosaic row fills', () => {
    EXPERIENCE_TYPES.forEach((type) => {
      expect(all.filter((e) => e.type === type).length).toBeGreaterThanOrEqual(3);
    });
  });

  it('carries a value for every tile it shows, and no key its type does not declare', () => {
    // `metricsFor`, not `METRICS_BY_TYPE`: the three conditional metrics are
    // legitimately absent when their condition fails, and what must never
    // happen is a tile on screen with no number behind it.
    all.forEach((e) => {
      const declared = new Set(METRICS_BY_TYPE[e.type]);
      metricsFor(e).forEach((key) => {
        expect(typeof e.metrics[key]).toBe('number');
      });
      Object.keys(e.metrics).forEach((key) => {
        expect(declared.has(key as MetricKey)).toBe(true);
      });
    });
  });

  it('never reports more completions than clicks on a task', () => {
    all.flatMap((e) => e.tasks).forEach((t) => {
      expect(t.completed).toBeLessThanOrEqual(t.clicked);
    });
  });

  it('reproduces the detail artboard tile for tile', () => {
    const checklist = all.find((e) => e.id === 'checklist-onboarding')!;
    expect(checklist.name).toBe('Onboarding Checklist');
    // `10:2271` draws exactly three tiles, in this order.
    expect(metricsFor(checklist)).toEqual([
      'completed-checklist',
      'users-viewed',
      'dismissed-checklist',
    ]);
    expect(formatMetric(checklist.metrics['completed-checklist']!, 'percent-completion')).toBe(
      '70% completion',
    );
    expect(formatMetric(checklist.metrics['users-viewed']!, 'users')).toBe('21 users');
    expect(formatMetric(checklist.metrics['dismissed-checklist']!, 'percent-users')).toBe(
      '30% users',
    );
    // And the four task rates it prints.
    expect(checklist.tasks.map(taskRate)).toEqual([50, 20, 30, 70]);
  });

  it('gives the Checklist artboard its two steps, with its captions', () => {
    const checklist = all.find((e) => e.id === 'checklist-onboarding')!;
    expect(checklist.steps.map((s) => s.label)).toEqual(['Checklist', 'Success']);
  });

  it('omits the POST type entirely', () => {
    // Changelog Posts has no skeleton — see experiences.ts.
    expect(all.every((e) => EXPERIENCE_TYPES.includes(e.type))).toBe(true);
  });
});

describe('the drill-down generators', () => {
  const all = DEMO_EXPERIENCES();
  const tour = all.find((e) => e.id === 'tour-welcome')!;
  const hint = all.find((e) => e.id === 'hint-dashboard')!;

  it('is deterministic — a seeded LCG, never Math.random', () => {
    expect(buildMetricDays(tour, 'users-reached')).toEqual(
      buildMetricDays(tour, 'users-reached'),
    );
    expect(buildStepDropoff(tour)).toEqual(buildStepDropoff(tour));
  });

  it('gives one experience’s two metrics different silhouettes', () => {
    // The seed mixes the id WITH the key, so two tiles on one page cannot draw
    // the same curve twice.
    const a = buildMetricDays(tour, 'users-reached').map((d) => d.value);
    const b = buildMetricDays(tour, 'reached-goal').map((d) => d.value);
    expect(a).not.toEqual(b);
  });

  it('draws a flat zero series for something nobody has seen', () => {
    const draft = all.find((e) => e.id === 'tour-trial-nudge')!;
    expect(buildMetricDays(draft, 'users-reached').every((d) => d.value === 0)).toBe(true);
  });

  it('pins the first drop-off bar at 100% and the last at the KPI', () => {
    // Both are the docs' own words: "the first step always starts at 100%" and
    // "the last step's percentage aligns directly with the KPI".
    const bars = buildStepDropoff(tour);
    expect(bars[0].pct).toBe(100);
    const expected = Math.round(
      (tour.metrics['went-through-all-steps']! / tour.metrics['users-reached']!) * 100,
    );
    expect(bars[bars.length - 1].pct).toBe(expected);
  });

  it('never lets a drop-off bar rise above the one before it', () => {
    const bars = buildStepDropoff(tour);
    bars.forEach((bar, i) => {
      if (i > 0) expect(bar.pct).toBeLessThanOrEqual(bars[i - 1].pct);
    });
  });

  it('names hint rows after the hint group’s own steps', () => {
    expect(buildHintRows(hint).map((r) => r.label)).toEqual(hint.steps.map((s) => s.label));
  });

  it('never reports more unique viewers than views', () => {
    buildHintRows(hint).forEach((r) => expect(r.uniqueViewers).toBeLessThanOrEqual(r.views));
  });

  it('gives one CTA row per CTA, and none at all without one', () => {
    expect(buildCtaRows(tour)).toHaveLength(tour.ctas);
    expect(buildCtaRows(base({ ctas: 0 }))).toHaveLength(0);
  });

  it('keeps the goal curve during the experience under the total', () => {
    const banner = all.find((e) => e.id === 'banner-install')!;
    const { all: total, during } = buildGoalCurves(banner);
    during.forEach((d, i) => expect(d.value).toBeLessThanOrEqual(total[i].value));
  });
});

describe('taskRate', () => {
  it('is 0, not NaN, when nobody clicked', () => {
    expect(taskRate({ id: 't', label: 'a', clicked: 0, completed: 0 })).toBe(0);
  });

  it('is derived, so a row can never print a rate its counts contradict', () => {
    expect(taskRate({ id: 't', label: 'a', clicked: 24, completed: 12 })).toBe(50);
  });
});
