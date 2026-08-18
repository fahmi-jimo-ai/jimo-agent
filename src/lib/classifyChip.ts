/**
 * Topic-pill classification.
 *
 * Transcribed verbatim from the Figma spec node 29:12197 ("Instructions"),
 * which ships the reference JS implementation. Do not "improve" the rules —
 * the worked examples in classifyChip.test.ts encode the spec's own expected
 * output, and the ordering (question first, then keyword vs topic) is load
 * bearing.
 *
 * Note the vocabulary mismatch, which is deliberate: the enum value is
 * `topic`, but the user-facing label for that category is "Intent".
 */
export type TopicCategory = 'keyword' | 'topic' | 'question';

export function classifyChip(rawText: string): TopicCategory {
  // 1. Empty -> topic
  if (!rawText) return 'topic';
  const text = rawText.trim().toLowerCase();
  if (!text) return 'topic';

  // 2. Question detection (highest priority)
  if (text.endsWith('?')) return 'question';

  const questionStarters =
    /^(how|what|why|where|when|who|can|could|should|would|may|is|are|do|does|did|will)\b/;
  if (questionStarters.test(text)) return 'question';

  const questionPatterns = /(how do i|how can i|can i|is it possible to|where should i|where can i)/;
  if (questionPatterns.test(text)) return 'question';

  // Optional: treat "how to ..." as a question
  if (text.startsWith('how to ')) return 'question';

  // 3. Topic vs keyword
  const words = text.split(/\s+/);
  const wordCount = words.length;

  const nonKeywordWords = new Set([
    'i', 'you', 'we', 'they', 'he', 'she',
    'my', 'your', 'our', 'their',
    'want', 'need', 'to', 'for', 'about', 'how',
  ]);

  const hasPunctuation = /[.!?,]/.test(text);
  const hasRealWord = words.some((w) => !nonKeywordWords.has(w));
  const looksLikeKeyword = wordCount <= 3 && hasRealWord && !hasPunctuation;

  if (looksLikeKeyword) return 'keyword';

  // Fallback
  return 'topic';
}

/** User-facing label for a category. `topic` reads as "Intent" in the UI. */
export const CATEGORY_LABEL: Record<TopicCategory, string> = {
  keyword: 'Keyword',
  topic: 'Intent',
  question: 'Question',
};
