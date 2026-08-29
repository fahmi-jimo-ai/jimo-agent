import { describe, it, expect } from 'vitest';
import {
  parseKnowledge,
  parsePage,
  parseSource,
  withSourceAdded,
  withSourcePatched,
  withSourceRemoved,
  INITIAL_KNOWLEDGE,
} from './knowledgeStore';
import type { KnowledgeSource } from '@/data/knowledgeSources';

/**
 * The suite runs in vitest's default node environment — there is no jsdom, so
 * `localStorage` is out of reach. Everything the store decides is therefore a
 * pure function of the stored string or of a list, and those are what is tested
 * here. The DOM half is covered by the Storybook stories.
 */

const source = (over: Partial<KnowledgeSource> = {}): KnowledgeSource => ({
  id: 'a',
  kind: 'url',
  label: 'https://usejimo.com',
  status: 'trained',
  addedAt: 1,
  updatedAt: 1,
  addedBy: 'Fahmi (You)',
  tokens: 100,
  usedInResponses: 0,
  chunks: [],
  ...over,
});

describe('parseKnowledge', () => {
  it('returns the initial state for nothing and for junk', () => {
    expect(parseKnowledge(null)).toEqual(INITIAL_KNOWLEDGE);
    expect(parseKnowledge('not json')).toEqual(INITIAL_KNOWLEDGE);
  });

  it('reads a pre-sources payload forward without a migration', () => {
    const legacy = JSON.stringify({ addedIds: ['user_id', 'email'] });
    expect(parseKnowledge(legacy)).toEqual({
      addedIds: ['user_id', 'email'],
      sources: [],
      // `pages` joined this state later and is seeded populated, so a payload
      // written before it existed reads forward with the catalogue rather than
      // an empty grid — see the `pages` block at the bottom of this file.
      pages: INITIAL_KNOWLEDGE.pages,
      retrain: 'never',
      demoSources: false,
    });
  });

  it('drops non-string property ids', () => {
    const raw = JSON.stringify({ addedIds: ['user_id', 7, null] });
    expect(parseKnowledge(raw).addedIds).toEqual(['user_id']);
  });

  it('falls back to "never" for an unknown retrain value', () => {
    expect(parseKnowledge(JSON.stringify({ retrain: 'hourly' })).retrain).toBe('never');
    expect(parseKnowledge(JSON.stringify({ retrain: 'weekly' })).retrain).toBe('weekly');
  });

  it('keeps only sources that parse', () => {
    const raw = JSON.stringify({ sources: [source(), null, { label: 'no id' }, 42] });
    expect(parseKnowledge(raw).sources).toHaveLength(1);
  });
});

describe('parseSource', () => {
  it('coerces an unknown kind and status rather than rendering an empty pill', () => {
    const parsed = parseSource({ ...source(), kind: 'podcast', status: 'queued' });
    expect(parsed?.kind).toBe('text');
    expect(parsed?.status).toBe('trained');
  });

  it('rejects a record with no id or no label', () => {
    expect(parseSource({ label: 'x' })).toBeNull();
    expect(parseSource({ id: 'x' })).toBeNull();
    expect(parseSource(null)).toBeNull();
  });

  it('defaults missing numbers to zero and drops malformed chunks', () => {
    const parsed = parseSource({
      id: 'a',
      label: 'x',
      tokens: 'lots',
      usedInResponses: undefined,
      chunks: [{ id: 'c1', text: 'ok' }, { id: 'c2' }, 'nope'],
    });
    expect(parsed?.tokens).toBe(0);
    expect(parsed?.usedInResponses).toBe(0);
    expect(parsed?.chunks).toEqual([{ id: 'c1', text: 'ok' }]);
  });
});

describe('list helpers', () => {
  it('appends, patches by id and removes by id', () => {
    const one = source({ id: 'one' });
    const two = source({ id: 'two', status: 'failed' });

    const list = withSourceAdded([one], two);
    expect(list.map((s) => s.id)).toEqual(['one', 'two']);

    const patched = withSourcePatched(list, 'two', { status: 'training' });
    expect(patched[0].status).toBe('trained');
    expect(patched[1].status).toBe('training');

    expect(withSourceRemoved(patched, 'one').map((s) => s.id)).toEqual(['two']);
  });

  it('leaves the list alone when the id is unknown', () => {
    const list = [source({ id: 'one' })];
    expect(withSourcePatched(list, 'ghost', { status: 'failed' })).toEqual(list);
    expect(withSourceRemoved(list, 'ghost')).toEqual(list);
  });
});

describe('pages', () => {
  it('reads a pre-pages payload forward with the seeded catalogue, not an empty grid', () => {
    // The no-migration property this store relies on: `parseKnowledge` spreads
    // over INITIAL_KNOWLEDGE, and `pages` is the one field there that is seeded
    // populated. Without this, an existing user's stored payload would open the
    // Interface tab, the skill page-picker and the skill drawer's `Interface:`
    // field all blank, with no way to fill them.
    const legacy = JSON.stringify({ addedIds: [], sources: [], retrain: 'never' });
    const parsed = parseKnowledge(legacy);
    expect(parsed.pages.length).toBe(INITIAL_KNOWLEDGE.pages.length);
    expect(parsed.pages.length).toBeGreaterThan(0);
  });

  it('lets a stored catalogue replace the seed, including an emptied one', () => {
    // Deleting every page has to stick — otherwise the seed grows back on reload
    // and the remove action silently does nothing.
    expect(parseKnowledge(JSON.stringify({ pages: [] })).pages).toEqual([]);
  });

  it('coerces an unknown element group rather than dropping the element', () => {
    const parsed = parsePage({
      id: 'p1',
      name: 'Dashboard',
      elements: [{ id: 'e1', label: 'Thing', group: 'telepathy', tag: 'Div' }],
    });
    expect(parsed?.elements[0].group).toBe('contents');
  });

  it('coerces a missing scan status to ready, never to a stuck spinner', () => {
    expect(parsePage({ id: 'p1', name: 'Dashboard' })?.status).toBe('ready');
    expect(parsePage({ id: 'p1', name: 'Dashboard', status: 'scanning' })?.status).toBe('scanning');
  });

  it('drops a page with no id or no name, and rejects a non-object', () => {
    expect(parsePage({ name: 'no id' })).toBeNull();
    expect(parsePage({ id: 'no-name' })).toBeNull();
    expect(parsePage(null)).toBeNull();
  });

  it('gives every seeded page at least one element, so no card reads "0 Element"', () => {
    INITIAL_KNOWLEDGE.pages.forEach((page) => {
      expect(page.elements.length).toBeGreaterThan(0);
      expect(page.urlRule).toBeTruthy();
    });
  });
});
