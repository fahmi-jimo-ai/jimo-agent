import * as React from 'react';
import { useEscalation } from '@/state/useEscalation';
import { evaluate, isRejection, REASON_COPY, type Decision } from './escalationEngine';
import { SAMPLE_BRIEF } from '@/data/fixtures';
import { WidgetIcons, Ico } from './WidgetIcons';

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
 * ## PROPOSAL — a tenth state, and why it is not in widget.css
 *
 * Everything above describes the port. What follows is new design, proposed
 * against four tickets, and it is marked at every site it touches:
 *
 *   - **PRD-599** — `execute-failed`, a TENTH state the upstream prototype does
 *     not have. The ticket is a run that reasoned for 72 seconds and then said
 *     only "Un problème est survenu": generic, in front of the end user, cause
 *     nowhere. So this state names the step that broke and the reason, and
 *     offers the two ways out (retry, or a person) instead of re-proposing the
 *     step that just failed.
 *   - **PRD-595** — the thinking panel counts its own wait and, past
 *     `SLOW_AFTER_MS`, says it is still working. Altior's two busiest Skills
 *     sit at 38% completion because users read a silent wait as a dead chat.
 *   - **PRD-577** — closing the window no longer discards the conversation, and
 *     on a narrow viewport the window is a sheet rather than the whole screen.
 *     Guidance on mobile is unusable today precisely because the two halves —
 *     read the instruction, perform the action — cannot both be on screen.
 *   - **PRD-104** — an idle widget with something waiting says so.
 *
 * **The CSS for all of that is in `widget-proposal.css`, not in widget.css.**
 * That file is a port and is still in step with its source, line for line;
 * patching a rule into it would make the next re-port a merge instead of a
 * copy. The proposal sheet is loaded after it, adds only new selectors, and
 * says the same thing at its own top.
 */

/** The prototype's nine, plus `execute-failed` (PROPOSAL, PRD-599 — see above).
 *  `s-{state}` on `.proto` is what the stylesheets gate on. */
export type WState =
  | 'idle'
  | 'expanded'
  | 'thinking'
  | 'response'
  | 'asking'
  | 'guide-waiting'
  | 'guide-checking'
  | 'execute-action'
  | 'execute-thinking'
  | 'execute-failed';

/** The four the escalation engine can actually produce. */
const LIVE_STATES: WState[] = ['idle', 'expanded', 'thinking', 'response'];

const THINK_MS = 1800;
const STEP_MS = 1100;

/** The rotating status line in the thinking panel (source: THINK_CYCLE). */
const THINK_CYCLE: Array<[string, string, string]> = [
  ['Reading ', 'the current page', 'i-eye'],
  ['Checking ', 'the knowledge base', 'i-routing-2'],
  ['Comparing ', 'similar answers', 'i-columns'],
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

const PILL_FACE: Record<Exclude<WState, 'idle' | 'expanded' | 'thinking' | 'response' | 'asking'>, PillFace> = {
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
  /* PROPOSAL (PRD-599). `warn: true` is what turns the pill amber — the flag
     has been in `PillFace` and `.ag-pill.is-warn` has been in widget.css since
     the port, with nothing setting either. The title names the STEP, never the
     failure in the abstract, because "a problem occurred" is the bug. */
  'execute-failed': {
    mode: 'icon',
    icon: 'i-close',
    warn: true,
    title: 'Could not open Settings → Legal notice',
    sub: 'The link moved — Settings → Compliance now',
  },
};

const BOTBAR_TEXT: Record<string, string> = {
  'guide-waiting': 'Jimo AI is guiding you...',
  'guide-checking': 'Jimo AI is guiding you...',
  'execute-action': 'Jimo AI is doing an action for you...',
  'execute-thinking': 'Jimo AI is doing an action for you...',
  'execute-failed': 'Jimo AI stopped on step 3',
};

type RunStep = { label: string; failed?: boolean };

const RUN_LOG: RunStep[] = [
  { label: 'Read the current page' },
  { label: 'Opened Settings' },
  { label: 'Found the SSO section' },
  { label: 'Waiting for you to paste the metadata URL' },
];

/* PROPOSAL (PRD-599). The same run, stopped. The log is what makes the failure
   legible — three steps that worked and the one that did not, rather than a
   single generic line standing in for all four. Mirrors the `failed` step
   `ThinkingTrace` now draws on /conversations: same object, two surfaces. */
const FAILED_RUN_LOG: RunStep[] = [
  { label: 'Read the current page' },
  { label: 'Closed the open dialog' },
  { label: 'Could not open Settings → Legal notice', failed: true },
];

/** PROPOSAL (PRD-599) — the cause, and the two ways out of it. */
const FAILURE = {
  cause:
    'The scanned link for this page no longer resolves. The section moved to Settings → Compliance since this page was last scanned.',
  retry: 'Try again',
  escalate: 'Get a person',
};

/** PROPOSAL (PRD-595) — past this, the panel stops being silent about the wait.
 *  Altior tolerates thinking time BETWEEN steps and not at the start, so this
 *  is deliberately short. */
const SLOW_AFTER_MS = 5000;

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

  const [live, setLive] = React.useState<WState>('idle');
  const [draft, setDraft] = React.useState('');
  const [echo, setEcho] = React.useState('');
  const [reply, setReply] = React.useState<Reply | null>(null);
  const [step, setStep] = React.useState(0);
  const [failedStreak, setFailedStreak] = React.useState(0);
  const [headOpen, setHeadOpen] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(-1);
  /** PROPOSAL (PRD-595) — ms spent in `thinking`, so the wait can show itself. */
  const [elapsed, setElapsed] = React.useState(0);

  const state = stateOverride ?? live;
  const frozen = stateOverride != null;

  const timers = React.useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  React.useEffect(() => clearTimers, []);

  // Cycle the thinking step while, and only while, we are thinking.
  React.useEffect(() => {
    if (state !== 'thinking') return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % THINK_CYCLE.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [state]);

  /* PROPOSAL (PRD-595). The wait counts itself. It runs on `state`, not on
     `live`, so a frozen `thinking` — which is how the preview control and
     Storybook reach this state — still crosses SLOW_AFTER_MS and shows the
     reassurance. Resetting on the way out is what keeps a second question from
     starting at the first one's total. */
  React.useEffect(() => {
    if (state !== 'thinking') {
      setElapsed(0);
      return;
    }
    const started = Date.now();
    const id = window.setInterval(() => setElapsed(Date.now() - started), 200);
    return () => window.clearInterval(id);
  }, [state]);

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
    setReply(null);
    setLive('thinking');

    const decision = evaluate(q, cfg, failedStreak);
    setFailedStreak((n) => (isRejection(q) ? n + 1 : 0));

    timers.current.push(
      window.setTimeout(() => {
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
      }, THINK_MS)
    );
  };

  const [lead, tail, icon] = THINK_CYCLE[step];
  const placeholder =
    state === 'thinking' ? 'Write a follow-up...' : state === 'response' ? 'Write a reply...' : 'Ask Jimo AI...';

  const pill = LIVE_STATES.includes(state) || state === 'asking' ? null : PILL_FACE[state];
  const asking = state === 'asking';

  /* PROPOSAL (PRD-599) — the failed run reads its own log, not the guiding one. */
  const failed = state === 'execute-failed';
  const runLog = failed ? FAILED_RUN_LOG : RUN_LOG;

  /* PROPOSAL (PRD-595) — the wait, in the two forms the panel shows it. */
  const slow = state === 'thinking' && elapsed >= SLOW_AFTER_MS;
  const seconds = Math.floor(elapsed / 1000);

  /* PROPOSAL (PRD-577 + PRD-104). Closing the window keeps the conversation, so
     `reply` outliving `idle` is the normal case now rather than a leak — and an
     idle widget holding an unread answer is exactly the thing PRD-104 says
     nobody notices. One flag serves both: it marks the launcher, and it is what
     `resume` reopens onto. */
  const waiting = state === 'idle' && reply != null;

  /** PRD-577: close is a collapse. It stops the timers and hides the window,
   *  and it does NOT throw the thread away — closing was mandatory on mobile to
   *  reach the UI the agent was pointing at, which is what made the loss a bug
   *  rather than a preference. `Clear` below is the explicit way out. */
  const collapse = () => {
    clearTimers();
    setLive('idle');
  };

  /** PRD-577: reopening lands back on the answer, not on an empty bar. */
  const resume = () => {
    if (frozen) return;
    setLive(reply ? 'response' : 'expanded');
  };

  return (
    <div className={`proto s-${state}`}>
      <WidgetIcons />
      <div
        className={`agent${headOpen ? ' head-open' : ''}${waiting ? ' has-attention' : ''}`}
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

          {/* Thinking */}
          <div className="ag-think ag-animborder">
            <div className="ag-think-inner">
              <p className="ag-think-echo ag-stagger" style={{ ['--d' as string]: '.05s' }}>{echo}</p>
              <div className="ag-think-step ag-stagger" style={{ ['--d' as string]: '.14s' }}>
                <svg className="ag-think-eye" viewBox="0 0 24 24"><use href={`#${icon}`} /></svg>
                <p className="ag-think-steptext" key={step}>
                  <span className="lead">{lead}</span>
                  <span className="tail">{tail}</span>
                  <span className="dots">...</span>
                </p>
              </div>
              {/* PROPOSAL (PRD-595). The counter runs from the first second —
                  the point is that SOMETHING moves — and the reassurance only
                  appears once the wait is long enough to be read as a dead
                  chat. Both are `.ag-prop-*`, styled in widget-proposal.css. */}
              <p className="ag-prop-elapsed">{seconds}s</p>
              {slow && (
                <p className="ag-prop-slow">
                  Still working — this one is taking longer than usual.
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
              {/* One node, two writers: the AI name in `response`, the question
                  counter in `asking`. */}
              <span className="ag-win-title">
                {asking ? `Question ${QUESTION.index} of ${QUESTION.total}` : 'Jimo AI'}
              </span>
              {/* Before .ag-win-actions, so reading order is counter → navigate
                  → window actions. CSS shows it in `asking` only. */}
              <span className="ag-opt-nav">
                <button className="ag-chev" title="Previous question"><Ico id="i-chevron-left" /></button>
                <button className="ag-chev" title="Next question"><Ico id="i-chevron-right" /></button>
              </span>
              <span className="ag-win-actions">
                {/* PRD-577: this collapses, it does not discard. The thread is
                    still there when the bar is clicked again. */}
                <button className="ag-round-btn" title="Close — your conversation is kept" onClick={collapse}>
                  <Ico id="i-close" />
                </button>
              </span>
            </div>

            <div className="ag-win-body">
              <div className="ag-md">
                {asking ? (
                  <p className="ag-md-p">{QUESTION.text}</p>
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
            {runLog.length === 0 ? (
              <div className="ag-runlog-item is-empty">No steps yet</div>
            ) : (
              runLog.map((l) => (
                <div
                  key={l.label}
                  className={`ag-runlog-item${l.failed ? ' ag-prop-failed' : ''}`}
                >
                  <Ico id={l.failed ? 'i-close' : 'i-check'} />
                  {l.label}
                </div>
              ))
            )}
            {/* PROPOSAL (PRD-599). The cause, then the two ways out — never the
                step that just failed, offered again. These are presentational,
                like the Submit / Skip rows above: the failed state is reached
                through the `state` override, which freezes the engine. */}
            {failed && (
              <>
                <p className="ag-prop-cause">{FAILURE.cause}</p>
                <div className="ag-prop-ctas">
                  <button className="ag-cta ag-cta-dark">{FAILURE.retry}</button>
                  <button className="ag-cta ag-cta-outline">{FAILURE.escalate}</button>
                </div>
              </>
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
            <span className="ag-bar-av" aria-hidden="true">
              {/* PROPOSAL (PRD-104). Rendered always, shown by
                  widget-proposal.css only under `.has-attention` — the same
                  always-in-DOM / toggle-by-class rule the tooltips follow, so
                  it can animate rather than pop in. */}
              <span className="ag-prop-dot" />
            </span>
            <input
              className="ag-bar-input"
              value={draft}
              placeholder={waiting ? 'Pick up where you left off...' : placeholder}
              autoComplete="off"
              onFocus={() => !frozen && state === 'idle' && resume()}
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

/** The tiny subset of markdown the response bodies actually use. */
function Markdown({ text }: { text: string }) {
  const html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return <p className="ag-md-p" dangerouslySetInnerHTML={{ __html: html }} />;
}
