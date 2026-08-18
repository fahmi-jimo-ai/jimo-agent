import * as React from 'react';
import { Magicpen, Add } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { Button } from '@/components/ui/Button/Button';
import { TopicPill } from './TopicPill';
import { TopicInput } from './TopicInput';
import { SuggestionsPanel } from './SuggestionsPanel';
import { useEscalation, setState } from '@/state/useEscalation';
import { getState } from '@/state/escalationStore';
import { buildSuggestions, makeTopic } from '@/data/fixtures';
import { useToast } from './toast';

/** How long the fake "AI" takes to think. Two seconds of shimmer, then the
 *  pills appear — any longer reads as a hang rather than as work. */
const GENERATE_MS = 2000;

export function TopicsSection() {
  const { topics, suggestions } = useEscalation();
  const [adding, setAdding] = React.useState(false);
  const toast = useToast();
  const timer = React.useRef<number>();

  React.useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      // Unmounting kills the timer, so leaving the flag at `generating` would
      // strand the skeleton on the next mount. Only this component starts it,
      // so it is safe to own the reset.
      if (getState().suggestions.status === 'generating') {
        setState((s) => ({ suggestions: { ...s.suggestions, status: 'idle' } }));
      }
    },
    []
  );

  const generate = () => {
    setState((s) => ({ suggestions: { ...s.suggestions, status: 'generating', collapsed: false } }));
    timer.current = window.setTimeout(() => {
      setState({
        suggestions: { status: 'ready', items: buildSuggestions(), selectedIds: [], collapsed: false },
      });
    }, GENERATE_MS);
  };

  const toggleSelect = (id: string) =>
    setState((s) => ({
      suggestions: {
        ...s.suggestions,
        selectedIds: s.suggestions.selectedIds.includes(id)
          ? s.suggestions.selectedIds.filter((x) => x !== id)
          : [...s.suggestions.selectedIds, id],
      },
    }));

  const addSelected = () =>
    setState((s) => {
      const picked = s.suggestions.items.filter((t) => s.suggestions.selectedIds.includes(t.id));
      return {
        topics: [...s.topics, ...picked],
        suggestions: {
          ...s.suggestions,
          // Added pills leave the suggestion pool — offering them again would
          // let the same topic be added twice.
          items: s.suggestions.items.filter((t) => !s.suggestions.selectedIds.includes(t.id)),
          selectedIds: [],
          collapsed: true,
        },
      };
    });

  const removeTopic = (id: string) =>
    setState((s) => ({ topics: s.topics.filter((t) => t.id !== id) }));

  const commitNew = (label: string) => {
    setState((s) => ({ topics: [...s.topics, makeTopic(label)] }));
    setAdding(false);
    toast({ type: 'positive', title: 'Topic added' });
  };

  const hasBody = topics.length > 0 || adding || suggestions.status !== 'idle';

  return (
    <Section
      title="Topics that goes directly to support"
      description="Specific topics or keywords when the Agent should escalate to the support tool"
      controls={
        <div className="flex items-center gap-[var(--space-2)]">
          {suggestions.status === 'idle' && (
            <Button
              variant="outline"
              onClick={generate}
              leftIcon={<Magicpen size={20} variant="Bold" color="currentColor" />}
            >
              Suggest topics
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setAdding(true)}
            leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
          >
            Add topic
          </Button>
        </div>
      }
    >
      {hasBody && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {(topics.length > 0 || adding) && (
            <div className="flex flex-wrap gap-[var(--space-2)]">
              {topics.map((t) => (
                <TopicPill
                  key={t.id}
                  label={t.label}
                  category={t.category}
                  action="remove"
                  onAction={() => removeTopic(t.id)}
                />
              ))}
              {adding && <TopicInput onCommit={commitNew} onCancel={() => setAdding(false)} />}
            </div>
          )}

          <SuggestionsPanel
            status={suggestions.status}
            items={suggestions.items}
            selectedIds={suggestions.selectedIds}
            collapsed={suggestions.collapsed}
            onToggleSelect={toggleSelect}
            onToggleCollapse={() =>
              setState((s) => ({ suggestions: { ...s.suggestions, collapsed: !s.suggestions.collapsed } }))
            }
            onRefresh={generate}
            onAddSelected={addSelected}
          />
        </div>
      )}
    </Section>
  );
}
