import { describe, it, expect } from 'vitest';
import { readSourcesSnapshot } from './demo';

/**
 * Only the pure half — the round trip itself needs `localStorage`, which the
 * node test environment does not have. What matters here is that an unreadable
 * snapshot cannot produce something the store will choke on.
 */
describe('readSourcesSnapshot', () => {
  it('returns null for nothing, for junk and for a non-array', () => {
    expect(readSourcesSnapshot(null)).toBeNull();
    expect(readSourcesSnapshot('')).toBeNull();
    expect(readSourcesSnapshot('{oops')).toBeNull();
    expect(readSourcesSnapshot('{"sources":[]}')).toBeNull();
  });

  it('returns the list it was given', () => {
    expect(readSourcesSnapshot('[]')).toEqual([]);
    expect(readSourcesSnapshot('[{"id":"a"}]')).toHaveLength(1);
  });
});
