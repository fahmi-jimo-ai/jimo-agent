import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { KnowledgePage } from '../../src/features/knowledge/KnowledgePage';
import { ToastProvider } from '../../src/components/app/toast';
import { resetKnowledge, addProperties } from '../../src/state/knowledgeStore';
import { USER_PROPERTIES } from '../../src/data/userProperties';

const FIGMA = 'https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=';

/**
 * One story per Figma frame in the User Context section, each seeding the
 * knowledge store then rendering the real page — so a story can be diffed
 * straight against the board it names.
 */
const meta = {
  title: 'Pages/KnowledgePage',
  component: KnowledgePage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

const ids = (source) =>
  USER_PROPERTIES.filter((p) => !source || p.source === source).map((p) => p.id);

const seed = (added) => () => {
  resetKnowledge();
  if (added?.length) addProperties(added);
};

const page = (seedFn, node, props = {}) => ({
  render: () => {
    seedFn();
    return (
      <ToastProvider>
        <MemoryRouter initialEntries={['/knowledge']}>
          <div style={{ height: '810px' }}>
            <KnowledgePage {...props} />
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
export const NoResultsFromFilter = page(seed(ids('custom')), '893-13761', { initialFilter: 'jimo' });

export const Playground = {
  ...page(seed(ids()), '887-10867'),
  parameters: { layout: 'fullscreen', chromatic: { disableSnapshot: true } },
};
