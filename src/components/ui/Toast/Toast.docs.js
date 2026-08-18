export const docs = {
  name: 'Toast',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=1760-7178',
  description:
    'Transient notification overlay for feedback after user actions. Supports neutral, positive, warning, and negative types with optional dismiss button and up to two action buttons.',
  whenToUse: [
    'Operation feedback — "Saved successfully", "Export failed"',
    'Async action completion — show after a mutation resolves',
    'Non-blocking warnings that do not require immediate action',
    'Undo prompts — add a secondary action with onSecondaryAction',
  ],
  whenNotToUse: [
    'Persistent in-page messages that must remain visible — use <Infobox> instead',
    'Blocking errors that require resolution before continuing — use an inline form error or modal',
    'Marketing or promotional messages',
  ],
  variants: {
    type: ['neutral', 'positive', 'warning', 'negative'],
  },
  props: [
    { name: 'type', type: "'neutral' | 'positive' | 'warning' | 'negative'", default: 'neutral', description: 'Semantic type — drives the border, background, and icon color' },
    { name: 'title', type: 'string', required: true, description: 'Toast title (required)' },
    { name: 'body', type: 'string', description: 'Optional body text for additional detail' },
    { name: 'dismissable', type: 'boolean', default: 'false', description: 'Shows a × close button' },
    { name: 'onDismiss', type: '() => void', description: 'Called when the × button is clicked' },
    { name: 'primaryAction', type: 'string', description: 'Label for the primary action button' },
    { name: 'onPrimaryAction', type: '() => void', description: 'Called on primary action click' },
    { name: 'secondaryAction', type: 'string', description: 'Label for the secondary action button' },
    { name: 'onSecondaryAction', type: '() => void', description: 'Called on secondary action click' },
  ],
  examples: [
    {
      label: 'Success',
      code: `<Toast type="positive" title="Changes saved" body="Your settings have been updated." dismissable onDismiss={closeToast} />`,
    },
    {
      label: 'Error with action',
      code: `<Toast type="negative" title="Export failed" body="Please try again or contact support." primaryAction="Retry" onPrimaryAction={retryExport} dismissable onDismiss={closeToast} />`,
    },
    {
      label: 'Warning with undo',
      code: `<Toast type="warning" title="Item archived" secondaryAction="Undo" onSecondaryAction={undoArchive} dismissable onDismiss={closeToast} />`,
    },
  ],
  relatedComponents: ['Infobox'],
  sourceFile: 'src/components/ui/Toast/Toast.js',
};
