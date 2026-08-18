export const docs = {
  name: 'Infobox',
  figmaUrl: 'https://www.figma.com/design/66ejN3hqSMkUXIPgmkebFH/Moji?node-id=1796-1900',
  description:
    'Persistent in-page contextual message block. Use for information that must remain visible while the user acts — tips, warnings, upgrade prompts, or error explanations. Supports an optional CTA link.',
  whenToUse: [
    'Persistent warnings or tips that must stay visible — e.g. "Your plan has reached its limit"',
    'Onboarding hints inside empty states or settings panels',
    'Upgrade/upsell callouts — use type="brand"',
    'Form-level error summaries after submission',
    'Informational banners for beta features',
  ],
  whenNotToUse: [
    'Transient post-action feedback — use <Toast> instead',
    'Blocking dialogs that prevent further action — use a modal instead',
    'Short inline field validation — use Input status prop instead',
  ],
  variants: {
    type: ['neutral', 'positive', 'warning', 'danger', 'brand'],
  },
  props: [
    { name: 'type', type: "'neutral' | 'positive' | 'warning' | 'danger' | 'brand'", default: 'neutral', description: 'Semantic type — drives border color, background, and icon' },
    { name: 'title', type: 'string', required: true, description: 'Infobox title (required)' },
    { name: 'body', type: 'string', description: 'Optional body text for additional explanation' },
    { name: 'showIcon', type: 'boolean', default: 'true', description: 'Whether to show the left icon' },
    { name: 'icon', type: 'React.ReactNode', description: 'Override the default icon — use an iconsax-react icon' },
    { name: 'ctaLabel', type: 'string', description: 'CTA link/button label' },
    { name: 'onCta', type: '() => void', description: 'Called when the CTA is clicked' },
  ],
  examples: [
    {
      label: 'Informational tip',
      code: `<Infobox type="neutral" title="Tip" body="You can customise this widget by clicking the settings icon." />`,
    },
    {
      label: 'Warning with CTA',
      code: `<Infobox type="warning" title="Plan limit reached" body="You've used 100% of your monthly active users." ctaLabel="Upgrade plan" onCta={openUpgradeModal} />`,
    },
    {
      label: 'Upgrade prompt',
      code: `<Infobox type="brand" title="Unlock advanced analytics" body="Available on the Growth plan and above." ctaLabel="See plans" onCta={openPlansPage} />`,
    },
    {
      label: 'Danger — permission error',
      code: `<Infobox type="danger" title="Access denied" body="You don't have permission to edit this widget." />`,
    },
  ],
  relatedComponents: ['Toast', 'Button'],
  sourceFile: 'src/components/ui/Infobox/Infobox.js',
};
