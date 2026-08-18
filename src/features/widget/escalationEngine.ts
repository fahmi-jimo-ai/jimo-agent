import { MATCHERS } from '@/data/fixtures';
import type { EscalationState, FrustrationLevel, Topic } from '@/state/types';

export type Reason = 'asked_for_human' | 'agent_stuck' | 'frustration' | 'topic_rule';

export interface Decision {
  reason: Reason;
  /** PRD decision 9: a stated intent opens the chat at once; an inferred one asks first. */
  behaviour: 'immediate' | 'card';
  topic?: Topic;
}

const hit = (text: string, phrases: readonly string[]) => {
  const t = text.toLowerCase();
  return phrases.some((p) => t.includes(p));
};

/**
 * Which frustration phrases count at a given sensitivity. `subtle` is the most
 * eager setting, so it accepts every tier; `furious` accepts only the loudest.
 */
function frustrationHit(text: string, level: FrustrationLevel) {
  const f = MATCHERS.frustration;
  const pools =
    level === 'subtle'
      ? [f.subtle, f.slight, f.furious]
      : level === 'slight'
        ? [f.slight, f.furious]
        : [f.furious];
  return pools.some((p) => hit(text, p));
}

/**
 * SIMULATOR HEURISTIC. Figma defines how a pill's own text is classified, never
 * how a live message matches one, so this is the honest minimum: a
 * case-insensitive substring match either way round. Short keyword pills also
 * match when they appear inside a longer message.
 */
export function matchTopic(text: string, topics: Topic[]): Topic | undefined {
  const t = text.toLowerCase().trim();
  if (!t) return undefined;
  return topics.find((topic) => {
    const label = topic.label.toLowerCase().replace(/[?"“”]/g, '').trim();
    return t.includes(label) || label.includes(t);
  });
}

/**
 * Decide whether this turn escalates.
 *
 * Precedence is the PRD's (R14): a stated request outranks a topic rule, which
 * outranks the two inferred signals. The topic label travels regardless of
 * which reason wins.
 */
export function evaluate(
  text: string,
  cfg: EscalationState,
  failedStreak: number
): Decision | null {
  if (!cfg.enabled || !cfg.vendor) return null;

  const { triggers, topics } = cfg;
  const topic = matchTopic(text, topics);

  if (triggers.explicit.on && hit(text, MATCHERS.explicitAsk)) {
    return { reason: 'asked_for_human', behaviour: 'immediate', topic };
  }

  // A matched topic is the customer's standing declaration, so it opens
  // straight away rather than asking.
  if (topic) return { reason: 'topic_rule', behaviour: 'immediate', topic };

  if (triggers.failedAnswers.on && hit(text, MATCHERS.rejection)) {
    if (failedStreak + 1 >= triggers.failedAnswers.count) {
      return { reason: 'agent_stuck', behaviour: 'card', topic };
    }
  }

  if (triggers.frustration.on && frustrationHit(text, triggers.frustration.level)) {
    return { reason: 'frustration', behaviour: 'card', topic };
  }

  return null;
}

export const isRejection = (text: string) => hit(text, MATCHERS.rejection);

export const REASON_COPY: Record<Reason, string> = {
  asked_for_human: 'You asked for a person',
  agent_stuck: "I haven't been able to answer this",
  frustration: 'This is taking too long',
  topic_rule: 'This one is better handled by a person',
};
