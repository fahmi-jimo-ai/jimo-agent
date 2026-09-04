import { describe, it, expect } from 'vitest';
import { citationText, countLine, reviewSummary, splitCitations, withheldReason } from './citations';
import type { CitedSource } from '@/data/analytics';

/**
 * This predicate decides what a stranger reading the widget is told about the
 * company's internal documentation, so the interesting cases are the ones where
 * a source is usable by the answer and still must not be named.
 */
const url = (over: Partial<CitedSource> = {}): CitedSource => ({
  sourceId: 'src',
  label: 'Help centre',
  kind: 'url',
  href: 'https://help.example.com/sso',
  ...over,
});

describe('withheldReason', () => {
  it('shows a public source that has a link', () => {
    expect(withheldReason(url())).toBeNull();
  });

  it('shows a source with no link, because a name is still worth having', () => {
    // The whole point of the chosen shape: Gojob's sources have no URL, and a
    // count is all they would ever see under the narrower rule.
    expect(withheldReason(url({ href: undefined }))).toBeNull();
  });

  it('withholds a team source even though it has a perfectly good link', () => {
    expect(withheldReason(url({ audience: 'team' }))).toBe('team-only');
  });

  it('withholds a team source that has no link either', () => {
    expect(withheldReason(url({ href: undefined, audience: 'team' }))).toBe('team-only');
  });

  it('treats a citation written before audiences existed as public', () => {
    expect(withheldReason(url({ audience: undefined }))).toBeNull();
  });
});

describe('splitCitations', () => {
  it('splits on audience alone, not on whether there is a link', () => {
    const sources = [
      url({ sourceId: 'a' }),
      url({ sourceId: 'b', href: undefined }),
      url({ sourceId: 'c', audience: 'team' }),
    ];
    const split = splitCitations(sources);
    expect(split.shown.map((s) => s.sourceId)).toEqual(['a', 'b']);
    expect(split.withheld.map((s) => s.sourceId)).toEqual(['c']);
  });

  it('preserves the order the answer used them in', () => {
    const sources = [url({ sourceId: 'a' }), url({ sourceId: 'b' })];
    expect(splitCitations(sources).shown.map((s) => s.sourceId)).toEqual(['a', 'b']);
  });

  it('handles a turn that cited nothing', () => {
    expect(splitCitations()).toEqual({ shown: [], withheld: [] });
  });
});

describe('citationText', () => {
  it('is the label alone when the kind carries nothing else', () => {
    expect(citationText(url())).toBe('Help centre');
  });

  it('appends what the kind does carry, which for a video is where to start', () => {
    expect(citationText(url({ kind: 'video', label: 'Declaring a visit', detail: '2:14' }))).toBe(
      'Declaring a visit · 2:14'
    );
  });
});

describe('countLine', () => {
  it('says source, not sources, for one', () => {
    expect(countLine(1)).toBe('Based on 1 more source not shared here');
  });

  it('pluralises', () => {
    expect(countLine(3)).toBe('Based on 3 more sources not shared here');
  });
});

describe('reviewSummary', () => {
  it('counts what the reader got against what the answer used', () => {
    const split = splitCitations([url({ sourceId: 'a' }), url({ sourceId: 'b', audience: 'team' })]);
    expect(reviewSummary(split)).toBe('1 of 2 shown to the end user');
  });
});
