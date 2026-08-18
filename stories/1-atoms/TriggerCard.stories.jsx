import React from 'react';
import { Personalcard, MessageRemove, EmojiSad } from 'iconsax-react';
import { TriggerCard } from '../../src/features/escalation/TriggerCard';

const FIGMA = 'https://www.figma.com/design/5LL3WooWBeEfjNpUls93Zg/Escalation?node-id=29-7085';

const meta = {
  title: 'Atoms/TriggerCard',
  component: TriggerCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered', design: { type: 'figma', url: FIGMA } },
};
export default meta;

const wrap = (s) => ({ render: (a) => <div style={{ width: 306, display: 'flex' }}><TriggerCard {...a} /></div>, args: s });

export const ExplicitRequest = wrap({
  tone: 'green',
  icon: <Personalcard size={18} variant="Bold" color="currentColor" />,
  title: 'On explicit request',
  description: 'Escalate as soon as the user asks for a person, however they word it.',
  checked: true,
});

export const Off = wrap({ ...ExplicitRequest.args, checked: false });

export const FailedAnswers = wrap({
  tone: 'purple',
  icon: <MessageRemove size={18} variant="Bold" color="currentColor" />,
  title: "User says it didn't work",
  description: 'Escalate after the user tells the Agent its answer missed.',
  checked: true,
});

export const Frustration = wrap({
  tone: 'red',
  icon: <EmojiSad size={18} variant="Bold" color="currentColor" />,
  title: 'User shows a',
  description: 'Escalate when the user tone of voice degrades negatively.',
  checked: true,
});

export const Playground = { ...ExplicitRequest, parameters: { chromatic: { disableSnapshot: true } } };
