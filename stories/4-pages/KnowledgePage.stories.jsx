import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { KnowledgePage } from '../../src/features/knowledge/KnowledgePage';
import { ToastProvider } from '../../src/components/app/toast';
import { resetKnowledge, setSources } from '../../src/state/knowledgeStore';
import { DEMO_SOURCES } from '../../src/data/knowledgeSources';

const FIGMA = 'https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=';
/* The Interface tab is a different file — Interface-Knowledge, 12987:12415. */
const FIGMA_IK = 'https://www.figma.com/design/ZapclwcQZLBxoeYxfo1ms0/Interface-Knowledge?node-id=';

/**
 * One story per Figma frame in the Sources tab (section 932:27941), each
 * seeding the knowledge store then rendering the real page — so a story can be
 * diffed straight against the board it names.
 *
 * The User Context stories moved to `Organisms/UserContextSection` when the
 * artboard replaced that tab with Interface; they still name their own frames.
 *
 * The Interface tab has frames of its own now (Interface-Knowledge 12987:12415)
 * and its stories are at the bottom, using `FIGMA_IK`.
 */
const meta = {
  title: 'Pages/KnowledgePage',
  component: KnowledgePage,
  parameters: { layout: 'fullscreen' },
};
export default meta;

const seed = (sources) => () => {
  resetKnowledge();
  if (sources?.length) setSources(sources);
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

const full = () => DEMO_SOURCES();

/* ── the two page frames ──────────────────────────────────────────────────── */

export const Empty = page(seed([]), '899-14841');
export const Populated = page(seed(full()), '899-15214');

/* ── the add flow ─────────────────────────────────────────────────────────── */

export const AddUrlIndividual = page(seed(full()), '932-20126', { initialAddKind: 'url' });
export const AddText = page(seed(full()), '932-21800', { initialAddKind: 'text' });
export const AddVideo = page(seed(full()), '932-19936', { initialAddKind: 'video' });
/* No Figma node: the artboard in its place (932:21990) is a pasted screenshot,
   so this dropzone is invented — see AddSourceModal's header comment. */
export const AddFile = {
  ...page(seed(full()), '932-27941', { initialAddKind: 'file' }),
};

/* ── no results, both ways in ─────────────────────────────────────────────── */

export const NoResultsFromSearch = page(seed(full()), '899-15214', {
  initialSearch: 'nothing matches this',
});
/* Every demo row is Trained but one, which is Failed — so filtering to
   Training… is the state no row can satisfy. */
export const NoResultsFromFilter = page(seed(full()), '899-15214', {
  initialStatus: 'training',
});

export const Playground = {
  ...page(seed(full()), '899-15214'),
  parameters: { layout: 'fullscreen', chromatic: { disableSnapshot: true } },
};

/* ── the Interface tab (Interface-Knowledge 12987:12415) ──────────────────── */

const ikPage = (node, props = {}) => ({
  render: () => {
    // The page catalogue is seeded by the store, not by the story: unlike
    // `sources`, `pages` starts populated — see INITIAL_KNOWLEDGE.
    resetKnowledge();
    return (
      <ToastProvider>
        <MemoryRouter initialEntries={['/knowledge']}>
          <div style={{ height: '810px' }}>
            <KnowledgePage initialTab="interface" {...props} />
          </div>
        </MemoryRouter>
      </ToastProvider>
    );
  },
  parameters: { design: { type: 'figma', url: FIGMA_IK + node } },
});

export const Interface = ikPage('12987-13033');
export const PageDrawerInterface = ikPage('12987-12416', { initialPageId: 'page-dashboard' });
export const PageDrawerSkills = ikPage('12987-13517', {
  initialPageId: 'page-dashboard',
  initialDrawerTab: 'skills',
});
