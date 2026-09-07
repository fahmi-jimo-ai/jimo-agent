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
 * ## Answers keep their pictures — PRD-615
 *
 * Altior's knowledge is image-first: a Tour step is often a title plus a
 * screenshot and nothing else, so a text-only answer throws away the half
 * that actually explains the step. The one real "found an answer" reply this
 * engine produces (`!decision` below) is reshaped from a single paragraph
 * into `Reply.steps`, each optionally carrying a placeholder screenshot
 * frame next to its text — interleaved, not linked out to. The handoff reply
 * ("Let me get a person on this") is untouched and still renders through
 * plain `Markdown`, since it never had a source to illustrate.
 */

/** The prototype's nine. `s-{state}` on `.proto` is what widget.css gates on. */
export type WState =
  | 'idle'
  | 'expanded'
  | 'thinking'
  | 'response'
  | 'asking'
  | 'guide-waiting'
  | 'guide-checking'
  | 'execute-action'
  | 'execute-thinking';

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

/**
 * A step in a found-answer reply that carries the same image its Tour-step
 * source carried — PRD-615. There is no real source image behind this
 * prototype (the knowledge store starts empty, same as everywhere else in
 * this app), so `hasImage` renders a placeholder frame with its own caption
 * rather than a faked screenshot. Invented, and labelled as such, same as
 * the rest of this file's canned copy.
 */
interface ReplyStep { text: string; hasImage?: boolean }
interface Reply { title?: string; body: string; steps?: ReplyStep[]; source?: string; handoff?: Decision }

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
            body: '',
            // PRD-615: Altior's own steps are image-first — a title plus a
            // screenshot, often nothing else — so the answer interleaves the
            // source's image with each step instead of dropping it.
            steps: [
              { text: 'Open **Settings → SSO**.', hasImage: true },
              { text: 'Add your identity provider’s metadata URL.', hasImage: true },
              { text: 'Verify your domain so members can sign in with it.' },
            ],
            source: 'SSO Setup Tour',
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
                ) : (
                  <>
                    {reply?.title && <h2 className="ag-md-h2">{reply.title}</h2>}
                    {reply?.steps ? (
                      <>
                        <ol className="ag-md-steps">
                          {reply.steps.map((s, i) => (
                            <li key={i} className="ag-md-step">
                              <MarkdownInline text={s.text} />
                              {s.hasImage && (
                                <span className="ag-md-step-img">Screenshot from the source step</span>
                              )}
                            </li>
                          ))}
                        </ol>
                        {reply.source && <p className="ag-md-source">Source: {reply.source}</p>}
                      </>
                    ) : (
                      reply && <Markdown text={reply.body} />
                    )}
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

/** The tiny subset of markdown the response bodies actually use. */
function Markdown({ text }: { text: string }) {
  const html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return <p className="ag-md-p" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Same bold-only rule as `Markdown`, without the block-level `<p>` — a step
 *  is already a list item and needs its text to sit flush against it. */
function MarkdownInline({ text }: { text: string }) {
  const html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
