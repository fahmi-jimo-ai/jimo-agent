import * as React from 'react';
import { useEscalation } from '@/state/useEscalation';
import { evaluate, isRejection, REASON_COPY, type Decision } from './escalationEngine';
import { SAMPLE_BRIEF } from '@/data/fixtures';
import { WidgetIcons, Ico } from './WidgetIcons';

type WState = 'idle' | 'expanded' | 'thinking' | 'response';

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

interface Reply { title?: string; body: string; handoff?: Decision }

export function AgentWidget({ onHandoff }: { onHandoff: (d: Decision, brief: string) => void }) {
  const cfg = useEscalation();

  const [state, setState] = React.useState<WState>('idle');
  const [draft, setDraft] = React.useState('');
  const [echo, setEcho] = React.useState('');
  const [reply, setReply] = React.useState<Reply | null>(null);
  const [step, setStep] = React.useState(0);
  const [failedStreak, setFailedStreak] = React.useState(0);
  const [headOpen, setHeadOpen] = React.useState(false);

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
    const q = text.trim();
    if (!q) {
      if (state === 'idle') setState('expanded');
      return;
    }
    setEcho(q);
    setDraft('');
    setStep(0);
    setReply(null);
    setState('thinking');

    const decision = evaluate(q, cfg, failedStreak);
    setFailedStreak((n) => (isRejection(q) ? n + 1 : 0));

    timers.current.push(
      window.setTimeout(() => {
        if (!decision) {
          setReply({
            title: 'Here’s what I found',
            body: 'Single sign-on is configured under **Settings → SSO**. Add your identity provider’s metadata URL, then verify your domain so members can sign in with it.',
          });
          setState('response');
          return;
        }

        if (decision.behaviour === 'immediate') {
          // Stated intent, or the customer's own topic rule: no card, no ask.
          onHandoff(decision, SAMPLE_BRIEF);
          setState('idle');
          setEcho('');
          return;
        }

        setReply({
          title: 'Let me get a person on this',
          body: `${REASON_COPY[decision.reason]}, so I can hand this to the support team with everything you've already told me — you won't have to repeat it.`,
          handoff: decision,
        });
        setState('response');
      }, THINK_MS)
    );
  };

  const [lead, tail, icon] = THINK_CYCLE[step];
  const placeholder =
    state === 'thinking' ? 'Write a follow-up...' : state === 'response' ? 'Write a reply...' : 'Ask Jimo AI...';

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

          {/* Response window */}
          <div className="ag-window">
            <div className="ag-win-head" style={{ ['--d' as string]: '.03s' }}>
              <span className="ag-grip"><Ico id="i-grip" /></span>
              <span className="ag-win-title">Jimo AI</span>
              <span className="ag-win-actions">
                <button
                  className="ag-round-btn"
                  title="Close"
                  onClick={() => { clearTimers(); setState('idle'); setReply(null); setEcho(''); }}
                >
                  <Ico id="i-close" />
                </button>
              </span>
            </div>

            <div className="ag-win-body">
              <div className="ag-md">
                {reply?.title && <h2 className="ag-md-h2">{reply.title}</h2>}
                {reply && <Markdown text={reply.body} />}
              </div>

              {/* The hand-off card IS this CTA row — the widget's own grammar,
                  dark primary + outline secondary, rather than a new surface. */}
              <div className="ag-ctas">
                {reply?.handoff && (
                  <>
                    <button
                      className="ag-cta ag-cta-dark ag-stagger"
                      style={{ ['--d' as string]: '.26s' }}
                      onClick={() => {
                        onHandoff(reply.handoff!, SAMPLE_BRIEF);
                        setState('idle');
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

              <div className="ag-feedback ag-stagger-fall" style={{ ['--d' as string]: '.34s' }}>
                <button className="ag-fb-btn" title="Like"><Ico id="i-like" /></button>
                <button className="ag-fb-btn ag-fb-dislike" title="Dislike"><Ico id="i-like" /></button>
                <button className="ag-fb-btn" title="Copy"><Ico id="i-copy" /></button>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="ag-bar">
            <span className="ag-bar-av" aria-hidden="true" />
            <input
              className="ag-bar-input"
              value={draft}
              placeholder={placeholder}
              autoComplete="off"
              onFocus={() => state === 'idle' && setState('expanded')}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(draft)}
            />
            <button className="ag-bar-btn" aria-label="Send" onClick={() => send(draft)}>
              <Ico id="i-arrow-up" />
            </button>
            <button className="ag-bar-stop" aria-label="Stop" onClick={() => { clearTimers(); setState('expanded'); }}>
              <Ico id="i-stop-round" />
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
