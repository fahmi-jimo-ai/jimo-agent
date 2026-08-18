export const docs = {
  name: 'DropdownMenuList',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=683-508',
  description:
    'A single row item inside a dropdown panel. Compose multiple DropdownMenuList items inside a DropdownMenuGroup container. Supports regular items, section headers, danger items, multi-select checkboxes, and optional description text.',
  whenToUse: [
    'Items inside a DropdownMenuGroup panel — always use inside DropdownMenuGroup',
    'Multi-select option lists — set multiSelect={true} to show a checkbox',
    'Section headers to group items — set state="list-header"',
    'Danger/destructive actions — set danger={true} for red text',
    'Items with extra context — set showDescription={true} and pass description',
  ],
  whenNotToUse: [
    'Standalone items outside a dropdown — this component is designed for dropdown panels only',
    'Navigation links — use a nav or router Link instead',
    'Full-page lists — use a table or list component instead',
  ],
  variants: {
    state: ['default', 'hover', 'hover-selected', 'selected', 'list-header', 'disabled'],
  },
  props: [
    { name: 'text', type: 'string', default: 'Text', description: 'Main label text' },
    { name: 'state', type: "'default' | 'hover' | 'hover-selected' | 'selected' | 'list-header' | 'disabled'", default: 'default', description: 'Visual/interactive state — hover is driven by CSS :hover in practice; set selected for chosen items' },
    { name: 'danger', type: 'boolean', default: 'false', description: 'Danger/destructive styling — red text, red hover background' },
    { name: 'multiSelect', type: 'boolean', default: 'false', description: 'Shows a checkbox — checked when state is "selected" or "hover-selected"' },
    { name: 'showIcon', type: 'boolean', default: 'true', description: 'Whether to show the left icon slot (non-multiSelect mode only)' },
    { name: 'icon', type: 'React.ReactNode', description: 'Custom left icon — use iconsax-react icons' },
    { name: 'showDescription', type: 'boolean', default: 'false', description: 'Whether to show the description sub-text' },
    { name: 'description', type: 'string', description: 'Secondary description text shown below the main label' },
    { name: 'onClick', type: 'React.MouseEventHandler', description: 'Click handler' },
  ],
  examples: [
    {
      label: 'Flat list inside a panel',
      code: `<DropdownMenuGroup>
  <DropdownMenuList text="Edit" icon={<Edit2 size={20} />} onClick={handleEdit} />
  <DropdownMenuList text="Duplicate" icon={<Copy size={20} />} onClick={handleDuplicate} />
  <DropdownMenuList text="Delete" danger icon={<Trash size={20} />} onClick={handleDelete} />
</DropdownMenuGroup>`,
    },
    {
      label: 'Multi-select with selected item',
      code: `<DropdownMenuGroup>
  <DropdownMenuList text="Option A" multiSelect state="selected" onClick={() => toggle('A')} />
  <DropdownMenuList text="Option B" multiSelect onClick={() => toggle('B')} />
  <DropdownMenuList text="Option C" multiSelect onClick={() => toggle('C')} />
</DropdownMenuGroup>`,
    },
    {
      label: 'Section header',
      code: `<DropdownMenuGroup>
  <DropdownMenuList state="list-header" text="Actions" />
  <DropdownMenuList text="Edit" onClick={handleEdit} />
  <DropdownMenuList text="Archive" onClick={handleArchive} />
</DropdownMenuGroup>`,
    },
    {
      label: 'With description',
      code: `<DropdownMenuList text="Send email" showDescription description="Notify the user via email" onClick={handleEmail} />`,
    },
  ],
  relatedComponents: ['DropdownMenuGroup', 'DropdownSelector'],
  sourceFile: 'src/components/ui/DropdownMenuList/DropdownMenuList.js',
};
