import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { ModalCard } from '@/components/app/ModalCard';
import { SettingCard, SettingRow } from '@/components/app/SettingRow';
import { useToast } from '@/components/app/toast';
import { useSettings, setProject, setSubscription } from '@/state/useSettings';
import { SettingsShell } from '../SettingsShell';
import { SaveBar, useDraft } from '../SaveBar';
import { ImageUploadField, ReadOnlyRow, DangerRow } from '../fields';

/**
 * `/settings/general` — Figma 13:9257 (two frames), reconciled against
 * help.usejimo.com/docs/settings/general-settings.
 *
 * The docs list FIVE things this page manages: Project Logo, Project Name,
 * Hide Jimo Label, Delete Project and **Project ID** — "a unique, uneditable
 * identifier... used mainly for API interactions and support references". The
 * artboards draw the first four. The fifth is here because the docs supersede
 * them for this area, and because the Installation page prints the same id in
 * its snippet, so a reader needs somewhere to copy it from.
 *
 * The artboards' two frames are the Hide-Jimo-label states: trial still
 * available ("Free for 14 days by starting a free trial on any plan") and trial
 * spent ("After your trial ends, you will need to enable this again after
 * upgrading to a plan"). A third state the artboards do not draw but the docs
 * require: on Scale the add-on is INCLUDED, so there is nothing to buy and the
 * row is a plain switch.
 *
 * Delete gets a confirm step the artboard does not draw, because the docs are
 * explicit that it "will directly purge all your data for the current project".
 * A one-click purge with no confirmation would be a bug, not fidelity.
 */
export function GeneralPage() {
  const s = useSettings();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const form = useDraft(
    { name: s.project.name, logo: s.project.logo },
    (next) => {
      setProject(next);
      toast({ type: 'positive', title: 'Project updated' });
    },
  );

  const onScale = s.subscription.plan === 'scale';
  const trialSpent = s.subscription.status === 'cancelled' || s.subscription.trialEndsAt !== null;

  return (
    <SettingsShell activeItem="General" title="General">
      <SettingCard>
        <ImageUploadField
          label="Project logo"
          fallbackName={s.project.name}
          value={form.draft.logo}
          onChange={(logo) => form.set('logo', logo)}
        />
        <div className="flex flex-col gap-[var(--space-2)] px-[var(--space-4)] pb-[var(--space-4)]">
          <Input
            label="Project name"
            value={form.draft.name}
            onChange={(e) => form.set('name', e.target.value)}
          />
        </div>
      </SettingCard>

      <SettingCard>
        <ReadOnlyRow
          title="Project ID"
          description="Used for API calls and when contacting support. This cannot be changed."
          value={s.project.projectId}
        />
      </SettingCard>

      <SettingCard>
        <SettingRow
          title="Hide Jimo label"
          description={
            onScale
              ? 'Included in your Scale plan.'
              : trialSpent
                ? 'After your trial ends, you will need to enable this again after upgrading to a plan'
                : 'Free for 14 days by starting a free trial on any plan'
          }
          control={
            onScale ? (
              <Button
                variant="outline"
                onClick={() => {
                  setProject({ hideJimoLabel: !s.project.hideJimoLabel });
                  toast({
                    type: 'positive',
                    title: s.project.hideJimoLabel ? 'Jimo label shown' : 'Jimo label hidden',
                  });
                }}
              >
                {s.project.hideJimoLabel ? 'Show label' : 'Hide label'}
              </Button>
            ) : trialSpent ? (
              <Button
                variant="outline"
                onClick={() => {
                  // The add-on is $50/month per the docs, and buying it is a
                  // subscription change — so it goes through Plan, not here.
                  setSubscription({ hideJimoLabelAddon: true });
                  toast({ type: 'neutral', title: 'Choose a plan to enable this' });
                }}
              >
                Upgrade plan
              </Button>
            ) : (
              <Button variant="outline" onClick={() => toast({ type: 'neutral', title: 'Pick a plan to start your trial' })}>
                Start a free trial
              </Button>
            )
          }
        />
      </SettingCard>

      <DangerRow
        title="Delete project"
        description="Permanently delete your account and all associated data in Jimo"
        action="Delete project"
        onAction={() => setConfirmDelete(true)}
      />

      <SaveBar visible={form.dirty} onSave={form.save} onReset={form.reset} />

      {confirmDelete && (
        <ModalCard
          variant="confirm"
          title="Delete this project?"
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                danger
                onClick={() => {
                  setConfirmDelete(false);
                  // Nothing is actually deleted: this prototype has no backend
                  // and wiping the store would take the reader's whole session
                  // with it. The confirmation is the designed beat; the purge
                  // is the part that needs a server.
                  toast({ type: 'neutral', title: 'Deleting a project needs a backend' });
                }}
              >
                Delete project
              </Button>
            </>
          }
        >
          This immediately purges every experience, user, segment and setting in{' '}
          <strong>{s.project.name}</strong>. It cannot be undone.
        </ModalCard>
      )}
    </SettingsShell>
  );
}
