import * as React from 'react';
import { Badge } from '@/components/ui/Chip/badge';
import { Alert } from '@/components/ui/Infobox/alert';
import { Section } from '@/components/ui/Section/Section';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table/Table';
import { useSettings } from '@/state/useSettings';

/**
 * INVENTED, and labelled as such. No artboard draws this tab.
 *
 * The Members frame (13:4843) draws a `Roles` tab beside `Members`, and
 * help.usejimo.com/docs/settings/team-management describes what is behind it —
 * "predefined roles such as Admin, Editor, and Viewer", customisable, with a
 * Roles tab to "define or edit the permissions associated with each role". So
 * the tab has to exist and has to say something; every pixel of HOW it says it
 * is this file's invention, built from the repo's existing table vocabulary.
 *
 * The permission matrix is deliberately NOT invented. The docs name no
 * individual permissions, and a made-up grid of checkboxes would read as
 * product truth in screenshots. Each role states its scope in prose instead,
 * and the Alert says plainly that editing needs a design.
 *
 * Expect this to be redrawn once a designer touches it.
 */
export function RolesTab() {
  const { team } = useSettings();

  const counts = team.roles.map(
    (r) => team.members.filter((m) => m.role === r.id).length,
  );

  return (
    <>
      <Alert
        type="neutral"
        title="Custom roles are not designed yet"
        body="Jimo supports customising what each role can do. This build lists the three predefined roles and who holds them; editing permissions needs an artboard first."
      />

      <Section flushBody title="Roles" description="Who can do what in this project.">
        <Table scroll={false}>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.roles.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell>
                  <span className="flex items-center gap-[var(--space-2)]">
                    <span className="[font:var(--text-subtitle-4)] text-[var(--color-text-primary)]">
                      {r.name}
                    </span>
                    {r.system && (
                      <Badge type="neutral" size="x-small">
                        Predefined
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell className="[font:var(--text-body-3)] text-[var(--color-text-secondary)]">
                  {r.description}
                </TableCell>
                <TableCell>{counts[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </>
  );
}
