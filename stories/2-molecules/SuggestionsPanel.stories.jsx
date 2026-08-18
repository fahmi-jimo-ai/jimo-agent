import React from 'react';
import { SuggestionsPanel } from '../../src/features/escalation/SuggestionsPanel';
import { buildSuggestions } from '../../src/data/fixtures';

const FIGMA = 'https://www.figma.com/design/5LL3WooWBeEfjNpUls93Zg/Escalation?node-id=';
const items = buildSuggestions();
const noop = () => {};

const meta = {
  title: 'Molecules/SuggestionsPanel',
  component: SuggestionsPanel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

const base = {
  items,
  selectedIds: [],
  collapsed: false,
  onToggleSelect: noop,
  onToggleCollapse: noop,
  onRefresh: noop,
  onAddSelected: noop,
};

export const Generating = {
  args: { ...base, status: 'generating', items: [] },
  parameters: { design: { type: 'figma', url: FIGMA + '29-18613' } },
};
export const Ready = {
  args: { ...base, status: 'ready' },
  parameters: { design: { type: 'figma', url: FIGMA + '29-19103' } },
};
export const Staged = {
  args: { ...base, status: 'ready', selectedIds: [items[0].id, items[4].id] },
  parameters: { design: { type: 'figma', url: FIGMA + '29-19716' } },
};
export const Collapsed = {
  args: { ...base, status: 'ready', collapsed: true },
  parameters: { design: { type: 'figma', url: FIGMA + '34-3082' } },
};

export const Playground = { args: { ...base, status: 'ready' }, parameters: { chromatic: { disableSnapshot: true } } };
