import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { ModalCard } from '@/components/app/ModalCard';
import { SettingCard, SettingRow } from '@/components/app/SettingRow';
import { useToast } from '@/components/app/toast';
import { useSettings, setAccount } from '@/state/useSettings';
import { SettingsShell } from '../SettingsShell';
import { SaveBar, useDraft } from '../SaveBar';
import { ImageUploadField, DangerRow } from '../fields';
import { ChangeEmailModal } from './ChangeEmailModal';
import { ChangePasswordModal } from './ChangePasswordModal';

/**
 * `/settings/account` — Figma 13:14165 (six frames), reconciled against
 * help.usejimo.com/docs/settings/notifications-and-account-settings.
 *
 * Docs: "Upload an avatar and update your personal details such as name and
 * username", "change your email and password", and account deletion "along with
 * all associated projects" — which is why the delete copy here says projects,
 * plural, where the artboard reuses the project-level wording.
 *
 * Email and password are NOT part of the save-bar draft. Both open their own
 * card because both need a verification beat the other fields do not, which is
 * exactly what the artboards draw.
 */
export function AccountPage() {
  const s = useSettings();
  const toast = useToast();
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const form = useDraft(
    {
      avatar: s.account.avatar,
      username: s.account.username,
      firstName: s.account.firstName,
      lastName: s.account.lastName,
    },
    (next) => {
      setAccount(next);
      toast({ type: 'positive', title: 'Account updated' });
    },
  );

  const fullName = `${s.account.firstName} ${s.account.lastName}`.trim();

  return (
    <SettingsShell activeItem="My account" title="My Account">
      <SettingCard>
        <ImageUploadField
          label="Avatar"
          shape="circle"
          fallbackName={fullName || s.account.username}
          value={form.draft.avatar}
          onChange={(avatar) => form.set('avatar', avatar)}
          removeLabel="Remove"
        />
        <div className="flex flex-col gap-[var(--space-4)] px-[var(--space-4)] pb-[var(--space-4)]">
          <Input
            label="Username"
            value={form.draft.username}
            onChange={(e) => form.set('username', (e.target as HTMLInputElement).value)}
          />
          <Input
            label="First name"
            value={form.draft.firstName}
            onChange={(e) => form.set('firstName', (e.target as HTMLInputElement).value)}
          />
          <Input
            label="Last name"
            value={form.draft.lastName}
            onChange={(e) => form.set('lastName', (e.target as HTMLInputElement).value)}
          />
        </div>
      </SettingCard>

      <SettingCard>
        <SettingRow
          title="Email"
          description={s.account.email}
          control={
            <Button variant="outline" onClick={() => setEmailOpen(true)}>
              Change email
            </Button>
          }
        />
        <SettingRow
          className="border-t border-[var(--color-border-default)]"
          title="Password"
          description="**********"
          control={
            <Button variant="outline" onClick={() => setPasswordOpen(true)}>
              Change password
            </Button>
          }
        />
      </SettingCard>

      <DangerRow
        title="Delete account"
        description="Permanently delete your account and all associated data in Jimo"
        action="Delete account"
        onAction={() => setConfirmDelete(true)}
      />

      <SaveBar visible={form.dirty} onSave={form.save} onReset={form.reset} />

      {emailOpen && (
        <ChangeEmailModal
          current={s.account.email}
          onClose={() => setEmailOpen(false)}
          onConfirm={(email) => {
            setAccount({ email });
            toast({ type: 'positive', title: 'Email updated' });
          }}
        />
      )}

      {passwordOpen && (
        <ChangePasswordModal
          onClose={() => setPasswordOpen(false)}
          onConfirm={() => toast({ type: 'positive', title: 'Password updated' })}
        />
      )}

      {confirmDelete && (
        <ModalCard
          variant="confirm"
          title="Delete your account?"
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
                  toast({ type: 'neutral', title: 'Deleting an account needs a backend' });
                }}
              >
                Delete account
              </Button>
            </>
          }
        >
          This deletes your Jimo account and every project associated with it. It cannot be undone.
        </ModalCard>
      )}
    </SettingsShell>
  );
}
