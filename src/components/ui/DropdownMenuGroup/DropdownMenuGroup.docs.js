export const docs = {
  name: 'DropdownMenuGroup',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=738-1190',
  description:
    'Container panel for dropdown menu items. Wraps DropdownMenuList rows with the correct border, rounded corners, and shadow. Position it absolutely relative to a DropdownSelector trigger.',
  whenToUse: [
    'The dropdown panel that opens from a DropdownSelector — always use this as the container for DropdownMenuList items',
    'Context menus triggered by right-click or action buttons',
    'Grouped option lists with section headers (list-header items)',
    'Scrollable item lists — set maxHeight to enable overflow scrolling',
  ],
  whenNotToUse: [
    'Non-dropdown UI panels — use a card or sheet component instead',
    'Direct child of a page layout — wrap in a positioned container and control z-index externally',
  ],
  variants: {},
  props: [
    { name: 'children', type: 'React.ReactNode', description: 'DropdownMenuList items and section headers' },
    { name: 'maxHeight', type: 'string | number', description: 'CSS max-height value — when set, the panel becomes scrollable (e.g. "240px" or 240)' },
    { name: 'className', type: 'string', description: 'Additional CSS class' },
    { name: 'style', type: 'React.CSSProperties', description: 'Inline styles — use for absolute positioning (top, left, z-index)' },
  ],
  examples: [
    {
      label: 'Basic dropdown panel',
      code: `<DropdownMenuGroup style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 10 }}>
  <DropdownMenuList text="Edit" onClick={handleEdit} />
  <DropdownMenuList text="Duplicate" onClick={handleDuplicate} />
  <DropdownMenuList text="Delete" danger onClick={handleDelete} />
</DropdownMenuGroup>`,
    },
    {
      label: 'Scrollable panel',
      code: `<DropdownMenuGroup maxHeight={240} style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 10 }}>
  {options.map(opt => (
    <DropdownMenuList key={opt.id} text={opt.label} onClick={() => select(opt)} />
  ))}
</DropdownMenuGroup>`,
    },
    {
      label: 'With section headers',
      code: `<DropdownMenuGroup style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 10 }}>
  <DropdownMenuList state="list-header" text="Manage" />
  <DropdownMenuList text="Edit settings" onClick={handleEdit} />
  <DropdownMenuList text="Archive" onClick={handleArchive} />
  <DropdownMenuList state="list-header" text="Danger zone" />
  <DropdownMenuList text="Delete permanently" danger onClick={handleDelete} />
</DropdownMenuGroup>`,
    },
  ],
  relatedComponents: ['DropdownMenuList', 'DropdownSelector'],
  sourceFile: 'src/components/ui/DropdownMenuGroup/DropdownMenuGroup.js',
};
