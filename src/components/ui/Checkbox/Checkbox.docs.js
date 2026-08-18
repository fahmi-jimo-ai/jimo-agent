export const docs = {
  name: 'Checkbox',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=604-1424',
  description:
    'Single boolean checkbox with label. Supports checked, unchecked, indeterminate, and disabled states.',
  whenToUse: [
    'Multi-select option lists — one checkbox per item',
    'Agreement prompts — "I accept the terms"',
    'Feature flag toggles in settings forms',
    'Indeterminate state for "select all" headers — set indeterminate={true}',
  ],
  whenNotToUse: [
    'Exclusive single-select groups (pick one) — use <Radio> instead',
    'On/off system settings — use <Toggle> instead, which has clearer on/off semantics',
  ],
  variants: {},
  props: [
    { name: 'label', type: 'React.ReactNode', description: 'Label text displayed to the right of the checkbox' },
    { name: 'checked', type: 'boolean', default: 'false', description: 'Whether the checkbox is checked' },
    { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Indeterminate (–) state — used for parent "select all" checkboxes' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all interaction' },
    { name: 'onChange', type: 'React.ChangeEventHandler<HTMLInputElement>', description: 'Change handler' },
  ],
  examples: [
    {
      label: 'Basic controlled',
      code: `<Checkbox label="Enable notifications" checked={enabled} onChange={e => setEnabled(e.target.checked)} />`,
    },
    {
      label: 'Indeterminate (partial selection)',
      code: `<Checkbox label="Select all" indeterminate={someSelected} checked={allSelected} onChange={toggleAll} />`,
    },
    {
      label: 'Disabled',
      code: `<Checkbox label="Read-only setting" checked disabled />`,
    },
  ],
  relatedComponents: ['Radio', 'Toggle', 'DropdownMenuList'],
  sourceFile: 'src/components/ui/Checkbox/Checkbox.js',
};
