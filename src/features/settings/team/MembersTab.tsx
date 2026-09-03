import * as React from 'react';
import { Sms } from 'iconsax-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/Chip/badge';
import { Switch } from '@/components/ui/Toggle/switch';
import { Section } from '@/components/ui/Section/Section';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableUserCell,
} from '@/components/ui/Table/Table';
import { SettingCard, SettingRow } from '@/components/app/SettingRow';
import { Avatar } from '@/components/app/Avatar';
import { Menu, MenuItem } from '@/components/app/Menu';
import { useToast } from '@/components/app/toast';
import { useSettings, setTeam, withMemberAdded, withMemberPatched, withMemberRemoved } from '@/state/useSettings';
import { makeMemberId, seatsFor } from '@/data/settings';
import { RoleSelect } from './RoleSelect';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Figma 13:4842 — the two Members frames (under seat limit, at seat limit),
 * reconciled against help.usejimo.com/docs/settings/team-management.
 *
 * Two things the docs change:
 *   - An invite "will be sent directly to their email, prompting them to join",
 *     so a newly invited row is **Pending**, not Active. The artboards only ever
 *     draw Active rows because they draw a settled workspace.
 *   - Auto-Join defaults joiners to **Viewer**. The artboard says "Only View",
 *     which is the retired vocabulary.
 *
 * The seat limit comes from the plan, so both artboard states are the same code
 * path: on Free there is 1 seat, on Startup 2, Growth 5, Scale 10. The
 * at-limit copy is the artboard's, and its remedy links to Plan, which is what
 * the docs say to do ("contact our support team" is for seats BEYOND a plan).
 */
export function MembersTab() {
  const { team, subscription, account } = useSettings();
  const toast = useToast();
  const [email, setEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('viewer');
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
  const [kebabFor, setKebabFor] = React.useState<string | null>(null);

  const seats = seatsFor(subscription.plan);
  const atLimit = team.members.length >= seats;
  const domain = account.email.split('@')[1] ?? 'your domain';
  const valid = EMAIL_RE.test(email.trim());

  const invite = () => {
    if (!valid || atLimit) return;
    setTeam({
      members: withMemberAdded(team.members, {
        id: makeMemberId(),
        // No name until they accept — the invite only carries an address.
        name: email.trim().split('@')[0],
        email: email.trim(),
        role: inviteRole,
        status: 'pending',
      }),
    });
    setEmail('');
    toast({ type: 'positive', title: `Invite sent to ${email.trim()}` });
  };

  return (
    <>
      <SettingCard>
        <SettingRow
          title="Auto-Join via email domain"
          description={
            <>
              Allow <strong>@{domain}</strong> emails to automatically join this project, defaulting
              to <strong>Viewer</strong> role.
            </>
          }
          control={
            <Switch
              checked={team.autoJoinDomain}
              aria-label="Auto-join via email domain"
              onCheckedChange={(v) => setTeam({ autoJoinDomain: v === true })}
            />
          }
        />
      </SettingCard>

      <Section
        flushBody
        title={
          <span className="flex items-center gap-[var(--space-2)]">
            Members
            <span className="[font:var(--text-body-3)] text-[var(--color-text-tertiary)]">
              {team.members.length}
            </span>
          </span>
        }
        description={
          atLimit
            ? "You've reached your seat limit. Collaborate with more team members on our higher plans."
            : `You can only add up to ${seats} members on your current plan`
        }
        controls={
          <div className="flex items-center gap-[var(--space-3)]">
            <Input
              size="small"
              className="w-[240px]"
              placeholder="teammate@mail.com"
              aria-label="Invite by email"
              value={email}
              disabled={atLimit}
              leftIcon={<Sms size={20} variant="Linear" color="currentColor" />}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') invite();
              }}
            />
            <RoleSelect
              value={inviteRole}
              roles={team.roles}
              onChange={setInviteRole}
              disabled={atLimit}
            />
            <Button disabled={!valid || atLimit} onClick={invite}>
              Invite
            </Button>
          </div>
        }
      >
        <Table scroll={false}>
          <TableHeader>
            <TableRow>
              <TableHead>Users</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[56px]" aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.members.map((m) => (
              <TableRow key={m.id}>
                <TableUserCell
                  avatar={<Avatar name={m.name} seed={m.id} size="regular" />}
                  title={m.name}
                  subtitle={m.email}
                />
                <TableCell>
                  <Badge type={m.status === 'active' ? 'positive' : 'neutral'} size="small">
                    {m.status === 'active' ? 'Active' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <RoleSelect
                    value={m.role}
                    roles={team.roles}
                    onChange={(role) =>
                      setTeam({ members: withMemberPatched(team.members, m.id, { role }) })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Menu
                    open={kebabFor === m.id}
                    onClose={() => setKebabFor(null)}
                    align="right"
                    trigger={
                      <Button
                        variant="link"
                        size="sm"
                        aria-label={`Actions for ${m.name}`}
                        aria-haspopup="menu"
                        onClick={() => setKebabFor((k) => (k === m.id ? null : m.id))}
                      >
                        •••
                      </Button>
                    }
                  >
                    {m.status === 'pending' && (
                      <MenuItem
                        label="Resend invite"
                        onClick={() => {
                          setKebabFor(null);
                          toast({ type: 'positive', title: `Invite resent to ${m.email}` });
                        }}
                      />
                    )}
                    <MenuItem
                      label="Remove from project"
                      onClick={() => {
                        setKebabFor(null);
                        setTeam({ members: withMemberRemoved(team.members, m.id) });
                        toast({ type: 'neutral', title: `${m.name} removed` });
                      }}
                    />
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </>
  );
}
