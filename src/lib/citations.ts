import type { CitationAudience, CitedSource } from '@/data/analytics';

/**
 * What an answer names, and to whom — PRD-582, PRD-455.
 *
 * ## One rule, two surfaces
 *
 * The widget's answer and `ThinkingTrace` on `/conversations` are the same
 * object drawn twice (CLAUDE.md, "the reasoning trace is one object drawn on
 * two surfaces"), so the decision about which citations an END USER may see
 * lives here rather than in either component. Two copies of this predicate
 * would drift the first time one of them gained a case, and the failure mode is
 * silent: the widget would name a source the record says was hidden.
 *
 * ## The rule, and why it is this one
 *
 * PRD-582 asks for citations "regardless of training mode", and the shape
 * chosen for it (Option A in the 4 September triage) takes that literally: a
 * citation is NAMED from whatever its source kind can give. A crawled page
 * gives a title and a URL, an uploaded file gives a filename, a video gives a
 * title and a timestamp, and content pushed through MCP gives a document name
 * and nothing else. Every one of those is shown.
 *
 * The rejected reading was to name only what could be linked and collapse the
 * rest into a count. It is the tidier rule and it fails the account that
 * drove the ticket: Gojob's sources are precisely the ones with no URL, so a
 * count is all they would ever see. A name the reader can carry back to their
 * own documentation is worth more than silence, even when Jimo cannot open it
 * for them.
 *
 * So the only thing that withholds a citation is WHO IS READING. PRD-455:
 * Tyredating's Zendesk is readable by their project managers and not by the
 * garagistes the agent answers, so a `team` source is used by the answer, named
 * in review, and never named in the widget. Missing link and restricted
 * audience are separate questions on purpose — a link is about whether a
 * destination exists, an audience is about whether this reader may be sent to
 * one.
 *
 * ## The record keeps everything
 *
 * `withheld` is not dropped. It is what the builder sees in conversation review,
 * which is the half of PRD-582 that is not about end users at all: "where did
 * this answer come from, was the training correct, is that source still up to
 * date". An answer that hides a citation from a reader and then also hides it
 * from the person auditing the agent would make review lie.
 */

/** Re-exported so a component reads the audience type from the rule module it
 *  is already importing. Defined on the record in `analytics.ts`. */
export type { CitationAudience };

/** One reason, not an enum of one for its own sake: `ThinkingTrace` labels the
 *  badge from it, and a second reason is exactly the kind of case this module
 *  exists to keep in one place. */
export type WithheldReason = 'team-only';

export interface CitationSplit {
  /** Named in the answer the end user reads. Linked where there is a link. */
  shown: CitedSource[];
  /** Used by the answer, not named to the end user. Review still shows them. */
  withheld: CitedSource[];
}

/** Why this citation is not named to the end user, or `null` when it is. */
export function withheldReason(source: CitedSource): WithheldReason | null {
  return (source.audience ?? 'everyone') === 'team' ? 'team-only' : null;
}

export function splitCitations(sources: CitedSource[] = []): CitationSplit {
  const shown: CitedSource[] = [];
  const withheld: CitedSource[] = [];
  for (const source of sources) {
    (withheldReason(source) === null ? shown : withheld).push(source);
  }
  return { shown, withheld };
}

/**
 * How a citation reads, given what its source kind actually carries.
 *
 * The label is always there. `detail` is whatever else the kind can offer that
 * helps the reader find the thing again: a timestamp on a video (PRD-583's
 * restitution half), nothing on a plain page, since its title is already the
 * whole address as far as a reader is concerned.
 */
export function citationText(source: CitedSource): string {
  return source.detail ? `${source.label} · ${source.detail}` : source.label;
}

/** The line that stands in for citations this reader may not be named. */
export function countLine(n: number): string {
  return `Based on ${n} more source${n === 1 ? '' : 's'} not shared here`;
}

/** Review's one-line summary of what the reader actually got. */
export function reviewSummary(split: CitationSplit): string {
  const total = split.shown.length + split.withheld.length;
  return `${split.shown.length} of ${total} shown to the end user`;
}
