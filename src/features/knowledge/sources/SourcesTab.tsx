import * as React from 'react';
import { useToast } from '@/components/app/toast';
import {
  useKnowledge,
  addSource,
  removeSource,
  updateSource,
  retrySource,
  resumeTraining,
  setRetrain,
} from '@/state/useKnowledge';
import type { KnowledgeSource, SourceKind } from '@/data/knowledgeSources';
import { RetrainFrequencyCard } from './RetrainFrequencyCard';
import { SourcesCard } from './SourcesCard';
import { TokenUsageCard } from './TokenUsageCard';
import { SourceDetailDrawer } from './SourceDetailDrawer';
import { AddSourceModal, type AddSourceDraft } from './AddSourceModal';
import type { KindFilter, StatusFilter } from './SourceToolbar';

/**
 * The Sources tab — Figma section 932:27941, frames 899:14841 (empty) and
 * 899:15214 (populated).
 *
 * Note the folder: `src/features/knowledge/SourceCell.tsx` one level up renders
 * a *`PropertySource`* — Jimo SDK vs Custom — and has nothing to do with a
 * knowledge source. Keeping this work in its own folder is what stops the two
 * meanings of "source" colliding in an import list.
 *
 * Card order down the page is the artboards': retraining frequency, sources,
 * token usage.
 *
 * `search`, `kind` and `status` are component state on purpose. They are view
 * state, not config — persisting them would make a stray search term survive a
 * reload and sync across tabs. The `initial*` props exist so a story can land
 * directly on a filtered frame.
 *
 * `initialDetailId` is the same shape, and carries the `?source=` deep link a
 * conversation's thinking trace links in with (see `KnowledgePage`). It seeds
 * `detailId` rather than controlling it, so closing the drawer closes it — a
 * controlled prop would fight the close button on every render.
 */
export function SourcesTab({
  initialSearch = '',
  initialKind = 'all',
  initialStatus = 'all',
  initialAddKind,
  initialDetailId,
}: {
  initialSearch?: string;
  initialKind?: KindFilter;
  initialStatus?: StatusFilter;
  initialAddKind?: SourceKind;
  initialDetailId?: string;
}) {
  const { sources, retrain } = useKnowledge();
  const toast = useToast();

  const [search, setSearch] = React.useState(initialSearch);
  const [kind, setKind] = React.useState<KindFilter>(initialKind);
  const [status, setStatus] = React.useState<StatusFilter>(initialStatus);
  const [draft, setDraft] = React.useState<AddSourceDraft | null>(
    initialAddKind ? { kind: initialAddKind } : null,
  );
  const [detailId, setDetailId] = React.useState<string | null>(initialDetailId ?? null);

  // `training` is persisted but its timer is not, so a reload would strand the
  // pill forever without this. `resumeTraining` is idempotent — arming an id
  // replaces its timer rather than stacking a second one.
  React.useEffect(() => {
    resumeTraining();
  }, []);

  // Read through the store rather than holding the row: the drawer has to keep
  // up as the same row goes Training… → Trained underneath it.
  const detail = sources.find((s) => s.id === detailId) ?? null;

  const outOfScope = (what: string) =>
    toast({
      type: 'neutral',
      title: `${what} is out of scope`,
      body: 'This prototype models the sources list, not the training pipeline behind it.',
    });

  return (
    <>
      <RetrainFrequencyCard value={retrain} onChange={setRetrain} />

      <SourcesCard
        sources={sources}
        search={search}
        onSearch={setSearch}
        kind={kind}
        onKind={setKind}
        status={status}
        onStatus={setStatus}
        onAdd={(k) => setDraft({ kind: k })}
        onOpen={(s) => setDetailId(s.id)}
        onEdit={(s) => setDraft({ kind: s.kind, editing: s })}
        onRetry={(s) => {
          retrySource(s.id);
          toast({ type: 'neutral', title: `Retraining ${s.label}` });
        }}
        onRemove={(s) => {
          if (detailId === s.id) setDetailId(null);
          removeSource(s.id);
          toast({ type: 'positive', title: 'Source removed' });
        }}
      />

      <TokenUsageCard sources={sources} />

      {draft && (
        <AddSourceModal
          draft={draft}
          onClose={() => setDraft(null)}
          onSubmit={(created: KnowledgeSource[]) => {
            created.forEach(addSource);
            setDraft(null);
            toast({
              type: 'positive',
              title: `${created.length} ${created.length === 1 ? 'source' : 'sources'} added`,
              body: 'Training starts now — the table updates when it finishes.',
            });
          }}
          onUpdate={(id, patch) => {
            updateSource(id, patch);
            // Editing puts the row back into training, so it needs a timer for
            // the same reason adding does.
            resumeTraining();
            setDraft(null);
            toast({ type: 'positive', title: 'Source updated', body: 'Retraining now.' });
          }}
        />
      )}

      {detail && (
        <SourceDetailDrawer
          source={detail}
          onClose={() => setDetailId(null)}
          onOutOfScope={outOfScope}
        />
      )}
    </>
  );
}
