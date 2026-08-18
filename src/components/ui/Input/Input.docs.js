export const docs = {
  name: 'Input',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=1259-51560',
  description:
    'Versatile text input field supporting text, textarea, and dropdown variants. Includes label, supportive text, leading/trailing icons, status indicators (positive, warning, negative, loading), and trailing unit text.',
  whenToUse: [
    'All text entry in forms — names, emails, URLs, numbers',
    'Multi-line text — set inputType="textarea"',
    'Validated fields — set status to "positive", "warning", or "negative" to show feedback',
    'Fields with inline units — use trailingText (e.g. "Days", "%")',
    'Search fields with a leading icon — set leftIcon',
    'Async validation — set status="loading" while checking',
  ],
  whenNotToUse: [
    'Boolean switches — use <Toggle> or <Checkbox> instead',
    'Dropdown selectors without text input — use <DropdownSelector> instead',
    'Date pickers — use a dedicated date input',
  ],
  variants: {
    inputType: ['text', 'textarea', 'dropdown', 'dropdown-search'],
    size: ['regular', 'small'],
    status: ['none', 'loading', 'positive', 'warning', 'negative'],
  },
  props: [
    { name: 'label', type: 'React.ReactNode', description: 'Field label displayed above the input' },
    { name: 'inputType', type: "'text' | 'textarea' | 'dropdown' | 'dropdown-search'", default: 'text', description: 'Input variant — text, textarea, or dropdown (shows chevron)' },
    { name: 'size', type: "'regular' | 'small'", default: 'regular', description: 'Size preset — regular (16px) or small (14px)' },
    { name: 'status', type: "'none' | 'loading' | 'positive' | 'warning' | 'negative'", default: 'none', description: 'Validation status — changes border color and shows a status icon' },
    { name: 'placeholder', type: 'string', description: 'Placeholder text' },
    { name: 'value', type: 'string', description: 'Controlled value' },
    { name: 'onChange', type: 'React.ChangeEventHandler', description: 'Change handler' },
    { name: 'supportiveText', type: 'React.ReactNode', description: 'Helper or error text shown below the input' },
    { name: 'leftIcon', type: 'React.ReactNode', description: 'Icon inside the input on the left' },
    { name: 'rightIcon', type: 'React.ReactNode', description: 'Icon inside the input on the right' },
    { name: 'trailingText', type: 'string', description: 'Unit or suffix text shown inside the right edge (e.g. "Days")' },
    { name: 'cta', type: 'React.ReactNode', description: 'Action button slotted inside the input (e.g. a "Copy" button)' },
    { name: 'secondarySlot', type: 'React.ReactNode', description: 'Secondary prefix slot for dropdown-style compound inputs' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all interaction' },
    { name: 'id', type: 'string', description: 'HTML id — auto-generated if omitted' },
  ],
  examples: [
    {
      label: 'Basic text input',
      code: `<Input label="Display name" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />`,
    },
    {
      label: 'With validation error',
      code: `<Input label="Email" status="negative" supportiveText="Invalid email address" value={email} onChange={e => setEmail(e.target.value)} />`,
    },
    {
      label: 'With leading icon',
      code: `<Input label="Search" leftIcon={<SearchNormal1 size={16} />} placeholder="Search features…" />`,
    },
    {
      label: 'Textarea',
      code: `<Input inputType="textarea" label="Description" placeholder="Describe your feature…" value={desc} onChange={e => setDesc(e.target.value)} />`,
    },
    {
      label: 'With trailing unit',
      code: `<Input label="Delay" trailingText="Days" placeholder="0" />`,
    },
    {
      label: 'Loading validation',
      code: `<Input label="Username" status="loading" value={username} onChange={e => setUsername(e.target.value)} supportiveText="Checking availability…" />`,
    },
  ],
  relatedComponents: ['DropdownSelector', 'Button'],
  sourceFile: 'src/components/ui/Input/Input.js',
};
