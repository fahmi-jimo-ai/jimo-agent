import React from 'react';
import { TopicPill } from '../../src/features/escalation/TopicPill';

const FIGMA = 'https://www.figma.com/design/5LL3WooWBeEfjNpUls93Zg/Escalation?node-id=34-3630';

const meta = {
  title: 'Atoms/TopicPill',
  component: TopicPill,
  tags: ['autodocs'],
  parameters: { layout: 'centered', design: { type: 'figma', url: FIGMA } },
};
export default meta;

export const Keyword = { args: { label: 'Support tickets', category: 'keyword', action: 'add' } };
export const Intent = { args: { label: 'I want to reduce support tickets', category: 'topic', action: 'add' } };
export const Question = { args: { label: 'How do I create a hint?', category: 'question', action: 'add' } };
export const Selected = { args: { label: 'Support tickets', category: 'keyword', action: 'add', selected: true } };
export const Added = { args: { label: 'Support tickets', category: 'keyword', action: 'remove' } };

/** The full matrix from the Figma "Pill States" section. Hover a pill to see its type tooltip. */
export const AllStates = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-8)' }}>
      {[
        ['keyword', 'Support tickets'],
        ['topic', 'I want to reduce support tickets'],
        ['question', 'How do I create a hint?'],
      ].map(([category, label]) => (
        <div key={category} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <TopicPill label={label} category={category} action="add" />
          <TopicPill label={label} category={category} action="add" selected />
          <TopicPill label={label} category={category} action="remove" />
        </div>
      ))}
    </div>
  ),
};

export const Playground = {
  args: { label: 'workspace roles & permissions', category: 'topic', action: 'add' },
  parameters: { chromatic: { disableSnapshot: true } },
};
