import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Play, ProfileCircle } from 'iconsax-react';
import { AppShell } from '../../src/app/AppShell';
import { PageHeader } from '../../src/components/ui/PageHeader/PageHeader';
import { UserContextSection } from '../../src/features/knowledge/UserContextSection';
import { ToastProvider } from '../../src/components/app/toast';
import { resetKnowledge, addProperties } from '../../src/state/knowledgeStore';
import { USER_PROPERTIES } from '../../src/data/userProperties';

const FIGMA = 'https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=';

/**
 * User Context — Figma 901:16049.
 *
 * These five stories used to render `Pages/KnowledgePage`. The newer Sources
 * artboard (932:17526) replaced the User Context tab with Interface, so the
 * page no longer routes here — but the section, and the frames it was drawn
 * from, are unchanged. They render inside the real `AppShell` with a
 * single-tab header so each still diffs against the board it names.
 */
const meta = {
  title: 'Organisms/UserContextSection',
  component: UserContextSection,
  parameters: { layout: 'fullscreen' },
};
export default meta;

const ids = (source) =>
  USER_PROPERTIES.filter((p) => !source || p.source === source).map((p) => p.id);

const seed = (added) => () => {
  resetKnowledge();
  if (added?.length) addProperties(added);
};

const TABS = [
  {
    id: 'user-context',
    label: 'User Context',
    icon: <ProfileCircle size={20} variant="Linear" color="currentColor" />,
  },
];

const page = (seedFn, node, props = {}) => ({
  render: () => {
    seedFn();
    return (
      <ToastProvider>
        <MemoryRouter initialEntries={['/knowledge']}>
          <div style={{ height: '810px' }}>
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
          </div>
        </MemoryRouter>
      </ToastProvider>
    );
  },
  parameters: { design: { type: 'figma', url: FIGMA + node } },
});

export const Empty = page(seed([]), '892-12055');
export const AddPropertyDialog = page(seed([]), '921-17353', { initialModalOpen: true });
export const Populated = page(seed(ids()), '887-10867');
export const NoResultsFromSearch = page(seed(ids()), '892-13280', { initialSearch: 'Role' });
// The filter frame: only custom attributes are in Agent Context, so filtering
// to Jimo SDK matches nothing.
export const NoResultsFromFilter = page(seed(ids('custom')), '893-13761', {
  initialFilter: 'jimo',
});
