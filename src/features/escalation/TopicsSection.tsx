import * as React from 'react';
import { Add } from 'iconsax-react';
import { Section } from '@/components/ui/Section/Section';
import { Button } from '@/components/ui/Button/Button';
import { TopicPill } from './TopicPill';
import { TopicInput } from './TopicInput';
import { setState, useEscalation } from '@/state/useEscalation';
import { makeTopic } from '@/data/fixtures';
import { useToast } from './toast';

export function TopicsSection() {
  const { topics } = useEscalation();
  const [adding, setAdding] = React.useState(false);
  // Clicking a committed pill's label drops it back into the same input.
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const toast = useToast();

  const removeTopic = (id: string) =>
    setState((s) => ({ topics: s.topics.filter((t) => t.id !== id) }));

  const commitNew = (label: string) => {
    setState((s) => ({ topics: [...s.topics, makeTopic(label)] }));
    setAdding(false);
    toast({ type: 'positive', title: 'Topic added' });
  };

  // Re-run makeTopic so the category re-classifies against the new wording.
  const commitEdit = (id: string, label: string) => {
    setState((s) => ({ topics: s.topics.map((t) => (t.id === id ? { ...makeTopic(label), id } : t)) }));
    setEditingId(null);
  };

  const startAdding = () => {
    setEditingId(null);
    setAdding(true);
  };

  const hasBody = topics.length > 0 || adding;

  return (
    <Section
      title="Topics that goes directly to support"
      description="Specific topics or keywords when the Agent should escalate to the support tool"
      controls={
        <Button
          variant="outline"
          onClick={startAdding}
          leftIcon={<Add size={20} variant="Linear" color="currentColor" />}
        >
          Add topic
        </Button>
      }
    >
      {/* `null`, not `false` — Section renders its content wrapper for anything
          that is not null, and an empty wrapper leaves the card a gap plus a
          full 24px of padding below the header. */}
      {hasBody ? (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {topics.map((t) =>
            editingId === t.id ? (
              <TopicInput
                key={t.id}
                initialValue={t.label}
                onCommit={(label) => commitEdit(t.id, label)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <TopicPill
                key={t.id}
                label={t.label}
                category={t.category}
                action="remove"
                onAction={() => removeTopic(t.id)}
                onEdit={() => {
                  setAdding(false);
                  setEditingId(t.id);
                }}
              />
            )
          )}
          {adding && <TopicInput onCommit={commitNew} onCancel={() => setAdding(false)} />}
        </div>
      ) : null}
    </Section>
  );
}
