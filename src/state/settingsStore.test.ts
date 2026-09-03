import { describe, it, expect } from 'vitest';
import {
  parseSettings,
  parseDomains,
  INITIAL_SETTINGS,
  withMemberPatched,
  withMemberRemoved,
  withDefaultTheme,
  withExclusionAdded,
  withExclusionRemoved,
  withWebhookPatched,
  withEnvRemoved,
} from './settingsStore';
import { INTEGRATION_CATALOGUE } from '@/data/settings';

const json = (o: unknown) => JSON.stringify(o);

describe('parseSettings', () => {
  it('returns the initial state for null and for junk', () => {
    expect(parseSettings(null)).toEqual(INITIAL_SETTINGS);
    expect(parseSettings('{not json')).toEqual(INITIAL_SETTINGS);
  });

  it('reads a payload written before a section existed', () => {
    // The whole point of merging over INITIAL_SETTINGS: no migration step.
    const old = json({ project: { name: 'acme' } });
    const s = parseSettings(old);
    expect(s.project.name).toBe('acme');
    expect(s.webhooks).toEqual([]);
    expect(s.environments).toEqual([]);
    expect(s.troubleshoot).toEqual(INITIAL_SETTINGS.troubleshoot);
    expect(s.team.roles).toHaveLength(3);
  });

  it('keeps the stored project id rather than regenerating it', () => {
    const s = parseSettings(json({ project: { projectId: 'fixed-id' } }));
    expect(s.project.projectId).toBe('fixed-id');
  });

  describe('coerces unknown enums rather than dropping the record', () => {
    it('rate limit unit', () => {
      const s = parseSettings(json({ rateLimit: { unit: 'fortnight', every: 9, count: 3 } }));
      expect(s.rateLimit.unit).toBe('hour');
      // The rest of the record survives the bad enum.
      expect(s.rateLimit.every).toBe(9);
      expect(s.rateLimit.count).toBe(3);
    });

    it('member status, while an arbitrary role is legitimate (roles are custom)', () => {
      const s = parseSettings(
        json({
          team: {
            members: [{ id: 'm1', name: 'Ada', email: 'a@b.c', role: 'release-manager', status: 'exploded' }],
          },
        }),
      );
      expect(s.team.members).toHaveLength(1);
      expect(s.team.members[0].status).toBe('active');
      expect(s.team.members[0].role).toBe('release-manager');
    });

    it('subscription status and an unknown plan id', () => {
      const s = parseSettings(json({ subscription: { status: 'refunded', plan: 'platinum' } }));
      expect(s.subscription.status).toBe('none');
      expect(s.subscription.plan).toBe('free');
    });

    it('gtm and install-check statuses', () => {
      const s = parseSettings(json({ install: { gtm: { status: 'exploding' }, check: { status: 'nope' } } }));
      expect(s.install.gtm.status).toBe('idle');
      expect(s.install.check.status).toBe('idle');
    });
  });

  it('drops records with no id, keeps the rest', () => {
    const s = parseSettings(
      json({
        team: { members: [{ name: 'no id' }, { id: 'm2', name: 'Grace' }] },
        webhooks: [{ id: 'w1' }, { id: 'w2', endpoint: 'https://x.test/hook' }],
        environments: [{ id: 'e1' }, { id: 'e2', name: 'Staging' }],
      }),
    );
    expect(s.team.members.map((m) => m.id)).toEqual(['m2']);
    expect(s.webhooks.map((w) => w.id)).toEqual(['w2']);
    expect(s.environments.map((e) => e.id)).toEqual(['e2']);
  });

  it('derives webhook delivery ok from the status code, per the docs 400 rule', () => {
    const s = parseSettings(
      json({
        webhooks: [
          {
            id: 'w1',
            endpoint: 'https://x.test/hook',
            deliveries: [{ at: 1, status: 200 }, { at: 2, status: 399 }, { at: 3, status: 400 }, { at: 4, status: 503 }],
          },
        ],
      }),
    );
    expect(s.webhooks[0].deliveries.map((d) => d.ok)).toEqual([true, true, false, false]);
  });

  it('merges stored integration state over the CURRENT catalogue', () => {
    // A vendor added to the catalogue later must read as disconnected, not undefined;
    // one no longer in the catalogue must not leak through.
    const s = parseSettings(json({ integrations: { slack: { connected: true }, myspace: { connected: true } } }));
    expect(Object.keys(s.integrations).sort()).toEqual(INTEGRATION_CATALOGUE.map((i) => i.id).sort());
    expect(s.integrations.slack.connected).toBe(true);
    expect(s.integrations.hubspot.connected).toBe(false);
    expect(s.integrations).not.toHaveProperty('myspace');
  });

  it('restores the default theme when the stored list is empty', () => {
    const s = parseSettings(json({ themes: [] }));
    expect(s.themes).toHaveLength(1);
    expect(s.themes[0].isDefault).toBe(true);
  });

  it('clamps numbers that would render nonsense', () => {
    const s = parseSettings(json({ rateLimit: { count: 0, every: -3 }, subscription: { seats: 0 } }));
    expect(s.rateLimit.count).toBe(1);
    expect(s.rateLimit.every).toBe(1);
    expect(s.subscription.seats).toBe(1);
  });
});

describe('parseDomains', () => {
  it('splits on whitespace, per the docs', () => {
    expect(parseDomains('foo.com bar.com')).toEqual(['foo.com', 'bar.com']);
    expect(parseDomains('  foo.com \n bar.com  ')).toEqual(['foo.com', 'bar.com']);
    expect(parseDomains('')).toEqual([]);
  });

  it('does not split a regex on its comma or dot', () => {
    // The docs' own example. A comma is NOT a separator because it can appear
    // inside a pattern like `a{1,3}`.
    expect(parseDomains('\\.*bar.com$')).toEqual(['\\.*bar.com$']);
    expect(parseDomains('foo{1,3}.com')).toEqual(['foo{1,3}.com']);
  });
});

describe('list helpers', () => {
  const members = [
    { id: 'a', name: 'A', email: 'a@x.c', role: 'admin', status: 'active' as const },
    { id: 'b', name: 'B', email: 'b@x.c', role: 'viewer', status: 'pending' as const },
  ];

  it('patches and removes members without mutating', () => {
    const patched = withMemberPatched(members, 'b', { role: 'editor' });
    expect(patched[1].role).toBe('editor');
    expect(members[1].role).toBe('viewer');
    expect(withMemberRemoved(members, 'a').map((m) => m.id)).toEqual(['b']);
  });

  it('makes exactly one theme default', () => {
    const themes = [
      { id: 't1', name: 'One', font: 'Inter', colours: [], isDefault: true },
      { id: 't2', name: 'Two', font: 'Inter', colours: [], isDefault: false },
    ];
    const next = withDefaultTheme(themes, 't2');
    expect(next.map((t) => t.isDefault)).toEqual([false, true]);
  });

  it('treats exclusions as a set', () => {
    expect(withExclusionAdded(['x'], 'x')).toEqual(['x']);
    expect(withExclusionAdded(['x'], 'y')).toEqual(['x', 'y']);
    expect(withExclusionRemoved(['x', 'y'], 'x')).toEqual(['y']);
  });

  it('patches webhooks and removes environments', () => {
    const hooks = [{ id: 'w1', endpoint: 'e', events: [], active: true, deliveries: [] }];
    expect(withWebhookPatched(hooks, 'w1', { active: false })[0].active).toBe(false);
    const envs = [{ id: 'e1', name: 'E', icon: 'global', colour: 'blue', domains: [], description: '' }];
    expect(withEnvRemoved(envs, 'e1')).toEqual([]);
  });
});
