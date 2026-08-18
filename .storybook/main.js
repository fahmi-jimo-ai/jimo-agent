import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
  stories: ['../stories/**/*.stories.@(js|jsx)', '../stories/**/*.mdx'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-designs'],
  framework: { name: '@storybook/react-vite', options: {} },
  viteFinal: async (cfg) => {
    cfg.resolve = cfg.resolve || {};
    cfg.resolve.alias = { ...cfg.resolve.alias, '@': resolve(__dirname, '../src') };
    cfg.plugins = [...(cfg.plugins || []), tailwindcss()];
    return cfg;
  },
};
export default config;
