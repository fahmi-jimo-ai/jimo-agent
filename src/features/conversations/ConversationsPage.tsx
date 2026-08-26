import * as React from 'react';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { sectionVariants } from '@/components/ui/Section/Section';
import { cn } from '@/lib/utils';
import { AppShell } from '@/app/AppShell';
import { UpdatedMeta } from '@/app/UpdatedMeta';
import { useToast } from '@/components/app/toast';
import { ConversationsToolbar } from './ConversationsToolbar';
import { ConversationList } from './ConversationList';
import { ConversationDetail } from './ConversationDetail';
import { ConversationsEmptyState } from './ConversationsEmptyState';
import { CONVERSATIONS, filterConversations } from '@/data/analytics';
import { useAnalytics, setAnalytics, clearConversationFilters } from '@/state/useAnalytics';

/**
 * Conversations — Figma 934:28534 / 934:29319 / 934:30359 / 934:30109.
 *
 * The artboards draw this as the second tab of a page called "Analyze". It
 * ships as its own route instead — see StatisticsPage's header comment for why.
 *
 * Three body states, the same shape `UserContextSection` uses:
 *   - nothing yet (934:30359): NO toolbar. There is nothing to filter.
 *   - filters match nothing (934:30109): toolbar stays — it is the way back out.
 *   - otherwise: toolbar, then the two panes.
 *
 * The two-pane card is not a `Section`. Section always applies --space-6 of
 * padding and a --space-6 gap between header and body, and this card is
 * edge-to-edge with a vertical rule down the middle. It reuses Section's
 * exported `sectionVariants` for the panel contract (bg / radius / shadow) and
 * zeroes the padding, rather than re-drawing a white rounded box by hand.
 */
export function ConversationsPage() {
  const {
    hasConversations,
    convoSearch,
    convoRange,
    convoResponse,
    convoSegment,
    convoSelectedId,
  } = useAnalytics();
  const toast = useToast();

  const shown = React.useMemo(
    () =>
      filterConversations(CONVERSATIONS, {
        search: convoSearch,
        response: convoResponse,
        segment: convoSegment,
        range: convoRange,
      }),
    [convoSearch, convoResponse, convoSegment, convoRange]
  );

  // The persisted selection may have been filtered out from under us; fall back
  // to the first visible row rather than showing an empty pane beside a list.
  const selected = shown.find((c) => c.id === convoSelectedId) ?? shown[0] ?? null;

  // Invented, and labelled as such: none of these has a frame behind it, so the
  // prototype acknowledges the click and stops.
  const outOfScope = (title: string) =>
    toast({
      type: 'neutral',
      title: `${title} is out of scope`,
      body: 'The artboard draws this affordance but no frame follows it.',
    });

  return (
    <AppShell
      activeItem="Conversations"
      header={
        <PageHeader title="Conversations" showTabs={false} showButtonGroup={false} meta={<UpdatedMeta />} />
      }
    >
      {!hasConversations ? (
        <ConversationsEmptyState variant="no-data" />
      ) : (
        <>
          <ConversationsToolbar
            search={convoSearch}
            range={convoRange}
            response={convoResponse}
            segment={convoSegment}
            onSearch={(convoSearch) => setAnalytics({ convoSearch })}
            onRange={(convoRange) => setAnalytics({ convoRange })}
            onResponse={(convoResponse) => setAnalytics({ convoResponse })}
            onSegment={(convoSegment) => setAnalytics({ convoSegment })}
            onExport={() => outOfScope('Export')}
          />

          {selected ? (
            <div
              className={cn(
                sectionVariants({ variant: 'shadow' }),
                // Edge-to-edge: the panes own their own padding, and the
                // vertical rule has to reach the card's edges.
                'h-[620px] flex-row gap-0 overflow-hidden p-0'
              )}
            >
              <ConversationList
                conversations={shown}
                selectedId={selected.id}
                onSelect={(convoSelectedId) => setAnalytics({ convoSelectedId })}
              />
              <ConversationDetail conversation={selected} onAction={outOfScope} />
            </div>
          ) : (
            <ConversationsEmptyState variant="no-results" onClearFilters={clearConversationFilters} />
          )}
        </>
      )}
    </AppShell>
  );
}
