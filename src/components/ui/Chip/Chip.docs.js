export const docs = {
  name: 'Chip',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=666-1652',
  description:
    'Compact pill-shaped labels for status, categories, and metadata tags. Supports semantic color types, filled/outlined variants, and an optional remove button.',
  whenToUse: [
    'Status labels — active, inactive, pending, error',
    'Filter tags on list or search pages',
    'Category or taxonomy labels attached to content',
    'Dismissable tags — add onRemove to show the × icon',
    'Icon-only compact indicators — set iconOnly={true}',
  ],
  whenNotToUse: [
    'Call-to-action buttons — use <Button> instead',
    'Navigation items or breadcrumbs',
    'Long text labels (>30 characters) — truncate or use a different element',
    'Toggleable filters — consider a <Checkbox> or <Toggle> instead',
  ],
  variants: {
    type: ['neutral', 'positive', 'negative', 'alert', 'brand'],
    variant: ['primary', 'secondary'],
    size: ['regular', 'small', 'x-small', 'xx-small'],
  },
  props: [
    { name: 'type', type: "'neutral' | 'positive' | 'negative' | 'alert' | 'brand'", default: 'neutral', description: 'Semantic color type' },
    { name: 'variant', type: "'primary' | 'secondary'", default: 'primary', description: 'Filled (primary) or outlined (secondary)' },
    { name: 'size', type: "'regular' | 'small' | 'x-small' | 'xx-small'", default: 'regular', description: 'Size preset' },
    { name: 'children', type: 'React.ReactNode', description: 'Chip label text' },
    { name: 'leftIcon', type: 'React.ReactNode', description: 'Icon on the left — use iconsax-react icons' },
    { name: 'rightIcon', type: 'React.ReactNode', description: 'Icon on the right' },
    { name: 'iconOnly', type: 'boolean', default: 'false', description: 'Renders without text — only the icon' },
    { name: 'onRemove', type: '() => void', description: 'When set, shows a × remove button and calls this on click' },
  ],
  examples: [
    {
      label: 'Active status',
      code: `<Chip type="positive" variant="secondary">Active</Chip>`,
    },
    {
      label: 'Error status',
      code: `<Chip type="negative" variant="primary">Error</Chip>`,
    },
    {
      label: 'Brand tag',
      code: `<Chip type="brand" variant="secondary">Jimo</Chip>`,
    },
    {
      label: 'Dismissable filter',
      code: `<Chip type="neutral" onRemove={() => removeFilter('status')}>Status: Active</Chip>`,
    },
    {
      label: 'Small with icon',
      code: `<Chip type="positive" size="small" leftIcon={<TickCircle size={12} />}>Done</Chip>`,
    },
  ],
  relatedComponents: ['Button', 'Infobox'],
  sourceFile: 'src/components/ui/Chip/Chip.js',
};
