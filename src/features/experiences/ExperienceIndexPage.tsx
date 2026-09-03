import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Add } from 'iconsax-react';
import { AppShell } from '@/app/AppShell';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { useToast } from '@/components/app/toast';
import {
  EXPERIENCE_LABEL,
  EXPERIENCE_NAV_LABEL,
  EXPERIENCE_PLURAL,
  EXPERIENCE_ROUTE,
  type Experience,
  type ExperienceStatus,
  type ExperienceType,
} from '@/data/experiences';
import {
  EXPERIENCE_TABS,
  EXPERIENCE_TAB_LABEL,
  type ExperienceDisplay,
  type ExperienceTab,
} from '@/state/experiencesStore';
import {
  duplicateExperience,
  filterExperiences,
  removeExperience,
  segmentOptions,
  setExperienceStatus,
  setView,
  tagOptions,
  useExperiences,
  experiencesOfType,
} from '@/state/useExperiences';
import { ExperiencesToolbar } from './ExperiencesToolbar';
import { ExperiencesCard } from './ExperiencesCard';
import type { ExperienceActions } from './ExperienceRowMenu';

/**
 * One experience type's dashboard — Agent Designer Sandbox `6:384`.
 *
 * ONE page component for all six types, not six near-copies. The six differ
 * only in title, glyph, KPI vocabulary and rows; the layout is identical, and
 * six files is the drift CLAUDE.md warns about at page scale. The type arrives
 * as a prop from the route element in `main.tsx`, which keeps `/tours`
 * greppable and makes the six types a compile-time fact rather than a `:type`
 * param every unknown segment would satisfy.
 *
 * Experiences live in the PRIMARY rail — `PrimaryNavSidebar` already ships all
 * six as peers of the Agent — so the page passes `primaryItem` and
 * `sections={null}`: it has no secondary rail, because none is designed for one
 * and lending it the Agent console's would misstate the IA.
 *
 * ## Filters are persisted, view state is not
 *
 * The docs say filters and display options "can be saved for the current tab
 * view", which makes them configuration; they live in `experiencesStore` under
 * one `ViewPrefs` per type. The `initial*` props are the story seam this repo
 * uses everywhere, and they override the stored values for one render so a
 * story can land on a frame.
 *
 * ## `+ New View` is a dead end, on purpose
 *
 * The docs do describe it ("the '+' tab enables you to tailor new views"), but
 * no frame follows it, and `All | Live | Draft` are status filters rather than
 * saved views — making them rows 1–3 of a user-editable list would let the user
 * delete "All". Building it properly means pinned-vs-user views plus rename,
 * reorder and delete: four undrawn flows behind one drawn `+`. So it raises the
 * same `outOfScope` toast `SkillsPage` uses, with the same wording.
 */
export function ExperienceIndexPage({
  type,
  initialSearch = '',
  initialTab,
  initialDisplay,
}: {
  type: ExperienceType;
  initialSearch?: string;
  initialTab?: ExperienceTab;
  initialDisplay?: ExperienceDisplay;
}) {
  const { experiences, views } = useExperiences();
  const navigate = useNavigate();
  const toast = useToast();

  const stored = views[type];
  const [tab, setTab] = React.useState<ExperienceTab>(initialTab ?? stored.tab);
  const [display, setDisplay] = React.useState<ExperienceDisplay>(
    initialDisplay ?? stored.display,
  );
  // The artboard draws no search box, so nothing renders one. The docs DO
  // define a name search on this list, and `filterExperiences` implements it —
  // reachable here through the story seam, the same way `SkillsPage` exposes
  // `initialSearch`.
  const [search] = React.useState(initialSearch);

  const ofType = experiencesOfType(experiences, type);
  const shown = filterExperiences(experiences, {
    search,
    tab,
    contexts: stored.contexts,
    statuses: stored.statuses,
    segments: stored.segments,
    tags: stored.tags,
    display,
  });

  const outOfScope = (what: string) =>
    toast({
      type: 'neutral',
      title: `${what} is out of scope`,
      body: 'The artboard draws this affordance but no frame follows it.',
    });

  const persist = (next: Parameters<typeof setView>[1]) => setView(type, next);

  const pickTab = (id: string) => {
    if (id === 'new-view') {
      outOfScope('Creating a view');
      return;
    }
    const next = id as ExperienceTab;
    setTab(next);
    persist({ tab: next });
  };

  const pickDisplay = (next: ExperienceDisplay) => {
    setDisplay(next);
    persist({ display: next });
  };

  const actionsFor = (experience: Experience): ExperienceActions => ({
    onEdit: () => outOfScope(`Editing ${experience.name}`),
    onSettings: () => outOfScope(`Target & publish for ${experience.name}`),
    onToggleStatus: () => {
      const next: ExperienceStatus = experience.status === 'live' ? 'paused' : 'live';
      setExperienceStatus(experience.id, next);
      toast({
        type: next === 'live' ? 'positive' : 'neutral',
        title: next === 'live' ? `${experience.name} is live` : `${experience.name} is paused`,
      });
    },
    onDuplicate: () => {
      const copy = duplicateExperience(experience.id);
      if (copy) toast({ type: 'positive', title: `${copy.name} created as a draft` });
    },
    onDelete: () => {
      removeExperience(experience.id);
      toast({ type: 'neutral', title: `${experience.name} deleted` });
    },
  });

  const tabs = [
    ...EXPERIENCE_TABS.map((id) => ({ id, label: EXPERIENCE_TAB_LABEL[id] })),
    {
      id: 'new-view',
      label: 'New View',
      icon: <Add size={20} variant="Linear" color="currentColor" />,
    },
  ];

  return (
    <AppShell
      activeItem={EXPERIENCE_NAV_LABEL[type]}
      primaryItem={EXPERIENCE_NAV_LABEL[type]}
      sections={null}
      primaryCollapsed={false}
      header={
        <PageHeader
          title={EXPERIENCE_PLURAL[type]}
          buttons={[
            {
              label: `New ${EXPERIENCE_LABEL[type]}`,
              level: 'primary',
              leftIcon: <Add size={20} variant="Linear" color="currentColor" />,
              onClick: () => outOfScope(`Creating a ${EXPERIENCE_LABEL[type].toLowerCase()}`),
            },
          ]}
          buttonSize="small"
          showTabs
          tabs={tabs}
          activeTab={tab}
          onTabClick={pickTab}
        />
      }
    >
      {ofType.length > 0 && (
        <ExperiencesToolbar
          type={type}
          contexts={stored.contexts}
          statuses={stored.statuses}
          segments={stored.segments}
          tags={stored.tags}
          display={display}
          segmentOptions={segmentOptions(experiences)}
          tagOptions={tagOptions(experiences)}
          onContexts={(contexts) => persist({ contexts })}
          onStatuses={(statuses) => persist({ statuses })}
          onSegments={(segments) => persist({ segments })}
          onTags={(tags) => persist({ tags })}
          onDisplay={pickDisplay}
        />
      )}

      <ExperiencesCard
        type={type}
        ofType={ofType}
        shown={shown}
        display={display}
        showType={stored.contexts.length > 1}
        onOpen={(experience) =>
          navigate(`${EXPERIENCE_ROUTE[experience.type]}/${encodeURIComponent(experience.id)}`)
        }
        onCreate={() => outOfScope(`Creating a ${EXPERIENCE_LABEL[type].toLowerCase()}`)}
        actionsFor={actionsFor}
      />
    </AppShell>
  );
}
