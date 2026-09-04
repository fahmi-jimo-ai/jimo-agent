import { describe, it, expect } from 'vitest';
import { isCovered } from './escalationEngine';

/**
 * `isCovered` decides whether the widget presents its answer as fact or marks
 * it — PRD-554, PRD-576. It is a simulator heuristic standing in for a retrieval
 * score, so what is worth asserting is the shape of the decision, not the
 * quality of the phrase list.
 */
describe('isCovered', () => {
  it('covers the subject the canned answer is actually about', () => {
    expect(isCovered('How do I set up SSO?')).toBe(true);
    expect(isCovered('the sign in page keeps failing')).toBe(true);
  });

  it('does not cover a question the knowledge says nothing about', () => {
    // PRD-576's case: a navigation question about a screen nobody trained.
    expect(isCovered('Where is the account settings tab?')).toBe(false);
    expect(isCovered('Can I export my invoices?')).toBe(false);
  });

  it('ignores case, so a shouted question is judged the same way', () => {
    expect(isCovered('WHERE DO I CHANGE MY PASSWORD')).toBe(true);
  });

  it('treats an empty question as uncovered rather than covered', () => {
    // The safe direction: an answer nobody asked for should never be presented
    // as grounded.
    expect(isCovered('')).toBe(false);
  });
});
