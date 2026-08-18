export const docs = {
  name: 'Toggle',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=604-1467',
  description:
    'Boolean on/off switch with optional label. Provides clear on/off semantics — prefer this over Checkbox for feature and setting toggles.',
  whenToUse: [
    'Feature flags and on/off settings — "Enable push notifications"',
    'Immediate effect toggles that take effect without a save button',
    'Preference switches in settings panels',
  ],
  whenNotToUse: [
    'Multi-select option lists — use <Checkbox> instead',
    'Exclusive single-choice groups — use <Radio> instead',
    'Actions that require confirmation — use <Button> instead',
  ],
  variants: {},
  props: [
    { name: 'label', type: 'React.ReactNode', description: 'Label text displayed to the right of the toggle' },
    { name: 'checked', type: 'boolean', default: 'false', description: 'Whether the toggle is on' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all interaction' },
    { name: 'onChange', type: 'React.ChangeEventHandler<HTMLInputElement>', description: 'Change handler' },
  ],
  examples: [
    {
      label: 'Controlled toggle',
      code: `<Toggle label="Enable push notifications" checked={enabled} onChange={e => setEnabled(e.target.checked)} />`,
    },
    {
      label: 'Disabled (locked setting)',
      code: `<Toggle label="Enterprise SSO (locked)" checked disabled />`,
    },
  ],
  relatedComponents: ['Checkbox', 'Radio'],
  sourceFile: 'src/components/ui/Toggle/Toggle.js',
};
