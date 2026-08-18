import { describe, it, expect } from 'vitest';
import { classifyChip } from './classifyChip';

// The 12 worked examples printed in the Figma spec (node 29:12197).
const SPEC_EXAMPLES: Array<[string, string]> = [
  ['How do I create a hint?', 'question'],
  ['Can I show contextual help on hover/click?', 'question'],
  ['Where should I create hints?', 'question'],
  ['How to invite my team', 'question'],
  ['I want to reduce support tickets', 'topic'],
  ['I want to use the Hint builder', 'topic'],
  ['Onboarding tour for new users', 'topic'],
  ['pricing', 'keyword'],
  ['team invites', 'keyword'],
  ['billing issue', 'keyword'],
  ['adaptive audio backgrounds', 'keyword'],
  ['workspace roles & permissions', 'topic'],
];

describe('classifyChip — Figma spec examples', () => {
  it.each(SPEC_EXAMPLES)('%s -> %s', (input, expected) => {
    expect(classifyChip(input)).toBe(expected);
  });
});

describe('classifyChip — edges', () => {
  it('empty and whitespace fall back to topic', () => {
    expect(classifyChip('')).toBe('topic');
    expect(classifyChip('   ')).toBe('topic');
  });
  it('is case-insensitive', () => {
    expect(classifyChip('PRICING')).toBe('keyword');
    expect(classifyChip('HOW DO I RESET?')).toBe('question');
  });
  it('punctuation disqualifies a keyword', () => {
    expect(classifyChip('billing, invoices')).toBe('topic');
  });
});
