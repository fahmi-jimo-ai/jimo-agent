export const docs = {
  name: 'DropdownSelector',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=1177-8683',
  description:
    'The trigger button for a dropdown. Displays a selected value (or placeholder) and a chevron indicator. Always compose with DropdownMenuList (flat list) or DropdownMenuGroup (grouped list) as the panel.',
  whenToUse: [
    'Select-from-list interactions — the trigger that opens a dropdown panel',
    'Filters and sorting controls — shows current selection, opens options on click',
    'Settings dropdowns — pair with DropdownMenuList for flat options',
    'Multi-group dropdowns — pair with DropdownMenuGroup for sectioned options',
  ],
  whenNotToUse: [
    'Free text input — use <Input> instead',
    'Yes/No toggles — use <Toggle> instead',
    'Fewer than 3 options all visible at once — use <Radio> instead',
    'Navigation menus — use a nav component instead',
  ],
  variants: {
    size: ['big', 'small'],
  },
  props: [
    { name: 'size', type: "'big' | 'small'", default: 'big', description: 'Size preset — big (44px min-height) or small (36px min-height)' },
    { name: 'text', type: 'string', description: 'The selected value text to display. Omit to show the placeholder.' },
    { name: 'isOpen', type: 'boolean', default: 'false', description: 'Whether the dropdown panel is currently open — rotates the chevron 180°' },
    { name: 'hasValue', type: 'boolean', default: 'false', description: 'Whether a value has been selected — turns the text blue' },
    { name: 'withIcon', type: 'boolean', default: 'false', description: 'Whether to show a left icon slot' },
    { name: 'icon', type: 'React.ReactNode', description: 'Custom icon for the left slot — use iconsax-react icons' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all interaction' },
    { name: 'onClick', type: 'React.MouseEventHandler', description: 'Click handler — typically toggles isOpen' },
  ],
  examples: [
    {
      label: 'Basic selector with panel',
      code: `const [open, setOpen] = useState(false);
const [value, setValue] = useState('');

<div style={{ position: 'relative' }}>
  <DropdownSelector
    text={value || undefined}
    isOpen={open}
    hasValue={!!value}
    onClick={() => setOpen(o => !o)}
  />
  {open && (
    <DropdownMenuGroup style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 10 }}>
      <DropdownMenuList text="Option A" onClick={() => { setValue('Option A'); setOpen(false); }} />
      <DropdownMenuList text="Option B" onClick={() => { setValue('Option B'); setOpen(false); }} />
      <DropdownMenuList text="Option C" onClick={() => { setValue('Option C'); setOpen(false); }} />
    </DropdownMenuGroup>
  )}
</div>`,
    },
    {
      label: 'Small with icon',
      code: `<DropdownSelector size="small" withIcon icon={<Filter size={20} />} text="Filtered by: Status" isOpen={false} hasValue />`,
    },
    {
      label: 'Disabled',
      code: `<DropdownSelector text="Locked option" disabled />`,
    },
  ],
  relatedComponents: ['DropdownMenuList', 'DropdownMenuGroup'],
  sourceFile: 'src/components/ui/DropdownSelector/DropdownSelector.js',
};
