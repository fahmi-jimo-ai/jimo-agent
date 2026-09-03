import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft2, Calendar, Layer } from 'iconsax-react';
import { AppShell } from '@/app/AppShell';
import { Button } from '@/components/ui/Button/Button';
import { DropdownSelector } from '@/components/ui/DropdownSelector/DropdownSelector';
import { Menu, MenuItem } from '@/components/app/Menu';
import { ModalCard } from '@/components/app/ModalCard';
import { useToast } from '@/components/app/toast';
import { UsersReachedSection } from '@/features/statistics/UsersReachedSection';
import {
  EXPERIENCE_NAV_LABEL,
  EXPERIENCE_PLURAL,
  EXPERIENCE_ROUTE,
  type ExperienceStatus,
  type ExperienceType,
  type MetricKey,
} from '@/data/experiences';
import {
  duplicateExperience,
  removeExperience,
  setExperienceStatus,
  useExperiences,
} from '@/state/useExperiences';
import { ExperienceDetailHeader } from './ExperienceDetailHeader';
import { StepsStrip } from './StepsStrip';
import { InsightsSection } from './InsightsSection';

/**
 * One experience's dashboard — Agent Designer Sandbox `10:2269`.
 *
 * A ROUTE, not a drawer: the artboard opens with a back chevron rather than a
 * close button, and a route swap also guarantees structurally what
 * `PageHeader/CONTEXT.md` states as a rule — that `type="main"` and
 * `type="sub"` never render at once.
 *
 * `id` is read from the route but can be passed directly, so a story mounts the
 * page under a bare `MemoryRouter` with no `<Routes>` and the `page()` helper
 * stays identical to the other page stories'.
 *
 * The experience is resolved THROUGH the store on every render rather than held
 * in state — the same note `SkillsPage` carries — so the page keeps up as the
 * record is renamed, paused or duplicated underneath it.
 *
 * ## An unknown id is a not-found page, never a redirect
 *
 * Bouncing to the index would make a typo'd or stale URL look like a working
 * page, and the one thing a reader needs to know is that the thing they linked
 * to is gone.
 *
 * ## Delete is one card, and there is never a second
 *
 * `ModalCard variant="confirm"` owns its own overlay when it is opened on its
 * own, which this is: there is no parent flow here to be a step of. The rule it
 * must not break is the other one — never render a second `ModalCard` over it.
 */
export function ExperienceDetailPage({
  type,
  id,
  initialMetric,
}: {
  type: ExperienceType;
  /** Overrides the route param. Stories pass this; the app does not. */
  id?: string;
  initialMetric?: MetricKey;
}) {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { experiences } = useExperiences();

  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [scopeOpen, setScopeOpen] = React.useState(false);
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [scope, setScope] = React.useState<string>('All hints');
  const [range, setRange] = React.useState<string>('All time');

  const experienceId = id ?? params.id ?? '';
  const experience = experiences.find((e) => e.id === experienceId && e.type === type) ?? null;

  const backToIndex = () => navigate(EXPERIENCE_ROUTE[type]);

  const outOfScope = (what: string) =>
    toast({
      type: 'neutral',
      title: `${what} is out of scope`,
      body: 'The artboard draws this affordance but no frame follows it.',
    });

  const shell = (children: React.ReactNode, header?: React.ReactNode) => (
    <AppShell
      activeItem={EXPERIENCE_NAV_LABEL[type]}
      primaryItem={EXPERIENCE_NAV_LABEL[type]}
      sections={null}
      primaryCollapsed={false}
      header={header}
    >
      {children}
    </AppShell>
  );

  if (!experience) {
    return shell(
      <div className="flex flex-col items-center gap-[var(--space-5)] py-[var(--space-12)] text-center">
        <div className="flex flex-col items-center gap-[var(--space-2)]">
          <p className="m-0 [font:var(--text-subtitle-2)] text-[var(--color-text-primary)]">
            This experience no longer exists
          </p>
          <p className="m-0 max-w-[420px] [font:var(--text-body-3)] text-[var(--color-text-secondary)]">
            It may have been deleted, or the link may be pointing at something that was never
            here.
          </p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft2 size={20} variant="Linear" color="currentColor" />}
          onClick={backToIndex}
        >
          Back to {EXPERIENCE_PLURAL[type]}
        </Button>
      </div>,
    );
  }

  const togglePlay = () => {
    const next: ExperienceStatus = experience.status === 'live' ? 'paused' : 'live';
    setExperienceStatus(experience.id, next);
    toast({
      type: next === 'live' ? 'positive' : 'neutral',
      title: next === 'live' ? `${experience.name} is live` : `${experience.name} is paused`,
    });
  };

  // The artboard's two selectors on the Users reached card. Both RELABEL only,
  // for the reason `InsightsSection` records about its own range picker: the
  // rows come from one fixed fixture, and refiltering them would be a claim the
  // data cannot back up.
  const scopeOptions = ['All hints', ...experience.steps.map((s) => s.label)];
  const rangeOptions = ['All time', 'Last week', 'Last month', 'Custom'];

  return shell(
    <>
      <StepsStrip experience={experience} />

      <InsightsSection
        experience={experience}
        initialMetric={initialMetric}
        onViewUsers={() => outOfScope('The per-day user list')}
        onExport={() => outOfScope('Exporting statistics')}
      />

      <UsersReachedSection
        controls={
          <>
            <Menu
              open={scopeOpen}
              onClose={() => setScopeOpen(false)}
              align="right"
              trigger={
                <DropdownSelector
                  size="small"
                  text={scope}
                  isOpen={scopeOpen}
                  withIcon
                  icon={<Layer size={20} variant="Linear" color="currentColor" />}
                  onClick={() => setScopeOpen((o) => !o)}
                />
              }
            >
              {scopeOptions.map((value) => (
                <MenuItem
                  key={value}
                  label={value}
                  selected={value === scope}
                  onClick={() => {
                    setScope(value);
                    setScopeOpen(false);
                  }}
                />
              ))}
            </Menu>
            <Menu
              open={rangeOpen}
              onClose={() => setRangeOpen(false)}
              align="right"
              trigger={
                <DropdownSelector
                  size="small"
                  text={range}
                  isOpen={rangeOpen}
                  withIcon
                  icon={<Calendar size={20} variant="Linear" color="currentColor" />}
                  onClick={() => setRangeOpen((o) => !o)}
                />
              }
            >
              {rangeOptions.map((value) => (
                <MenuItem
                  key={value}
                  label={value}
                  selected={value === range}
                  onClick={() => {
                    setRange(value);
                    setRangeOpen(false);
                  }}
                />
              ))}
            </Menu>
          </>
        }
        onExport={() => outOfScope('Exporting the user list')}
        onSeeAll={() => outOfScope('The full user list')}
      />

      {confirmingDelete && (
        <ModalCard
          variant="confirm"
          title={`Delete ${experience.name}?`}
          onClose={() => setConfirmingDelete(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
              <Button
                danger
                onClick={() => {
                  removeExperience(experience.id);
                  setConfirmingDelete(false);
                  toast({ type: 'neutral', title: `${experience.name} deleted` });
                  backToIndex();
                }}
              >
                Delete
              </Button>
            </>
          }
        >
          This cannot be undone. Everyone it has already reached keeps whatever they saw, but the
          experience and its statistics go away.
        </ModalCard>
      )}
    </>,
    <ExperienceDetailHeader
      experience={experience}
      onBack={backToIndex}
      onPlay={togglePlay}
      onSettings={() => outOfScope(`Target & publish for ${experience.name}`)}
      onEdit={() => outOfScope(`Editing ${experience.name}`)}
      onDuplicate={() => {
        const copy = duplicateExperience(experience.id);
        if (copy) toast({ type: 'positive', title: `${copy.name} created as a draft` });
      }}
      onPublicUrl={() => outOfScope('Generating a public URL')}
      onDelete={() => setConfirmingDelete(true)}
    />,
  );
}
