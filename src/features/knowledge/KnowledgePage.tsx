import * as React from 'react';
import { Play, MenuBoard, Messages, ProfileCircle } from 'iconsax-react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { AppShell } from '@/app/AppShell';
import { useToast } from '@/components/app/toast';
import { UserContextSection } from './UserContextSection';

/**
 * The Knowledge page — Figma Copilot-Widget 901:16049.
 *
 * Only the **User Context** tab is designed, so only it is built. Sources and
 * Custom Answers render because the artboard shows them, but they are inert:
 * `PageHeader` gets no `onTabClick`, which is the honest state of the design
 * rather than a placeholder panel nobody drew.
 *
 * The header is PageHeader verbatim — title row, one right-hand button and the
 * tab bar are all built in (PageHeader.tsx:107). `buttonSize="small"` matches
 * the artboard's 36px button; Escalation's page uses the 44px default.
 */
const TABS = [
  { id: 'sources', label: 'Sources', icon: <MenuBoard size={20} variant="Linear" color="currentColor" /> },
  { id: 'custom-answers', label: 'Custom Answers', icon: <Messages size={20} variant="Linear" color="currentColor" /> },
  { id: 'user-context', label: 'User Context', icon: <ProfileCircle size={20} variant="Linear" color="currentColor" /> },
];

export function KnowledgePage(props: React.ComponentProps<typeof UserContextSection>) {
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
          activeTab="user-context"
        />
      }
    >
      <UserContextSection {...props} />
    </AppShell>
  );
}
