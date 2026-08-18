export const docs = {
  name: 'Button',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=2906-5218',
  description:
    'Primary interactive element for triggering user actions. Supports filled (primary), outlined (secondary), and text-only (tertiary) levels with danger and icon-only variants.',
  whenToUse: [
    'Primary CTAs in forms, dialogs, and confirmation prompts',
    'Triggering mutations — save, create, publish, delete',
    'Destructive actions — set danger={true}',
    'Icon-only square buttons — set iconOnly={true}',
    'Side-by-side action pairs — use level="primary" for the main action and level="secondary" for cancel',
  ],
  whenNotToUse: [
    'Navigation links — use an <a> or router <Link> instead',
    'Toggle on/off states — use <Toggle> instead',
    'Multi-select options — use <Checkbox> instead',
    'Single-select groups — use <Radio> instead',
  ],
  variants: {
    level: ['primary', 'secondary', 'tertiary'],
    size: ['big', 'small'],
  },
  props: [
    { name: 'level', type: "'primary' | 'secondary' | 'tertiary'", default: 'primary', description: 'Visual level — filled, outlined, or text-only' },
    { name: 'size', type: "'big' | 'small'", default: 'big', description: 'Size preset — big (44px) or small (36px)' },
    { name: 'danger', type: 'boolean', default: 'false', description: 'Danger/destructive style — red for primary, red text for secondary/tertiary' },
    { name: 'iconOnly', type: 'boolean', default: 'false', description: 'Renders as a square icon-only button (no label)' },
    { name: 'leftIcon', type: 'React.ReactNode', description: 'Icon rendered to the left of the label — use iconsax-react icons' },
    { name: 'rightIcon', type: 'React.ReactNode', description: 'Icon rendered to the right of the label — use iconsax-react icons' },
    { name: 'children', type: 'React.ReactNode', description: 'Button label text' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all interaction' },
    { name: 'onClick', type: 'React.MouseEventHandler', description: 'Click handler' },
  ],
  examples: [
    {
      label: 'Primary action',
      code: `<Button level="primary" onClick={handleSave}>Save Changes</Button>`,
    },
    {
      label: 'Secondary cancel',
      code: `<Button level="secondary" onClick={handleCancel}>Cancel</Button>`,
    },
    {
      label: 'Destructive delete',
      code: `<Button level="primary" danger onClick={handleDelete}>Delete</Button>`,
    },
    {
      label: 'With left icon',
      code: `<Button level="primary" leftIcon={<Add size={20} />}>Create</Button>`,
    },
    {
      label: 'Icon only',
      code: `<Button level="secondary" iconOnly><Setting2 size={20} /></Button>`,
    },
    {
      label: 'Small tertiary',
      code: `<Button level="tertiary" size="small">View details</Button>`,
    },
  ],
  relatedComponents: ['Chip', 'Toggle'],
  sourceFile: 'src/components/ui/Button/Button.js',
};
