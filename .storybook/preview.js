import '../src/styles/globals.css';
import '../src/styles/global.css';

const preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'centered',
    viewport: {
      options: {
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '810px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
      },
    },
  },
  initialGlobals: { viewport: { value: 'desktop' } },
};
export default preview;
