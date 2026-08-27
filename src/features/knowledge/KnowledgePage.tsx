import * as React from 'react';
import { Play, Element4, Firstline, MessageText } from 'iconsax-react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { AppShell } from '@/app/AppShell';
import { useToast } from '@/components/app/toast';
import { SourcesTab } from './sources/SourcesTab';

/**
 * The Knowledge page — Figma Copilot-Widget, section 932:27941 ("Sources page").
 *
 * The tab bar is that section's (932:17526): **Interface · Sources · Custom
 * Answers**, in that order, with Sources active. It replaces the older
 * 901:16049 bar, which named User Context where Interface now sits.
 * `UserContextSection` and its files stay in the repo and keep their Storybook
 * stories — the design dropped the tab, not the work.
 *
 * Only **Sources** is designed, so only it is built, and `PageHeader` still
 * gets no `onTabClick`. Interface and Custom Answers render because the
 * artboard shows them and they are inert, which is the honest state of the
 * design rather than a placeholder panel nobody drew. There is no tab state
 * here for the same reason: with one live tab there is nothing to hold.
 *
 * The header is PageHeader verbatim — title row, one right-hand button and the
 * tab bar are all built in (PageHeader.tsx:107). `buttonSize="small"` matches
 * the artboard's 36px button (899:15220); Escalation's page uses the 44px
 * default.
 */
const TABS = [
  // Figma glyphs: element-4, firstline, message-text (932:17530 / 17537 / 17544).
  { id: 'interface', label: 'Interface', icon: <Element4 size={20} variant="Linear" color="currentColor" /> },
  { id: 'sources', label: 'Sources', icon: <Firstline size={20} variant="Linear" color="currentColor" /> },
  {
    id: 'custom-answers',
    label: 'Custom Answers',
    icon: <MessageText size={20} variant="Linear" color="currentColor" />,
  },
];

export function KnowledgePage(props: React.ComponentProps<typeof SourcesTab>) {
  const toast = useToast();

  return (
    <AppShell
      activeItem="Knowledge"
      header={
        <PageHeader
          title="Knowledge"
          buttonSize="small"
          showButtonGroup
          buttons={[
            {
              label: 'Test Knowledge',
              level: 'secondary',
              leftIcon: <Play size={20} variant="Linear" color="currentColor" />,
              // Invented, and labelled as such: the artboard has the button but
              // no frame behind it.
              onClick: () =>
                toast({
                  type: 'neutral',
                  title: 'Knowledge testing is out of scope',
                  body: 'The agent sandbox is not part of this prototype.',
                }),
            },
          ]}
          showTabs
          tabs={TABS}
          activeTab="sources"
        />
      }
    >
      <SourcesTab {...props} />
    </AppShell>
  );
}
