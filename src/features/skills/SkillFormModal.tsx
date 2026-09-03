import * as React from 'react';
import { Global, Trash } from 'iconsax-react';
import { ModalCard } from '@/components/app/ModalCard';
import { Menu } from '@/components/app/Menu';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { DropdownMenuList } from '@/components/ui/DropdownMenuList/DropdownMenuList';
import {
  makeSkillId,
  SKILL_MODES,
  SKILL_MODE_LABEL,
  type Skill,
  type SkillMode,
  type SkillScope,
} from '@/data/skills';
import type { InterfacePage } from '@/data/interfacePages';
import { skillGlyph } from './skillGlyph';

/**
 * Add / Edit a skill — Figma `12384:9787` for the field set.
 *
 * ## One card, two steps
 *
 * CLAUDE.md forbids a dialog over a dialog, so the delete confirmation is a
 * STEP of this card, not a second one: `step` cross-slides the interior and
 * eases both the height and the width, and `variant` takes the card from the
 * 560 form shape to the 440 headerless `confirm` shape on the way. That is the
 * exact case `ModalCard`'s header names as belonging inside the card — "you are
 * about to turn this off, are you sure" — as opposed to `PickerDialog`, which is
 * opened on its own and therefore owns its own overlay.
 *
 * `direction` is tracked so the return leg slides back the way it came.
 *
 * ## Add and Edit are the same card
 *
 * `draft.editing` is the whole difference: it flips the title, prefills every
 * field, swaps the commit button's copy, and is what puts Delete in the footer.
 * A separate EditSkillModal would be this file with three strings changed, and
 * the two would drift the first time a field was added.
 *
 * ## Where the page comes from
 *
 * `SkillPagePicker` runs BEFORE this card and hands its choice in as
 * `draft.page`, so `Start from` is a settled value here rather than a second
 * picker — which is also why it is read-only. When there is no page (the picker
 * was skipped, or the skill never had one) the field falls back to a plain URL
 * input. That URL is a starting hint only: `Skill` has no field for a raw URL —
 * `pageId` points at a SCANNED page — so it is deliberately not persisted, and
 * this comment is that admission rather than a silently dropped value.
 *
 * `AddSourceModal` is the structural reference for all of the above.
 */

export type SkillDraft = {
  /** Chosen in the Add Skill menu; preselects the Mode field. */
  mode: SkillMode;
  /** Chosen in `SkillPagePicker`. `null`/absent leaves Start from a URL field. */
  page?: InterfacePage | null;
  /** PRD-584 — set by the picker's Global tile. Absent means page-scoped. */
  scope?: SkillScope;
  /** Set when the card was opened from a row's edit action. */
  editing?: Skill;
};

type Step = 'details' | 'confirm-delete';

export function SkillFormModal({
  draft,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
}: {
  draft: SkillDraft;
  onClose: () => void;
  onSubmit: (skill: Skill) => void;
  onUpdate: (id: string, patch: Partial<Skill>) => void;
  /** Omit and the footer has no Delete, so the confirm step is unreachable. */
  onDelete?: (id: string) => void;
}) {
  const { editing } = draft;

  const [step, setStep] = React.useState<Step>('details');
  const [direction, setDirection] = React.useState<'forward' | 'back'>('forward');

  const [name, setName] = React.useState(editing?.name ?? '');
  const [description, setDescription] = React.useState(editing?.description ?? '');
  const [instructions, setInstructions] = React.useState(editing?.instructions ?? '');
  const [mode, setMode] = React.useState<SkillMode>(editing?.mode ?? draft.mode);
  const [modeOpen, setModeOpen] = React.useState(false);
  const [startUrl, setStartUrl] = React.useState('');

  const page = draft.page ?? null;
  const canSave = name.trim().length > 0;

  /* PRD-584. Editing keeps whatever the skill already is; creating takes what
     the picker chose. The form does not offer a scope control of its own —
     the picker is where that question is asked, and asking it twice is how the
     two answers start to disagree. */
  const scope: SkillScope = editing?.scope ?? draft.scope ?? 'page';

  const go = (next: Step, dir: 'forward' | 'back') => {
    setDirection(dir);
    setStep(next);
  };

  const submit = () => {
    if (!canSave) return;

    if (editing) {
      onUpdate(editing.id, {
        name: name.trim(),
        description: description.trim(),
        instructions,
        mode,
        scope,
        pageId: page?.id ?? editing.pageId ?? null,
        updatedAt: Date.now(),
      });
      return;
    }

    onSubmit({
      // Seeded from the mode the FORM settled on, not `draft.mode`: the field is
      // editable, and an id reading `guide-…` on an Execute skill would be a
      // small lie in every log line that ever prints it.
      id: makeSkillId(mode),
      name: name.trim(),
      description: description.trim(),
      instructions,
      mode,
      scope,
      pageId: page?.id ?? null,
      active: true,
      updatedAt: Date.now(),
      usage: 0,
      completed: 0,
    });
  };

  if (step === 'confirm-delete' && editing) {
    return (
      <ModalCard
        title="Delete this skill?"
        onClose={onClose}
        variant="confirm"
        step={step}
        direction={direction}
        footer={
          <>
            <Button variant="outline" onClick={() => go('details', 'back')}>
              Cancel
            </Button>
            <Button
              danger
              onClick={() => {
                onDelete?.(editing.id);
                onClose();
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        “{editing.name}” will stop running immediately. Conversations that already
        used it keep their record of what it did.
      </ModalCard>
    );
  }

  return (
    <ModalCard
      title={editing ? 'Edit skill' : 'New skill'}
      onClose={onClose}
      step={step}
      direction={direction}
      footer={
        <div className="flex w-full items-center justify-between gap-[var(--space-3)]">
          {editing && onDelete ? (
            <Button
              variant="link"
              danger
              leftIcon={<Trash size={20} variant="Linear" color="currentColor" />}
              onClick={() => go('confirm-delete', 'forward')}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-[var(--space-3)]">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!canSave} onClick={submit}>
              {editing ? 'Save changes' : 'Create skill'}
            </Button>
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-[var(--space-4)]">
        <Input
          label="Name"
          placeholder="Update the payment method"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          inputType="textarea"
          label="Description"
          supportiveText="One line the agent reads to decide whether this skill applies."
          placeholder="Fills in a new card on the billing screen and saves it."
          className="[&_textarea]:min-h-[72px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          inputType="textarea"
          label="Instructions"
          supportiveText="Goal, the inputs you need, the numbered steps, and what to do when it fails."
          placeholder={'Your goal is to …\n\nSteps:\n1. …'}
          className="[&_textarea]:min-h-[180px]"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />

        <Menu
          className="w-full"
          open={modeOpen}
          onClose={() => setModeOpen(false)}
          menuClassName="min-w-[280px]"
          trigger={
            <Input
              inputType="dropdown"
              label="Mode"
              readOnly
              className="w-full cursor-pointer [&_input]:cursor-pointer"
              leftIcon={skillGlyph(mode, 24)}
              value={SKILL_MODE_LABEL[mode]}
              onClick={() => setModeOpen((o) => !o)}
            />
          }
        >
          {SKILL_MODES.map((value) => (
            <DropdownMenuList
              key={value}
              text={SKILL_MODE_LABEL[value]}
              icon={skillGlyph(value, 20)}
              state={mode === value ? 'selected' : 'default'}
              onClick={() => {
                setMode(value);
                setModeOpen(false);
              }}
            />
          ))}
        </Menu>

        {page ? (
          <Input
            label="Start from"
            readOnly
            supportiveText="Chosen when the skill was created. Pick a different page from the Interface tab."
            value={page.name}
            leftIcon={<Global size={24} variant="Linear" color="currentColor" />}
            className="[&_input]:cursor-default"
          />
        ) : (
          <Input
            label="Start from"
            placeholder="https://app.example.com/billing"
            supportiveText="Optional. A scanned page is what actually binds a skill to a screen."
            leftIcon={<Global size={24} variant="Linear" color="currentColor" />}
            value={startUrl}
            onChange={(e) => setStartUrl(e.target.value)}
          />
        )}
      </div>
    </ModalCard>
  );
}
