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
import { CONVERSATIONS, filterConversations, type TriggeredSkill } from '@/data/analytics';
import { useAnalytics, setAnalytics, clearConversationFilters } from '@/state/useAnalytics';

/**
 * Conversations — Figma 949:7217 (list) / 949:7347 (panel), over the older
 * 934:28534 / 934:29319 / 934:30359 / 934:30109 for the page states.
 *
 * The artboards draw this as the second tab of a page called "Analyze". It
 * ships as its own route instead — see StatisticsPage's header comment for why.
 *
 * Three body states, the same shape `UserContextSection` uses:
 *   - nothing yet (934:30359): NO toolbar. There is nothing to filter.
 *   - filters match nothing (934:30109): toolbar stays — it is the way back out.
 *   - otherwise: toolbar, then the two panes.
 *
 * `traceDefaultOpen` is a story hook, not a feature: it opens the first agent
 * turn's `ThinkingTrace` so the expanded frame (Figma `12983:8096`) can be shot
 * and diffed. It defaults to false, so the app is unaffected.
 *
 * The two-pane card is not a `Section`. Section always applies --space-6 of
 * padding and a --space-6 gap between header and body, and this card is
 * edge-to-edge with a vertical rule down the middle. It reuses Section's
 * exported `sectionVariants` for the panel contract (bg / radius / shadow) and
 * zeroes the padding, rather than re-drawing a white rounded box by hand.
 *
 * This is the ONE page that opts out of Subpage's centred 1064 column
 * (`maxWidth="100%"`). Figma 949:7347 annotates the panel "This entire box will
 * fill the viewport", and it means it: a 400px list beside a transcript does not
 * fit in 1064 without the bubbles turning into a column of two-word lines. The
 * header and the toolbar widen with it — widening the card alone would leave
 * them floating over a page that is a different width from its own content. The
 * --space-8 gutters stay, so the card still clears the nav rail and the window
 * edge rather than being flush against both.
 */
export function ConversationsPage({ traceDefaultOpen = false }: { traceDefaultOpen?: boolean } = {}) {
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

  // Share conversation is the one menu row the artboard follows through on:
  // 949:7292 annotates it "success toast saying 'Conversation Link Copied'".
  // There is no link to copy in a prototype, so the toast is the whole feature.
  const shareConversation = () =>
    toast({ type: 'positive', title: 'Conversation Link Copied' });

  // Invented, and labelled as such: none of the rest has a frame behind it, so
  // the prototype acknowledges the click and stops.
  const outOfScope = (title: string) =>
    toast({
      type: 'neutral',
      title: `${title} is out of scope`,
      body: 'The artboard draws this affordance but no frame follows it.',
    });

  // A skill chip in a thinking trace is the one dead end whose destination is
  // known: `Skills` is already a sidebar item, it just has no page yet. The
  // toast names the skill rather than claiming the skill itself is out of
  // scope — the answer really did fire it.
  const skillOutOfScope = (skill: TriggeredSkill) =>
    toast({
      type: 'neutral',
      title: `${skill.name} fired on this answer`,
      body: 'Skills has no page yet, so there is nowhere to open it.',
    });

  return (
    <AppShell
      activeItem="Conversations"
      maxWidth="100%"
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
              <ConversationDetail
                conversation={selected}
                onAction={outOfScope}
                onShare={shareConversation}
                onSkillClick={skillOutOfScope}
                traceDefaultOpen={traceDefaultOpen}
              />
            </div>
          ) : (
            <ConversationsEmptyState variant="no-results" onClearFilters={clearConversationFilters} />
          )}
        </>
      )}
    </AppShell>
  );
}
