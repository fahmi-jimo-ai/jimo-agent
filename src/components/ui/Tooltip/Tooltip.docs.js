export const docs = {
  name: 'Tooltip',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=1438-1729',
  description:
    'Dark pill-shaped tooltip bubble with a directional arrow. Used to surface contextual help or labels on hover or focus.',
  whenToUse: [
    'Explain icon-only buttons or controls that lack visible labels',
    'Surface extra context for truncated text or complex UI elements',
    'Show keyboard shortcut hints on hover',
    'Provide non-critical contextual information without cluttering the UI',
  ],
  whenNotToUse: [
    'Critical information — users may miss it; use an Infobox instead',
    'Long, interactive content — tooltips are read-only and ephemeral',
    'Form field errors — use Input with supportiveText instead',
    'Actions or buttons — use a Dropdown or ContextMenu instead',
  ],
  variants: {
    arrowPosition: ['up', 'up-left', 'up-right', 'bottom', 'bottom-left', 'bottom-right', 'left', 'right', 'none'],
  },
  props: [
    { name: 'children', type: 'React.ReactNode', required: true, description: 'Tooltip label text' },
    {
      name: 'arrowPosition',
      type: "'up' | 'up-left' | 'up-right' | 'bottom' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'none'",
      default: 'up-left',
      description: 'Position of the directional arrow on the tooltip bubble',
    },
    { name: 'className', type: 'string', description: 'Additional CSS class names' },
  ],
  examples: [
    {
      label: 'Default (up-left arrow)',
      code: `<Tooltip>Save changes</Tooltip>`,
    },
    {
      label: 'Arrow pointing up, centered',
      code: `<Tooltip arrowPosition="up">This is a tooltip</Tooltip>`,
    },
    {
      label: 'Arrow pointing down',
      code: `<Tooltip arrowPosition="bottom">Tooltip above a target</Tooltip>`,
    },
    {
      label: 'Arrow on the left',
      code: `<Tooltip arrowPosition="left">Tooltip to the right</Tooltip>`,
    },
    {
      label: 'No arrow',
      code: `<Tooltip arrowPosition="none">Floating tooltip</Tooltip>`,
    },
  ],
  relatedComponents: ['Infobox', 'Button'],
  sourceFile: 'src/components/ui/Tooltip/Tooltip.js',
};
