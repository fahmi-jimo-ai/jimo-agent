import React from 'react';
import { SearchNormal1, Slack, Notepad2, Global, Book1 } from 'iconsax-react';
import {
  PickerDialog,
  PickerGroup,
  PickerRow,
  PickerCount,
  PickerEmpty,
} from '../../src/components/app/PickerDialog';
import { Button } from '../../src/components/ui/Button/Button';
import { Input } from '../../src/components/ui/Input/Input';
import { Checkbox } from '../../src/components/ui/Checkbox/Checkbox';
import { ContainedIcon } from '../../src/components/ui/ContainedIcon/ContainedIcon';
import { AddPropertyModal } from '../../src/features/knowledge/AddPropertyModal';

const FIGMA = 'https://www.figma.com/design/42KccejbNYeHc3EP5P8vHd/Copilot-Widget?node-id=';

/**
 * `PickerDialog` — the "search a catalogue, tick some rows, confirm" structure,
 * transcribed from Figma 921:17353.
 *
 * The point of this file is that the last two stories use **no knowledge code at
 * all**. Same shell, same rows, a different catalogue and a different trailing
 * control — which is the test of whether the structure is actually reusable or
 * just the add-property dialog with the names filed off.
 *
 * ## The parts
 *
 * | Export | Renders |
 * |---|---|
 * | `PickerDialog` | Shell: overlay, sticky header + `search`, scrolling body, sticky `footer` |
 * | `PickerGroup` | `label` + an 8px-gapped run of rows |
 * | `PickerRow` | `icon` · `title` / `description` · `trailing`, with the row-wide hover fill |
 * | `PickerCount` | The footer's Subtitle-3 status line |
 * | `PickerEmpty` | Centred "nothing matched" message |
 *
 * ## Rules worth keeping
 *
 * - **Give `PickerRow` an `onClick`, and `trailing` keeps its own.** A `<label>`
 *   row does NOT work here: Moji's `Checkbox` is Radix's, which renders a
 *   `<button role="checkbox">` and only emits a hidden `<input>` inside a
 *   `<form>` — so a label has nothing to forward the click to and the row reads
 *   as clickable while doing nothing. `PickerRow` isolates the trailing
 *   control's own click, so the two never double-fire.
 * - **The body has no bottom padding.** The last row is meant to be cut flush by
 *   the footer rule; that clipped row is what tells you the list keeps going,
 *   since the scrollbar is hidden.
 * - **Height is fixed, not max.** A dialog that resized as the list filtered
 *   would reflow on every keystroke.
 * - **The row fill is hover, and only hover.** `--color-brand-subtle` means the
 *   pointer is on the row, never that the row is picked — that is the trailing
 *   control's job, and it keeps saying so after the pointer leaves. There is no
 *   `selected` prop by design; one fill meaning both would make a picked row and
 *   a hovered row identical, and a list of picked rows one solid block.
 */
const meta = {
  title: 'Organisms/PickerDialog',
  component: PickerDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: FIGMA + '921-17353' },
  },
};
export default meta;

const noop = () => {};

/* ------------------------------------------------------------------ *
 * 1–3. The real binding: Knowledge → Add user property (921:17353)
 * ------------------------------------------------------------------ */

const dialog = (props = {}) => ({
  render: () => (
    <div className="h-screen bg-[var(--color-blue-50)]">
      <AddPropertyModal addedIds={[]} onClose={noop} onAdd={noop} {...props} />
    </div>
  ),
});

/** The artboard, 1:1. Diff this one against the Figma frame. */
export const AddUserProperty = dialog();

/** Rows already in Agent Context read as checked + disabled, never hidden. */
export const WithRowsAlreadyAdded = dialog({ addedIds: ['id', 'email', 'plan'] });

/* ------------------------------------------------------------------ *
 * 4. A second, unrelated catalogue — no knowledge code involved
 * ------------------------------------------------------------------ */

const SOURCES = [
  { id: 'slack', name: 'Slack', description: 'Threads from your support channels', icon: Slack, tint: 'purple' },
  { id: 'notion', name: 'Notion', description: 'Pages in the shared workspace', icon: Notepad2, tint: 'blue' },
  { id: 'site', name: 'Public website', description: 'Everything under the docs path', icon: Global, tint: 'green' },
  { id: 'help', name: 'Help center', description: 'Published articles and categories', icon: Book1, tint: 'orange' },
];

function AddKnowledgeSource() {
  const [query, setQuery] = React.useState('');
  const [picked, setPicked] = React.useState(['slack']);

  const q = query.trim().toLowerCase();
  const shown = SOURCES.filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
  );
  const toggle = (id) =>
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <div className="h-screen bg-[var(--color-blue-50)]">
      <PickerDialog
        title="Add knowledge source"
        onClose={noop}
        search={
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sources..."
            aria-label="Search sources"
            size="small"
            leftIcon={<SearchNormal1 size={20} variant="Linear" color="currentColor" />}
          />
        }
        footer={
          <>
            <PickerCount>
              {picked.length} {picked.length === 1 ? 'source' : 'sources'} selected
            </PickerCount>
            <Button size="sm" disabled={picked.length === 0}>
              Connect {picked.length === 1 ? 'source' : 'sources'}
            </Button>
          </>
        }
      >
        {shown.length === 0 ? (
          <PickerEmpty>No source found</PickerEmpty>
        ) : (
          <PickerGroup label="Available integrations">
            {shown.map((s) => (
              <PickerRow
                key={s.id}
                icon={<ContainedIcon icon={s.icon} tint={s.tint} glyph="ink" size={40} className="rounded-[var(--radius-md)] [&>svg]:size-6" />}
                title={s.name}
                description={s.description}
                onClick={() => toggle(s.id)}
                trailing={
                  <Checkbox
                    checked={picked.includes(s.id)}
                    onCheckedChange={() => toggle(s.id)}
                    aria-label={s.name}
                  />
                }
              />
            ))}
          </PickerGroup>
        )}
      </PickerDialog>
    </div>
  );
}

/**
 * The modularity check: a different catalogue, different tints, its own copy and
 * a row pre-checked on mount — with nothing imported from `features/knowledge`.
 */
export const OtherUse_AddKnowledgeSource = { render: () => <AddKnowledgeSource /> };

/* ------------------------------------------------------------------ *
 * 5. The shell on its own, with no search and no footer
 * ------------------------------------------------------------------ */

/** Both `search` and `footer` are optional — the header rule follows the title row. */
export const ShellOnly = {
  render: () => (
    <div className="h-screen bg-[var(--color-blue-50)]">
      <PickerDialog title="Pick a destination" onClose={noop} height={420} width={480}>
        <PickerGroup>
          {['Inbox', 'Archive', 'Snoozed'].map((label) => (
            <PickerRow key={label} as="button" title={label} onClick={noop} />
          ))}
        </PickerGroup>
      </PickerDialog>
    </div>
  ),
};
