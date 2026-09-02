import * as React from 'react';
import { createPortal } from 'react-dom';
import { useEscalation } from '@/state/useEscalation';
import { useKnowledge } from '@/state/useKnowledge';
import { useSkills } from '@/state/useSkills';
import { evaluate, isRejection, REASON_COPY, type Decision } from './escalationEngine';
import { SAMPLE_BRIEF } from '@/data/fixtures';
import { WidgetIcons, Ico } from './WidgetIcons';
import type { KnowledgeSource } from '@/data/knowledgeSources';

/**
 * The Jimo agent launcher, in the layout trigger-demo currently ships.
 *
 * ## Why the DOM changed and the CSS did not
 *
 * `src/styles/widget.css` was ported whole from
 * `trigger-demo/builder/src/styles/widget.css` and is still in step with it —
 * same 1705-line generation, only this repo's own port header differs. What was
 * NOT ported was the markup: this file used to render four of the prototype's
 * nine states, so roughly a third of that stylesheet — `.ag-pill`,
 * `.ag-runlog`, `.ag-botbar`, the `.ag-opt-*` rows and the four `s-guide-*` /
 * `s-execute-*` gates — styled nodes that did not exist.
 *
 * The slots below now match `trigger-demo/builder/src/prototype/prototype.html`
 * one for one, in its order. Nothing in widget.css was touched to make them
 * render; if a slot looks wrong, the markup is wrong, not the stylesheet.
 *
 * ## Which states this widget can actually reach
 *
 * `escalationEngine` answers support questions. It drives `idle`, `expanded`,
 * `thinking` and `response`, exactly as before — those four are the live
 * widget. The other five are the prototype's CRM-agent flows (asking a
 * clarifying question, guiding a user through a form, executing steps for
 * them), and nothing in this repo produces them: there is no host app to guide
 * anyone around. They are rendered as LAYOUT so the stylesheet has its nodes
 * and each frame can be shot and diffed, and reached through the `state`
 * override, which Storybook uses. Wiring them means giving the widget a host to
 * act on — that is a different piece of work, not a missing `if`.
 *
 * ## What is invented here
 *
 * Everything the guide / execute / asking slots SAY. The prototype's own copy
 * is about a CRM deal pipeline; the strings below are the support equivalents.
 * No artboard and no PRD defines them. Same quarantine as `MATCHERS` in
 * fixtures.ts.
 *
 * ## The run log is the pill's expanded face
 *
 * `.ag-pill` collapsed → `.ag-runlog.show` expanded is the widget's own version
 * of the disclosure `ThinkingTrace` draws on `/conversations`: one line of what
 * the agent is doing, opening onto the list of what it has done. Same object,
 * two surfaces — keep them recognisable as each other.
 *
 * ## Three proposals live here, and they are marked
 *
 * Everything above describes the widget as ported. Three slots below are NEW
 * design, answering tickets rather than transcribing the prototype, and their
 * styles are quarantined in `src/styles/widget-proposals.css` for the same
 * reason: so `widget.css` stays a whole-file port.
 *
 *   - **PRD-595** — the thinking panel ACCUMULATES its steps and speaks up on a
 *     long wait, instead of rotating one line. See THINK_STEPS.
 *   - **PRD-589** — a context/skill picker in the chat bar, so the end user
 *     picks what the agent may read and run. See ContextPicker.
 *   - **PRD-590** — a reader for articles hosted in Jimo, so the knowledge base
 *     has a reading surface inside the customer's product. See the `reading`
 *     state.
 */

/** The prototype's nine, plus `reading` — PRD-590's article view, which the
 *  upstream prototype has no equivalent for. `s-{state}` on `.proto` is what
 *  widget.css (and widget-proposals.css, for `reading`) gates on. */
export type WState =
  | 'idle'
  | 'expanded'
  | 'thinking'
  | 'response'
  | 'reading'
  | 'asking'
  | 'guide-waiting'
  | 'guide-checking'
  | 'execute-action'
  | 'execute-thinking';

/** The states this build can actually produce. */
const LIVE_STATES: WState[] = ['idle', 'expanded', 'thinking', 'response', 'reading'];

/**
 * PRD-595 — two think durations, and the slow one is the DEFAULT.
 *
 * Altior's report is specific: "at startup it is hard to see that anything is
 * running", and thinking time between steps is explicitly tolerated. So the
 * first answer of a session is the slow one here, and every answer after it is
 * quick — which is both what their users experience and what makes the frame
 * this ticket is about the FIRST thing a reviewer sees, rather than something
 * reachable only through a Storybook override.
 */
const COLD_THINK_MS = 5200;
const WARM_THINK_MS = 1800;
/** When the wait stops being ordinary and the panel should say so. Comfortably
 *  inside a cold start and out of reach of a warm one. */
const HOLD_MS = 4000;

/**
 * The steps, which now ACCUMULATE rather than replace each other.
 *
 * A single line that rewrites itself every second is indistinguishable from a
 * loop — there is no evidence of work completed, which is exactly what Altior's
 * users read as "spinning for nothing". Keeping finished steps on screen turns
 * the same wait into a list that is visibly getting longer.
 *
 * That is also the widget growing the rail `ThinkingTrace` already draws on
 * /conversations. CLAUDE.md asks that the two surfaces stay recognisable as
 * each other; this is what closes the gap rather than widening it.
 */
const THINK_STEPS: Array<{ label: string; icon: string }> = [
  { label: 'Reading your question', icon: 'i-eye' },
  { label: 'Searching the knowledge base', icon: 'i-routing-2' },
  { label: 'Comparing similar answers', icon: 'i-columns' },
  { label: 'Writing the answer', icon: 'i-pen' },
];

const STARTERS = [
  'How do I set up SSO?',
  "The SSO login still doesn't work",
  'I want to talk to a human',
];

/* ── Invented, and labelled as such ────────────────────────────────────────
   Copy for the five states this repo cannot reach. The prototype fills these
   from a live CRM run; there is no run here, so they are fixtures. */
type PillFace = {
  /** `is-icon` shows a glyph, `is-spin` shows the spinner. */
  mode: 'icon' | 'spin';
  icon?: string;
  warn?: boolean;
  title: string;
  sub?: string;
};

const PILL_FACE: Record<
  Exclude<WState, 'idle' | 'expanded' | 'thinking' | 'response' | 'reading' | 'asking'>,
  PillFace
> = {
  'guide-waiting': {
    mode: 'icon',
    icon: 'i-mouse-square',
    title: 'Guiding you to Settings → SSO',
    sub: 'Step 2 of 4 · waiting for your action...',
  },
  'guide-checking': { mode: 'spin', title: 'Checking your action...' },
  'execute-action': {
    mode: 'icon',
    icon: 'i-mouse-square',
    title: 'Following up — Verify domain',
    sub: '3 of 5',
  },
  'execute-thinking': { mode: 'spin', title: 'Thinking...' },
};

const BOTBAR_TEXT: Record<string, string> = {
  'guide-waiting': 'Jimo AI is guiding you...',
  'guide-checking': 'Jimo AI is guiding you...',
  'execute-action': 'Jimo AI is doing an action for you...',
  'execute-thinking': 'Jimo AI is doing an action for you...',
};

const RUN_LOG = [
  'Read the current page',
  'Opened Settings',
  'Found the SSO section',
  'Waiting for you to paste the metadata URL',
];

const QUESTION = {
  index: 1,
  total: 4,
  text: 'Which identity provider are you connecting?',
  options: ['Okta', 'Microsoft Entra ID', 'Google Workspace', 'Something else'],
};

interface Reply { title?: string; body: string; handoff?: Decision }

export function AgentWidget({
  onHandoff,
  state: stateOverride,
}: {
  onHandoff: (d: Decision, brief: string) => void;
  /**
   * Forces a state and freezes the engine. Storybook's way into the five
   * frames this repo has no host app to produce — see the header comment.
   */
  state?: WState;
}) {
  const cfg = useEscalation();
  const { sources } = useKnowledge();
  const { skills } = useSkills();

  const [live, setLive] = React.useState<WState>('idle');
  const [draft, setDraft] = React.useState('');
  const [echo, setEcho] = React.useState('');
  const [reply, setReply] = React.useState<Reply | null>(null);
  /** How many THINK_STEPS have finished. The live one is `step`. */
  const [step, setStep] = React.useState(0);
  /** PRD-595 — the wait has run long enough to be worth acknowledging. */
  const [holding, setHolding] = React.useState(false);
  /** PRD-595 — has this session already answered once? The first is the slow one. */
  const [answeredOnce, setAnsweredOnce] = React.useState(false);
  const [failedStreak, setFailedStreak] = React.useState(0);
  const [headOpen, setHeadOpen] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(-1);
  /** PRD-590 — the article being read, if any. */
  const [article, setArticle] = React.useState<KnowledgeSource | null>(null);

  /**
   * PRD-589 — what THIS end user lets the agent use, for THIS conversation.
   *
   * Seeded from what the admin configured (page context on, every active skill
   * available) rather than from nothing. Defaulting everything off would read
   * as a privacy win and behave as a regression: every existing deployment
   * would silently stop working until each user opted back in, one skill at a
   * time. The ask is a CHOICE, not a new default — so the control is one click
   * from the input, and the count on it is what makes the current exposure
   * legible without opening anything.
   */
  const [ctxPage, setCtxPage] = React.useState(true);
  const [ctxOff, setCtxOff] = React.useState<string[]>([]);
  const [ctxOpen, setCtxOpen] = React.useState(false);

  const state = stateOverride ?? live;
  const frozen = stateOverride != null;

  /** PRD-590. Only trained articles — one still training has nothing to show. */
  const articles = React.useMemo(
    () => sources.filter((s) => s.kind === 'hosted' && s.status === 'trained'),
    [sources],
  );
  const activeSkills = React.useMemo(() => skills.filter((s) => s.active), [skills]);
  const allowedSkills = activeSkills.filter((s) => !ctxOff.includes(s.id));
  /** What the badge counts: everything the agent may currently touch. */
  const ctxCount = allowedSkills.length + (ctxPage ? 1 : 0);

  const timers = React.useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  React.useEffect(() => clearTimers, []);

  // Advance the thinking step while, and only while, we are thinking. The
  // steps ACCUMULATE now, so this stops at the last one instead of wrapping:
  // a list that restarts is the same "spinning for nothing" the ticket is about.
  React.useEffect(() => {
    if (state !== 'thinking') return;
    const total = answeredOnce ? WARM_THINK_MS : COLD_THINK_MS;
    // Paced off the real duration so the last step lands as the answer does,
    // rather than a fixed interval that finishes early and then sits still.
    const id = window.setInterval(
      () => setStep((s) => Math.min(s + 1, THINK_STEPS.length - 1)),
      total / THINK_STEPS.length,
    );
    return () => window.clearInterval(id);
  }, [state, answeredOnce]);

  const send = (text: string) => {
    if (frozen) return;
    const q = text.trim();
    if (!q) {
      if (state === 'idle') setLive('expanded');
      return;
    }
    setEcho(q);
    setDraft('');
    setStep(0);
    setHolding(false);
    setReply(null);
    setArticle(null);
    setLive('thinking');

    const decision = evaluate(q, cfg, failedStreak);
    setFailedStreak((n) => (isRejection(q) ? n + 1 : 0));

    const thinkMs = answeredOnce ? WARM_THINK_MS : COLD_THINK_MS;
    // The reassurance is its own timer, not a step: it is about the WAIT, not
    // about what the agent is doing, and tying it to a step would make it fire
    // on a fast answer that happened to reach that step.
    timers.current.push(window.setTimeout(() => setHolding(true), HOLD_MS));

    timers.current.push(
      window.setTimeout(() => {
        setHolding(false);
        setAnsweredOnce(true);
        if (!decision) {
          setReply({
            title: 'Here’s what I found',
            body: 'Single sign-on is configured under **Settings → SSO**. Add your identity provider’s metadata URL, then verify your domain so members can sign in with it.',
          });
          setLive('response');
          return;
        }

        if (decision.behaviour === 'immediate') {
          // Stated intent, or the customer's own topic rule: no card, no ask.
          onHandoff(decision, SAMPLE_BRIEF);
          setLive('idle');
          setEcho('');
          return;
        }

        setReply({
          title: 'Let me get a person on this',
          body: `${REASON_COPY[decision.reason]}, so I can hand this to the support team with everything you've already told me — you won't have to repeat it.`,
          handoff: decision,
        });
        setLive('response');
      }, thinkMs)
    );
  };

  /** PRD-590 — open an article. Clears the reply so the window body has one
   *  writer, the same way `asking` and `response` already share it. */
  const openArticle = (source: KnowledgeSource) => {
    clearTimers();
    setReply(null);
    setArticle(source);
    setLive('reading');
  };

  const placeholder =
    state === 'thinking' ? 'Write a follow-up...' : state === 'response' ? 'Write a reply...' : 'Ask Jimo AI...';

  const pill = LIVE_STATES.includes(state) || state === 'asking' ? null : PILL_FACE[state];
  const asking = state === 'asking';
  const reading = state === 'reading';
  // Falls back to the first article so the `state` override reaches this frame
  // the way it reaches the other five — Storybook forces the state, never the
  // selection that would normally have set it.
  const shownArticle = article ?? articles[0] ?? null;

  return (
    <div className={`proto s-${state}`}>
      <WidgetIcons />
      <div
        className={`agent${headOpen ? ' head-open' : ''}`}
        id="agent"
        onMouseEnter={() => setHeadOpen(true)}
        onMouseLeave={() => setHeadOpen(false)}
      >
        <div className="ag-surface">
          {/* Expanded: starter chips */}
          <div className="ag-suggestions is-chips">
            {STARTERS.map((s, i) => (
              <button
                key={s}
                className="ag-sugg ag-stagger"
                style={{ ['--d' as string]: `${(0.04 + i * 0.045).toFixed(3)}s` }}
                onClick={() => send(s)}
              >
                <span className="ag-sugg-main">
                  <span className="ag-sugg-icon"><Ico id="i-message-question" /></span>
                  <span className="ag-sugg-label">{s}</span>
                </span>
                <span className="ag-sugg-cta">Ask<Ico id="i-arrow-up" /></span>
              </button>
            ))}
          </div>

          {/* PRD-590 — the knowledge base, readable. Sits under the starter
              chips on `expanded` and is gated by data, not by a state class:
              a workspace with no hosted articles renders nothing here, which
              is the correct empty state for a customer who has not written
              any. `.ag-suggestions` is `display:none` outside `expanded`, and
              this list follows it because it lives inside the same slot. */}
          {state === 'expanded' && articles.length > 0 && (
            <div className="ag-kb">
              <div className="ag-kb-head">
                <Ico id="i-book" />
                From your knowledge base
              </div>
              {articles.map((source) => (
                <button key={source.id} className="ag-kb-item" onClick={() => openArticle(source)}>
                  <Ico id="i-book" />
                  <span>{source.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Thinking — PRD-595. The steps accumulate: everything finished
              stays on screen with a check, the current one keeps the spinner.
              A rotating single line cannot show progress, and progress is the
              whole complaint. */}
          <div className="ag-think ag-animborder">
            <div className="ag-think-inner">
              <p className="ag-think-echo ag-stagger" style={{ ['--d' as string]: '.05s' }}>{echo}</p>
              <div className="ag-think-steps">
                {THINK_STEPS.slice(0, step + 1).map((s, i) => {
                  const done = i < step;
                  return (
                    <div key={s.label} className={`ag-think-row ${done ? 'is-done' : 'is-live'}`}>
                      <span className="ag-think-row-icon">
                        {/* The finished ones swap their own glyph for a check —
                            the glyph said what was happening, the check says it
                            happened. */}
                        <Ico id={done ? 'i-check' : 'i-spinner'} />
                      </span>
                      {s.label}
                    </div>
                  );
                })}
              </div>
              {holding && (
                <p className="ag-think-hold">
                  Still working — this one is taking a little longer than usual.
                </p>
              )}
            </div>
          </div>

          {/* Response window — and, in `asking`, the question. ONE window, one
              body: the option rows are children of `.ag-win-body`, never a
              second panel welded to this one. See widget.css's own note. */}
          <div className="ag-window">
            <div className="ag-win-head" style={{ ['--d' as string]: '.03s' }}>
              <span className="ag-grip"><Ico id="i-grip" /></span>
              {/* One node, three writers now: the AI name in `response`, the
                  question counter in `asking`, the article title in `reading`. */}
              <span className="ag-win-title">
                {asking
                  ? `Question ${QUESTION.index} of ${QUESTION.total}`
                  : reading
                    ? shownArticle?.label
                    : 'Jimo AI'}
              </span>
              {/* Before .ag-win-actions, so reading order is counter → navigate
                  → window actions. CSS shows it in `asking` only. */}
              <span className="ag-opt-nav">
                <button className="ag-chev" title="Previous question"><Ico id="i-chevron-left" /></button>
                <button className="ag-chev" title="Next question"><Ico id="i-chevron-right" /></button>
              </span>
              <span className="ag-win-actions">
                <button
                  className="ag-round-btn"
                  title="Close"
                  onClick={() => { clearTimers(); setLive('idle'); setReply(null); setEcho(''); }}
                >
                  <Ico id="i-close" />
                </button>
              </span>
            </div>

            <div className="ag-win-body">
              <div className="ag-md">
                {asking ? (
                  <p className="ag-md-p">{QUESTION.text}</p>
                ) : reading && shownArticle ? (
                  // PRD-590 — the article, read inside the product. There is no
                  // URL to open instead: that absence IS the feature.
                  <div className="ag-read-body">
                    <button className="ag-read-back" onClick={() => setLive('expanded')}>
                      <Ico id="i-chevron-left" />
                      All articles
                    </button>
                    {(shownArticle.body ?? '').split('\n\n').map((para, i) => (
                      <p key={i} className="ag-read-p">
                        {para}
                      </p>
                    ))}
                    <p className="ag-read-private">
                      <Ico id="i-lock" />
                      Private to your workspace — not published, not indexed.
                    </p>
                  </div>
                ) : (
                  <>
                    {reply?.title && <h2 className="ag-md-h2">{reply.title}</h2>}
                    {reply && <Markdown text={reply.body} />}
                  </>
                )}
              </div>

              {/* The hand-off card IS this CTA row — the widget's own grammar,
                  dark primary + outline secondary, rather than a new surface.
                  `:empty` is display:none, which is what keeps it out of the
                  way in `asking`. */}
              <div className="ag-ctas">
                {!asking && reply?.handoff && (
                  <>
                    <button
                      className="ag-cta ag-cta-dark ag-stagger"
                      style={{ ['--d' as string]: '.26s' }}
                      onClick={() => {
                        onHandoff(reply.handoff!, SAMPLE_BRIEF);
                        setLive('idle');
                        setReply(null);
                        setEcho('');
                      }}
                    >
                      Talk to a human
                    </button>
                    <button
                      className="ag-cta ag-cta-outline ag-stagger"
                      style={{ ['--d' as string]: '.32s' }}
                      onClick={() => setReply({ ...reply, handoff: undefined })}
                    >
                      Not now
                    </button>
                  </>
                )}
              </div>

              {/* Asking only — gated by widget.css, not by a conditional here,
                  so the rows keep their entrance animation. */}
              <div className="ag-opt-list ag-stagger" style={{ ['--d' as string]: '.12s' }}>
                {QUESTION.options.map((opt, i) => (
                  <button
                    key={opt}
                    className={`ag-opt${i === selected ? ' is-sel' : ''}`}
                    onClick={() => setSelected(i)}
                  >
                    <span className="ag-opt-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="ag-opt-text">{opt}</span>
                  </button>
                ))}
              </div>
              <div className="ag-opt-foot ag-stagger" style={{ ['--d' as string]: '.18s' }}>
                <button className="ag-submit">Submit</button>
                <button className="ag-skip">Skip</button>
              </div>

              <div className="ag-feedback ag-stagger-fall" style={{ ['--d' as string]: '.34s' }}>
                <button className="ag-fb-btn" title="Like"><Ico id="i-like" /></button>
                <button className="ag-fb-btn ag-fb-dislike" title="Dislike"><Ico id="i-like" /></button>
                <button className="ag-fb-btn" title="Copy"><Ico id="i-copy" /></button>
              </div>
            </div>
          </div>

          {/* Guidance / Execute: run log — the pill's expanded face. It sits
              ABOVE the pill, as in the prototype, so the pill stays the thing
              nearest the bar the whole time it is open. */}
          <div className={`ag-runlog${logOpen ? ' show' : ''}`}>
            {RUN_LOG.length === 0 ? (
              <div className="ag-runlog-item is-empty">No steps yet</div>
            ) : (
              RUN_LOG.map((l) => (
                <div key={l} className="ag-runlog-item">
                  <Ico id="i-check" />
                  {l}
                </div>
              ))
            )}
          </div>

          {/* Guidance / Execute: status pill */}
          <div
            className={`ag-pill ag-animborder ${pill?.mode === 'spin' ? 'is-spin' : 'is-icon'}${pill?.warn ? ' is-warn' : ''}`}
            title={logOpen ? 'Collapse steps' : 'Show steps'}
            onClick={() => setLogOpen((o) => !o)}
          >
            <span className="ag-pill-icon ag-stagger-pop" style={{ ['--d' as string]: '.05s' }}>
              <Ico id={pill?.icon ?? 'i-mouse-square'} />
            </span>
            <span className="ag-pill-spin ag-stagger-pop" style={{ ['--d' as string]: '.05s' }}>
              <Ico id="i-spinner" />
            </span>
            <span className="ag-pill-text ag-stagger" style={{ ['--d' as string]: '.1s' }}>
              <span className="ag-pill-title">{pill?.title ?? ''}</span>
              <span className="ag-pill-sub">{pill?.sub ?? ''}</span>
            </span>
          </div>

          {/* Input bar (idle / expanded / thinking / response / asking) */}
          <div className="ag-bar">
            <span className="ag-bar-av" aria-hidden="true" />
            {/* PRD-589 — before the input, because it qualifies what you are
                about to send. After it, it would read as an action on the
                message rather than a setting for it. */}
            <ContextPicker
              open={ctxOpen}
              onOpenChange={setCtxOpen}
              count={ctxCount}
              page={ctxPage}
              onPageChange={setCtxPage}
              skills={activeSkills}
              off={ctxOff}
              onOffChange={setCtxOff}
            />
            <input
              className="ag-bar-input"
              value={draft}
              placeholder={placeholder}
              autoComplete="off"
              onFocus={() => !frozen && state === 'idle' && setLive('expanded')}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(draft)}
            />
            <button className="ag-bar-btn" aria-label="Send" onClick={() => send(draft)}>
              <Ico id="i-arrow-up" />
            </button>
            <button className="ag-bar-stop" aria-label="Stop" onClick={() => { clearTimers(); setLive('expanded'); }}>
              <Ico id="i-stop-round" />
            </button>
          </div>

          {/* Bottom bar — in guide / execute it IS the input bar: widget.css
              hides `.ag-bar` in those four states and shows this in its place. */}
          <div className="ag-botbar">
            <span className="ag-bar-av ag-stagger" style={{ ['--d' as string]: '.03s' }} aria-hidden="true" />
            <span className="ag-botbar-text ag-stagger" style={{ ['--d' as string]: '.08s' }}>
              {BOTBAR_TEXT[state] ?? ''}
            </span>
            <button className="ag-ghost-stop ag-stagger" style={{ ['--d' as string]: '.14s' }}>
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PRD-589 — what the agent may look at, and what it may run, chosen here.
 *
 * v6Protect's argument is that both decisions belong to the END USER: the data
 * on the page is theirs, and being acted for without asking is startling. Both
 * are workspace-global admin settings today, which is either too permissive or
 * too restrictive for everyone at once. Their own proposal was a picker in the
 * chat bar, like the context and tool selectors other chat products ship — so
 * that is the shape, rather than a settings screen an end user would never
 * find.
 *
 * ## It is portaled, because `.ag-bar` clips
 *
 * The trigger belongs in the bar — that is the whole request — but `.ag-bar`
 * carries `overflow: hidden` in widget.css, so an absolutely-positioned panel
 * inside it renders at the right size and is then cut off entirely. That
 * stylesheet is a whole-file port and must not be patched to fix a slot it
 * does not know about, so the panel goes to `document.body` and is positioned
 * from the trigger's rect instead.
 *
 * This is the same answer `src/components/app/Menu.tsx` gives on the dashboard,
 * for the same reason, and it comes with the same two consequences CLAUDE.md
 * records: outside-click detection has to test the PANEL as well as the trigger
 * (they are no longer parent and child, so one `contains` call cannot cover
 * both), and the positioning effect must not depend on a value that is a fresh
 * object each render, or it re-measures, re-renders and loops.
 *
 * It also comes with a third consequence that is this widget's alone. Per its
 * port header, widget.css scopes the whole `--agent-*` block to `#agent`
 * instead of `:root`, so those variables leak into no Storybook story — and
 * resolve to nothing outside the widget. A panel on `document.body` is outside
 * it, and renders unthemed: no background, a currentColor border, the wrong
 * font. So the variables it uses are READ off the trigger (which is inside
 * `#agent`) and set on the panel. Copying beats re-declaring them here: a
 * customer's brand override still reaches the panel, and nothing is
 * duplicated out of the stylesheet to drift later.
 *
 * `position: fixed` is not an escape hatch here, before anyone tries it —
 * `.ag-bar` carries an identity `transform`, which makes it the containing
 * block for fixed descendants and clips them just the same.
 */

/** The variables `.ag-ctx-panel` and its rows resolve, in widget-proposals.css.
 *  Kept next to that file's rules — add one there, add it here. */
const PANEL_VARS = [
  '--agent-panel-bg', '--agent-surface', '--agent-surface-hover',
  '--agent-panel-border-width', '--agent-panel-border-style', '--agent-panel-border-color',
  '--agent-border', '--agent-border-minimal',
  '--agent-panel-radius', '--agent-radius-panel', '--agent-radius-row', '--agent-radius-full',
  '--agent-panel-shadow', '--agent-shadow-panel',
  '--agent-text', '--agent-text-muted', '--agent-primary-10',
  '--ag-accent', '--ag-accent-fg', '--ag-input-family', '--ag-input-size',
] as const;
function ContextPicker({
  open,
  onOpenChange,
  count,
  page,
  onPageChange,
  skills,
  off,
  onOffChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  page: boolean;
  onPageChange: (on: boolean) => void;
  skills: Array<{ id: string; name: string; description: string; mode: string }>;
  off: string[];
  onOffChange: (next: string[]) => void;
}) {
  const trigger = React.useRef<HTMLButtonElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ left: number; bottom: number } | null>(null);
  const [theme, setTheme] = React.useState<React.CSSProperties>({});

  // Measured in a layout effect so the panel never paints at 0,0 first. The
  // deps are `open` alone — every other value here is a primitive read at call
  // time, and adding one that is rebuilt each render is the loop CLAUDE.md
  // warns about.
  React.useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = trigger.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Anchored to the trigger's TOP edge and grown upward: the bar sits at
      // the bottom of the viewport, so a panel opening downward would be off
      // screen.
      setPos({ left: r.left, bottom: window.innerHeight - r.top + 8 });
      // Carry the widget's theme across the portal — see the header.
      const cs = getComputedStyle(el);
      const next: Record<string, string> = {};
      for (const name of PANEL_VARS) {
        const value = cs.getPropertyValue(name);
        if (value) next[name] = value;
      }
      setTheme(next as React.CSSProperties);
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      // Both, not one: portaled, the panel is no longer inside the trigger's
      // subtree, so testing the trigger alone would close the panel on every
      // click INSIDE it.
      if (trigger.current?.contains(t) || panel.current?.contains(t)) return;
      onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  const toggleSkill = (id: string) =>
    onOffChange(off.includes(id) ? off.filter((x) => x !== id) : [...off, id]);

  return (
    <div className="ag-ctx">
      <button
        ref={trigger}
        type="button"
        className={`ag-ctx-btn${open ? ' is-open' : ''}`}
        aria-expanded={open}
        title="Choose what the agent can use"
        onClick={() => onOpenChange(!open)}
      >
        <Ico id="i-sliders" />
        {/* Hidden at zero rather than showing "0": a badge reading zero is
            noise, and the button's own state already says "nothing on". */}
        {count > 0 && <span className="ag-ctx-count">{count}</span>}
      </button>

      {open && pos && createPortal(
        <div
          ref={panel}
          className="ag-ctx-panel"
          role="dialog"
          aria-label="What the agent can use"
          style={{ ...theme, left: pos.left, bottom: pos.bottom }}
        >
          <div className="ag-ctx-group">Context</div>
          <button
            type="button"
            className={`ag-ctx-row${page ? ' is-on' : ''}`}
            onClick={() => onPageChange(!page)}
          >
            <span className="ag-ctx-box"><Ico id="i-check" /></span>
            <span className="ag-ctx-row-text">
              <span className="ag-ctx-row-title">Read this page</span>
              <span className="ag-ctx-row-sub">
                Lets the agent see what is on screen so you do not have to describe it.
              </span>
            </span>
          </button>

          {skills.length > 0 && (
            <>
              <div className="ag-ctx-group">Skills it may run</div>
              {skills.map((skill) => {
                const on = !off.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    className={`ag-ctx-row${on ? ' is-on' : ''}`}
                    onClick={() => toggleSkill(skill.id)}
                  >
                    <span className="ag-ctx-box"><Ico id="i-check" /></span>
                    <span className="ag-ctx-row-text">
                      <span className="ag-ctx-row-title">{skill.name}</span>
                      {/* The mode matters more than the description here: an
                          `execute` skill ACTS, which is the half of the ticket
                          about being surprised. */}
                      <span className="ag-ctx-row-sub">
                        {skill.mode === 'execute'
                          ? 'Acts for you'
                          : skill.mode === 'guide'
                            ? 'Walks you through it'
                            : 'Explains it'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </>
          )}

          <p className="ag-ctx-note">Applies to this conversation only.</p>
        </div>,
        document.body,
      )}
    </div>
  );
}

/** The tiny subset of markdown the response bodies actually use. */
function Markdown({ text }: { text: string }) {
  const html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return <p className="ag-md-p" dangerouslySetInnerHTML={{ __html: html }} />;
}
