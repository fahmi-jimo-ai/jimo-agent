import * as React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/Chip/badge';
import { ModalCard } from '@/components/app/ModalCard';
import { parseDomains, type Environment } from '@/state/useSettings';
import type { EnvironmentColour, EnvironmentIcon } from '@/data/settings';
import { ColourSwatchField, IconPickerField } from './ColourSwatchField';

/**
 * "Edit environment" — help.usejimo.com/docs/settings/environments.
 *
 * INVENTED layout, docs-sourced fields: Icon & Colour, Name, Domains and an
 * optional Description, in that order, which is the order the docs list them.
 *
 * Domains are "separated by spaces, or press Enter after each domain" and may
 * be regexes (`\.*bar.com$`). So splitting on whitespace is the whole rule —
 * a comma is NOT a separator, because it can appear inside a pattern like
 * `a{1,3}`. `parseDomains` carries that, and it is unit-tested.
 *
 * Delete is a `confirm` STEP of this card, not a second dialog.
 */
export function EnvironmentModal({
  existing,
  onClose,
  onSave,
  onDelete,
}: {
  existing?: Environment;
  onClose: () => void;
  onSave: (env: Omit<Environment, 'id'>) => void;
  onDelete?: () => void;
}) {
  const [step, setStep] = React.useState<'form' | 'delete'>('form');
  const [name, setName] = React.useState(existing?.name ?? '');
  const [icon, setIcon] = React.useState<string>(existing?.icon ?? 'global');
  const [colour, setColour] = React.useState<string>(existing?.colour ?? 'blue');
  const [domainText, setDomainText] = React.useState((existing?.domains ?? []).join(' '));
  const [description, setDescription] = React.useState(existing?.description ?? '');

  const domains = parseDomains(domainText);
  const valid = name.trim() !== '' && domains.length > 0;

  return (
    <ModalCard
      title={
        step === 'delete'
          ? 'Delete this environment?'
          : existing
            ? 'Edit environment'
            : 'New environment'
      }
      variant={step === 'delete' ? 'confirm' : 'card'}
      step={step}
      direction={step === 'form' ? 'back' : 'forward'}
      onClose={onClose}
      footer={
        step === 'delete' ? (
          <>
            <Button variant="outline" onClick={() => setStep('form')}>
              Cancel
            </Button>
            <Button danger onClick={onDelete}>
              Delete environment
            </Button>
          </>
        ) : (
          <>
            {existing && onDelete ? (
              <Button variant="link" danger onClick={() => setStep('delete')}>
                Delete
              </Button>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button
              disabled={!valid}
              onClick={() =>
                onSave({ name: name.trim(), icon, colour, domains, description: description.trim() })
              }
            >
              {existing ? 'Save environment' : 'Create environment'}
            </Button>
          </>
        )
      }
    >
      {step === 'delete' ? (
        <>
          Experiences published to <strong>{existing?.name}</strong> will fall back to all domains.
          This cannot be undone.
        </>
      ) : (
        <div className="flex flex-col gap-[var(--space-5)]">
          <div className="flex gap-[var(--space-6)]">
            <IconPickerField value={icon} onChange={(i: EnvironmentIcon) => setIcon(i)} />
            <ColourSwatchField value={colour} onChange={(c: EnvironmentColour) => setColour(c)} />
          </div>

          <Input
            label="Name"
            placeholder="Staging"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex flex-col gap-[var(--space-2)]">
            <Input
              label="Domains"
              placeholder="foo.com bar.com"
              value={domainText}
              supportiveText="Separate with spaces. Regular expressions work too, e.g. \.*bar.com$"
              onChange={(e) => setDomainText(e.target.value)}
            />
            {domains.length > 0 && (
              <div className="flex flex-wrap gap-[var(--space-2)]">
                {domains.map((d) => (
                  <Badge key={d} type="neutral" size="x-small">
                    {d}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Description"
            inputType="textarea"
            placeholder="Optional — what this environment is for."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      )}
    </ModalCard>
  );
}
